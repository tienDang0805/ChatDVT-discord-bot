import { useEffect, useState, useRef, useCallback } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { FlappyBirdGame } from './FlappyBirdGame';
import { Loader2, Trophy, Crown, Medal } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const DISCORD_CLIENT_ID = '1376397644238426173';

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string | null;
  bestScore: number;
  currentScore: number;
  isPlaying: boolean;
}

const isRunningInDiscord = (): boolean => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('frame_id') || params.has('instance_id') || window.self !== window.top;
  } catch {
    return true;
  }
};

const RANK_ICONS = [Crown, Trophy, Medal];
const RANK_COLORS = ['text-amber-400', 'text-slate-300', 'text-amber-700'];

interface FlappyBirdActivityProps {
  preAuthUser?: DiscordUser | null;
  preAuthChannelId?: string;
  onBackToMenu?: () => void;
}

export const FlappyBirdActivity = ({ preAuthUser, preAuthChannelId, onBackToMenu }: FlappyBirdActivityProps) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'web'>(() => {
    if (preAuthUser) return 'ready';
    return 'loading';
  });
  const [error, setError] = useState('');
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(preAuthUser || null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const channelIdRef = useRef<string>(preAuthChannelId || '');

  useEffect(() => {
    if (preAuthUser) {
      const socket = io({ transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('flappy:join', {
          channelId: preAuthChannelId || 'global',
          userId: preAuthUser.id,
          username: preAuthUser.global_name || preAuthUser.username,
          avatar: preAuthUser.avatar,
        });
      });

      socket.on('flappy:leaderboard', (data: LeaderboardEntry[]) => {
        setLeaderboard(data);
      });

      return () => { socket.disconnect(); };
    }

    if (!isRunningInDiscord()) {
      setStatus('web');
      return;
    }

    if (!DISCORD_CLIENT_ID) {
      setStatus('error');
      setError('DISCORD_CLIENT_ID not configured');
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

        const socket = io({ transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('flappy:join', {
            channelId: channelIdRef.current,
            userId: (auth.user as DiscordUser).id,
            username: (auth.user as DiscordUser).global_name || (auth.user as DiscordUser).username,
            avatar: (auth.user as DiscordUser).avatar,
          });
        });

        socket.on('flappy:leaderboard', (data: LeaderboardEntry[]) => {
          setLeaderboard(data);
        });

        setError('');
        setStatus('ready');
      } catch (err: any) {
        console.error('[Activity] Failed:', err);
        setStatus('error');
        setError(err.message || 'Unknown error');
      }
    };

    initActivity();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [preAuthUser, preAuthChannelId]);

  const handleScore = useCallback((currentScore: number) => {
    if (!socketRef.current || !discordUser) return;
    socketRef.current.emit('flappy:score', {
      channelId: channelIdRef.current,
      userId: discordUser.id,
      currentScore,
    });
  }, [discordUser]);

  const handleGameOver = useCallback((finalScore: number) => {
    if (!socketRef.current || !discordUser) return;
    socketRef.current.emit('flappy:gameover', {
      channelId: channelIdRef.current,
      userId: discordUser.id,
      finalScore,
    });
  }, [discordUser]);

  if (status === 'web') {
    return <FlappyBirdGame />;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-amber-500 animate-spin" />
        <p className="text-slate-400 font-mono text-sm tracking-wider animate-pulse">
          Đang kết nối Discord Activity...
        </p>
        {error && (
          <p className="text-slate-600 font-mono text-xs">{error}</p>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-6xl">💥</div>
        <h1 className="text-white font-black text-xl">Activity lỗi rồi!</h1>
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

  return (
    <div className="relative min-h-screen bg-[#0a0e1a] overflow-hidden">
      {discordUser && (
        <div className="absolute top-2 left-2 z-50 flex items-center gap-2 bg-[#131b26]/90 border border-slate-700/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          {discordUser.avatar && (
            <img
              src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.webp?size=32`}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="text-[11px] font-bold text-slate-300">
            {discordUser.global_name || discordUser.username}
          </span>
        </div>
      )}

      <button
        onClick={() => setShowLeaderboard(prev => !prev)}
        className="absolute top-2 right-2 z-50 bg-[#131b26]/90 border border-slate-700/50 rounded-lg p-2 backdrop-blur-sm transition-colors hover:bg-[#1a2332]"
        title="Toggle Leaderboard"
      >
        <Trophy size={16} className="text-amber-400" />
      </button>

      {showLeaderboard && leaderboard.length > 0 && (
        <div className="absolute top-12 right-2 z-40 w-56 bg-[#131b26]/95 border border-slate-700/50 rounded-xl backdrop-blur-sm overflow-hidden shadow-2xl">
          <div className="px-3 py-2 border-b border-slate-700/50 flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Bảng xếp hạng
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {leaderboard.map((entry, idx) => {
              const RankIcon = RANK_ICONS[idx] || null;
              const rankColor = RANK_COLORS[idx] || 'text-slate-500';
              const isMe = entry.userId === discordUser?.id;

              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-2 px-3 py-2 transition-colors ${
                    isMe ? 'bg-amber-500/10 border-l-2 border-amber-400' : 'border-l-2 border-transparent'
                  } ${idx < leaderboard.length - 1 ? 'border-b border-slate-800/50' : ''}`}
                >
                  <div className="w-5 flex-shrink-0 text-center">
                    {RankIcon ? (
                      <RankIcon size={14} className={rankColor} />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">{idx + 1}</span>
                    )}
                  </div>
                  {entry.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${entry.userId}/${entry.avatar}.webp?size=32`}
                      alt=""
                      className="w-5 h-5 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold truncate ${isMe ? 'text-amber-300' : 'text-slate-300'}`}>
                      {entry.username}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-white">{entry.bestScore}</p>
                    {entry.isPlaying && entry.currentScore > 0 && (
                      <p className="text-[9px] text-emerald-400 font-mono animate-pulse">
                        ▶ {entry.currentScore}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <FlappyBirdGame
        isActivity
        onScore={handleScore}
        onGameOver={handleGameOver}
      />
    </div>
  );
};

export default FlappyBirdActivity;
