import { Router } from 'express';
import { webQuizService } from '../../bot/services/webQuiz';

const router = Router();

router.get('/web-quiz/rooms', (req, res) => { res.json(webQuizService.getPublicRooms()); });

router.post('/web-quiz/create', (req, res) => {
    const { creatorName, topic, difficulty, numQuestions, apiKey, timeLimitSecs, tone } = req.body;
    if (!creatorName || !topic || !apiKey) return res.status(400).json({ error: 'Missing info or API Key' });
    res.json(webQuizService.createRoom(creatorName, topic, difficulty || 'Dễ', numQuestions || 5, apiKey, timeLimitSecs || 15, tone || 'Hài hước, giải trí'));
});

router.post('/web-quiz/join', (req, res) => {
    const { roomId, playerName } = req.body;
    if (!roomId || !playerName) return res.status(400).json({ error: 'Missing info' });
    const result = webQuizService.joinRoom(roomId, playerName);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

router.post('/web-quiz/:roomId/start', async (req, res) => {
    const { playerId } = req.body;
    res.json({ success: await webQuizService.startRoom(req.params.roomId, playerId) });
});

router.post('/web-quiz/:roomId/next-round', async (req, res) => {
    const { playerId, newTopic, newTone } = req.body;
    if (!newTopic) return res.status(400).json({ success: false, error: 'Missing topic' });
    res.json({ success: await webQuizService.nextRound(req.params.roomId, playerId, newTopic, newTone || '') });
});

router.get('/web-quiz/:roomId/stream', (req, res) => { webQuizService.addClient(req.params.roomId, res); });

router.post('/web-quiz/:roomId/answer', (req, res) => {
    const { playerId, answer } = req.body;
    res.json(webQuizService.submitAnswer(req.params.roomId, playerId, answer));
});

export default router;
