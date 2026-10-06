import type { ReactNode } from 'react';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
import GlobalMusicPlayer from './GlobalMusicPlayer';
import { ErrorBoundary } from './ErrorBoundary';
import { OfflineBanner } from './OfflineBanner';
import { NavigationProgress } from './NavigationProgress';
import { Toaster } from 'react-hot-toast';

// Keep the server HTML and the browser's first render structurally identical.
export function AppShell({ children }: { children: ReactNode }) {
  return <MusicPlayerProvider><div className="min-h-screen">
    <OfflineBanner />
    <NavigationProgress />
    <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', style: { borderRadius: '12px', padding: '16px' } }} />
    <GlobalMusicPlayer />
    <ErrorBoundary>{children}</ErrorBoundary>
  </div></MusicPlayerProvider>;
}
