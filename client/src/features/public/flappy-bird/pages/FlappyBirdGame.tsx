import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface FlappyBirdGameProps {
  onScore?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
  isActivity?: boolean;
}

interface Bird {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
  flapFrame: number;
}

interface Pipe {
  x: number;
  gapY: number;
  gapSize: number;
  scored: boolean;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

type GameState = 'menu' | 'playing' | 'gameover';

const BASE_W = 400;
const BASE_H = 640;
const GRAVITY = 0.45;
const FLAP_FORCE = -7.5;
const PIPE_WIDTH = 52;
const PIPE_SPEED_BASE = 2.5;
const PIPE_SPAWN_INTERVAL = 100;
const BIRD_SIZE = 28;
const GROUND_H = 60;

const PIPE_COLORS = [
  '#22c55e', '#16a34a', '#15803d',
  '#10b981', '#059669', '#047857',
];

const SKY_GRADIENT_TOP = '#1e3a5f';
const SKY_GRADIENT_BOTTOM = '#87ceeb';

export const FlappyBirdGame = ({ onScore, onGameOver, isActivity = false }: FlappyBirdGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('flappy_high_score') || '0'));
  const [canvasSize, setCanvasSize] = useState({ w: BASE_W, h: BASE_H });

  const gameRef = useRef<{
    bird: Bird;
    pipes: Pipe[];
    particles: Particle[];
    score: number;
    frame: number;
    groundOffset: number;
    pipeSpeed: number;
    flash: number;
    shakeX: number;
    shakeY: number;
    starField: Array<{ x: number; y: number; s: number; b: number }>;
  }>({
    bird: { x: BASE_W * 0.28, y: BASE_H / 2, velocity: 0, rotation: 0, flapFrame: 0 },
    pipes: [],
    particles: [],
    score: 0,
    frame: 0,
    groundOffset: 0,
    pipeSpeed: PIPE_SPEED_BASE,
    flash: 0,
    shakeX: 0,
    shakeY: 0,
    starField: [],
  });
  const rafRef = useRef(0);
  const stateRef = useRef<GameState>('menu');

  useEffect(() => {
    const resize = () => {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;
      const ratio = BASE_W / BASE_H;
      let w: number, h: number;
      if (maxW / maxH > ratio) {
        h = maxH;
        w = h * ratio;
      } else {
        w = maxW;
        h = w / ratio;
      }
      setCanvasSize({ w: Math.floor(w), h: Math.floor(h) });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const stars: Array<{ x: number; y: number; s: number; b: number }> = [];
    for (let i = 0; i < 30; i++) {
      stars.push({
        x: Math.random() * BASE_W,
        y: Math.random() * (BASE_H - GROUND_H - 100),
        s: Math.random() * 2 + 0.5,
        b: Math.random(),
      });
    }
    gameRef.current.starField = stars;
  }, []);

  const addParticles = (x: number, y: number, color: string, count: number) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      g.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.bird = { x: BASE_W * 0.28, y: BASE_H / 2, velocity: 0, rotation: 0, flapFrame: 0 };
    g.pipes = [];
    g.particles = [];
    g.score = 0;
    g.frame = 0;
    g.groundOffset = 0;
    g.pipeSpeed = PIPE_SPEED_BASE;
    g.flash = 0;
    g.shakeX = 0;
    g.shakeY = 0;
  }, []);

  const flap = useCallback(() => {
    if (stateRef.current === 'menu') {
      resetGame();
      stateRef.current = 'playing';
      setGameState('playing');
      setScore(0);
    }
    if (stateRef.current === 'playing') {
      gameRef.current.bird.velocity = FLAP_FORCE;
      gameRef.current.bird.flapFrame = 6;
    }
  }, [resetGame]);

  const restart = useCallback(() => {
    resetGame();
    stateRef.current = 'playing';
    setGameState('playing');
    setScore(0);
  }, [resetGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (stateRef.current === 'gameover') {
          restart();
        } else {
          flap();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flap, restart]);

  const drawBird = useCallback((ctx: CanvasRenderingContext2D, bird: Bird) => {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    const isFlapping = bird.flapFrame > 0;

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(-2, -3, BIRD_SIZE / 3, BIRD_SIZE / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(6, -5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(7, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(BIRD_SIZE / 2 - 2, -2);
    ctx.lineTo(BIRD_SIZE / 2 + 8, 0);
    ctx.lineTo(BIRD_SIZE / 2 - 2, 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    const wingAngle = isFlapping ? -0.5 : 0.3;
    ctx.save();
    ctx.translate(-4, 4);
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, []);

  const drawPipe = useCallback((ctx: CanvasRenderingContext2D, pipe: Pipe) => {
    const topH = pipe.gapY - pipe.gapSize / 2;
    const bottomY = pipe.gapY + pipe.gapSize / 2;

    const drawPipeSection = (x: number, y: number, w: number, h: number, isTop: boolean) => {
      const grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, pipe.color);
      grad.addColorStop(0.3, '#4ade80');
      grad.addColorStop(0.7, pipe.color);
      grad.addColorStop(1, '#166534');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x, y, 3, h);
      ctx.fillRect(x + w - 3, y, 3, h);

      const capH = 20;
      const capX = x - 4;
      const capW = w + 8;
      const capY = isTop ? y + h - capH : y;
      const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
      capGrad.addColorStop(0, '#166534');
      capGrad.addColorStop(0.3, '#4ade80');
      capGrad.addColorStop(0.7, pipe.color);
      capGrad.addColorStop(1, '#166534');
      ctx.fillStyle = capGrad;
      ctx.fillRect(capX, capY, capW, capH);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(capX, capY, capW, capH);
    };

    if (topH > 0) drawPipeSection(pipe.x, 0, PIPE_WIDTH, topH, true);
    drawPipeSection(pipe.x, bottomY, PIPE_WIDTH, BASE_H - GROUND_H - bottomY, false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const g = gameRef.current;
      const scale = canvasSize.w / BASE_W;
      canvas.width = canvasSize.w;
      canvas.height = canvasSize.h;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

      if (g.flash > 0) g.flash--;
      if (g.shakeX !== 0) g.shakeX *= 0.8;
      if (g.shakeY !== 0) g.shakeY *= 0.8;
      if (Math.abs(g.shakeX) < 0.5) g.shakeX = 0;
      if (Math.abs(g.shakeY) < 0.5) g.shakeY = 0;

      ctx.save();
      ctx.translate(g.shakeX, g.shakeY);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, BASE_H - GROUND_H);
      skyGrad.addColorStop(0, SKY_GRADIENT_TOP);
      skyGrad.addColorStop(1, SKY_GRADIENT_BOTTOM);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      g.starField.forEach(s => {
        s.b += 0.02;
        const alpha = 0.2 + Math.abs(Math.sin(s.b)) * 0.5;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      });

      const cloudY1 = 60 + Math.sin(g.frame * 0.005) * 10;
      const cloudY2 = 140 + Math.cos(g.frame * 0.004) * 8;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      [{ x: 50, y: cloudY1 }, { x: 250, y: cloudY2 }, { x: 350, y: 90 }].forEach(c => {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 40, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x + 25, c.y - 5, 25, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x - 20, c.y + 3, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      if (stateRef.current === 'playing') {
        g.frame++;
        g.pipeSpeed = PIPE_SPEED_BASE + g.score * 0.08;
        if (g.pipeSpeed > 5.5) g.pipeSpeed = 5.5;

        g.bird.velocity += GRAVITY;
        g.bird.y += g.bird.velocity;
        g.bird.rotation = Math.max(-0.5, Math.min(g.bird.velocity * 0.06, 1.5));
        if (g.bird.flapFrame > 0) g.bird.flapFrame--;

        g.groundOffset = (g.groundOffset + g.pipeSpeed) % 24;

        if (g.frame % PIPE_SPAWN_INTERVAL === 0) {
          const minGap = Math.max(110, 150 - g.score * 2);
          const gapSize = minGap + Math.random() * 30;
          const minY = gapSize / 2 + 40;
          const maxY = BASE_H - GROUND_H - gapSize / 2 - 40;
          const gapY = minY + Math.random() * (maxY - minY);
          g.pipes.push({
            x: BASE_W + 10,
            gapY,
            gapSize,
            scored: false,
            color: PIPE_COLORS[Math.floor(Math.random() * PIPE_COLORS.length)],
          });
        }

        g.pipes.forEach(p => {
          p.x -= g.pipeSpeed;
          if (!p.scored && p.x + PIPE_WIDTH < g.bird.x) {
            p.scored = true;
            g.score++;
            setScore(g.score);
            onScore?.(g.score);
            addParticles(g.bird.x, g.bird.y, '#fbbf24', 8);
          }
        });
        g.pipes = g.pipes.filter(p => p.x + PIPE_WIDTH > -10);

        const bx = g.bird.x;
        const by = g.bird.y;
        const br = BIRD_SIZE / 2 - 3;

        if (by + br > BASE_H - GROUND_H || by - br < 0) {
          stateRef.current = 'gameover';
          setGameState('gameover');
          g.flash = 8;
          g.shakeX = (Math.random() - 0.5) * 12;
          g.shakeY = (Math.random() - 0.5) * 12;
          addParticles(bx, by, '#ef4444', 20);
          if (g.score > highScore) {
            setHighScore(g.score);
            localStorage.setItem('flappy_high_score', String(g.score));
          }
          onGameOver?.(g.score);
        }

        for (const p of g.pipes) {
          const topH = p.gapY - p.gapSize / 2;
          const bottomY = p.gapY + p.gapSize / 2;
          if (
            bx + br > p.x && bx - br < p.x + PIPE_WIDTH &&
            (by - br < topH || by + br > bottomY)
          ) {
            stateRef.current = 'gameover';
            setGameState('gameover');
            g.flash = 8;
            g.shakeX = (Math.random() - 0.5) * 12;
            g.shakeY = (Math.random() - 0.5) * 12;
            addParticles(bx, by, '#ef4444', 20);
            if (g.score > highScore) {
              setHighScore(g.score);
              localStorage.setItem('flappy_high_score', String(g.score));
            }
            onGameOver?.(g.score);
            break;
          }
        }
      }

      if (stateRef.current === 'menu') {
        g.bird.y = BASE_H / 2 + Math.sin(g.frame * 0.05) * 15;
        g.bird.rotation = 0;
        g.frame++;
        g.groundOffset = (g.groundOffset + 1) % 24;
      }

      g.pipes.forEach(p => drawPipe(ctx, p));
      drawBird(ctx, g.bird);

      g.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life--;
        const alpha = Math.max(0, p.life / 50);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1;
      g.particles = g.particles.filter(p => p.life > 0);

      const groundY = BASE_H - GROUND_H;
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, BASE_H);
      groundGrad.addColorStop(0, '#8B7355');
      groundGrad.addColorStop(0.1, '#a0522d');
      groundGrad.addColorStop(1, '#654321');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, BASE_W, GROUND_H);

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, groundY, BASE_W, 8);
      ctx.fillStyle = '#22c55e';
      for (let i = -g.groundOffset; i < BASE_W; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, groundY + 8);
        ctx.lineTo(i + 12, groundY);
        ctx.lineTo(i + 24, groundY + 8);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(139,115,85,0.3)';
      for (let i = 0; i < BASE_W; i += 30) {
        ctx.fillRect(i + 5, groundY + 20, 12, 6);
        ctx.fillRect(i + 15, groundY + 40, 10, 5);
      }

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flash * 0.08})`;
        ctx.fillRect(0, 0, BASE_W, BASE_H);
      }

      if (stateRef.current === 'playing' || stateRef.current === 'gameover') {
        ctx.save();
        ctx.font = 'bold 48px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillText(String(g.score), BASE_W / 2 + 2, 72);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeText(String(g.score), BASE_W / 2, 70);
        ctx.fillText(String(g.score), BASE_W / 2, 70);
        ctx.restore();
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasSize, highScore, drawBird, drawPipe, onScore, onGameOver]);

  const handleCanvasClick = useCallback(() => {
    if (stateRef.current === 'gameover') return;
    flap();
  }, [flap]);

  return (
    <div className={`flex flex-col items-center justify-center ${isActivity ? 'min-h-screen bg-[#0a0e1a]' : 'min-h-screen bg-slate-50 dark:bg-[#0d1117]'} select-none`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          onClick={handleCanvasClick}
          onTouchStart={(e) => { e.preventDefault(); handleCanvasClick(); }}
          className="block rounded-xl shadow-2xl cursor-pointer"
          style={{ width: canvasSize.w, height: canvasSize.h, touchAction: 'none' }}
        />

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
            <div className="text-6xl mb-3 animate-bounce">🐦</div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              Flappy Bird
            </h1>
            <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
              Tap to Fly
            </p>
            <button
              onClick={flap}
              className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/30"
            >
              <Play size={20} fill="white" /> Chơi ngay
            </button>
            {highScore > 0 && (
              <div className="mt-4 flex items-center gap-2 text-amber-200/80 text-sm font-bold">
                <Trophy size={14} /> Kỷ lục: {highScore}
              </div>
            )}
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
            <div className="text-5xl mb-2">💀</div>
            <h2 className="text-2xl font-black text-white mb-1" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              Game Over
            </h2>
            <div className="flex items-center gap-6 my-4">
              <div className="text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Điểm</p>
                <p className="text-3xl font-black text-white">{score}</p>
              </div>
              <div className="w-px h-10 bg-slate-600" />
              <div className="text-center">
                <p className="text-amber-400 text-xs uppercase tracking-widest">Kỷ lục</p>
                <p className="text-3xl font-black text-amber-400">{highScore}</p>
              </div>
            </div>
            {score >= highScore && score > 0 && (
              <p className="text-amber-300 text-sm font-bold mb-3 animate-pulse">🎉 Kỷ lục mới!</p>
            )}
            <button
              onClick={restart}
              className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/30"
            >
              <RotateCcw size={18} /> Chơi lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlappyBirdGame;
