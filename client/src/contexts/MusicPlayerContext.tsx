import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';

export interface Song {
  id: string;
  videoId: string;
  title: string;
  coverUrl: string;
  category?: string;
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
  volume: number;
  setVolume: (vol: number) => void;
  isShuffling: boolean;
  toggleShuffle: () => void;
  isLooping: boolean;
  toggleLoop: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [secretCode, setSecretCodeState] = useState<string | null>(() => localStorage.getItem('music_secret_code'));
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('music_volume');
    return saved !== null ? Number(saved) : 100;
  });
  
  const playerRef = useRef<any>(null);
  
  // To avoid Stale Closures in react-youtube event callbacks
  const stateRefs = useRef({ queue, isShuffling, isLooping });
  useEffect(() => {
    stateRefs.current = { queue, isShuffling, isLooping };
  }, [queue, isShuffling, isLooping]);

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
    const { queue: currentQueue, isShuffling: currentIsShuffling } = stateRefs.current;
    if (currentQueue.length === 0) return;
    setCurrentSongIndex((prev) => {
      if (currentIsShuffling && currentQueue.length > 1) {
        let nextIdx = prev;
        // Try up to 10 times to find a new index (to avoid infinite loop if somehow logic fails)
        let attempts = 0;
        while (nextIdx === prev && attempts < 10) {
           nextIdx = Math.floor(Math.random() * currentQueue.length);
           attempts++;
        }
        return nextIdx;
      }
      return (prev + 1) % currentQueue.length;
    });
    setIsPlaying(true);
  };

  const prevSong = () => {
    const { queue: currentQueue } = stateRefs.current;
    if (currentQueue.length === 0) return;
    setCurrentSongIndex((prev) => (prev - 1 + currentQueue.length) % currentQueue.length);
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

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    localStorage.setItem('music_volume', vol.toString());
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
    }
  };

  const toggleShuffle = () => setIsShuffling(prev => !prev);
  const toggleLoop = () => setIsLooping(prev => !prev);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    if (isPlaying) playerRef.current.playVideo();
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 0 = ended, 1 = playing, 2 = paused
    if (event.data === 0) {
      if (stateRefs.current.isLooping) {
        playerRef.current?.seekTo(0);
        playerRef.current?.playVideo();
      } else {
        nextSong();
      }
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
        isPlaying, togglePlay, currentSong,
        volume, setVolume,
        isShuffling, toggleShuffle,
        isLooping, toggleLoop
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
