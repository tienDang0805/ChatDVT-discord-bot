import { useTuTienGame } from '../GameContext';

export default function CharacterSheet() {
  const { profile, stats } = useTuTienGame();

  if (!profile) return null;

  return (
    <div className="tutien-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="tutien-panel-title">Hồ Sơ Tu Chân</div>
      
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 5px 0', color: 'var(--tu-tien-gold)' }}>{profile.name}</h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--tu-tien-text-muted)' }}>Cảnh giới: <span style={{ color: 'var(--tu-tien-text-main)' }}>{stats.realm}</span></div>
      </div>

      {/* Progress Bars */}
      <div className="tutien-progress-container">
        <div className="tutien-progress-label">
          <span>Khí huyết: {Math.floor(stats.health)}/{stats.maxHealth}</span>
        </div>
        <div className="tutien-progress-bar-bg">
          <div className="tutien-progress-fill fill-health" style={{ width: `${(stats.health / stats.maxHealth) * 100}%` }}></div>
        </div>
      </div>

      <div className="tutien-progress-container">
        <div className="tutien-progress-label">
          <span>Linh lực: {Math.floor(stats.qi)}/{stats.maxQi}</span>
        </div>
        <div className="tutien-progress-bar-bg">
          <div className="tutien-progress-fill fill-qi" style={{ width: `${(stats.qi / stats.maxQi) * 100}%` }}></div>
        </div>
      </div>

      <div className="tutien-progress-container">
        <div className="tutien-progress-label">
          <span>Đạo tâm: {Math.floor(stats.daoHeart)}/{stats.maxDaoHeart}</span>
        </div>
        <div className="tutien-progress-bar-bg">
          <div className="tutien-progress-fill fill-dao" style={{ width: `${(stats.daoHeart / stats.maxDaoHeart) * 100}%` }}></div>
        </div>
      </div>

      <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        Tài phú: <span style={{ color: 'var(--tu-tien-gold)' }}>{stats.wealth}</span>
      </div>

      <hr style={{ borderColor: 'var(--tu-tien-border)', opacity: 0.5 }} />

      {/* Items & Companions */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ color: 'var(--tu-tien-text-muted)', marginBottom: '5px' }}>Hành trang:</div>
        <ul style={{ paddingLeft: '20px', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
          {profile.items.length > 0 ? profile.items.map((it: string, i: number) => <li key={i}>{it}</li>) : <li>*Trống không*</li>}
        </ul>

        <div style={{ color: 'var(--tu-tien-text-muted)', marginBottom: '5px' }}>Đồng hành:</div>
        <ul style={{ paddingLeft: '20px', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
          {profile.companions.length > 0 ? profile.companions.map((it: string, i: number) => <li key={i}>{it}</li>) : <li>*Cô độc*</li>}
        </ul>

        <div style={{ color: 'var(--tu-tien-text-muted)', marginBottom: '5px' }}>Mệnh cách:</div>
        <ul style={{ paddingLeft: '20px', margin: '0', fontSize: '0.9rem' }}>
          {profile.traits.length > 0 ? profile.traits.map((it: string, i: number) => <li key={i} style={{ color: 'var(--tu-tien-primary)' }}>[{it}]</li>) : <li>*Phàm phu*</li>}
        </ul>
      </div>
    </div>
  );
}
