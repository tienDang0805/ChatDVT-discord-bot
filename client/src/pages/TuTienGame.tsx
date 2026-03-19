import { useEffect } from 'react';
import { GameProvider, useTuTienGame } from '../components/tutien/GameContext';
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
    </div>
  );
};

export default function TuTienGame() {
  // Đảm bảo nút back của trình duyệt luôn về /chatDVT nếu là entry đầu tiên
  useEffect(() => {
    if (window.history.length <= 2) {
      window.history.replaceState(null, '', '/chatDVT');
      window.history.pushState(null, '', window.location.pathname);
    }
  }, []);

  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
