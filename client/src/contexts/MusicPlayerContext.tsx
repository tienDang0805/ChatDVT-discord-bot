import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

export interface Song {
  id: string;
  videoId: string;
  title: string;
  coverUrl: string;
}

interface MusicPlayerContextType {
  secretCode: string | null;
  setSecretCode: (code: string | null) => void;
  queue: Song[];
  setQueue: (songs: Song[]) => void;
  currentSongIndex: number;
  playSong: (index: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  currentSong: Song | null;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [secretCode, setSecretCodeState] = useState<string | null>(() => localStorage.getItem('music_secret_code'));
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playerRef = useRef<any>(null);

  const setSecretCode = (code: string | null) => {
    setSecretCodeState(code);
    if (code) localStorage.setItem('music_secret_code', code);
    else localStorage.removeItem('music_secret_code');
  };

  const currentSong = currentSongIndex >= 0 && queue.length > 0 ? queue[currentSongIndex] : null;

  const playSong = (index: number) => {
    if (index >= 0 && index < queue.length) {
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;
    setCurrentSongIndex((prev) => (prev + 1) % queue.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (queue.length === 0) return;
    setCurrentSongIndex((prev) => (prev - 1 + queue.length) % queue.length);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (isPlaying) {
      playerRef.current?.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current?.playVideo();
      setIsPlaying(true);
    }
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (isPlaying) playerRef.current.playVideo();
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 0 = ended, 1 = playing, 2 = paused
    if (event.data === 0) {
      nextSong();
    } else if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    }
  };

  const onPlayerError = () => {
    console.error("YouTube Player Error. Skipping to next song...");
    setTimeout(nextSong, 2000);
  };

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
    },
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        secretCode, setSecretCode,
        queue, setQueue,
        currentSongIndex, playSong, nextSong, prevSong,
        isPlaying, togglePlay, currentSong
      }}
    >
      {children}
      {currentSong && (
        <div style={{ position: 'fixed', bottom: -100, visibility: 'hidden', zIndex: -999 }}>
           <YouTube
             videoId={currentSong.videoId}
             opts={opts}
             onReady={onReady}
             onStateChange={onStateChange}
             onError={onPlayerError}
           />
        </div>
      )}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return context;
};
