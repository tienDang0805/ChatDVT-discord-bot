import { useState } from 'react';
import { useTuTienGame } from '../GameContext';
import type { WorldConfig } from '../types';

const WORLD_NAME_SUGGESTIONS = ['Huyền Thiên Giới', 'Cửu Châu Đại Lục', 'Thương Lan Giới', 'Vạn Yêu Quốc', 'Hỗn Độn Thiên Vực', 'Thái Cổ Thần Vực'];
const SECT_SUGGESTIONS = ['Thanh Vân Tông', 'Huyết Ma Giáo', 'Thiên Kiếm Các', 'Vạn Bảo Lâu', 'Âm Dương Cung', 'Lôi Đình Tông', 'Bách Thảo Viện', 'Thần Đao Môn'];

export default function WorldCreation() {
  const { setWorldConfig, setScreen } = useTuTienGame();

  const [config, setConfig] = useState<WorldConfig>({
    name: '',
    writingStyle: '',
    background: '',
    sects: [],
    era: '',
    currency: '',
  });

  const [sectInput, setSectInput] = useState('');

  const addSect = (name?: string) => {
    const val = (name || sectInput).trim();
    if (!val || config.sects.length >= 6 || config.sects.includes(val)) return;
    setConfig(prev => ({ ...prev, sects: [...prev.sects, val] }));
    setSectInput('');
  };

  const removeSect = (idx: number) => {
    setConfig(prev => ({ ...prev, sects: prev.sects.filter((_, i) => i !== idx) }));
  };

  const randomName = () => {
    const name = WORLD_NAME_SUGGESTIONS[Math.floor(Math.random() * WORLD_NAME_SUGGESTIONS.length)];
    setConfig(prev => ({ ...prev, name }));
  };

  const addRandomSects = () => {
    const shuffled = [...SECT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    const newSects = shuffled.slice(0, 4).filter(s => !config.sects.includes(s));
    setConfig(prev => ({ ...prev, sects: [...prev.sects, ...newSects].slice(0, 6) }));
  };

  const isValid = config.name.trim() !== '' && config.background.trim() !== '' && config.sects.length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) setWorldConfig(config);
  };

  return (
    <div style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="tutien-saves-container" style={{ maxWidth: '850px', width: '100%', padding: '2.5rem' }}>
        <div className="tutien-panel-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>
          🌍 Khai Thiên Lập Giới · Thiết Kế Thế Giới
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tutien-input-group">
            <label>Tên thế giới / Cõi giới:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="tutien-input"
                placeholder="VD: Cửu Châu Đại Lục, Huyền Thiên Giới..."
                value={config.name}
                onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
                maxLength={30}
                required
              />
              <button type="button" className="tutien-btn" onClick={randomName} style={{ whiteSpace: 'nowrap' }} title="Ngẫu nhiên tên">
                🎲 Ngẫu Nhiên
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="tutien-input-group">
              <label>Giọng văn truyền tụng (AI):</label>
              <input
                className="tutien-input"
                placeholder="VD: Bi tráng hào sảng, u ám tàn khốc, huyền bí..."
                value={config.writingStyle}
                onChange={e => setConfig(prev => ({ ...prev, writingStyle: e.target.value }))}
              />
            </div>

            <div className="tutien-input-group">
              <label>Thời đại / Kỷ nguyên:</label>
              <input
                className="tutien-input"
                placeholder="VD: Mạt Pháp, Thượng Cổ, Linh Khí Khôi Phục..."
                value={config.era}
                onChange={e => setConfig(prev => ({ ...prev, era: e.target.value }))}
              />
            </div>

            <div className="tutien-input-group">
              <label>Hệ thống tiền tệ:</label>
              <input
                className="tutien-input"
                placeholder="VD: Linh thạch, Đạo tệ, Kim nguyên bảo..."
                value={config.currency}
                onChange={e => setConfig(prev => ({ ...prev, currency: e.target.value }))}
              />
            </div>
          </div>

          <div className="tutien-input-group">
            <label>Bối cảnh thế giới & Thiên đạo pháp tắc:</label>
            <textarea
              className="tutien-textarea"
              placeholder="VD: Thiên địa linh khí cạn kiệt, ma đạo trỗi dậy tàn sát chúng sinh. Chính đạo suy vi chỉ còn lại vài đại tông môn cố thủ linh mạch..."
              value={config.background}
              onChange={e => setConfig(prev => ({ ...prev, background: e.target.value }))}
              style={{ minHeight: '110px' }}
              required
            />
          </div>

          <div className="tutien-input-group">
            <label>Tông Môn & Thế Lực Lớn (Tối đa 6):</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                className="tutien-input"
                placeholder="Nhập tên tông môn..."
                value={sectInput}
                onChange={e => setSectInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSect(); } }}
                disabled={config.sects.length >= 6}
              />
              <button type="button" className="tutien-btn" onClick={() => addSect()} disabled={config.sects.length >= 6}>
                + Thêm
              </button>
              <button type="button" className="tutien-btn" onClick={addRandomSects} style={{ whiteSpace: 'nowrap' }}>
                🎲 Thêm 4 Tông
              </button>
            </div>
            <div className="tutien-sect-tags">
              {config.sects.map((s, i) => (
                <span key={i} className="tutien-sect-tag">
                  🏯 {s}
                  <span className="tutien-sect-tag-remove" onClick={() => removeSect(i)}>×</span>
                </span>
              ))}
            </div>
            {config.sects.length < 2 && (
              <div style={{ fontSize: '0.82rem', color: 'var(--tt-crimson)', marginTop: '6px' }}>
                * Cần ít nhất 2 tông môn để khởi tạo thế giới
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', gap: '12px' }}>
            <button type="button" className="tutien-btn tutien-btn-danger" onClick={() => setScreen('MENU')}>
              ← Quay Lại
            </button>
            <button type="submit" className="tutien-btn" disabled={!isValid} style={{ padding: '12px 36px', fontSize: '1.05rem' }}>
              Tiếp Tục → Bản Mệnh Đăng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
