import { Router } from 'express';
import { prisma } from '../../database/prisma';
import axios from 'axios';

const router = Router();

// --- Playlist ---
router.post('/music/playlist', async (req, res) => {
    try {
        const { secretCode } = req.body;
        if (!secretCode) return res.status(400).json({ error: 'Missing secretCode' });
        const code = secretCode.trim().toUpperCase();
        let playlist = await prisma.musicPlaylist.findUnique({ where: { secretCode: code } });
        if (!playlist) {
            playlist = await prisma.musicPlaylist.create({ data: { secretCode: code, name: `Trạm phát ${code}`, songs: "[]" } });
        }
        res.json({ ...playlist, songs: JSON.parse(playlist.songs) });
    } catch (err) { console.error('Music playlist error:', err); res.status(500).json({ error: 'Server error' }); }
});

// --- Copy ---
router.post('/music/copy', async (req, res) => {
    try {
        const { sourceCode, targetCode } = req.body;
        if (!sourceCode || !targetCode) return res.status(400).json({ error: 'Thiếu thông tin' });
        const src = sourceCode.trim().toUpperCase();
        const tgt = targetCode.trim().toUpperCase();
        const sourcePlaylist = await prisma.musicPlaylist.findUnique({ where: { secretCode: src } });
        if (!sourcePlaylist) return res.status(404).json({ error: 'Playlist nguồn không tồn tại' });
        const targetPlaylist = await prisma.musicPlaylist.findUnique({ where: { secretCode: tgt } });
        if (targetPlaylist) {
            await prisma.musicPlaylist.update({ where: { secretCode: tgt }, data: { songs: sourcePlaylist.songs } });
        } else {
            await prisma.musicPlaylist.create({ data: { secretCode: tgt, name: `Trạm phát ${tgt}`, songs: sourcePlaylist.songs } });
        }
        res.json({ success: true, targetCode: tgt, songs: JSON.parse(sourcePlaylist.songs) });
    } catch (err) { console.error('Music copy error:', err); res.status(500).json({ error: 'Server error' }); }
});

// --- Add Song ---
router.post('/music/add', async (req, res) => {
    try {
        const { secretCode, youtubeUrl, category } = req.body;
        if (!secretCode || !youtubeUrl) return res.status(400).json({ error: 'Thiếu thông tin' });
        const code = secretCode.trim().toUpperCase();
        const folderName = category?.trim() || 'Tất cả';
        const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const videoId = match ? match[1] : null;
        if (!videoId) return res.status(400).json({ error: 'Link YouTube không hợp lệ' });
        let title = 'Bài hát Youtube';
        try {
            const embedRes = await axios.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            if (embedRes.data && embedRes.data.title) title = embedRes.data.title;
        } catch (e) { /* ignore */ }
        const newSong = { id: Date.now().toString(), videoId, title, coverUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, category: folderName };
        const playlist = await prisma.musicPlaylist.findUnique({ where: { secretCode: code } });
        if (!playlist) return res.status(404).json({ error: 'Không tìm thấy playlist' });
        const songs = JSON.parse(playlist.songs || "[]");
        songs.push(newSong);
        await prisma.musicPlaylist.update({ where: { secretCode: code }, data: { songs: JSON.stringify(songs) } });
        res.json(newSong);
    } catch (err) { console.error('Music add error:', err); res.status(500).json({ error: 'Server error' }); }
});

// --- Remove Song ---
router.post('/music/remove', async (req, res) => {
    try {
        const { secretCode, songId } = req.body;
        const code = secretCode.trim().toUpperCase();
        const playlist = await prisma.musicPlaylist.findUnique({ where: { secretCode: code } });
        if (!playlist) return res.status(404).json({ error: 'Không tìm thấy playlist' });
        let songs = JSON.parse(playlist.songs || "[]");
        songs = songs.filter((s: any) => s.id !== songId);
        await prisma.musicPlaylist.update({ where: { secretCode: code }, data: { songs: JSON.stringify(songs) } });
        res.json({ success: true, songs });
    } catch (err) { console.error('Music remove error:', err); res.status(500).json({ error: 'Server error' }); }
});

export default router;
