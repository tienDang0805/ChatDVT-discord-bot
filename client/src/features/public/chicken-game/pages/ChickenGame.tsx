import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';

const W = 400, H = 600;

interface Entity { x: number; y: number; w: number; h: number; }
interface Chicken extends Entity { alive: boolean; dx: number; type: number; }
interface Bullet extends Entity { dy: number; }
interface Egg extends Entity { dy: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }

const CHICKEN_ROWS = 4, CHICKEN_COLS = 8;

export const ChickenGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('chickenHS') || '0'));
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const gameRef = useRef<{
    player: Entity; bullets: Bullet[]; eggs: Egg[]; chickens: Chicken[];
    particles: Particle[]; keys: Set<string>; score: number; lives: number;
    level: number; frame: number; eggTimer: number; paused: boolean;
    touchX: number | null; shooting: boolean;
  }>({
    player: { x: W / 2 - 20, y: H - 50, w: 40, h: 30 },
    bullets: [], eggs: [], chickens: [], particles: [],
    keys: new Set(), score: 0, lives: 3, level: 1, frame: 0,
    eggTimer: 0, paused: false, touchX: null, shooting: false,
  });
  const rafRef = useRef<number>(0);

  const createChickens = useCallback((lvl: number) => {
    const chickens: Chicken[] = [];
    const rows = Math.min(CHICKEN_ROWS + Math.floor(lvl / 3), 6);
    const cols = CHICKEN_COLS;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        chickens.push({
          x: 30 + c * 44, y: 30 + r * 40, w: 32, h: 28,
          alive: true, dx: 1 + lvl * 0.3, type: r % 3,
        });
      }
    }
    return chickens;
  }, []);

  const addParticles = (x: number, y: number, color: string, count: number) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      g.particles.push({
        x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
        life: 20 + Math.random() * 15, color, size: 2 + Math.random() * 3,
      });
    }
  };

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.player = { x: W / 2 - 20, y: H - 50, w: 40, h: 30 };
    g.bullets = []; g.eggs = []; g.particles = [];
    g.score = 0; g.lives = 3; g.level = 1; g.frame = 0; g.eggTimer = 0;
    g.chickens = createChickens(1);
    setScore(0); setLives(3); setLevel(1);
    setGameState('playing');
  }, [createChickens]);

  const nextLevel = useCallback(() => {
    const g = gameRef.current;
    g.level++; g.bullets = []; g.eggs = [];
    g.chickens = createChickens(g.level);
    setLevel(g.level);
  }, [createChickens]);

  const gameOver = useCallback(() => {
    const g = gameRef.current;
    setScore(g.score);
    if (g.score > highScore) {
      setHighScore(g.score);
      localStorage.setItem('chickenHS', String(g.score));
    }
    setGameState('gameover');
  }, [highScore]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const g = gameRef.current;

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (['ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) e.preventDefault();
      if (down) g.keys.add(e.key); else g.keys.delete(e.key);
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      g.touchX = (e.touches[0].clientX - rect.left) * scaleX;
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      g.shooting = true;
      onTouchMove(e);
    };
    const onTouchEnd = () => { g.touchX = null; g.shooting = false; };
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    const hit = (a: Entity, b: Entity) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const drawChicken = (c: Chicken) => {
      const colors = ['#ff6b6b', '#ffd93d', '#6bcb77'];
      const col = colors[c.type];
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2 + 2, c.w / 2, c.h / 2 - 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(c.x + c.w / 2 - 5, c.y + c.h / 2 - 2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.x + c.w / 2 + 5, c.y + c.h / 2 - 2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(c.x + c.w / 2 - 4, c.y + c.h / 2 - 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.x + c.w / 2 + 6, c.y + c.h / 2 - 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff9f43';
      ctx.beginPath();
      ctx.moveTo(c.x + c.w / 2, c.y + c.h / 2 + 4);
      ctx.lineTo(c.x + c.w / 2 - 4, c.y + c.h / 2 + 8);
      ctx.lineTo(c.x + c.w / 2 + 4, c.y + c.h / 2 + 8);
      ctx.fill();
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(c.x + c.w / 2, c.y + 4);
      ctx.lineTo(c.x + c.w / 2 - 4, c.y - 2);
      ctx.lineTo(c.x + c.w / 2 + 4, c.y - 2);
      ctx.fill();
      const wingOff = Math.sin(g.frame * 0.15) * 3;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(c.x - 2, c.y + c.h / 2 + wingOff, 5, 8, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(c.x + c.w + 2, c.y + c.h / 2 - wingOff, 5, 8, 0.3, 0, Math.PI * 2); ctx.fill();
    };

    const loop = () => {
      g.frame++;
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 30; i++) {
        const sx = (i * 97 + g.frame * 0.1) % W;
        const sy = (i * 73 + g.frame * 0.05) % H;
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(g.frame * 0.02 + i) * 0.15})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      if (g.touchX !== null) {
        g.player.x += (g.touchX - g.player.x - g.player.w / 2) * 0.15;
      } else {
        if (g.keys.has('ArrowLeft') || g.keys.has('a')) g.player.x -= 5;
        if (g.keys.has('ArrowRight') || g.keys.has('d')) g.player.x += 5;
      }
      g.player.x = Math.max(0, Math.min(W - g.player.w, g.player.x));

      if ((g.keys.has(' ') || g.keys.has('Space') || g.shooting) && g.frame % 10 === 0) {
        g.bullets.push({ x: g.player.x + g.player.w / 2 - 2, y: g.player.y - 8, w: 4, h: 10, dy: -8 });
      }

      g.bullets = g.bullets.filter(b => { b.y += b.dy; return b.y > -10; });

      let moveDown = false;
      const alive = g.chickens.filter(c => c.alive);
      if (alive.length > 0) {
        const minX = Math.min(...alive.map(c => c.x));
        const maxX = Math.max(...alive.map(c => c.x + c.w));
        if (maxX >= W - 5 || minX <= 5) {
          alive.forEach(c => c.dx = -c.dx);
          moveDown = true;
        }
        g.chickens.forEach(c => {
          if (!c.alive) return;
          c.x += c.dx;
          if (moveDown) c.y += 12;
        });
      }

      g.eggTimer++;
      const eggRate = Math.max(30, 80 - g.level * 8);
      if (g.eggTimer >= eggRate && alive.length > 0) {
        g.eggTimer = 0;
        const shooter = alive[Math.floor(Math.random() * alive.length)];
        g.eggs.push({ x: shooter.x + shooter.w / 2 - 3, y: shooter.y + shooter.h, w: 6, h: 8, dy: 2.5 + g.level * 0.3 });
      }
      g.eggs = g.eggs.filter(e => { e.y += e.dy; return e.y < H + 10; });

      for (let bi = g.bullets.length - 1; bi >= 0; bi--) {
        for (const c of g.chickens) {
          if (!c.alive) continue;
          if (hit(g.bullets[bi], c)) {
            c.alive = false;
            g.bullets.splice(bi, 1);
            g.score += 10 * g.level;
            setScore(g.score);
            addParticles(c.x + c.w / 2, c.y + c.h / 2, ['#ff6b6b', '#ffd93d', '#6bcb77'][c.type], 12);
            break;
          }
        }
      }

      for (let ei = g.eggs.length - 1; ei >= 0; ei--) {
        if (hit(g.eggs[ei], g.player)) {
          g.eggs.splice(ei, 1);
          g.lives--;
          setLives(g.lives);
          addParticles(g.player.x + g.player.w / 2, g.player.y, '#60a5fa', 15);
          if (g.lives <= 0) { gameOver(); return; }
        }
      }

      for (const c of g.chickens) {
        if (c.alive && c.y + c.h >= g.player.y) { gameOver(); return; }
      }

      if (alive.length === 0) { nextLevel(); return; }

      g.chickens.forEach(c => { if (c.alive) drawChicken(c); });

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(g.player.x + g.player.w / 2, g.player.y - 5);
      ctx.lineTo(g.player.x, g.player.y + g.player.h);
      ctx.lineTo(g.player.x + g.player.w, g.player.y + g.player.h);
      ctx.fill();
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(g.player.x + g.player.w / 2 - 3, g.player.y + g.player.h - 6, 6, 6);
      const flameH = 4 + Math.random() * 6;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(g.player.x + g.player.w / 2 - 5, g.player.y + g.player.h);
      ctx.lineTo(g.player.x + g.player.w / 2, g.player.y + g.player.h + flameH);
      ctx.lineTo(g.player.x + g.player.w / 2 + 5, g.player.y + g.player.h);
      ctx.fill();

      g.bullets.forEach(b => {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(251,191,36,.3)';
        ctx.fillRect(b.x - 1, b.y + b.h, b.w + 2, 6);
      });

      g.eggs.forEach(e => {
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life--; p.vy += 0.1;
        ctx.globalAlpha = p.life / 35;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
        return p.life > 0;
      });

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`⭐ ${g.score}`, 10, 22);
      ctx.fillText(`Lv.${g.level}`, W / 2 - 15, 22);
      ctx.fillText('❤️'.repeat(g.lives), W - 60, 22);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [gameState, gameOver, nextLevel]);

  useEffect(() => { document.title = 'Bắn Gà | devtiendang.blog'; }, []);

  return (
    <PageShell title="Bắn Gà" subtitle="Chicken Invaders" icon="🐔" maxWidth="2xl">
      <style>{`
        canvas{image-rendering:pixelated;border-radius:12px;border:2px solid rgba(96,165,250,.15);max-width:100%;height:auto!important}
      `}</style>

      <div className="flex justify-end mb-3">
        <span className="text-sm text-slate-400 dark:text-slate-500">🏆 {highScore}</span>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <canvas ref={canvasRef} width={W} height={H} style={{ display: gameState === 'playing' ? 'block' : 'none', touchAction: 'none' }} />

          {gameState === 'menu' && (
            <div className="fade-up bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm" style={{width:W,maxWidth:'100%'}}>
              <div className="text-6xl mb-4">🐔</div>
              <h2 className="text-2xl font-black text-blue-500 mb-2">CHICKEN INVADERS</h2>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 leading-relaxed">
                ← → hoặc A D để di chuyển<br />Space để bắn · Hỗ trợ cảm ứng
              </p>
              <button onClick={startGame} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-sm active:scale-[0.98] uppercase tracking-wider">
                <Play size={20} /> BẮT ĐẦU
              </button>
              {highScore > 0 && <p className="text-slate-400 dark:text-slate-500 text-xs mt-4">Kỷ lục: {highScore} điểm</p>}
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="fade-up bg-white dark:bg-[#131923] border border-red-200 dark:border-red-500/20 rounded-2xl p-10 text-center shadow-sm" style={{width:W,maxWidth:'100%'}}>
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-2xl font-black text-red-500 mb-2">GAME OVER</h2>
              <div className="flex justify-center gap-10 mb-6">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs">Điểm</p>
                  <p className="text-yellow-500 text-2xl font-black">{score}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs">Level</p>
                  <p className="text-blue-500 text-2xl font-black">{level}</p>
                </div>
              </div>
              {score >= highScore && score > 0 && <p className="text-yellow-500 text-sm font-bold mb-4">🏆 KỶ LỤC MỚI!</p>}
              <button onClick={startGame} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-sm active:scale-[0.98] uppercase tracking-wider">
                <RotateCcw size={18} /> CHƠI LẠI
              </button>
            </div>
          )}
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="flex justify-center gap-6 mt-3 text-sm text-slate-400 dark:text-slate-500">
          <span>⭐ {score}</span>
          <span>Lv.{level}</span>
          <span>{'❤️'.repeat(lives)}</span>
        </div>
      )}
    </PageShell>
  );
};
