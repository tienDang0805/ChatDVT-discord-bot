import { geminiService } from './gemini';

export interface IWebQuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface IWebQuizPlayer {
  id: string; // Secret ID like UUID for scoring
  name: string; // Display name
  score: number;
}

export interface IWebQuizState {
  id: string; // Room ID
  creatorName: string;
  topic: string;
  difficulty: string;
  tone: string;
  timeLimitSecs: number;
  numQuestions: number;
  apiKey: string; // Tác giả cấp Key
  status: 'waiting' | 'generating' | 'showing_question' | 'showing_answer' | 'finished' | 'error';
  errorMessage?: string;
  creatorId: string;
  players: Record<string, IWebQuizPlayer>; // Key: playerId
  questions: IWebQuizQuestion[];
  totalQuestions: number;
  currentQuestionIndex: number;
  timer: number;
  clients: any[]; // express Response objects for SSE
  answersThisRound: Record<string, "A" | "B" | "C" | "D">; // Key: playerId
}

export class WebQuizServiceClass {
  private rooms: Map<string, IWebQuizState> = new Map();

  private generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

  public getPublicRooms() {
    const list = [];
    for (const [id, room] of this.rooms.entries()) {
      if (room.status === 'waiting' || room.status === 'generating') {
        list.push({
          id,
          creator: room.creatorName,
          topic: room.topic,
          difficulty: room.difficulty,
          numQuestions: room.numQuestions,
          playerCount: Object.keys(room.players).length
        });
      }
    }
    return list;
  }

  public createRoom(creatorName: string, topic: string, difficulty: string, numQuestions: number, apiKey: string, timeLimitSecs: number, tone: string) {
    const roomId = this.generateId();
    const playerId = this.generateId();
    
    const room: IWebQuizState = {
      id: roomId,
      creatorName,
      topic,
      difficulty,
      tone,
      timeLimitSecs: Math.min(60, Math.max(5, timeLimitSecs)),
      numQuestions: Math.min(20, Math.max(2, numQuestions)),
      apiKey,
      status: 'waiting',
      creatorId: playerId,
      players: { [playerId]: { id: playerId, name: creatorName, score: 0 } },
      questions: [],
      totalQuestions: Math.min(20, Math.max(2, numQuestions)),
      currentQuestionIndex: -1,
      timer: 0,
      clients: [],
      answersThisRound: {}
    };

    this.rooms.set(roomId, room);
    return { roomId, playerId };
  }

  public joinRoom(roomId: string, playerName: string) {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, message: 'Phòng không tồn tại!' };
    if (room.status !== 'waiting') return { success: false, message: 'Phòng đã bắt đầu!' };

    const playerId = this.generateId();
    room.players[playerId] = { id: playerId, name: playerName, score: 0 };
    
    this.broadcast(room, { type: 'players_update', players: Object.values(room.players) });
    return { success: true, playerId };
  }

  public addClient(roomId: string, res: any) {
    const room = this.rooms.get(roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*'
    });
    res.flushHeaders?.();

    room.clients.push(res);

    res.write(`data: ${JSON.stringify(this.getRoomPublicState(room))}\n\n`);

    const heartbeat = setInterval(() => {
      try { res.write(`: heartbeat\n\n`); } catch(e) { clearInterval(heartbeat); }
    }, 15000);

    res.on('close', () => {
      clearInterval(heartbeat);
      room.clients = room.clients.filter(c => c !== res);
    });
  }

  public broadcast(room: IWebQuizState, data: any) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const c of room.clients) {
      c.write(payload);
    }
  }

  private getRoomPublicState(room: IWebQuizState) {
    let currentQuestion = null;
    if (room.status === 'showing_question' || room.status === 'showing_answer') {
        const q = room.questions[room.currentQuestionIndex];
        currentQuestion = {
           question: q.question,
           options: q.options,
           // Hide correct answer unless showing_answer
           correct_answer: room.status === 'showing_answer' ? q.correct_answer : null,
           explanation: room.status === 'showing_answer' ? q.explanation : null
        };
    }

    return {
       type: 'sync',
       state: {
         id: room.id,
         topic: room.topic,
         status: room.status,
         errorMessage: room.errorMessage,
         timer: room.timer,
         creatorId: room.creatorId,
         currentQuestionIndex: room.currentQuestionIndex,
         totalQuestions: room.totalQuestions,
         players: Object.values(room.players).sort((a,b)=>b.score - a.score),
         currentQuestion,
         answersSubmittedCount: Object.keys(room.answersThisRound).length
       }
    };
  }

  public async startRoom(roomId: string, playerId: string) {
     const room = this.rooms.get(roomId);
     if (!room) return false;
     if (room.status !== 'waiting' && room.status !== 'error' && room.status !== 'finished') return false;
     if (room.creatorId !== playerId) return false;

     room.status = 'generating';
     room.errorMessage = undefined;
     this.broadcast(room, this.getRoomPublicState(room));

     try {
       const prompt = `Bạn là chuyên gia Quiz. Tạo ${room.numQuestions} câu hỏi trắc nghiệm tiếng Việt về "${room.topic}". Mức độ: ${room.difficulty}.
        Giọng văn: ${room.tone}.
        Trả về ĐÚNG VÀ CHỈ MỘT mảng JSON hợp lệ, KHÔNG CÓ THẺ MARKDOWN. Phải có định dạng:
        [
          {
            "question": "Câu hỏi?",
            "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
            "correct_answer": "A",
            "explanation": "Giải thích hài hước ngắn gọn."
          }
        ]`;
       // Call Gemini with custom API KEY
       const questions = await geminiService.generateJSON<IWebQuizQuestion[]>(prompt, null, undefined, room.apiKey);
       if (!questions || questions.length === 0) throw new Error("AI không trả về kết quả hợp lệ.");

       room.questions = questions;
       room.totalQuestions = questions.length;
       this.gameLoop(room); // Start the engine asynchronous
       return true;
     } catch (err: any) {
       console.error("Web Quiz Gen Error:", err);
       room.status = 'error';
       room.errorMessage = err.message || "Không thể nhận diện câu hỏi từ AI, hãy thử lại với Prompt / API Key khác.";
       this.broadcast(room, this.getRoomPublicState(room));
       return false;
     }
  }

  public async nextRound(roomId: string, playerId: string, newTopic: string, newTone: string) {
      const room = this.rooms.get(roomId);
      if (!room || room.creatorId !== playerId) return false;

      room.topic = newTopic;
      if (newTone) room.tone = newTone;
      for (const p of Object.values(room.players)) { p.score = 0; }
      room.questions = [];
      room.currentQuestionIndex = -1;
      
      this.startRoom(roomId, playerId);
      return true;
  }

  private async sleep(ms: number) {
     return new Promise(r => setTimeout(r, ms));
  }

  private async gameLoop(room: IWebQuizState) {
      for (let i = 0; i < room.questions.length; i++) {
         room.currentQuestionIndex = i;
         room.status = 'showing_question';
         room.timer = room.timeLimitSecs; // N giây để answer
         room.answersThisRound = {};
         this.broadcast(room, this.getRoomPublicState(room));

         while (room.timer > 0) {
            await this.sleep(1000);
            room.timer--;
            // Broadcast every second
            this.broadcast(room, { type: 'timer', timer: room.timer });

            // If everyone answered, stop timer early
            if (Object.keys(room.answersThisRound).length === Object.keys(room.players).length) {
               break; 
            }
         }

         // Show Answer Phase
         room.status = 'showing_answer';
         room.timer = 7; // 7 seconds to show answer and leaderboard
         const correctOpt = room.questions[i].correct_answer;

         // Calculate scores
         for (const [pId, ans] of Object.entries(room.answersThisRound)) {
             if (ans === correctOpt) {
                 room.players[pId].score += 100; // Plus 100 per correct
             }
         }

         this.broadcast(room, this.getRoomPublicState(room));

         while(room.timer > 0) {
             await this.sleep(1000);
             room.timer--;
             this.broadcast(room, { type: 'timer', timer: room.timer });
         }
      }

      // Finish
      room.status = 'finished';
      this.broadcast(room, this.getRoomPublicState(room));

      // Cleanup room after 5 minutes, close SSE connections gracefully
      setTimeout(() => {
          for (const c of room.clients) {
             try { c.end(); } catch(e) {}
          }
          room.clients = [];
          this.rooms.delete(room.id);
      }, 300 * 1000);
  }

  public submitAnswer(roomId: string, playerId: string, answer: "A"|"B"|"C"|"D") {
      const room = this.rooms.get(roomId);
      if (!room || room.status !== 'showing_question') return { success: false };
      if (!room.players[playerId]) return { success: false };
      if (room.answersThisRound[playerId]) return { success: false }; // Already answered

      room.answersThisRound[playerId] = answer;
      this.broadcast(room, { type: 'player_answered', answersSubmittedCount: Object.keys(room.answersThisRound).length });
      return { success: true };
  }
}

export const webQuizService = new WebQuizServiceClass();
