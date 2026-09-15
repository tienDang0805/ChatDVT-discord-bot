import { useState } from 'react';
import { useTuTienGame } from '../GameContext';
import StoryTerminal from './StoryTerminal';
import ActionPanel from './ActionPanel';
import GamePopups from './GamePopups';
import type { PopupType } from './GamePopups';

const MENU_ITEMS: { type: PopupType; icon: string; label: string }[] = [
  { type: 'CHARACTER', icon: '👤', label: 'Nhân Vật' },
  { type: 'INVENTORY', icon: '🎒', label: 'Hành Trang' },
  { type: 'QUEST', icon: '📜', label: 'Nhiệm Vụ' },
  { type: 'NPC', icon: '👥', label: 'Giao Tế' },
  { type: 'MAP', icon: '🗺️', label: 'Bản Đồ' },
];

export default function GameInterface() {
  const { stats, profile, worldConfig, currentLocation, turnCount, equipment, setScreen } = useTuTienGame();
  const [activePopup, setActivePopup] = useState<PopupType>(null);

  const hpPct = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const qiPct = Math.max(0, Math.min(100, (stats.qi / stats.maxQi) * 100));
  const daoPct = Math.max(0, Math.min(100, (stats.daoHeart / stats.maxDaoHeart) * 100));
  const rawCurrency = worldConfig?.currency || 'Linh thạch';
  const currency = rawCurrency.length > 12 ? `${rawCurrency.slice(0, 10)}...` : rawCurrency;

  const activeBuffCount = equipment.filter(e => e.effect).length;

  return (
    <div className="rpg-game-root">
      <div className="rpg-hud">
        <div
          className="rpg-player-frame"
          onClick={() => setActivePopup('CHARACTER')}
          title="Bấm để xem chi tiết nhân vật"
        >
          <div className="rpg-player-avatar">
            <span className="rpg-player-avatar-icon">☯</span>
            <span className="rpg-player-realm-pip">⚡</span>
          </div>
          <div className="rpg-player-meta">
            <div className="rpg-player-name-row">
              <span className="rpg-player-name">{profile?.name || 'Vô Danh Đạo Hữu'}</span>
              <span className="rpg-player-realm-tag">{stats.realm}</span>
            </div>
            <div className="rpg-player-bars">
              <div className="rpg-bar-item hp-main" title={`Khí huyết (HP): ${Math.floor(stats.health)}/${stats.maxHealth}`}>
                <span className="rpg-bar-label">HP</span>
                <div className="rpg-bar-track hp">
                  <div className="rpg-bar-progress hp" style={{ width: `${hpPct}%` }} />
                </div>
                <span className="rpg-bar-val">{Math.floor(stats.health)}/{stats.maxHealth}</span>
              </div>
              <div className="rpg-bars-subrow">
                <div className="rpg-bar-item" title={`Linh lực (Qi): ${Math.floor(stats.qi)}/${stats.maxQi}`}>
                  <span className="rpg-bar-label">QI</span>
                  <div className="rpg-bar-track sub">
                    <div className="rpg-bar-progress qi" style={{ width: `${qiPct}%` }} />
                  </div>
                  <span className="rpg-bar-val">{Math.floor(stats.qi)}</span>
                </div>
                <div className="rpg-bar-item" title={`Đạo tâm: ${Math.floor(stats.daoHeart)}/${stats.maxDaoHeart}`}>
                  <span className="rpg-bar-label">ĐẠO</span>
                  <div className="rpg-bar-track sub">
                    <div className="rpg-bar-progress dao" style={{ width: `${daoPct}%` }} />
                  </div>
                  <span className="rpg-bar-val">{Math.floor(stats.daoHeart)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rpg-location-plaque" onClick={() => setActivePopup('MAP')} title="Bấm để xem bản đồ cõi giới">
          <div className="rpg-location-title">
            <span className="rpg-location-icon">📍</span>
            <span>{currentLocation || 'Bất Minh Chi Địa'}</span>
          </div>
          <div className="rpg-location-sub">
            <span>{worldConfig?.era || 'Kỷ Nguyên Tu Chân'}</span>
            <span>·</span>
            <span>Lượt {turnCount}</span>
          </div>
        </div>

        <div className="rpg-hud-right-deck">
          <div className="rpg-resource-tags">
            <div className="rpg-res-chip" title={`Tài sản: ${stats.wealth} ${rawCurrency}`}>
              <span className="rpg-res-icon">💰</span>
              <span className="rpg-res-val">{stats.wealth}</span>
              <span className="rpg-res-unit">{currency}</span>
            </div>
            <div className="rpg-res-chip" title={`Tuổi thọ: ${stats.age} / ${stats.maxLifespan} năm`}>
              <span className="rpg-res-icon">⏳</span>
              <span className="rpg-res-val">{stats.age}</span>
              <span className="rpg-res-unit">/{stats.maxLifespan}t</span>
            </div>
            {activeBuffCount > 0 && (
              <div
                className="rpg-res-chip buff"
                onClick={() => setActivePopup('CHARACTER')}
                title="Cơ duyên & Buff kích hoạt"
              >
                <span className="rpg-res-icon">✨</span>
                <span className="rpg-res-val">{activeBuffCount}</span>
              </div>
            )}
          </div>

          <div className="rpg-icon-dock">
            {MENU_ITEMS.map(item => (
              <button
                key={item.type}
                className={`rpg-dock-btn ${activePopup === item.type ? 'active' : ''}`}
                onClick={() => setActivePopup(activePopup === item.type ? null : item.type)}
                title={item.label}
              >
                <span className="rpg-dock-icon">{item.icon}</span>
                <span className="rpg-dock-tooltip">{item.label}</span>
              </button>
            ))}
            <button className="rpg-dock-btn exit" onClick={() => setScreen('MENU')} title="Lưu & Thoát ra sảnh">
              <span className="rpg-dock-icon">🚪</span>
              <span className="rpg-dock-tooltip">Lưu & Thoát</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rpg-main-area">
        <StoryTerminal />
      </div>

      <div className="rpg-bottom-zone">
        <ActionPanel />
      </div>

      <GamePopups activePopup={activePopup} onClose={() => setActivePopup(null)} />
    </div>
  );
}
