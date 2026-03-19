import { GameProvider, useTuTienGame } from '../components/tutien/GameContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../components/tutien/shared/styles.css';

// Tạm thời để trống component con, ta sẽ import sau khi code xong.
import CharacterCreation from '../components/tutien/creation/CharacterCreation';
import GameInterface from '../components/tutien/playing/GameInterface';

const GameContainer = () => {
  const { screen } = useTuTienGame();

  return (
    <div className="tutien-wrapper">
      {screen === 'CREATION' && (
        <CharacterCreation />
      )}
      {screen === 'PLAYING' && (
        <GameInterface />
      )}
      {screen === 'DEATH' && (
        <div className="tutien-title" style={{ color: 'var(--tu-tien-primary)' }}>
          Thân Tử Đạo Tiêu
        </div>
      )}

      {/* Nút Back về Portal */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 z-50 bg-black/60 hover:bg-black/90 text-white/80 hover:text-white p-2 md:px-4 md:py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 shadow-lg border border-white/10"
      >
        <ArrowLeft size={20} /> <span className="hidden md:inline text-sm font-bold">Về Trang Chủ</span>
      </Link>
    </div>
  );
};

export default function TuTienGame() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
