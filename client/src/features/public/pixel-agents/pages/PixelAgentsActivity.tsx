import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { PixelAgents } from './PixelAgents';
import { Loader2 } from 'lucide-react';

const DISCORD_CLIENT_ID = '1376397644238426173';

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

const isRunningInDiscord = (): boolean => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('frame_id') || params.has('instance_id') || window.self !== window.top;
  } catch {
    return true;
  }
};

export const PixelAgentsActivity = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'web'>('loading');
  const [error, setError] = useState('');
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);

  useEffect(() => {
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
        console.log('[Activity] Step 1: Creating DiscordSDK...');
        setError('SDK init...');
        const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

        console.log('[Activity] Step 2: Waiting for ready()...');
        setError('Waiting ready()...');
        await Promise.race([
          discordSdk.ready(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('SDK ready() timeout (15s) — Discord không phản hồi. Kiểm tra URL Mapping trong Developer Portal.')), 15000)),
        ]);

        console.log('[Activity] Step 3: Authorizing...');
        setError('Authorizing...');
        const { code } = await discordSdk.commands.authorize({
          client_id: DISCORD_CLIENT_ID,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify'],
        });

        console.log('[Activity] Step 4: Exchanging token...');
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

        console.log('[Activity] Step 5: Authenticating...');
        setError('Authenticating...');
        const auth = await discordSdk.commands.authenticate({ access_token });
        if (!auth) throw new Error('Authentication failed');

        if (auth.user) {
          setDiscordUser(auth.user as DiscordUser);
        }

        console.log('[Activity] ✅ Ready!');
        setError('');
        setStatus('ready');
      } catch (err: any) {
        console.error('[Activity] ❌ Failed:', err);
        setStatus('error');
        setError(err.message || 'Unknown error');
      }
    };

    initActivity();
  }, []);

  if (status === 'web') {
    return <PixelAgents />;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-orange-500 animate-spin" />
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
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-6xl">💥</div>
        <h1 className="text-white font-black text-xl">Activity lỗi rồi sếp ơi</h1>
        <p className="text-slate-400 font-mono text-sm text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {discordUser && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-2 bg-[#131b26] border border-slate-700 rounded-lg px-3 py-1.5">
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
      <PixelAgents isActivity />
    </div>
  );
};

export default PixelAgentsActivity;
