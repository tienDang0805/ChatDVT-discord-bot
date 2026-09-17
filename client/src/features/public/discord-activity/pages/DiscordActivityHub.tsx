import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { Loader2, Gamepad2, Swords, Bird, ArrowLeft, Sparkles } from 'lucide-react';

const DISCORD_CLIENT_ID = '1376397644238426173';

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

type ActiveGame = 'menu' | 'survivor' | 'flappy';

const SurvivorArena = lazy(() =>
  import('../../survivor-arena/pages/SurvivorArena').then(m => ({ default: m.SurvivorArena }))
);
const FlappyBirdActivity = lazy(() =>
  import('../../flappy-bird/pages/FlappyBirdActivity').then(m => ({ default: m.FlappyBirdActivity }))
);

const isRunningInDiscord = (): boolean => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('frame_id') || params.has('instance_id') || window.self !== window.top;
  } catch {
    return true;
  }
};

const GAMES: {
  id: ActiveGame;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  border: string;
  glow: string;
  tags: string[];
}[] = [
  {
    id: 'survivor',
    title: 'Survivor Arena 8D',
    subtitle: 'Roguelike Auto-Shooter',
    description: 'Chọn chiến binh, chiến đấu chống quái vật theo đợt, nâng cấp kỹ năng, tiến hóa tối thượng qua 20 Wave!',
    icon: '⚔️',
    gradient: 'from-amber-600/30 via-rose-600/20 to-purple-700/30',
    border: 'border-amber-500/40 hover:border-amber-400/70',
    glow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]',
    tags: ['7 Nhân vật', '20 Wave', 'Boss & Tiến hóa'],
  },
  {
    id: 'flappy',
    title: 'Flappy Bird',
    subtitle: 'Arcade Classic',
    description: 'Điều khiển chú chim bay qua các chướng ngại vật! Bảng xếp hạng realtime cùng thành viên trong room.',
    icon: '🐦',
    gradient: 'from-emerald-600/30 via-cyan-600/20 to-sky-700/30',
    border: 'border-emerald-500/40 hover:border-emerald-400/70',
    glow: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.3)]',
    tags: ['Xếp hạng', 'Realtime', 'Dễ chơi khó Master'],
  },
];

const GameHubLoading = () => (
  <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
    <Loader2 size={36} className="text-amber-500 animate-spin" />
    <p className="text-slate-400 font-mono text-sm tracking-wider animate-pulse">
      Đang tải game...
    </p>
  </div>
);

export const DiscordActivityHub = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'web'>('loading');
  const [error, setError] = useState('');
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');
  const channelIdRef = useRef<string>('');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (!isRunningInDiscord()) {
      setStatus('web');
      return;
    }

    const initActivity = async () => {
      try {
        setError('SDK init...');
        const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

        setError('Waiting ready()...');
        await Promise.race([
          discordSdk.ready(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SDK ready() timeout (15s)')), 15000)
          ),
        ]);

        setError('Authorizing...');
        const { code } = await discordSdk.commands.authorize({
          client_id: DISCORD_CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify'],
        });

        setError('Token exchange...');
        const tokenRes = await fetch('/api/activity-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!tokenRes.ok) {
          const errBody = await tokenRes.text();
          throw new Error(`Token exchange failed: ${tokenRes.status} ${errBody}`);
        }
        const { access_token } = await tokenRes.json();

        setError('Authenticating...');
        const auth = await discordSdk.commands.authenticate({ access_token });
        if (!auth) throw new Error('Authentication failed');

        if (auth.user) {
          setDiscordUser(auth.user as DiscordUser);
        }

        channelIdRef.current = discordSdk.channelId || 'global';

        setError('');
        setStatus('ready');
        requestAnimationFrame(() => setAnimateIn(true));
      } catch (err: any) {
        console.error('[DiscordActivityHub] Failed:', err);
        setStatus('error');
        setError(err.message || 'Unknown error');
      }
    };

    initActivity();
  }, []);

  const backToMenu = useCallback(() => {
    setActiveGame('menu');
    setAnimateIn(false);
    requestAnimationFrame(() => setAnimateIn(true));
  }, []);

  if (status === 'web') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] relative">
        <WebGameHub onSelect={setActiveGame} activeGame={activeGame} onBack={backToMenu} />
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-amber-500 animate-spin" />
        <p className="text-slate-400 font-mono text-sm tracking-wider animate-pulse">
          Đang kết nối Discord Activity...
        </p>
        {error && <p className="text-slate-600 font-mono text-xs">{error}</p>}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-6xl">💥</div>
        <h1 className="text-white font-black text-xl">Activity lỗi!</h1>
        <p className="text-slate-400 font-mono text-sm text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (activeGame === 'survivor') {
    return (
      <div className="relative min-h-screen">
        <Suspense fallback={<GameHubLoading />}>
          <SurvivorArena onBackToMenu={backToMenu} />
        </Suspense>
        <BackToMenuPill onClick={backToMenu} />
      </div>
    );
  }

  if (activeGame === 'flappy') {
    return (
      <div className="relative min-h-screen">
        <Suspense fallback={<GameHubLoading />}>
          <FlappyBirdActivity
            preAuthUser={discordUser}
            preAuthChannelId={channelIdRef.current}
            onBackToMenu={backToMenu}
          />
        </Suspense>
        <BackToMenuPill onClick={backToMenu} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0d1225] to-[#060911] relative overflow-hidden">
      <style>{`
        @keyframes hubCardIn {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          33% { transform: translate(30px, -20px) scale(1.1); opacity: 0.6; }
          66% { transform: translate(-20px, 10px) scale(0.95); opacity: 0.3; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-amber-500/8 blur-3xl" style={{ animation: 'orbFloat 12s ease-in-out infinite' }} />
        <div className="absolute bottom-32 right-16 w-64 h-64 rounded-full bg-purple-600/8 blur-3xl" style={{ animation: 'orbFloat 16s ease-in-out infinite 3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" style={{ animation: 'orbFloat 20s ease-in-out infinite 6s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 md:py-10">
        {discordUser && (
          <div
            className="flex items-center gap-2.5 bg-[#131b26]/80 border border-slate-700/50 rounded-full px-4 py-2 backdrop-blur-sm mb-6 md:mb-8"
            style={animateIn ? { animation: 'hubCardIn 0.4s ease-out' } : { opacity: 0 }}
          >
            {discordUser.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.webp?size=64`}
                alt=""
                className="w-7 h-7 rounded-full ring-2 ring-amber-500/40"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-700 ring-2 ring-slate-600" />
            )}
            <span className="text-sm font-bold text-slate-200">
              {discordUser.global_name || discordUser.username}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        <div
          className="text-center mb-8 md:mb-12"
          style={animateIn ? { animation: 'hubCardIn 0.5s ease-out 0.1s both' } : { opacity: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-3">
            <Gamepad2 size={13} />
            <span>ChatDVT Game Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 mb-2">
            CHỌN GAME ĐỂ CHƠI
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-md mx-auto">
            Chơi cùng bạn bè ngay trong Discord! Chọn một game bên dưới để bắt đầu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl w-full">
          {GAMES.map((game, idx) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`group relative text-left bg-gradient-to-br ${game.gradient} border-2 ${game.border} rounded-3xl p-5 md:p-7 transition-all duration-300 ${game.glow} active:scale-[0.97] overflow-hidden backdrop-blur-sm`}
              style={animateIn ? { animation: `hubCardIn 0.5s ease-out ${0.2 + idx * 0.12}s both` } : { opacity: 0 }}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/2"
                  style={{ animation: 'shimmerSweep 4s ease-in-out infinite' }}
                />
              </div>

              <div className="relative z-10">
                <div
                  className="text-5xl md:text-6xl mb-3"
                  style={{ animation: 'floatSlow 4s ease-in-out infinite' }}
                >
                  {game.icon}
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-0.5 group-hover:text-amber-200 transition-colors">
                  {game.title}
                </h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {game.subtitle}
                </p>
                <p className="text-xs md:text-sm text-slate-300/80 leading-relaxed mb-4">
                  {game.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {game.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-amber-400 group-hover:text-amber-300 font-black text-sm transition-colors">
                  <Sparkles size={14} />
                  <span>CHƠI NGAY</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <p className="text-[11px] text-slate-600 font-mono tracking-wider">
            Powered by ChatDVT 8D • {GAMES.length} game khả dụng
          </p>
        </div>
      </div>
    </div>
  );
};

function BackToMenuPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 bg-[#131b26]/90 border border-slate-700/60 rounded-full backdrop-blur-md shadow-2xl text-xs font-bold text-slate-300 hover:text-white hover:border-amber-500/50 transition-all hover:bg-[#1a2332]/95 active:scale-95"
    >
      <ArrowLeft size={14} />
      <span>Menu Game</span>
    </button>
  );
}

function WebGameHub({
  onSelect,
  activeGame,
  onBack,
}: {
  onSelect: (g: ActiveGame) => void;
  activeGame: ActiveGame;
  onBack: () => void;
}) {
  if (activeGame === 'survivor') {
    return (
      <Suspense fallback={<GameHubLoading />}>
        <SurvivorArena onBackToMenu={onBack} />
        <BackToMenuPill onClick={onBack} />
      </Suspense>
    );
  }

  if (activeGame === 'flappy') {
    return (
      <Suspense fallback={<GameHubLoading />}>
        <FlappyBirdActivity onBackToMenu={onBack} />
        <BackToMenuPill onClick={onBack} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0d1225] to-[#060911] relative overflow-hidden">
      <style>{`
        @keyframes hubCardIn {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 md:py-10">
        <div className="text-center mb-8 md:mb-12" style={{ animation: 'hubCardIn 0.5s ease-out' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-3">
            <Gamepad2 size={13} />
            <span>ChatDVT Game Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 mb-2">
            CHỌN GAME ĐỂ CHƠI
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-md mx-auto">
            Chọn một game bên dưới để bắt đầu chơi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl w-full">
          {GAMES.map((game, idx) => (
            <button
              key={game.id}
              onClick={() => onSelect(game.id)}
              className={`group relative text-left bg-gradient-to-br ${game.gradient} border-2 ${game.border} rounded-3xl p-5 md:p-7 transition-all duration-300 ${game.glow} active:scale-[0.97] overflow-hidden backdrop-blur-sm`}
              style={{ animation: `hubCardIn 0.5s ease-out ${0.15 + idx * 0.12}s both` }}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/2"
                  style={{ animation: 'shimmerSweep 4s ease-in-out infinite' }}
                />
              </div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-3" style={{ animation: 'floatSlow 4s ease-in-out infinite' }}>
                  {game.icon}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-0.5 group-hover:text-amber-200 transition-colors">
                  {game.title}
                </h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{game.subtitle}</p>
                <p className="text-xs md:text-sm text-slate-300/80 leading-relaxed mb-4">{game.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {game.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-amber-400 group-hover:text-amber-300 font-black text-sm transition-colors">
                  <Sparkles size={14} />
                  <span>CHƠI NGAY</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiscordActivityHub;
