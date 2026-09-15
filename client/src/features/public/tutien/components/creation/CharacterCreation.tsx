import { useState } from 'react';
import { useTuTienGame } from '../GameContext';
import type { CharacterProfile, Equipment } from '../types';
import { GRADE_LIST, GRADE_COLORS } from '../types';

const MAX_ITEMS = 3;
const MAX_TRAITS = 3;
const MAX_COMPANIONS = 2;

const ITEM_SUGGESTIONS = ['Ngọc Bội vỡ', 'Kiếm rỉ sét', 'Linh thảo khô', 'Thiên Mệnh Ngọc', 'Huyết Nhẫn'];
const TRAIT_SUGGESTIONS = ['Thiên Mệnh Chi Tử', 'Sát phạt quả đoán', 'Trời sinh mẫn cảm', 'Thể chất ốm yếu', 'Vận mệnh vô song', 'Thiên linh căn'];
const COMPANION_SUGGESTIONS = ['Lão bộc trung thành', 'Thanh mai trúc mã', 'Sói hoang linh tính', 'Tiểu sư muội', 'Hỏa phượng con'];

export default function CharacterCreation() {
  const { initCharacter, worldConfig, setScreen, setIsLoading, isLoading } = useTuTienGame();

  const [profile, setProfile] = useState<CharacterProfile>({
    name: '',
    backstory: '',
    goal: '',
    items: [],
    traits: [],
    companions: [],
    startLocation: '',
  });

  const [itemInput, setItemInput] = useState('');
  const [itemGrade, setItemGrade] = useState<Equipment['grade']>('PHÀM');
  const [traitInput, setTraitInput] = useState('');
  const [companionInput, setCompanionInput] = useState('');

  const addItem = (name?: string) => {
    const val = (name || itemInput).trim();
    if (!val || profile.items.length >= MAX_ITEMS) return;
    setProfile(prev => ({ ...prev, items: [...prev.items, { name: val, grade: itemGrade }] }));
    setItemInput('');
  };

  const addTrait = (name?: string) => {
    const val = (name || traitInput).trim();
    if (!val || profile.traits.length >= MAX_TRAITS) return;
    setProfile(prev => ({ ...prev, traits: [...prev.traits, val] }));
    setTraitInput('');
  };

  const addCompanion = (name?: string) => {
    const val = (name || companionInput).trim();
    if (!val || profile.companions.length >= MAX_COMPANIONS) return;
    setProfile(prev => ({ ...prev, companions: [...prev.companions, val] }));
    setCompanionInput('');
  };

  const isFormValid = profile.name.trim() !== '' && profile.backstory.trim() !== '' && profile.goal.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/tutien-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldConfig, profile }),
      });
      const data = await res.json();

      if (data.stats) {
        const aiItems = data.initialItems?.map((item: any, i: number) => ({
          id: `start_${i}`,
          name: item.name,
          type: item.type || 'MATERIAL',
          grade: item.grade || 'PHÀM',
          effect: item.effect || '',
          statBonus: item.statBonus || undefined,
        }));
        initCharacter(
          profile,
          data.stats,
          data.openingNarrative,
          data.initialChoices?.map((c: any, i: number) => ({ id: `ai_init_${i}`, label: c.label || c })),
          data.npcs?.map((n: any, i: number) => ({ id: `npc_${i}`, ...n })),
          aiItems,
        );
      } else {
        initCharacter(profile);
      }
    } catch (err) {
      console.error('[TuTien] Init error:', err);
      initCharacter(profile);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="tutien-saves-container" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div className="tutien-panel-title" style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
            Thiên Đạo Khai Mệnh...
          </div>
          <div className="tutien-loading" style={{ flexDirection: 'column', padding: '1.5rem' }}>
            <div className="tutien-loading-dot" style={{ width: '18px', height: '18px' }} />
            <span style={{ marginTop: '1.5rem', color: 'var(--tt-text-bright)', fontSize: '1.05rem' }}>
              Thiên Đạo đang an bài số mệnh, cân chỉnh thuộc tính và dựng màn mở đầu...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="tutien-saves-container" style={{ maxWidth: '850px', width: '100%', padding: '2.5rem' }}>
        <div className="tutien-panel-title" style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
          👤 Bản Mệnh Đăng · Thiết Lập Đạo Căn
        </div>
        <div style={{ textAlign: 'center', color: 'var(--tt-text-muted)', fontSize: '0.88rem', marginBottom: '1.8rem' }}>
          Cõi Giới: <strong style={{ color: 'var(--tt-gold-primary)' }}>{worldConfig?.name || 'Huyền Giới'}</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div className="tutien-input-group">
              <label>Tôn tính đại danh (Đạo hiệu / Tên họ):</label>
              <input
                className="tutien-input"
                placeholder="VD: Hàn Lập, Lý Trường Thọ, Vương Lâm..."
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                maxLength={30}
                required
              />
            </div>

            <div className="tutien-input-group">
              <label>Điểm xuất phát ban đầu:</label>
              <input
                className="tutien-input"
                placeholder="VD: Phàm thôn nghèo hẻo lánh, Ngoại môn tạp dịch..."
                value={profile.startLocation}
                onChange={e => setProfile(prev => ({ ...prev, startLocation: e.target.value }))}
              />
            </div>
          </div>

          <div className="tutien-input-group">
            <label>Tiểu sử xuất thân & Cơ duyên thiếu thời:</label>
            <textarea
              className="tutien-textarea"
              placeholder="Gia tộc sa sút? Cô nhi lưu lạc phàm trần? Hay thiên tài ẩn thế chịu hàm oan phế bỏ đan điền?..."
              value={profile.backstory}
              onChange={e => setProfile(prev => ({ ...prev, backstory: e.target.value }))}
              required
            />
          </div>

          <div className="tutien-input-group">
            <label>Chấp niệm nhập đạo (Mục tiêu tu hành cao nhất):</label>
            <input
              className="tutien-input"
              placeholder="VD: Báo thù gia tộc, cứu sống hồng nhan, trường sinh bất tử, đạp bằng cửu thiên..."
              value={profile.goal}
              onChange={e => setProfile(prev => ({ ...prev, goal: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="tutien-input-group">
              <label>Vật phẩm tùy thân ({profile.items.length}/{MAX_ITEMS}):</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <input
                  className="tutien-input"
                  style={{ flex: 1, padding: '8px 10px' }}
                  placeholder="Tên bảo vật..."
                  value={itemInput}
                  onChange={e => setItemInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
                  disabled={profile.items.length >= MAX_ITEMS}
                />
                <select
                  className="tutien-input"
                  style={{ width: '85px', padding: '8px 4px' }}
                  value={itemGrade}
                  onChange={e => setItemGrade(e.target.value as Equipment['grade'])}
                >
                  {GRADE_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <button type="button" className="tutien-btn" onClick={() => addItem()} disabled={profile.items.length >= MAX_ITEMS}>
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {ITEM_SUGGESTIONS.map(sug => (
                  <span
                    key={sug}
                    onClick={() => addItem(sug)}
                    style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', color: 'var(--tt-text-muted)' }}
                  >
                    +{sug}
                  </span>
                ))}
              </div>
              {profile.items.map((it, idx) => (
                <div key={idx} className="tutien-creation-tag" style={{ borderLeft: `3px solid ${GRADE_COLORS[it.grade]}` }}>
                  <span style={{ color: GRADE_COLORS[it.grade], fontWeight: 600 }}>[{it.grade}]</span>
                  <span style={{ flex: 1, marginLeft: '6px' }}>{it.name}</span>
                  <span className="tutien-sect-tag-remove" onClick={() => setProfile(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))}>×</span>
                </div>
              ))}
            </div>

            <div className="tutien-input-group">
              <label>Mệnh cách đặc dị ({profile.traits.length}/{MAX_TRAITS}):</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <input
                  className="tutien-input"
                  style={{ padding: '8px 10px' }}
                  placeholder="Nhập mệnh cách..."
                  value={traitInput}
                  onChange={e => setTraitInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTrait(); } }}
                  disabled={profile.traits.length >= MAX_TRAITS}
                />
                <button type="button" className="tutien-btn" onClick={() => addTrait()} disabled={profile.traits.length >= MAX_TRAITS}>
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {TRAIT_SUGGESTIONS.map(sug => (
                  <span
                    key={sug}
                    onClick={() => addTrait(sug)}
                    style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', color: 'var(--tt-text-muted)' }}
                  >
                    +{sug}
                  </span>
                ))}
              </div>
              {profile.traits.map((t, idx) => (
                <div key={idx} className="tutien-creation-tag">
                  <span style={{ color: 'var(--tt-crimson)', fontWeight: 600 }}>✦ {t}</span>
                  <span className="tutien-sect-tag-remove" onClick={() => setProfile(prev => ({ ...prev, traits: prev.traits.filter((_, i) => i !== idx) }))}>×</span>
                </div>
              ))}
            </div>

            <div className="tutien-input-group">
              <label>Hộ đạo / Đồng hành ({profile.companions.length}/{MAX_COMPANIONS}):</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <input
                  className="tutien-input"
                  style={{ padding: '8px 10px' }}
                  placeholder="Thêm đồng hành..."
                  value={companionInput}
                  onChange={e => setCompanionInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompanion(); } }}
                  disabled={profile.companions.length >= MAX_COMPANIONS}
                />
                <button type="button" className="tutien-btn" onClick={() => addCompanion()} disabled={profile.companions.length >= MAX_COMPANIONS}>
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {COMPANION_SUGGESTIONS.map(sug => (
                  <span
                    key={sug}
                    onClick={() => addCompanion(sug)}
                    style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', color: 'var(--tt-text-muted)' }}
                  >
                    +{sug}
                  </span>
                ))}
              </div>
              {profile.companions.map((c, idx) => (
                <div key={idx} className="tutien-creation-tag">
                  <span style={{ color: 'var(--tt-jade)', fontWeight: 600 }}>🤝 {c}</span>
                  <span className="tutien-sect-tag-remove" onClick={() => setProfile(prev => ({ ...prev, companions: prev.companions.filter((_, i) => i !== idx) }))}>×</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', gap: '12px' }}>
            <button type="button" className="tutien-btn tutien-btn-danger" onClick={() => setScreen('WORLD_CREATION')}>
              ← Quay Lại
            </button>
            <button type="submit" className="tutien-btn" disabled={!isFormValid} style={{ padding: '12px 36px', fontSize: '1.05rem' }}>
              ⚡ Khởi Bước Tu Tiên · Khai Mở Thiên Mệnh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
