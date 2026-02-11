import { geminiService } from './gemini';

interface IPlayer {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
}

interface IGameSession {
  players: IPlayer[];
  status: "waiting" | "in-progress" | "ended";
  turn: number;
  log: string[];
}

class PKGameService {
  private sessions: Map<string, IGameSession> = new Map();
  // In a real bot, we would have Map<guildId, Session>, but legacy was singleton/global or per-instance?
  // User's legacy code used `this.gameSession = null`, implying one game per bot instance strictly or relying on singleton.
  // We will keep it simple as legacy did, or ideally per guild if we want improvement. 
  // Let's stick to legacy SINGLE instance for now to be safe, or upgrade to Map if easy.
  // The new code structure uses a singleton export `pkGameService`.
  // To support multiple servers, we SHOULD use a Map. But legacy might have been simple.
  // Let's upgrade to Map to be safe for a "Vip Pro" bot.
  
  public isGameActive(guildId: string): boolean {
      const session = this.sessions.get(guildId);
      return session !== undefined && session.status !== "ended";
  }

  public startNewGame(guildId: string) {
      if (this.isGameActive(guildId)) {
          return { success: false, message: "❌ Hiện đang có một trận đấu PK đang diễn ra. Vui lòng đợi!" };
      }
      this.sessions.set(guildId, {
          players: [],
          status: "waiting",
          turn: 0,
          log: []
      });
      return { success: true, message: "Một trận đấu PK mới đã được tạo! Hai người chơi dùng `/pk join` để tham gia." };
  }

  public joinGame(guildId: string, user: any) {
      const session = this.sessions.get(guildId);
      if (!session || session.status !== "waiting") {
          return { success: false, message: "❌ Không có trận đấu nào đang chờ hoặc đã quá 2 người rồi." };
      }
      if (session.players.length >= 2) {
          return { success: false, message: "❌ Đã có đủ 2 người chơi rồi." };
      }
      if (session.players.some(p => p.id === user.id)) {
          return { success: false, message: "❌ Bạn đã tham gia rồi." };
      }

      const newPlayer: IPlayer = {
          id: user.id,
          name: user.globalName || user.username,
          hp: 100,
          maxHp: 100
      };
      session.players.push(newPlayer);

      if (session.players.length === 2) {
          session.status = "in-progress";
          session.turn = Math.floor(Math.random() * 2);
          const p1 = session.players[0];
          const p2 = session.players[1];
          return { success: true, message: `Trận đấu bắt đầu giữa ${p1.name} và ${p2.name}! Lượt của **${session.players[session.turn].name}**.` };
      }
      return { success: true, message: `${user.globalName || user.username} đã tham gia! Cần thêm ${2 - session.players.length} người nữa.` };
  }

  public async processTurn(guildId: string, user: any, actionDescription: string) {
      const session = this.sessions.get(guildId);
      if (!session || session.status !== "in-progress") {
          return { success: false, message: "❌ Không có trận đấu nào đang diễn ra." };
      }

      const currentPlayer = session.players[session.turn];
      if (currentPlayer.id !== user.id) {
          return { success: false, message: `❌ Chưa đến lượt của bạn, ${user.globalName || user.username}. Lượt của **${currentPlayer.name}**.` };
      }

      const opponentPlayer = session.players[(session.turn + 1) % 2];

      try {
          // Note: In legacy, audioUrl was passed. Here we assume 'actionDescription' IS the text or we need audio.
          // If actionDescription is a URL, handle it? 
          // For now, let's assume we pass text. If logic requires audio-to-text, we need that service.
          // The user mentioned "Prompt đỉnh cao đâu", so we MUST use the legacy prompt.
          
          // Legacy prompt expects "audioTranscript"
          const audioTranscript = actionDescription; // logic simplification for now

          const gamePrompt = `
          Bối cảnh: Trận đấu PK giữa ${currentPlayer.name} (HP: ${currentPlayer.hp}/${currentPlayer.maxHp}) và ${opponentPlayer.name} (HP: ${opponentPlayer.hp}/${opponentPlayer.maxHp}).
          Lượt của ${currentPlayer.name}.
          Hành động của ${currentPlayer.name}: "${audioTranscript}".
          Hãy tạo một kịch bản sinh động mô tả hành động này, tính toán sát thương hợp lý (10-30 HP).
          JSON: { "description": "...", "damage": "number" }`;

          const result: any = await geminiService.generateJSON(gamePrompt);
          const damage = parseInt(result.damage) || 0;

          opponentPlayer.hp -= damage;
          if (opponentPlayer.hp < 0) opponentPlayer.hp = 0;

          session.log.push(result.description);
          session.turn = (session.turn + 1) % 2;

          const turnMessage = `
          **--- Lượt đấu ---**
          ${result.description}
          ${currentPlayer.name}: ${currentPlayer.hp}/${currentPlayer.maxHp} HP
          ${opponentPlayer.name}: ${opponentPlayer.hp}/${opponentPlayer.maxHp} HP
          ---
          Lượt tiếp theo là của **${session.players[session.turn].name}**.`;

          if (opponentPlayer.hp <= 0) {
              return this.endGame(guildId, currentPlayer, opponentPlayer, turnMessage); // Fixed signature
          }

          return { success: true, message: turnMessage };

      } catch (error) {
          console.error('PK Turn Error:', error);
          return { success: false, message: "Lỗi xử lý lượt đấu." };
      }
  }

  private endGame(guildId: string, winner: IPlayer | null, loser: IPlayer | null, finalTurnMessage: string | null) {
      const session = this.sessions.get(guildId);
      if (!session) return { success: false, message: "No game." };
      
      session.status = "ended";
      
      let msg = "🎉 **Trận đấu PK đã kết thúc!**\n";
      if (finalTurnMessage) msg += finalTurnMessage + '\n';
      if (winner && loser) msg += `Chúc mừng **${winner.name}** đã đánh bại **${loser.name}**!`;
      
      this.sessions.delete(guildId);
      return { success: true, message: msg };
  }
}

export const pkGameService = new PKGameService();
