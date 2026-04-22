import { useState } from 'react';
import { useTuTienGame } from '../GameContext';
import type { CharacterProfile } from '../types';

const MAX_ITEMS = 3;
const MAX_TRAITS = 3;
const MAX_COMPANIONS = 2;

const ITEM_SUGGESTIONS = ['Ngọc Bội vỡ', 'Kiếm rỉ sét', 'Linh thảo khô', 'Tiền đồng hồ', 'Túi đựng rác'];
const TRAIT_SUGGESTIONS = ['Sát phạt quả đoán', 'Mị lực vô song', 'Trời sinh mẫn cảm', 'Thể chất ốm yếu', 'Số như cứt trôi'];
const COMPANION_SUGGESTIONS = ['Lão bộc què', 'Thanh mai trúc mã', 'Sói xám hoang', 'Hỏa nha ngốc', 'Tiểu sư muội'];

export default function CharacterCreation() {
  const { initCharacter } = useTuTienGame();
  
  const [profile, setProfile] = useState<CharacterProfile>({
    name: '',
    backstory: '',
    goal: '',
    items: [],
    traits: [],
    companions: [],
    startLocation: 'Cô nhi viện sụp đổ'
  });

  const [inputVal, setInputVal] = useState({ item: '', trait: '', companion: '' });

  const handleAddArray = (
    field: 'items' | 'traits' | 'companions',
    valField: 'item' | 'trait' | 'companion',
    max: number
  ) => {
    const val = inputVal[valField].trim();
    if (!val) return;
    if (profile[field].length >= max) return; // Limit reached

    setProfile(prev => ({ ...prev, [field]: [...prev[field], val] }));
    setInputVal(prev => ({ ...prev, [valField]: '' }));
  };

  const handleRemoveArray = (field: 'items' | 'traits' | 'companions', idx: number) => {
    setProfile(prev => {
      const newArr = [...prev[field]];
      newArr.splice(idx, 1);
      return { ...prev, [field]: newArr };
    });
  };

  const isFormValid = profile.name.trim() !== '' && profile.backstory.trim() !== '' && profile.goal.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      initCharacter(profile);
    }
  };

  return (
    <div className="tutien-panel" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="tutien-panel-title" style={{ fontSize: '1.5rem' }}>Bản Mệnh Đăng - Điển Cố Khởi Nguyên</div>
      
      <form onSubmit={handleSubmit}>
        <div className="tutien-input-group">
          <label>Tôn tính đại danh (Tên):</label>
          <input 
            className="tutien-input" 
            placeholder="Ví dụ: Hàn Lập, Vương Lâm..." 
            value={profile.name}
            onChange={e => setProfile(prev => ({...prev, name: e.target.value}))}
            maxLength={30}
            required
          />
        </div>

        <div className="tutien-input-group">
          <label>Tiểu sử xuất thân (Bối cảnh):</label>
          <textarea 
            className="tutien-textarea" 
            placeholder="Ngươi đến từ đâu? Gia tộc sa sút hay kẻ ăn mày lang thang?" 
            value={profile.backstory}
            onChange={e => setProfile(prev => ({...prev, backstory: e.target.value}))}
            required
          />
        </div>

        <div className="tutien-input-group">
          <label>Chấp niệm nhập đạo (Mục tiêu):</label>
          <input 
            className="tutien-input" 
            placeholder="Vì sao phải trường sinh? Báo thù, cứu người hay đạt tuyệt đỉnh?" 
            value={profile.goal}
            onChange={e => setProfile(prev => ({...prev, goal: e.target.value}))}
            required
          />
        </div>

        <div className="tutien-input-group">
          <label>Điểm xuất phát:</label>
          <select 
            className="tutien-input" 
            value={profile.startLocation}
            onChange={e => setProfile(prev => ({...prev, startLocation: e.target.value}))}
          >
            <option value="Tạp dịch xứ Huyết Ma Tông">Tạp dịch xứ Huyết Ma Tông</option>
            <option value="Phàm thôn nghèo nàn">Phàm thôn nghèo nàn</option>
            <option value="Rừng U Môi ẩm ướt">Rừng U Môi ẩm ướt</option>
            <option value="Đống thây ma trên chiến trường">Đống thây ma trên chiến trường</option>
          </select>
        </div>

        {/* Arrays Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          
          {/* Items */}
          <div className="tutien-input-group">
            <label>Hành trang (Tối đa {MAX_ITEMS}):</label>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              <input 
                className="tutien-input" 
                placeholder="Thêm vật phẩm..." 
                value={inputVal.item}
                onChange={e => setInputVal(prev => ({...prev, item: e.target.value}))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddArray('items', 'item', MAX_ITEMS); } }}
                disabled={profile.items.length >= MAX_ITEMS}
              />
              <button type="button" className="tutien-btn" onClick={() => handleAddArray('items', 'item', MAX_ITEMS)}>+</button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--tu-tien-text-muted)' }}>Gợi ý: {ITEM_SUGGESTIONS.join(', ')}</div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              {profile.items.map((it, idx) => (
                <li key={idx} style={{ background: 'var(--tu-tien-bg)', padding: '5px', marginBottom: '5px', border: '1px solid var(--tu-tien-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it}</span>
                  <span style={{ cursor: 'pointer', color: 'var(--tu-tien-primary)' }} onClick={() => handleRemoveArray('items', idx)}>X</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Traits */}
          <div className="tutien-input-group">
            <label>Mệnh cách (Tối đa {MAX_TRAITS}):</label>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              <input 
                className="tutien-input" 
                placeholder="Thêm mệnh cách..." 
                value={inputVal.trait}
                onChange={e => setInputVal(prev => ({...prev, trait: e.target.value}))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddArray('traits', 'trait', MAX_TRAITS); } }}
                disabled={profile.traits.length >= MAX_TRAITS}
              />
              <button type="button" className="tutien-btn" onClick={() => handleAddArray('traits', 'trait', MAX_TRAITS)}>+</button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--tu-tien-text-muted)' }}>Gợi ý: {TRAIT_SUGGESTIONS.join(', ')}</div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              {profile.traits.map((it, idx) => (
                <li key={idx} style={{ background: 'var(--tu-tien-bg)', padding: '5px', marginBottom: '5px', border: '1px solid var(--tu-tien-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it}</span>
                  <span style={{ cursor: 'pointer', color: 'var(--tu-tien-primary)' }} onClick={() => handleRemoveArray('traits', idx)}>X</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Companions */}
          <div className="tutien-input-group">
            <label>Đồng hành (Tối đa {MAX_COMPANIONS}):</label>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              <input 
                className="tutien-input" 
                placeholder="Thêm đồng hành..." 
                value={inputVal.companion}
                onChange={e => setInputVal(prev => ({...prev, companion: e.target.value}))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddArray('companions', 'companion', MAX_COMPANIONS); } }}
                disabled={profile.companions.length >= MAX_COMPANIONS}
              />
              <button type="button" className="tutien-btn" onClick={() => handleAddArray('companions', 'companion', MAX_COMPANIONS)}>+</button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--tu-tien-text-muted)' }}>Gợi ý: {COMPANION_SUGGESTIONS.join(', ')}</div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              {profile.companions.map((it, idx) => (
                <li key={idx} style={{ background: 'var(--tu-tien-bg)', padding: '5px', marginBottom: '5px', border: '1px solid var(--tu-tien-border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it}</span>
                  <span style={{ cursor: 'pointer', color: 'var(--tu-tien-primary)' }} onClick={() => handleRemoveArray('companions', idx)}>X</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="tutien-btn" 
            disabled={!isFormValid}
            style={{ padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold' }}
          >
            Khởi Bước Đạo Đồ
          </button>
        </div>

      </form>
    </div>
  );
}
