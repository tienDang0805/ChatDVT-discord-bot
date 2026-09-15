import { useEffect } from 'react';
import { GameProvider, useTuTienGame } from '../components/GameContext';
import '../components/shared/styles.css';

import WorldCreation from '../components/creation/WorldCreation';
import CharacterCreation from '../components/creation/CharacterCreation';
import GameInterface from '../components/playing/GameInterface';

const MenuScreen = () => {
  const { setScreen, getSaveSlots, loadSaveSlot, deleteSaveSlot } = useTuTienGame();
  const saves = getSaveSlots();

  return (
    <div className="tutien-menu-screen">
      <div className="tutien-menu-title">修 仙 傳</div>
      <div className="tutien-menu-subtitle">Tu Tiên Truyện · Vấn Đạo Trường Sinh</div>

      <div className="tutien-menu-actions">
        <button className="tutien-btn tutien-menu-btn" onClick={() => setScreen('WORLD_CREATION')}>
          ✦ Khai Thiên Lập Giới ✦
        </button>
      </div>

      {saves.length > 0 && (
        <div className="tutien-saves-container">
          <div style={{ color: 'var(--tt-gold-primary)', fontFamily: 'var(--tt-font-title)', fontSize: '0.95rem', marginBottom: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
            📜 KÝ ỨC LUÂN HỒI (LƯU TRỮ):
          </div>
          {saves.map(s => (
            <div key={s.id} className="tutien-save-slot">
              <div className="tutien-save-info" onClick={() => loadSaveSlot(s.id)}>
                <div className="tutien-save-name">{s.charName}</div>
                <div className="tutien-save-details">
                  {s.worldName} · <span style={{ color: 'var(--tt-gold-primary)' }}>{s.realm}</span> · Tuổi {s.age} · Lượt {s.turnCount}
                </div>
              </div>
              <button className="tutien-save-delete" onClick={() => deleteSaveSlot(s.id)} title="Xóa bản lưu">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DeathScreen = () => {
  const { profile, stats, turnCount, equipment, resetGame, worldConfig } = useTuTienGame();
  const currency = worldConfig?.currency || 'Linh thạch';

  return (
    <div className="tutien-death-screen">
      <div className="tutien-death-title">身死道消</div>
      <div style={{ fontSize: '1.25rem', color: 'var(--tt-crimson)', marginBottom: '1.5rem', letterSpacing: '0.15em', fontWeight: 600 }}>
        Thân Tử Đạo Tiêu · Vạn Niên Đạo Hạnh Hóa Tro Tàn
      </div>

      <div className="tutien-death-summary">
        <div style={{ fontSize: '1.6rem', color: 'var(--tt-gold-primary)', fontFamily: 'var(--tt-font-title)', marginBottom: '1.2rem', fontWeight: 700 }}>
          {profile?.name || 'Vô Danh Đạo Nhân'}
        </div>
        <div className="tutien-death-stat"><span>Thế giới</span><span>{worldConfig?.name || '—'}</span></div>
        <div className="tutien-death-stat"><span>Cảnh giới viên tịch</span><span>{stats.realm}</span></div>
        <div className="tutien-death-stat"><span>Hưởng thọ</span><span>{stats.age} năm</span></div>
        <div className="tutien-death-stat"><span>Số lượt vấn đạo</span><span>{turnCount} lượt</span></div>
        <div className="tutien-death-stat"><span>Tài sản tích lũy</span><span>{stats.wealth} {currency}</span></div>
        <div className="tutien-death-stat"><span>Pháp bảo mang theo</span><span>{equipment.length} kiện</span></div>

        {stats.lifespan <= 0 && (
          <div style={{ marginTop: '1.2rem', color: 'var(--tt-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            ⏳ Thọ nguyên cạn kiệt, thiên nhân ngũ suy...
          </div>
        )}
        {stats.health <= 0 && (
          <div style={{ marginTop: '0.6rem', color: 'var(--tt-crimson)', fontSize: '0.9rem', fontWeight: 500 }}>
            🩸 Khí huyết đoạn tuyệt, kinh mạch vỡ nát!
          </div>
        )}
        {stats.daoHeart <= 0 && (
          <div style={{ marginTop: '0.6rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 500 }}>
            🧘 Đạo tâm tan vỡ, tẩu hỏa nhập ma, vạn kiếp bất phục!
          </div>
        )}

        <button
          className="tutien-btn"
          style={{ marginTop: '2rem', padding: '14px 36px', fontSize: '1.1rem', width: '100%' }}
          onClick={resetGame}
        >
          🔄 Nhập Luân Hồi · Tái Sinh
        </button>
      </div>
    </div>
  );
};

const GameContainer = () => {
  const { screen } = useTuTienGame();

  useEffect(() => {
    const chatWidget = document.querySelector('.chat-widget-container, [class*="ChatWidget"]') as HTMLElement;
    if (chatWidget) chatWidget.style.display = 'none';
    return () => { if (chatWidget) chatWidget.style.display = ''; };
  }, []);

  return (
    <div className="tutien-wrapper">
      {screen === 'MENU' && <MenuScreen />}
      {screen === 'WORLD_CREATION' && <WorldCreation />}
      {screen === 'CHAR_CREATION' && <CharacterCreation />}
      {screen === 'PLAYING' && <GameInterface />}
      {screen === 'DEATH' && <DeathScreen />}
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
