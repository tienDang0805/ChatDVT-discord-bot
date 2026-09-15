import { useState } from 'react';
import { useTuTienGame } from '../GameContext';
import { GRADE_COLORS, ITEM_TYPE_ICONS, REALM_LIFESPAN } from '../types';
import type { Equipment } from '../types';

export type PopupType = 'CHARACTER' | 'INVENTORY' | 'QUEST' | 'NPC' | 'MAP' | null;

function parseNameDesc(raw: string): { name: string; desc: string } {
  const colonIdx = raw.indexOf(':');
  const dashIdx = raw.indexOf(' - ');
  if (colonIdx > 0 && colonIdx < 40) {
    return { name: raw.slice(0, colonIdx).trim(), desc: raw.slice(colonIdx + 1).trim() };
  }
  if (dashIdx > 0 && dashIdx < 40) {
    return { name: raw.slice(0, dashIdx).trim(), desc: raw.slice(dashIdx + 3).trim() };
  }
  return { name: raw, desc: '' };
}

function ExpandableTag({ raw, icon, colorClass }: { raw: string; icon?: string; colorClass?: string }) {
  const [open, setOpen] = useState(false);
  const { name, desc } = parseNameDesc(raw);
  return (
    <div
      className={`rpg-expandable-tag ${colorClass || ''} ${open ? 'expanded' : ''}`}
      onClick={() => desc && setOpen(!open)}
      style={{ cursor: desc ? 'pointer' : 'default' }}
    >
      <div className="rpg-expandable-header">
        {icon && <span className="rpg-expandable-icon">{icon}</span>}
        <span className="rpg-expandable-name">{name}</span>
        {desc && <span className="rpg-expandable-arrow">{open ? '▾' : '▸'}</span>}
      </div>
      {open && desc && <div className="rpg-expandable-desc">{desc}</div>}
    </div>
  );
}

interface GamePopupsProps {
  activePopup: PopupType;
  onClose: () => void;
}

export default function GamePopups({ activePopup, onClose }: GamePopupsProps) {
  if (!activePopup) return null;

  return (
    <div className="rpg-popup-overlay" onClick={onClose}>
      <div className="rpg-popup-container" onClick={e => e.stopPropagation()}>
        <button className="rpg-popup-close" onClick={onClose}>✕</button>
        {activePopup === 'CHARACTER' && <CharacterPopup />}
        {activePopup === 'INVENTORY' && <InventoryPopup />}
        {activePopup === 'QUEST' && <QuestPopup />}
        {activePopup === 'NPC' && <NPCPopup />}
        {activePopup === 'MAP' && <MapPopup />}
      </div>
    </div>
  );
}

function CharacterPopup() {
  const { profile, stats, worldConfig, equipment } = useTuTienGame();
  if (!profile) return null;

  const currency = worldConfig?.currency || 'Linh thạch';
  const lifePct = Math.max(0, (stats.lifespan / stats.maxLifespan) * 100);

  const equipBonuses = equipment.reduce((acc, item) => {
    if (item.statBonus) {
      for (const [k, v] of Object.entries(item.statBonus)) {
        acc[k] = (acc[k] || 0) + (v as number);
      }
    }
    return acc;
  }, {} as Record<string, number>);

  const realmKeys = Object.keys(REALM_LIFESPAN);
  const currentIdx = realmKeys.indexOf(stats.realm);
  const nextRealm = currentIdx < realmKeys.length - 1 ? realmKeys[currentIdx + 1] : null;

  return (
    <div className="rpg-popup-content">
      <div className="rpg-popup-title">👤 {profile.name}</div>
      <div className="rpg-popup-subtitle">{profile.backstory}</div>

      <div className="rpg-char-header">
        <div className="rpg-realm-display">
          <div className="rpg-realm-label">Cảnh Giới</div>
          <div className="rpg-realm-name">{stats.realm}</div>
          {nextRealm && <div className="rpg-realm-next">Kế tiếp: {nextRealm}</div>}
        </div>
        <div className="rpg-age-display">
          <div>Tuổi: <strong>{stats.age}</strong></div>
          <div>Thọ mệnh: <strong>{Math.floor(stats.lifespan)}</strong>/{stats.maxLifespan}</div>
          <div className="rpg-bar-mini"><div className="rpg-bar-fill" style={{ width: `${lifePct}%`, background: lifePct > 50 ? 'var(--tu-tien-gold)' : lifePct > 20 ? '#e67e22' : 'var(--tu-tien-primary)' }} /></div>
        </div>
      </div>

      <div className="rpg-stat-section">
        <div className="rpg-stat-title">⚡ Chiến Lực</div>
        <div className="rpg-stat-bars">
          <StatBar label="🩸 Khí huyết" current={stats.health} max={stats.maxHealth} color="var(--tu-tien-primary)" bonus={equipBonuses.health} />
          <StatBar label="💠 Linh lực" current={stats.qi} max={stats.maxQi} color="#4ba3e3" bonus={equipBonuses.qi} />
          <StatBar label="🧘 Đạo tâm" current={stats.daoHeart} max={stats.maxDaoHeart} color="var(--tu-tien-gold)" bonus={equipBonuses.daoHeart} />
        </div>
      </div>

      <div className="rpg-stat-section">
        <div className="rpg-stat-title">📊 Thuộc Tính</div>
        <div className="rpg-attr-grid">
          <AttrItem icon="⚔️" label="Công kích" value={stats.attack} bonus={equipBonuses.attack} />
          <AttrItem icon="🛡️" label="Phòng ngự" value={stats.defense} bonus={equipBonuses.defense} />
          <AttrItem icon="💨" label="Thân pháp" value={stats.speed} bonus={equipBonuses.speed} />
          <AttrItem icon="🧠" label="Ngộ tính" value={stats.comprehension} bonus={equipBonuses.comprehension} />
          <AttrItem icon="🍀" label="Vận khí" value={stats.luck} bonus={equipBonuses.luck} />
          <AttrItem icon="💰" label={currency} value={stats.wealth} />
        </div>
      </div>

      {profile.traits.length > 0 && (
        <div className="rpg-stat-section">
          <div className="rpg-stat-title">🔮 Mệnh Cách</div>
          <div className="rpg-buffs">
            {profile.traits.map((t, i) => (
              <ExpandableTag key={i} raw={t} icon="✦" colorClass="rpg-buff-trait" />
            ))}
          </div>
        </div>
      )}

      {equipment.filter(e => e.effect).length > 0 && (
        <div className="rpg-stat-section">
          <div className="rpg-stat-title">⚡ Buff Trang Bị</div>
          <div className="rpg-buffs">
            {equipment.filter(e => e.effect).map(e => (
              <ExpandableTag key={e.id} raw={`${e.name}: ${e.effect}`} icon={ITEM_TYPE_ICONS[e.type] || '📦'} colorClass="rpg-buff-equip" />
            ))}
          </div>
        </div>
      )}

      {profile.companions.length > 0 && (
        <div className="rpg-stat-section">
          <div className="rpg-stat-title">🤝 Đồng Hành</div>
          <div className="rpg-buffs">
            {profile.companions.map((c, i) => (
              <ExpandableTag key={i} raw={c} icon="🐾" colorClass="rpg-companion-expandable" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, current, max, color, bonus }: { label: string; current: number; max: number; color: string; bonus?: number }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="rpg-stat-bar-row">
      <div className="rpg-stat-bar-label">
        <span>{label}</span>
        <span>
          {Math.floor(current)}/{max}
          {bonus && bonus > 0 ? <span className="rpg-bonus"> (+{bonus})</span> : null}
        </span>
      </div>
      <div className="rpg-bar-bg"><div className="rpg-bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

function AttrItem({ icon, label, value, bonus }: { icon: string; label: string; value: number; bonus?: number }) {
  return (
    <div className="rpg-attr-item">
      <span className="rpg-attr-icon">{icon}</span>
      <span className="rpg-attr-label">{label}</span>
      <span className="rpg-attr-value">
        {value}
        {bonus && bonus > 0 ? <span className="rpg-bonus"> +{bonus}</span> : null}
      </span>
    </div>
  );
}

function InventoryPopup() {
  const { equipment, equippedItems, removeEquipment, equipItem, unequipItem, addLog, updateStats, stats } = useTuTienGame();
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const EQUIP_SLOT_MAP: Record<string, 'weapon' | 'armor' | 'accessory'> = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
  };

  const isEquippable = (type: string) => type === 'WEAPON' || type === 'ARMOR' || type === 'ACCESSORY';
  const isEquipped = (itemId: string) => Object.values(equippedItems).includes(itemId);

  const useItem = (item: Equipment) => {
    if (item.type === 'CONSUMABLE') {
      let effectText = `Sử dụng ${item.name}`;
      if (item.statBonus) {
        const changes: Record<string, number> = {};
        for (const [k, v] of Object.entries(item.statBonus)) {
          changes[k] = ((stats as any)[k] || 0) + (v as number);
        }
        updateStats(changes);
        effectText += ` — ${item.effect}`;
      } else {
        updateStats({ health: Math.min(stats.health + 20, stats.maxHealth) });
        effectText += ' — hồi phục khí huyết';
      }
      addLog({ id: `use_${Date.now()}`, text: `🧪 ${effectText}`, type: 'ITEM_GAIN' });
      removeEquipment(item.id);
      setSelectedItem(null);
    }
  };

  const handleEquip = (item: Equipment) => {
    equipItem(item.id);
    addLog({ id: `equip_${Date.now()}`, text: `⚔️ Trang bị: ${item.name} — ${item.effect || 'Sẵn sàng chiến đấu'}`, type: 'SYSTEM_REWARD' });
    setSelectedItem(null);
  };

  const handleUnequip = (item: Equipment) => {
    const slot = EQUIP_SLOT_MAP[item.type];
    if (slot) {
      unequipItem(slot);
      addLog({ id: `unequip_${Date.now()}`, text: `🔓 Tháo trang bị: ${item.name}`, type: 'NARRATIVE' });
      setSelectedItem(null);
    }
  };

  const gradeGroups = ['TIÊN', 'THIÊN', 'BẢO', 'LINH', 'PHÀM'] as const;
  const SLOT_LABELS: Record<string, string> = { WEAPON: '⚔️ Vũ Khí', ARMOR: '🛡️ Hộ Giáp', ACCESSORY: '💍 Pháp Bảo' };

  return (
    <div className="rpg-popup-content">
      <div className="rpg-popup-title">🎒 Hành Trang ({equipment.length})</div>

      {equipment.length === 0 ? (
        <div className="rpg-empty">Hành trang trống rỗng, đi tìm cơ duyên thôi!</div>
      ) : (
        <div className="rpg-inventory-layout">
          <div className="rpg-inv-grid">
            {gradeGroups.map(grade => {
              const items = equipment.filter(e => e.grade === grade);
              if (items.length === 0) return null;
              return (
                <div key={grade}>
                  <div className="rpg-inv-grade-header" style={{ color: GRADE_COLORS[grade] }}>— {grade} Cấp —</div>
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`rpg-inv-item ${selectedItem?.id === item.id ? 'selected' : ''} ${isEquipped(item.id) ? 'equipped' : ''}`}
                      onClick={() => setSelectedItem(item)}
                      style={{ borderLeftColor: GRADE_COLORS[item.grade] }}
                    >
                      <span className="rpg-inv-item-icon">{ITEM_TYPE_ICONS[item.type] || '📦'}</span>
                      <span className="rpg-inv-item-name" style={{ color: GRADE_COLORS[item.grade] }}>{item.name}</span>
                      {isEquipped(item.id) && <span className="rpg-inv-equipped-badge">Đang mang</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {selectedItem && (
            <div className="rpg-inv-detail">
              <div className="rpg-inv-detail-name" style={{ color: GRADE_COLORS[selectedItem.grade] }}>
                {ITEM_TYPE_ICONS[selectedItem.type]} {selectedItem.name}
              </div>
              <div className="rpg-inv-detail-grade">
                [{selectedItem.grade}] · {SLOT_LABELS[selectedItem.type] || selectedItem.type}
              </div>
              <div className="rpg-inv-detail-effect">{selectedItem.effect || 'Không có hiệu quả đặc biệt'}</div>
              {selectedItem.statBonus && (
                <div className="rpg-inv-detail-stats">
                  {Object.entries(selectedItem.statBonus).map(([k, v]) => (
                    <span key={k} className="rpg-bonus">+{v as number} {k}</span>
                  ))}
                </div>
              )}
              <div className="rpg-inv-actions">
                {isEquippable(selectedItem.type) && !isEquipped(selectedItem.id) && (
                  <button className="tutien-btn" onClick={() => handleEquip(selectedItem)}>⚔️ Trang Bị</button>
                )}
                {isEquippable(selectedItem.type) && isEquipped(selectedItem.id) && (
                  <button className="tutien-btn" onClick={() => handleUnequip(selectedItem)}>🔓 Tháo Ra</button>
                )}
                {selectedItem.type === 'CONSUMABLE' && (
                  <button className="tutien-btn" onClick={() => useItem(selectedItem)}>🧪 Sử dụng</button>
                )}
                <button className="tutien-btn tutien-btn-danger" onClick={() => { removeEquipment(selectedItem.id); setSelectedItem(null); }}>🗑️ Vứt bỏ</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestPopup() {
  const { quests } = useTuTienGame();
  const active = quests.filter(q => q.status === 'ACTIVE');
  const done = quests.filter(q => q.status !== 'ACTIVE');

  return (
    <div className="rpg-popup-content">
      <div className="rpg-popup-title">📜 Nhiệm Vụ</div>

      {active.length > 0 && (
        <>
          <div className="rpg-section-label">🔥 Đang tiến hành</div>
          {active.map(q => (
            <div key={q.id} className="rpg-quest-card active">
              <div className="rpg-quest-name">{q.name}</div>
              <div className="rpg-quest-desc">{q.description}</div>
              {q.reward && <div className="rpg-quest-reward">🎁 {q.reward}</div>}
            </div>
          ))}
        </>
      )}

      {done.length > 0 && (
        <>
          <div className="rpg-section-label" style={{ marginTop: '1rem' }}>📋 Đã hoàn thành / Thất bại</div>
          {done.map(q => (
            <div key={q.id} className={`rpg-quest-card ${q.status === 'COMPLETED' ? 'completed' : 'failed'}`}>
              <div className="rpg-quest-name">{q.status === 'COMPLETED' ? '✅' : '❌'} {q.name}</div>
              <div className="rpg-quest-desc">{q.description}</div>
            </div>
          ))}
        </>
      )}

      {quests.length === 0 && <div className="rpg-empty">Chưa có nhiệm vụ nào</div>}
    </div>
  );
}

function NPCPopup() {
  const { npcs } = useTuTienGame();

  const relationLabels: Record<string, { label: string; color: string }> = {
    ALLY: { label: '友 Đồng minh', color: '#4ade80' },
    ENEMY: { label: '敵 Kẻ thù', color: '#ef4444' },
    NEUTRAL: { label: '中 Trung lập', color: '#a3a3a3' },
    MASTER: { label: '師 Sư phụ', color: '#eab308' },
    DISCIPLE: { label: '徒 Đệ tử', color: '#3b82f6' },
  };

  return (
    <div className="rpg-popup-content">
      <div className="rpg-popup-title">👥 Nhân Vật Đã Gặp</div>

      {npcs.length === 0 ? (
        <div className="rpg-empty">Chưa gặp ai trên đường tu</div>
      ) : (
        <div className="rpg-npc-list">
          {npcs.map(npc => {
            const rel = relationLabels[npc.relation] || relationLabels.NEUTRAL;
            return (
              <div key={npc.id} className="rpg-npc-card">
                <div className="rpg-npc-header">
                  <span className="rpg-npc-name">{npc.name}</span>
                  <span className="rpg-npc-relation" style={{ color: rel.color }}>{rel.label}</span>
                </div>
                {npc.realm && <div className="rpg-npc-realm">{npc.realm}</div>}
                {npc.sect && <div className="rpg-npc-sect">🏯 {npc.sect}</div>}
                {npc.description && <div className="rpg-npc-desc">{npc.description}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MapPopup() {
  const { locations, currentLocation, worldConfig } = useTuTienGame();

  return (
    <div className="rpg-popup-content">
      <div className="rpg-popup-title">🗺️ {worldConfig?.name || 'Bản Đồ'}</div>
      <div className="rpg-popup-subtitle">{worldConfig?.era} · {worldConfig?.background?.slice(0, 80)}...</div>

      {worldConfig?.sects && worldConfig.sects.length > 0 && (
        <div className="rpg-stat-section">
          <div className="rpg-stat-title">🏯 Tông Môn</div>
          <div className="rpg-buffs">
            {worldConfig.sects.map((s, i) => (
              <ExpandableTag key={i} raw={s} icon="🏯" colorClass="rpg-sect-expandable" />
            ))}
          </div>
        </div>
      )}

      <div className="rpg-stat-section">
        <div className="rpg-stat-title">📍 Đã khám phá</div>
        <div className="rpg-map-explored">
          {locations.length === 0 ? (
            <div className="rpg-empty">Chưa khám phá nơi nào</div>
          ) : (
            locations.map((loc, i) => {
              const { name } = parseNameDesc(loc);
              const isCurrent = loc === currentLocation;
              return (
                <ExpandableTag
                  key={i}
                  raw={loc}
                  icon={isCurrent ? '📍' : '🔹'}
                  colorClass={isCurrent ? 'rpg-location-current' : 'rpg-location-visited'}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
