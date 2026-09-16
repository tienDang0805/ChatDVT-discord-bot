import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { SurvivorArena } from './SurvivorArena';
import { Loader2 } from 'lucide-react';

const DISCORD_CLIENT_ID = '1376397644238426173';

const isRunningInDiscord = (): boolean => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('frame_id') || params.has('instance_id') || window.self !== window.top;
  } catch {
    return true;
  }
};

export const SurvivorArenaActivity = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'web'>('loading');
  const [error, setError] = useState('');

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

        setError('');
        setStatus('ready');
      } catch (err: any) {
        console.error('[SurvivorArena Activity] Failed:', err);
        setStatus('error');
        setError(err.message || 'Unknown error');
      }
    };

    initActivity();
  }, []);

  if (status === 'web') {
    return <SurvivorArena />;
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

  return <SurvivorArena />;
};

export default SurvivorArenaActivity;
