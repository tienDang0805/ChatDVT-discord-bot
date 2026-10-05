import type { ReactNode } from 'react';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
import GlobalMusicPlayer from './GlobalMusicPlayer';
import { ChatWidget } from './ChatWidget';
import { ErrorBoundary } from './ErrorBoundary';
import { OfflineBanner } from './OfflineBanner';
import { NavigationProgress } from './NavigationProgress';
import { Toaster } from 'react-hot-toast';

// Keep the server HTML and the browser's first render structurally identical.
export function AppShell({ children, chatWidget = false }: { children: ReactNode; chatWidget?: boolean }) {
  return <MusicPlayerProvider><div className="min-h-screen">
    <OfflineBanner />
    <NavigationProgress />
    <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', style: { borderRadius: '12px', padding: '16px' } }} />
    <GlobalMusicPlayer />
    {chatWidget && <ChatWidget />}
    <ErrorBoundary>{children}</ErrorBoundary>
  </div></MusicPlayerProvider>;
}
