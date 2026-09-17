import { useState, useEffect } from 'react';
import { CHARACTERS, SKILLS, PASSIVES } from '../../game/data';
import {
  CHARACTER_AVATARS, CHARACTER_FULL_SPRITES, SKILL_ICONS,
  ULTIMATE_ICONS, CHARACTER_DETAILS,
} from '../../game/characterAssets';
import tienDangAvatarUrl from '../../assets/tien_dang_avatar.png';
import {
  Swords, Shield, Sparkles, Flame, Zap, Award, Crosshair, ArrowLeft,
} from 'lucide-react';

interface CharacterSelectProps {
  onSelect: (id: string) => void;
  onBack?: () => void;
}

export function CharacterSelect({ onSelect, onBack }: CharacterSelectProps) {
  const [selected, setSelected] = useState<string>(CHARACTERS[0].id);

  const selectedChar = CHARACTERS.find(c => c.id === selected) || CHARACTERS[0];
  const charDetails = CHARACTER_DETAILS[selected] || CHARACTER_DETAILS.tien;
  const startingSkill = SKILLS[selectedChar.startingSkillId];
  const startingSkillIcon = SKILL_ICONS[selectedChar.startingSkillId];
  const ultIcon = startingSkill?.ultimateId ? ULTIMATE_ICONS[startingSkill.ultimateId] : null;
  const fullSprite = CHARACTER_FULL_SPRITES[selected] || CHARACTER_FULL_SPRITES.tien;
  const reqPassive = startingSkill?.requiredPassiveId ? PASSIVES[startingSkill.requiredPassiveId] : null;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onSelect(selected);
      } else if (e.key >= '1' && e.key <= '7') {
        const idx = parseInt(e.key, 10) - 1;
        if (CHARACTERS[idx]) {
          setSelected(CHARACTERS[idx].id);
        }
      } else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        const idx = CHARACTERS.findIndex(c => c.id === selected);
        const next = (idx + 1) % CHARACTERS.length;
        setSelected(CHARACTERS[next].id);
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        const idx = CHARACTERS.findIndex(c => c.id === selected);
        const prev = (idx - 1 + CHARACTERS.length) % CHARACTERS.length;
        setSelected(CHARACTERS[prev].id);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, onSelect]);

  const hpPercent = Math.min(100, Math.round((selectedChar.baseHp / 160) * 100));
  const spdPercent = Math.min(100, Math.round((selectedChar.baseSpeed / 130) * 100));
  const armPercent = Math.min(100, Math.round(((selectedChar.baseArmor + 0.5) / 4) * 100));

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-[#03060f] via-[#080d1a] to-[#04060c] text-slate-100 flex flex-col justify-between p-3 md:p-6 overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/20 via-transparent to-transparent" />

      {onBack && (
        <button
          onClick={onBack}
          className="relative z-20 inline-flex items-center gap-1.5 px-3 py-1.5 mb-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900/60 border border-slate-700/50 rounded-xl transition-all hover:border-amber-500/50 active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Menu Game</span>
        </button>
      )}

      <div className="relative z-10 text-center max-w-2xl mx-auto pt-1 pb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Sparkles size={12} className="text-amber-400" />
          <span>CHIẾN TRƯỜNG ROGUELIKE 8D</span>
        </div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
          CHỌN CHIẾN BINH XUẤT TRẬN
        </h1>
        <p className="text-[11px] md:text-xs text-slate-400 font-medium tracking-wide mt-1">
          7 Anh hùng độc bản • Kỹ năng thức tỉnh tối thượng • Sống sót qua 20 đợt quái tử thần
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-7xl w-full mx-auto my-auto items-stretch">
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-700/70 rounded-3xl p-4 md:p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div
            className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500"
            style={{ backgroundColor: charDetails.glowColor }}
          />

          <div>
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-600 text-amber-300 uppercase">
                  {charDetails.tag}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Độ khó: <span className="text-amber-400 font-mono">{charDetails.difficulty}</span>
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                Phím tắt: [1 - 7]
              </span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow">
                {selectedChar.name}
              </h2>
              <span className="text-sm md:text-base font-bold text-amber-400/90">
                {selectedChar.nickname}
              </span>
            </div>
            <p className="text-xs text-slate-400 italic mt-0.5 mb-2">
              {charDetails.quote}
            </p>
          </div>

          <div className="relative w-full h-56 md:h-64 flex items-center justify-center my-1 select-none">
            <div
              className="absolute w-44 md:w-56 h-16 rounded-[100%] border-2 border-dashed opacity-70 pointer-events-none"
              style={{
                borderColor: selectedChar.color,
                boxShadow: `0 0 35px ${selectedChar.color}`,
                animation: 'pedestalRotate 14s linear infinite',
              }}
            />
            <div
              className="absolute w-36 md:w-44 h-12 rounded-[100%] border border-white/40 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 20px ${selectedChar.color}`,
                animation: 'pedestalRotate 8s linear infinite reverse',
              }}
            />
            <div
              className="absolute w-48 md:w-60 h-48 md:h-60 rounded-full blur-2xl pointer-events-none"
              style={{
                backgroundColor: `${selectedChar.color}25`,
                animation: 'auraPulse 3s ease-in-out infinite',
              }}
            />

            <img
              src={fullSprite}
              alt={selectedChar.name}
              className="relative z-10 max-h-48 md:max-h-56 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] filter"
              style={{ animation: 'floatHero 3.5s ease-in-out infinite' }}
            />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80">
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1 font-bold text-rose-400"><Flame size={11} /> HP</span>
                  <span className="font-black text-rose-300">{selectedChar.baseHp}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" style={{ width: `${hpPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1 font-bold text-cyan-400"><Zap size={11} /> TỐC ĐỘ</span>
                  <span className="font-black text-cyan-300">{selectedChar.baseSpeed}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" style={{ width: `${spdPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1 font-bold text-amber-400"><Shield size={11} /> GIÁP</span>
                  <span className="font-black text-amber-300">{selectedChar.baseArmor}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${armPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-700/70 flex items-start gap-2.5">
                <div className="w-11 h-11 rounded-xl p-1 bg-slate-950/80 border border-slate-600/80 flex-shrink-0 flex items-center justify-center shadow-inner">
                  {startingSkillIcon ? (
                    <img src={startingSkillIcon} alt={startingSkill?.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl">{startingSkill?.icon}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">VŨ KHÍ KHỞI ĐẦU</span>
                  </div>
                  <p className="text-xs font-black text-white truncate">{startingSkill?.name}</p>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mt-0.5">
                    {startingSkill?.description}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-900/90 rounded-2xl p-2.5 border border-purple-500/50 flex items-start gap-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="w-11 h-11 rounded-xl p-1 bg-purple-950/80 border border-purple-400/80 flex-shrink-0 flex items-center justify-center shadow-inner">
                  {ultIcon ? (
                    <img src={ultIcon} alt={startingSkill?.ultimateName} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl">{startingSkill?.ultimateIcon}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} className="text-purple-400" /> THỨC TỈNH
                    </span>
                    {reqPassive && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/40">
                        + {reqPassive.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-purple-200 truncate">{startingSkill?.ultimateName}</p>
                  <p className="text-[10px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                    {startingSkill?.ultimateDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-transparent p-2 rounded-xl border border-amber-500/30">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0">
                <Award size={13} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide mr-1.5">NỘI TẠI:</span>
                <span className="text-[11px] font-bold text-slate-200">{selectedChar.passiveDescription}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Crosshair size={13} className="text-amber-400" />
              <span>DANH SÁCH CHIẾN BINH ({CHARACTERS.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">Chọn để xem chi tiết</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
            {CHARACTERS.map((char, index) => {
              const isSelected = selected === char.id;
              const skill = SKILLS[char.startingSkillId];
              const skillIcon = SKILL_ICONS[char.startingSkillId];
              const avatar = CHARACTER_AVATARS[char.id] || tienDangAvatarUrl;

              return (
                <div
                  key={char.id}
                  onClick={() => setSelected(char.id)}
                  className={`group relative rounded-2xl p-2.5 border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-amber-950/40 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-[1.02] -translate-x-1'
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all shadow-md bg-slate-900"
                      style={{ borderColor: isSelected ? '#fbbf24' : char.color }}
                    >
                      <img
                        src={avatar}
                        alt={char.name}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-0 left-0 bg-slate-950/80 text-[9px] font-mono font-bold px-1 rounded-br text-slate-300">
                        #{index + 1}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white truncate">{char.name}</span>
                        {isSelected && (
                          <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1 rounded shadow">
                            CHỌN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium truncate" style={{ color: char.color }}>
                        {char.nickname}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-rose-400 font-bold">{char.baseHp}HP</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold">{char.baseSpeed}SPD</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">{char.baseArmor}DEF</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg p-1 bg-slate-900 border border-slate-700/80 flex items-center justify-center mb-1">
                      {skillIcon ? (
                        <img src={skillIcon} alt={skill?.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-sm">{skill?.icon}</span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 max-w-[80px] truncate text-right">
                      {skill?.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSelect(selected)}
              className="w-full group relative overflow-hidden py-3.5 md:py-4 px-6 rounded-2xl font-black text-base md:text-lg text-slate-950 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-orange-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5"
            >
              <div
                className="absolute inset-0 bg-white/25 w-1/3 skew-x-12 pointer-events-none"
                style={{ animation: 'shimmerLine 2.5s infinite' }}
              />
              <Swords size={20} className="text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>XUẤT TRẬN: {selectedChar.name.toUpperCase()}</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 font-mono mt-1.5">
              Nhấn [SPACE] hoặc [ENTER] để vào trận tức thì
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
