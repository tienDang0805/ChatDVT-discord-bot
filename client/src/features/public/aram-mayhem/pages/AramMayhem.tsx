import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swords, Sparkles, RotateCcw, Volume2, VolumeX, Shuffle, Trophy } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';

interface AramMayhemProps {
  onBackToMenu?: () => void;
}

type Tier = 'silver' | 'gold' | 'prismatic';

interface AugmentDef {
  id: string;
  name: string;
  tier: Tier;
  icon: string;
  desc: string;
  sub: string;
}

interface ChampionDef {
  id: string;
  name: string;
  title: string;
  color: string;
  accent: string;
  hp: number;
  dmg: number;
  speed: number;
  range: number;
  passive: string;
  skills: { key: string; name: string; cd: number; desc: string }[];
  sprite: string[];
}

interface Unit {
  id: number;
  team: 'blue' | 'red';
  kind: 'player' | 'champ' | 'minion' | 'turret' | 'nexus';
  name: string;
  champId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  dmg: number;
  speed: number;
  range: number;
  atkCd: number;
  maxAtkCd: number;
  color: string;
  dead: boolean;
  respawnTimer: number;
  stunTimer: number;
  shield: number;
  scale: number;
  facing: number;
  aiSkillTimer: number;
  masteryTimer: number;
  chatText: string;
  chatTimer: number;
}

interface Projectile {
  id: number;
  team: 'blue' | 'red';
  kind: 'basic' | 'tornado' | 'hook' | 'shroom' | 'laser' | 'snowball' | 'fireball' | 'turret_shot' | 'lux_orb' | 'justice';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  dmg: number;
  color: string;
  life: number;
  maxLife: number;
  pierce: boolean;
  stun: number;
  pullOriginX?: number;
  pullOriginY?: number;
  hitIds: Set<number>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  size: number;
  life: number;
}

interface Relic {
  x: number;
  y: number;
  active: boolean;
  timer: number;
  isAugmentBox: boolean;
}

const WORLD_W = 2200;
const BRIDGE_TOP = 110;
const BRIDGE_BOT = 390;
const CANVAS_W = 920;
const CANVAS_H = 500;

const TROLL_CHATS = [
  'Ez game anh em ơi!',
  'Jungle diff nặng quá!',
  '0/10 mới bật nội tại!',
  'Tắt máy đi ngủ đi!',
  'Lag vãi chưởng 999ms!',
  'Gánh còng cả lưng!',
  'Múa lửa Đắk Nông!',
  'Lõi này ảo ma Canada!',
  'Đầu hàng phút 15 đê!',
  'Pentakill pha ke!',
];

const ENEMY_NAMES = [
  'Master Yi Chặt Chém',
  'Zed Múa Bóng Hụt',
  'Malphite Không Làm Gì',
  'Lee Sin Sóng Âm Gió',
  'Vayne Lăn Vào Trụ',
  'Nasus Quên Q',
  'Shaco Đa Nhân Cách',
];

const ALLY_NAMES = [
  'Yuumi Bấm Bàn Phím Bằng Chân',
  'Jinx Bắn Chim',
];

const CHAMPIONS: ChampionDef[] = [
  {
    id: 'yasuo',
    name: 'Đấng Yasuo 0/10',
    title: 'Kiếm Khách Gánh Team (Team Địch)',
    color: '#38bdf8',
    accent: '#0284c7',
    hp: 950,
    dmg: 48,
    speed: 3.6,
    range: 135,
    passive: 'Nội tại 0/10: Mỗi lần chết tăng +25% Sát thương và hồi sinh siêu tốc 1.5s!',
    skills: [
      { key: 'Q', name: 'Bão Kiếm Hasagi', cd: 2.2, desc: 'Phóng lốc xoáy xuyên thấu hất tung kẻ địch' },
      { key: 'W', name: 'Tường Gió Thông Thạo 7', cd: 6.5, desc: 'Tạo khiên gió + hồi máu + nháy Thông Thạo 7' },
      { key: 'E', name: 'Lướt Vào Trụ', cd: 3.0, desc: 'Lướt thẳng tới kẻ địch gần nhất và chém xoáy' },
      { key: 'R', name: 'Trăn Trối Tập Thể', cd: 10.0, desc: 'Nhảy bổ vào mục tiêu chém bão kiếm AOE cực mạnh' },
    ],
    sprite: [
      '..1111..',
      '.111111.',
      '..2332..',
      '.114411.',
      '11144113',
      '..1111.3',
      '..2..2.3',
      '.22..22.',
    ],
  },
  {
    id: 'blitz',
    name: 'Blitzcrank Bàn Tay Vàng',
    title: 'Kéo Nhầm Bố Cũng Kéo',
    color: '#facc15',
    accent: '#ca8a04',
    hp: 1350,
    dmg: 42,
    speed: 3.2,
    range: 120,
    passive: 'Giáp Hơi Nước: Máu trâu bò, tự tạo khiên mỗi khi tung chiêu!',
    skills: [
      { key: 'Q', name: 'Bàn Tay Hỏa Tiễn', cd: 3.8, desc: 'Phóng bàn tay siêu dài kéo tuột kẻ địch về tận mặt' },
      { key: 'W', name: 'Tăng Tốc Chạy Trốn', cd: 5.5, desc: 'Bốc khói tăng tốc chạy + tốc đánh và tạo khiên' },
      { key: 'E', name: 'Đấm Móc Lên Trời', cd: 3.2, desc: 'Đấm bay mọi kẻ địch xung quanh làm choáng' },
      { key: 'R', name: 'Trường Điện Từ 8D', cd: 9.0, desc: 'Giật sét nổ tung toàn bộ kẻ địch trong vùng rộng' },
    ],
    sprite: [
      '..1111..',
      '.131131.',
      '11111111',
      '12111121',
      '11144111',
      '.111111.',
      '.22..22.',
      '222..222',
    ],
  },
  {
    id: 'teemo',
    name: 'Teemo Chúa Tể Địa Ngục',
    title: 'Trinh Sát Rải Nấm Toàn Cầu',
    color: '#4ade80',
    accent: '#16a34a',
    hp: 880,
    dmg: 45,
    speed: 3.9,
    range: 250,
    passive: 'Ống Thổi Độc: Đánh xa cực rát, rải nấm nổ banh xác đội hình địch!',
    skills: [
      { key: 'Q', name: 'Phi Tiêu Mù Mắt', cd: 3.0, desc: 'Bắn phi tiêu độc gây sát thương lớn và làm choáng' },
      { key: 'W', name: 'Chạy Lạch Bạch', cd: 4.5, desc: 'Lướt nhanh về phía trước và để lại 1 quả nấm' },
      { key: 'E', name: 'Phun Độc 3 Tia', cd: 2.8, desc: 'Bắn 3 mũi tên độc hình nón xuyên thấu' },
      { key: 'R', name: 'Rải Nấm Tập Thể', cd: 5.5, desc: 'Quăng 3 quả Nấm Hạt Nhân nổ diện rộng trên cầu' },
    ],
    sprite: [
      '.44..44.',
      '.111111.',
      '.132231.',
      '..2222..',
      '.114411.',
      '.111111.',
      '..2..2..',
      '.22..22.',
    ],
  },
  {
    id: 'garen',
    name: 'Garen Công Lý Mặc Váy',
    title: 'Xoay Như Chong Chóng Tre',
    color: '#60a5fa',
    accent: '#f59e0b',
    hp: 1400,
    dmg: 46,
    speed: 3.4,
    range: 125,
    passive: 'Bất Khuất: Tự hồi máu liên tục và xoay kiếm chém văng tất cả!',
    skills: [
      { key: 'Q', name: 'Đòn Quyết Định Bổ Củi', cd: 3.5, desc: 'Lao tới bổ kiếm gây sát thương và làm choáng' },
      { key: 'W', name: 'Lì Đòn Không Não', cd: 6.0, desc: 'Bật giáp vàng khổng lồ và hồi ngay 250 máu' },
      { key: 'E', name: 'Phán Quyết Chong Chóng', cd: 3.2, desc: 'Xoay kiếm 360 độ chém nát toàn bộ kẻ địch xung quanh' },
      { key: 'R', name: 'Công Lý Demacia', cd: 9.5, desc: 'Thả thanh kiếm khổng lồ từ trời xuống nổ tan xác mục tiêu' },
    ],
    sprite: [
      '...44...',
      '..2332..',
      '44111144',
      '41144114',
      '.1144113',
      '.1111113',
      '..2222.3',
      '.22..22.',
    ],
  },
  {
    id: 'lux',
    name: 'Lux Cười Khúc Khích',
    title: 'Tiểu Thư Spam Laser Cầu Vồng',
    color: '#f472b6',
    accent: '#ec4899',
    hp: 860,
    dmg: 50,
    speed: 3.5,
    range: 280,
    passive: 'Chói Lòa: Tay dài nhất map, bắn Cầu Vồng Tối Thượng xuyên cả bản đồ!',
    skills: [
      { key: 'Q', name: 'Khóa Ánh Sáng', cd: 3.2, desc: 'Bắn cầu ánh sáng xuyên táo làm choáng kẻ địch' },
      { key: 'W', name: 'Khiên Lăng Kính Ảo Ma', cd: 5.5, desc: 'Tạo lá chắn ánh sáng và hồi máu cho cả đội' },
      { key: 'E', name: 'Quả Cầu Lấp Lánh', cd: 3.5, desc: 'Nổ vùng ánh sáng diện rộng giữa đội hình địch' },
      { key: 'R', name: 'Cầu Vồng Tối Thượng', cd: 7.5, desc: 'Bắn tia Đại Bác Laser xuyên suốt chiều dài cầu ARAM!' },
    ],
    sprite: [
      '..4444..',
      '.423324.',
      '.422224.',
      '..1441..',
      '.1144113',
      '.1111113',
      '..2..2..',
      '.22..22.',
    ],
  },
];

const AUGMENTS: AugmentDef[] = [
  {
    id: 'yasuo_010',
    name: 'Nội Tại 0/10 Sớm',
    tier: 'prismatic',
    icon: '💀',
    desc: 'Cộng ngay +10 Chết vào KDA! Đổi lại +120% Sát Thương và đòn đánh thường bắn 3 tia!',
    sub: 'Đúng chuẩn sách giáo khoa Đấng',
  },
  {
    id: 'urf_mode',
    name: 'Súng Liên Thanh URF',
    tier: 'prismatic',
    icon: '⚡',
    desc: 'Giảm 60% hồi chiêu tất cả kỹ năng Q W E R D F và tăng +40% Tốc chạy!',
    sub: 'Bấm liệt bàn phím không kịp thở',
  },
  {
    id: 'auto_laser',
    name: 'Đại Bác Cầu Vồng Tự Động',
    tier: 'prismatic',
    icon: '🌈',
    desc: 'Mỗi 3.5 giây tự động bắn 1 tia Laser Cầu Vồng Tối Thượng xuyên suốt cầu ARAM!',
    sub: 'Đứng im cũng có Pentakill',
  },
  {
    id: 'mastery_burn',
    name: 'Thông Thạo 7 Tâm Lý Chiến',
    tier: 'prismatic',
    icon: '👑',
    desc: 'Tự động nháy Thông Thạo 7 mỗi 1.5s, đốt máu toàn bộ kẻ địch xung quanh bằng sát thương tinh thần!',
    sub: 'Làm đối thủ tức ói máu mà chết',
  },
  {
    id: 'long_hook',
    name: 'Bàn Tay Dài 3 Mét',
    tier: 'prismatic',
    icon: '🪝',
    desc: 'Mỗi 3 giây tự động phóng Bàn Tay Hỏa Tiễn kéo cổ kẻ địch gần nhất về tận mặt để đấm!',
    sub: 'Chạy đằng trời cũng bị lôi về',
  },
  {
    id: 'giant_heart',
    name: 'Trái Tim Khổng Nhân 8D',
    tier: 'gold',
    icon: '🗿',
    desc: 'Tăng +1000 Máu tối đa, phóng to kích thước tướng khổng lồ và hồi ngay 100% máu!',
    sub: 'To hơn cả cái trụ ARAM',
  },
  {
    id: 'poop_shroom',
    name: 'Ỉa Nấm Mọi Nơi',
    tier: 'gold',
    icon: '🍄',
    desc: 'Mỗi 1.8 giây tự động rải 1 quả Nấm Độc Hạt Nhân ngay dưới chân khi di chuyển!',
    sub: 'Biến cây cầu thành bãi mìn',
  },
  {
    id: 'mega_snowball',
    name: 'Cầu Tuyết Siêu To Khổng Lồ',
    tier: 'gold',
    icon: '⛄',
    desc: 'Mỗi 3.5 giây tự lăn 1 quả Cầu Tuyết Poro khổng lồ nghiền nát cả làn đường!',
    sub: 'Cán phẳng từ lính tới tướng',
  },
  {
    id: 'blame_jungle',
    name: 'Thánh Đổ Thừa: Tại Rừng!',
    tier: 'gold',
    icon: '🤬',
    desc: 'Mỗi khi bị đánh trúng sẽ chửi "Jungle diff!" và bắn 8 quả cầu lửa ra mọi hướng!',
    sub: 'Map ARAM làm gì có rừng nhưng cứ đổ thừa',
  },
  {
    id: 'call_homies',
    name: 'Gọi Hội Đồng Đội Cảm Tử',
    tier: 'gold',
    icon: '👯',
    desc: 'Triệu hồi ngay 2 Chiến Thần Đồng Đội lao lên combat húc trụ cùng bạn!',
    sub: 'Đông hơn là thắng',
  },
  {
    id: 'vamp_lord',
    name: 'Hút Máu Ma Cà Rồng',
    tier: 'silver',
    icon: '🧛',
    desc: 'Hồi máu bằng 28% sát thương gây ra và tăng +50% tốc độ đánh!',
    sub: 'Đứng giữa 5 thằng địch vẫn đầy cây máu',
  },
  {
    id: 'walking_turret',
    name: 'Pháo Đài Di Động',
    tier: 'silver',
    icon: '🗼',
    desc: 'Gắn 1 khẩu pháo Trụ Bảo Vệ trên đầu, tự động bắn đạn trụ vào kẻ địch gần nhất!',
    sub: 'Trụ đi bộ đúng nghĩa đen',
  },
  {
    id: 'spin_blade',
    name: 'Vòng Kiếm Chong Chóng',
    tier: 'silver',
    icon: '🌀',
    desc: 'Tạo vòng kiếm xoay vĩnh viễn quanh người, chém liên tục mọi kẻ địch dám lại gần!',
    sub: 'Cách ly xã hội 2 mét',
  },
  {
    id: 'poro_snack',
    name: 'Bánh Poro Béo Phì',
    tier: 'silver',
    icon: '🍪',
    desc: 'Hồi 90 Máu mỗi giây và tăng +45% Sát thương cơ bản!',
    sub: 'Ăn no vác nặng đấm đau',
  },
];

class SoundFX {
  ctx: AudioContext | null = null;
  muted = false;

  private ensure() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq: number, dur: number, type: OscillatorType = 'square', endFreq?: number, vol = 0.08) {
    const ctx = this.ensure();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur);
      }
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  hit() {
    this.playTone(220, 0.07, 'square', 90, 0.05);
  }

  skill() {
    this.playTone(440, 0.14, 'sawtooth', 780, 0.07);
  }

  laser() {
    this.playTone(680, 0.35, 'sawtooth', 180, 0.1);
  }

  mastery() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.14, 'triangle', n * 1.02, 0.09), i * 70);
    });
  }

  augment() {
    const notes = [392, 523, 659, 784, 1046];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.16, 'sine', n, 0.1), i * 65);
    });
  }

  kill() {
    this.playTone(587, 0.12, 'square', 880, 0.09);
    setTimeout(() => this.playTone(880, 0.22, 'square', 1174, 0.09), 100);
  }
}

const sfx = new SoundFX();

export const AramMayhem: React.FC<AramMayhemProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedChamp, setSelectedChamp] = useState<ChampionDef>(CHAMPIONS[0]);
  const [phase, setPhase] = useState<'select' | 'playing' | 'victory' | 'defeat'>('select');
  const [augmentChoices, setAugmentChoices] = useState<AugmentDef[]>([]);
  const [pickedAugments, setPickedAugments] = useState<AugmentDef[]>([]);
  const [rerollsLeft, setRerollsLeft] = useState(3);
  const [muted, setMuted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [hudState, setHudState] = useState({
    hp: 1000,
    maxHp: 1000,
    shield: 0,
    level: 1,
    xp: 0,
    nextXp: 100,
    kills: 0,
    deaths: 0,
    assists: 0,
    cds: [0, 0, 0, 0, 0, 0],
    maxCds: [2, 5, 3, 9, 4, 6],
    blueTurrets: 2,
    redTurrets: 2,
    blueNexusHp: 100,
    redNexusHp: 100,
  });

  const stateRef = useRef<{
    units: Unit[];
    projectiles: Projectile[];
    particles: Particle[];
    floatTexts: FloatText[];
    relics: Relic[];
    poros: { x: number; y: number; vx: number; vy: number }[];
    keys: Set<string>;
    mouseX: number;
    mouseY: number;
    targetMoveX: number | null;
    targetMoveY: number | null;
    cameraX: number;
    frame: number;
    nextId: number;
    champ: ChampionDef;
    augments: Set<string>;
    augmentStacks: Record<string, number>;
    level: number;
    xp: number;
    nextXp: number;
    kills: number;
    deaths: number;
    assists: number;
    multiKill: number;
    multiKillTimer: number;
    cds: number[];
    maxCds: number[];
    markedTargetId: number | null;
    pausedForAugment: boolean;
    autoMode: boolean;
    blameCooldown: number;
  }>({
    units: [],
    projectiles: [],
    particles: [],
    floatTexts: [],
    relics: [],
    poros: [],
    keys: new Set(),
    mouseX: CANVAS_W / 2,
    mouseY: CANVAS_H / 2,
    targetMoveX: null,
    targetMoveY: null,
    cameraX: 0,
    frame: 0,
    nextId: 1,
    champ: CHAMPIONS[0],
    augments: new Set(),
    augmentStacks: {},
    level: 1,
    xp: 0,
    nextXp: 90,
    kills: 0,
    deaths: 0,
    assists: 0,
    multiKill: 0,
    multiKillTimer: 0,
    cds: [0, 0, 0, 0, 0, 0],
    maxCds: [2, 5, 3, 9, 4, 6],
    markedTargetId: null,
    pausedForAugment: false,
    autoMode: false,
    blameCooldown: 0,
  });

  const showBanner = useCallback((txt: string) => {
    setBannerText(txt);
    setTimeout(() => {
      setBannerText(prev => (prev === txt ? '' : prev));
    }, 2400);
  }, []);

  const rollAugmentOptions = useCallback(() => {
    const pool = [...AUGMENTS];
    const picked: AugmentDef[] = [];
    while (picked.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    setAugmentChoices(picked);
    stateRef.current.pausedForAugment = true;
    sfx.augment();
  }, []);

  const spawnAllyChamp = useCallback((customName?: string) => {
    const st = stateRef.current;
    const randomDef = CHAMPIONS[Math.floor(Math.random() * CHAMPIONS.length)];
    st.units.push({
      id: st.nextId++,
      team: 'blue',
      kind: 'champ',
      name: customName || ALLY_NAMES[Math.floor(Math.random() * ALLY_NAMES.length)],
      champId: randomDef.id,
      x: 240 + Math.random() * 80,
      y: 180 + Math.random() * 140,
      vx: 0,
      vy: 0,
      radius: 18,
      hp: 850,
      maxHp: 850,
      dmg: 34,
      speed: 2.8,
      range: randomDef.range,
      atkCd: 0,
      maxAtkCd: 35,
      color: '#38bdf8',
      dead: false,
      respawnTimer: 0,
      stunTimer: 0,
      shield: 0,
      scale: 1,
      facing: 1,
      aiSkillTimer: 60,
      masteryTimer: 0,
      chatText: '',
      chatTimer: 0,
    });
  }, []);

  const initMatch = useCallback((champ: ChampionDef) => {
    const st = stateRef.current;
    st.champ = champ;
    st.units = [];
    st.projectiles = [];
    st.particles = [];
    st.floatTexts = [];
    st.augments = new Set();
    st.augmentStacks = {};
    st.level = 1;
    st.xp = 0;
    st.nextXp = 90;
    st.kills = 0;
    st.deaths = 0;
    st.assists = 0;
    st.multiKill = 0;
    st.multiKillTimer = 0;
    st.markedTargetId = null;
    st.frame = 0;
    st.nextId = 1;
    st.cds = [0, 0, 0, 0, 0, 0];
    st.maxCds = [
      champ.skills[0].cd,
      champ.skills[1].cd,
      champ.skills[2].cd,
      champ.skills[3].cd,
      4.5,
      7.0,
    ];

    st.units.push({
      id: st.nextId++,
      team: 'blue',
      kind: 'player',
      name: champ.name,
      champId: champ.id,
      x: 260,
      y: 250,
      vx: 0,
      vy: 0,
      radius: 20,
      hp: champ.hp,
      maxHp: champ.hp,
      dmg: champ.dmg,
      speed: champ.speed,
      range: champ.range,
      atkCd: 0,
      maxAtkCd: 24,
      color: champ.color,
      dead: false,
      respawnTimer: 0,
      stunTimer: 0,
      shield: 0,
      scale: 1,
      facing: 1,
      aiSkillTimer: 0,
      masteryTimer: 0,
      chatText: 'Vào việc anh em ơi!',
      chatTimer: 120,
    });

    st.units.push({
      id: st.nextId++,
      team: 'blue',
      kind: 'nexus',
      name: 'Nhà Chính Xanh',
      x: 150,
      y: 250,
      vx: 0,
      vy: 0,
      radius: 36,
      hp: 3200,
      maxHp: 3200,
      dmg: 0,
      speed: 0,
      range: 0,
      atkCd: 0,
      maxAtkCd: 60,
      color: '#0ea5e9',
      dead: false,
      respawnTimer: 0,
      stunTimer: 0,
      shield: 0,
      scale: 1.4,
      facing: 1,
      aiSkillTimer: 0,
      masteryTimer: 0,
      chatText: '',
      chatTimer: 0,
    });

    [520, 880].forEach((tx, idx) => {
      st.units.push({
        id: st.nextId++,
        team: 'blue',
        kind: 'turret',
        name: `Trụ Xanh ${idx + 1}`,
        x: tx,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 26,
        hp: 1900,
        maxHp: 1900,
        dmg: 52,
        speed: 0,
        range: 270,
        atkCd: 0,
        maxAtkCd: 42,
        color: '#38bdf8',
        dead: false,
        respawnTimer: 0,
        stunTimer: 0,
        shield: 0,
        scale: 1.2,
        facing: 1,
        aiSkillTimer: 0,
        masteryTimer: 0,
        chatText: '',
        chatTimer: 0,
      });
    });

    st.units.push({
      id: st.nextId++,
      team: 'red',
      kind: 'nexus',
      name: 'Nhà Chính Đỏ',
      x: WORLD_W - 150,
      y: 250,
      vx: 0,
      vy: 0,
      radius: 36,
      hp: 3000,
      maxHp: 3000,
      dmg: 0,
      speed: 0,
      range: 0,
      atkCd: 0,
      maxAtkCd: 60,
      color: '#ef4444',
      dead: false,
      respawnTimer: 0,
      stunTimer: 0,
      shield: 0,
      scale: 1.4,
      facing: -1,
      aiSkillTimer: 0,
      masteryTimer: 0,
      chatText: '',
      chatTimer: 0,
    });

    [WORLD_W - 880, WORLD_W - 520].forEach((tx, idx) => {
      st.units.push({
        id: st.nextId++,
        team: 'red',
        kind: 'turret',
        name: `Trụ Đỏ ${idx + 1}`,
        x: tx,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 26,
        hp: 1750,
        maxHp: 1750,
        dmg: 45,
        speed: 0,
        range: 265,
        atkCd: 0,
        maxAtkCd: 45,
        color: '#f87171',
        dead: false,
        respawnTimer: 0,
        stunTimer: 0,
        shield: 0,
        scale: 1.2,
        facing: -1,
        aiSkillTimer: 0,
        masteryTimer: 0,
        chatText: '',
        chatTimer: 0,
      });
    });

    spawnAllyChamp('Yuumi Gánh Team');
    spawnAllyChamp('Jinx Bắn Chim');

    for (let i = 0; i < 3; i++) {
      const def = CHAMPIONS[(i + 1) % CHAMPIONS.length];
      st.units.push({
        id: st.nextId++,
        team: 'red',
        kind: 'champ',
        name: ENEMY_NAMES[i % ENEMY_NAMES.length],
        champId: def.id,
        x: WORLD_W - 320 - i * 45,
        y: 175 + i * 75,
        vx: 0,
        vy: 0,
        radius: 19,
        hp: 820,
        maxHp: 820,
        dmg: 32,
        speed: 2.75,
        range: def.range,
        atkCd: 0,
        maxAtkCd: 38,
        color: '#f43f5e',
        dead: false,
        respawnTimer: 0,
        stunTimer: 0,
        shield: 0,
        scale: 1,
        facing: -1,
        aiSkillTimer: 50 + i * 25,
        masteryTimer: 0,
        chatText: '',
        chatTimer: 0,
      });
    }

    st.relics = [
      { x: 740, y: 150, active: true, timer: 0, isAugmentBox: false },
      { x: 1100, y: 250, active: true, timer: 0, isAugmentBox: true },
      { x: 1460, y: 350, active: true, timer: 0, isAugmentBox: false },
    ];

    st.poros = Array.from({ length: 6 }, (_, i) => ({
      x: 400 + i * 260,
      y: 145 + (i % 2) * 200,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
    }));

    setPickedAugments([]);
    setRerollsLeft(3);
    setPhase('playing');
    rollAugmentOptions();
  }, [rollAugmentOptions, spawnAllyChamp]);

  const applyAugment = useCallback((aug: AugmentDef) => {
    const st = stateRef.current;
    st.augments.add(aug.id);
    st.augmentStacks[aug.id] = (st.augmentStacks[aug.id] || 0) + 1;
    setPickedAugments(prev => [...prev, aug]);
    setAugmentChoices([]);
    st.pausedForAugment = false;

    const player = st.units.find(u => u.kind === 'player');
    if (player) {
      if (aug.id === 'yasuo_010') {
        st.deaths += 10;
        player.dmg = Math.round(player.dmg * 2.2);
        player.chatText = '0/10 ĐÃ ĐẠT! BẬT NỘI TẠI!';
        player.chatTimer = 140;
        player.masteryTimer = 140;
      } else if (aug.id === 'urf_mode') {
        player.speed += 1.4;
      } else if (aug.id === 'giant_heart') {
        player.maxHp += 1000;
        player.hp = player.maxHp;
        player.scale = Math.min(2.3, player.scale + 0.55);
        player.radius = Math.min(34, player.radius + 7);
      } else if (aug.id === 'poro_snack') {
        player.dmg = Math.round(player.dmg * 1.45);
        player.maxHp += 350;
        player.hp = Math.min(player.maxHp, player.hp + 350);
      } else if (aug.id === 'vamp_lord') {
        player.maxAtkCd = Math.max(10, Math.floor(player.maxAtkCd * 0.65));
      } else if (aug.id === 'walking_turret') {
        player.shield += 300;
      } else if (aug.id === 'call_homies') {
        spawnAllyChamp('Yasuo Đồng Đội 15gg');
        spawnAllyChamp('Malphite Đá Tảng');
      }
    }
    sfx.mastery();
    showBanner(`ĐÃ CHỌN LÕI: ${aug.name.toUpperCase()}!`);
  }, [showBanner, spawnAllyChamp]);

  const triggerSkill = useCallback((slot: number) => {
    const st = stateRef.current;
    if (st.pausedForAugment) return;
    const player = st.units.find(u => u.kind === 'player');
    if (!player || player.dead) return;
    if (st.cds[slot] > 0) return;

    const cdr = st.augments.has('urf_mode') ? 0.4 : 1;
    const enemies = st.units.filter(u => u.team === 'red' && !u.dead);
    let nearest: Unit | null = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < bestDist) {
        bestDist = d;
        nearest = e;
      }
    }

    const aimX = nearest ? nearest.x : player.x + player.facing * 240;
    const aimY = nearest ? nearest.y : player.y;
    const angle = Math.atan2(aimY - player.y, aimX - player.x);

    if (slot === 4) {
      if (st.markedTargetId) {
        const target = st.units.find(u => u.id === st.markedTargetId && !u.dead);
        st.markedTargetId = null;
        if (target) {
          player.x = target.x - player.facing * 20;
          player.y = target.y;
          target.hp -= player.dmg * 2.2;
          st.floatTexts.push({
            x: target.x,
            y: target.y - 20,
            vy: -1.8,
            text: 'BAY VÀO MẶT!',
            color: '#38bdf8',
            size: 15,
            life: 45,
          });
          st.cds[4] = st.maxCds[4] * cdr;
          sfx.skill();
          return;
        }
      }
      st.projectiles.push({
        id: st.nextId++,
        team: 'blue',
        kind: 'snowball',
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * 11,
        vy: Math.sin(angle) * 11,
        radius: 14,
        dmg: player.dmg * 1.5,
        color: '#e0f2fe',
        life: 65,
        maxLife: 65,
        pierce: false,
        stun: 20,
        hitIds: new Set(),
      });
      st.cds[4] = st.maxCds[4] * cdr;
      sfx.skill();
      return;
    }

    if (slot === 5) {
      const failFlash = Math.random() < 0.22;
      const dist = failFlash ? 35 : 190;
      player.x = Math.max(90, Math.min(WORLD_W - 90, player.x + Math.cos(angle) * dist));
      player.y = Math.max(BRIDGE_TOP + 22, Math.min(BRIDGE_BOT - 22, player.y + Math.sin(angle) * dist));
      player.masteryTimer = 90;
      player.chatText = failFlash ? 'Tốc biến đập đầu vào tường!' : 'Tốc biến outplay!';
      player.chatTimer = 95;
      for (let i = 0; i < 18; i++) {
        st.particles.push({
          x: player.x,
          y: player.y,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.5) * 7,
          color: '#fde047',
          size: 5,
          life: 25,
          maxLife: 25,
        });
      }
      st.cds[5] = st.maxCds[5] * cdr;
      sfx.mastery();
      return;
    }

    st.cds[slot] = st.maxCds[slot] * cdr;
    sfx.skill();

    const cid = st.champ.id;
    if (slot === 0) {
      if (cid === 'blitz') {
        st.projectiles.push({
          id: st.nextId++,
          team: 'blue',
          kind: 'hook',
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 12,
          vy: Math.sin(angle) * 12,
          radius: 16,
          dmg: player.dmg * 2.4,
          color: '#facc15',
          life: 42,
          maxLife: 42,
          pierce: false,
          stun: 45,
          pullOriginX: player.x,
          pullOriginY: player.y,
          hitIds: new Set(),
        });
        player.chatText = 'Lại đây với anh!';
        player.chatTimer = 70;
      } else {
        st.projectiles.push({
          id: st.nextId++,
          team: 'blue',
          kind: 'tornado',
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 9.5,
          vy: Math.sin(angle) * 9.5,
          radius: 22,
          dmg: player.dmg * 2.3,
          color: cid === 'lux' ? '#f472b6' : cid === 'teemo' ? '#4ade80' : '#38bdf8',
          life: 52,
          maxLife: 52,
          pierce: true,
          stun: 35,
          hitIds: new Set(),
        });
        if (cid === 'yasuo') {
          player.chatText = 'HASAGI!!';
          player.chatTimer = 65;
        }
      }
    } else if (slot === 1) {
      player.shield += 280 + st.level * 25;
      player.hp = Math.min(player.maxHp, player.hp + 210);
      player.masteryTimer = 110;
      player.chatText = TROLL_CHATS[Math.floor(Math.random() * TROLL_CHATS.length)];
      player.chatTimer = 95;
      if (cid === 'teemo') {
        st.projectiles.push({
          id: st.nextId++,
          team: 'blue',
          kind: 'shroom',
          x: player.x,
          y: player.y,
          vx: 0,
          vy: 0,
          radius: 20,
          dmg: player.dmg * 2.8,
          color: '#22c55e',
          life: 420,
          maxLife: 420,
          pierce: true,
          stun: 25,
          hitIds: new Set(),
        });
      }
      sfx.mastery();
    } else if (slot === 2) {
      if (cid === 'yasuo' || cid === 'garen' || cid === 'blitz') {
        if (nearest && bestDist < 380) {
          player.x = nearest.x - player.facing * 24;
          player.y = nearest.y;
        } else {
          player.x = Math.min(WORLD_W - 100, Math.max(100, player.x + Math.cos(angle) * 140));
        }
        for (const e of enemies) {
          if (Math.hypot(e.x - player.x, e.y - player.y) < 150) {
            e.hp -= player.dmg * 2.5;
            e.stunTimer = Math.max(e.stunTimer, 25);
            st.floatTexts.push({
              x: e.x,
              y: e.y - 18,
              vy: -1.5,
              text: `-${Math.round(player.dmg * 2.5)}`,
              color: '#facc15',
              size: 14,
              life: 35,
            });
          }
        }
      } else {
        for (let i = -1; i <= 1; i++) {
          const a = angle + i * 0.22;
          st.projectiles.push({
            id: st.nextId++,
            team: 'blue',
            kind: 'lux_orb',
            x: player.x,
            y: player.y,
            vx: Math.cos(a) * 8.5,
            vy: Math.sin(a) * 8.5,
            radius: 18,
            dmg: player.dmg * 1.9,
            color: player.color,
            life: 48,
            maxLife: 48,
            pierce: true,
            stun: 15,
            hitIds: new Set(),
          });
        }
      }
    } else if (slot === 3) {
      sfx.laser();
      player.masteryTimer = 150;
      if (cid === 'lux') {
        player.chatText = 'CẦU VỒNG TỐI THƯỢNG HAHAHA!';
        player.chatTimer = 110;
        st.projectiles.push({
          id: st.nextId++,
          team: 'blue',
          kind: 'laser',
          x: player.x,
          y: player.y,
          vx: player.facing,
          vy: 0,
          radius: 42,
          dmg: player.dmg * 4.5,
          color: '#f472b6',
          life: 28,
          maxLife: 28,
          pierce: true,
          stun: 25,
          hitIds: new Set(),
        });
      } else if (cid === 'teemo') {
        player.chatText = 'ĂN NẤM HẠT NHÂN ĐI!';
        player.chatTimer = 110;
        for (let i = 0; i < 4; i++) {
          st.projectiles.push({
            id: st.nextId++,
            team: 'blue',
            kind: 'shroom',
            x: Math.min(WORLD_W - 160, Math.max(160, player.x + player.facing * (90 + i * 85))),
            y: BRIDGE_TOP + 50 + Math.random() * (BRIDGE_BOT - BRIDGE_TOP - 100),
            vx: 0,
            vy: 0,
            radius: 22,
            dmg: player.dmg * 3.4,
            color: '#4ade80',
            life: 480,
            maxLife: 480,
            pierce: true,
            stun: 30,
            hitIds: new Set(),
          });
        }
      } else if (cid === 'garen') {
        player.chatText = 'DEMACIAAAA!!';
        player.chatTimer = 110;
        const t = nearest || enemies[0];
        const tx = t ? t.x : player.x + player.facing * 150;
        const ty = t ? t.y : player.y;
        st.projectiles.push({
          id: st.nextId++,
          team: 'blue',
          kind: 'justice',
          x: tx,
          y: ty,
          vx: 0,
          vy: 0,
          radius: 75,
          dmg: player.dmg * 5.0,
          color: '#facc15',
          life: 32,
          maxLife: 32,
          pierce: true,
          stun: 45,
          hitIds: new Set(),
        });
      } else {
        player.chatText = cid === 'yasuo' ? 'SORYE GE TON!!' : 'GIẬT SÉT TOÀN CẦU!';
        player.chatTimer = 110;
        if (nearest && bestDist < 420 && cid === 'yasuo') {
          player.x = nearest.x;
          player.y = nearest.y;
        }
        st.projectiles.push({
          id: st.nextId++,
          team: 'blue',
          kind: 'justice',
          x: player.x,
          y: player.y,
          vx: 0,
          vy: 0,
          radius: 155,
          dmg: player.dmg * 4.2,
          color: player.color,
          life: 28,
          maxLife: 28,
          pierce: true,
          stun: 50,
          hitIds: new Set(),
        });
      }
    }
  }, []);

  const flashMasteryAndTaunt = useCallback(() => {
    const st = stateRef.current;
    const player = st.units.find(u => u.kind === 'player');
    if (!player) return;
    player.masteryTimer = 150;
    player.chatText = TROLL_CHATS[Math.floor(Math.random() * TROLL_CHATS.length)];
    player.chatTimer = 120;
    sfx.mastery();
  }, []);

  useEffect(() => {
    stateRef.current.autoMode = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
        e.preventDefault();
      }
      stateRef.current.keys.add(k);
      if (k === 'q') triggerSkill(0);
      if (k === 'w') triggerSkill(1);
      if (k === 'e') triggerSkill(2);
      if (k === 'r') triggerSkill(3);
      if (k === 'd') triggerSkill(4);
      if (k === 'f') triggerSkill(5);
      if (k === 't' || k === 'g') flashMasteryAndTaunt();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let rafId = 0;

    const addKillCredit = (victim: Unit) => {
      const st = stateRef.current;
      const xpGain = victim.kind === 'champ' ? 65 : victim.kind === 'turret' ? 120 : 22;
      st.xp += xpGain;
      if (victim.kind === 'champ') {
        st.kills++;
        st.multiKill++;
        st.multiKillTimer = 260;
        sfx.kill();
        const labels = ['', 'CHIẾN CÔNG ĐẦU!', 'DOUBLE KILL!', 'TRIPLE KILL!', 'QUADRA KILL!', '🔥 PENTAKILL 8D!! 🔥'];
        const msg = labels[Math.min(5, st.multiKill)] || '🔥 GODLIKE LÕI NỔ!! 🔥';
        showBanner(`${msg} (+${xpGain} XP)`);
      } else if (victim.kind === 'turret') {
        sfx.kill();
        showBanner('💥 ĐÃ PHÁ HỦY TRỤ ĐỊCH! 💥');
      }
      if (st.xp >= st.nextXp) {
        st.xp -= st.nextXp;
        st.level++;
        st.nextXp = Math.round(st.nextXp * 1.25);
        const p = st.units.find(u => u.kind === 'player');
        if (p) {
          p.maxHp += 95;
          p.hp = Math.min(p.maxHp, p.hp + 220);
          p.dmg += 8;
        }
        if (st.level % 2 === 1) {
          rollAugmentOptions();
        }
      }
    };

    const spawnMinionWave = () => {
      const st = stateRef.current;
      for (let i = 0; i < 3; i++) {
        st.units.push({
          id: st.nextId++,
          team: 'blue',
          kind: 'minion',
          name: 'Lính Xanh',
          x: 220 - i * 32,
          y: 200 + i * 48,
          vx: 0,
          vy: 0,
          radius: 12,
          hp: 290 + st.level * 22,
          maxHp: 290 + st.level * 22,
          dmg: 18 + st.level * 2,
          speed: 1.9,
          range: 85,
          atkCd: 0,
          maxAtkCd: 42,
          color: '#60a5fa',
          dead: false,
          respawnTimer: 0,
          stunTimer: 0,
          shield: 0,
          scale: 1,
          facing: 1,
          aiSkillTimer: 0,
          masteryTimer: 0,
          chatText: '',
          chatTimer: 0,
        });

        st.units.push({
          id: st.nextId++,
          team: 'red',
          kind: 'minion',
          name: 'Lính Đỏ',
          x: WORLD_W - 220 + i * 32,
          y: 200 + i * 48,
          vx: 0,
          vy: 0,
          radius: 12,
          hp: 260 + st.level * 18,
          maxHp: 260 + st.level * 18,
          dmg: 15 + st.level * 2,
          speed: 1.85,
          range: 85,
          atkCd: 0,
          maxAtkCd: 44,
          color: '#fb7185',
          dead: false,
          respawnTimer: 0,
          stunTimer: 0,
          shield: 0,
          scale: 1,
          facing: -1,
          aiSkillTimer: 0,
          masteryTimer: 0,
          chatText: '',
          chatTimer: 0,
        });
      }
    };

    const drawPixelSprite = (
      matrix: string[],
      cx: number,
      cy: number,
      scale: number,
      mainColor: string,
      accentColor: string,
      flip: boolean
    ) => {
      const pxSize = Math.max(2, Math.round(3.5 * scale));
      const totalW = 8 * pxSize;
      const totalH = 8 * pxSize;
      const startX = cx - totalW / 2;
      const startY = cy - totalH / 2;
      for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r];
        for (let c = 0; c < row.length; c++) {
          const ch = row[flip ? 7 - c : c];
          if (ch === '.') continue;
          ctx.fillStyle =
            ch === '1'
              ? mainColor
              : ch === '2'
              ? '#fde68a'
              : ch === '3'
              ? '#f8fafc'
              : accentColor;
          ctx.fillRect(startX + c * pxSize, startY + r * pxSize, pxSize, pxSize);
        }
      }
    };

    const loop = () => {
      const st = stateRef.current;

      if (!st.pausedForAugment) {
        st.frame++;
        if (st.blameCooldown > 0) st.blameCooldown--;
        if (st.multiKillTimer > 0) {
          st.multiKillTimer--;
          if (st.multiKillTimer === 0) st.multiKill = 0;
        }

        for (let i = 0; i < st.cds.length; i++) {
          if (st.cds[i] > 0) st.cds[i] = Math.max(0, st.cds[i] - 1 / 60);
        }

        if (st.frame === 20 || st.frame % 320 === 0) {
          spawnMinionWave();
        }

        const player = st.units.find(u => u.kind === 'player');
        if (player) {
          if (player.dead) {
            player.respawnTimer--;
            if (player.respawnTimer <= 0) {
              player.dead = false;
              player.hp = player.maxHp;
              player.x = 240;
              player.y = 250;
              player.chatText = st.champ.id === 'yasuo' ? 'Chết thêm mạng nữa càng mạnh!' : 'Hồi sinh báo thù!';
              player.chatTimer = 100;
            }
          } else {
            if (st.champ.id === 'garen' && st.frame % 30 === 0) {
              player.hp = Math.min(player.maxHp, player.hp + 22);
            }
            if (st.augments.has('poro_snack') && st.frame % 30 === 0) {
              player.hp = Math.min(player.maxHp, player.hp + 45 * (st.augmentStacks['poro_snack'] || 1));
            }
            if (st.augments.has('poop_shroom') && st.frame % 105 === 0) {
              st.projectiles.push({
                id: st.nextId++,
                team: 'blue',
                kind: 'shroom',
                x: player.x,
                y: player.y,
                vx: 0,
                vy: 0,
                radius: 20,
                dmg: player.dmg * 2.5,
                color: '#4ade80',
                life: 420,
                maxLife: 420,
                pierce: true,
                stun: 25,
                hitIds: new Set(),
              });
            }
            if (st.augments.has('auto_laser') && st.frame % 200 === 0) {
              sfx.laser();
              st.projectiles.push({
                id: st.nextId++,
                team: 'blue',
                kind: 'laser',
                x: player.x,
                y: player.y,
                vx: player.facing,
                vy: 0,
                radius: 36,
                dmg: player.dmg * 3.2,
                color: '#f472b6',
                life: 25,
                maxLife: 25,
                pierce: true,
                stun: 20,
                hitIds: new Set(),
              });
            }
            if (st.augments.has('mega_snowball') && st.frame % 210 === 0) {
              st.projectiles.push({
                id: st.nextId++,
                team: 'blue',
                kind: 'snowball',
                x: player.x,
                y: player.y,
                vx: player.facing * 8.5,
                vy: 0,
                radius: 38,
                dmg: player.dmg * 2.8,
                color: '#e0f2fe',
                life: 140,
                maxLife: 140,
                pierce: true,
                stun: 30,
                hitIds: new Set(),
              });
            }
            if (st.augments.has('mastery_burn') && st.frame % 85 === 0) {
              player.masteryTimer = 70;
              for (const u of st.units) {
                if (u.team === 'red' && !u.dead && Math.hypot(u.x - player.x, u.y - player.y) < 260) {
                  u.hp -= player.dmg * 1.3;
                  st.floatTexts.push({
                    x: u.x,
                    y: u.y - 24,
                    vy: -1.4,
                    text: 'Cay cú -' + Math.round(player.dmg * 1.3),
                    color: '#c084fc',
                    size: 12,
                    life: 35,
                  });
                }
              }
            }
            if (st.augments.has('long_hook') && st.frame % 175 === 0) {
              const target = st.units.find(
                u => u.team === 'red' && !u.dead && u.kind !== 'turret' && u.kind !== 'nexus' && Math.abs(u.x - player.x) < 520
              );
              if (target) {
                const ang = Math.atan2(target.y - player.y, target.x - player.x);
                st.projectiles.push({
                  id: st.nextId++,
                  team: 'blue',
                  kind: 'hook',
                  x: player.x,
                  y: player.y,
                  vx: Math.cos(ang) * 13,
                  vy: Math.sin(ang) * 13,
                  radius: 17,
                  dmg: player.dmg * 2.0,
                  color: '#facc15',
                  life: 45,
                  maxLife: 45,
                  pierce: false,
                  stun: 40,
                  pullOriginX: player.x,
                  pullOriginY: player.y,
                  hitIds: new Set(),
                });
              }
            }
            if (st.augments.has('walking_turret') && st.frame % 45 === 0) {
              const target = st.units.find(u => u.team === 'red' && !u.dead && Math.hypot(u.x - player.x, u.y - player.y) < 350);
              if (target) {
                const ang = Math.atan2(target.y - player.y, target.x - player.x);
                st.projectiles.push({
                  id: st.nextId++,
                  team: 'blue',
                  kind: 'turret_shot',
                  x: player.x,
                  y: player.y - 24,
                  vx: Math.cos(ang) * 10,
                  vy: Math.sin(ang) * 10,
                  radius: 9,
                  dmg: player.dmg * 1.4,
                  color: '#38bdf8',
                  life: 45,
                  maxLife: 45,
                  pierce: false,
                  stun: 0,
                  hitIds: new Set(),
                });
              }
            }
            if (st.augments.has('spin_blade') && st.frame % 18 === 0) {
              for (const u of st.units) {
                if (u.team === 'red' && !u.dead && Math.hypot(u.x - player.x, u.y - player.y) < 115) {
                  u.hp -= player.dmg * 0.65;
                }
              }
            }

            let dx = 0;
            let dy = 0;
            if (st.keys.has('arrowleft') || st.keys.has('j')) dx -= 1;
            if (st.keys.has('arrowright') || st.keys.has('l')) dx += 1;
            if (st.keys.has('arrowup') || st.keys.has('i')) dy -= 1;
            if (st.keys.has('arrowdown') || st.keys.has('k')) dy += 1;

            if (dx !== 0 || dy !== 0) {
              st.targetMoveX = null;
              st.targetMoveY = null;
            } else if (st.targetMoveX !== null && st.targetMoveY !== null) {
              const distToClick = Math.hypot(st.targetMoveX - player.x, st.targetMoveY - player.y);
              if (distToClick > 8) {
                dx = (st.targetMoveX - player.x) / distToClick;
                dy = (st.targetMoveY - player.y) / distToClick;
              } else {
                st.targetMoveX = null;
                st.targetMoveY = null;
              }
            }

            if (st.autoMode && dx === 0 && dy === 0) {
              const redUnits = st.units.filter(u => u.team === 'red' && !u.dead);
              const closest = redUnits.sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
              if (closest) {
                const dist = Math.hypot(closest.x - player.x, closest.y - player.y);
                if (player.hp < player.maxHp * 0.25) {
                  dx = -1;
                } else if (dist > player.range * 0.85) {
                  dx = Math.sign(closest.x - player.x);
                  dy = Math.sign(closest.y - player.y) * 0.6;
                }
                if (dist < 340) {
                  const readySlot = [0, 1, 2, 3].find(s => st.cds[s] <= 0);
                  if (readySlot !== undefined) triggerSkill(readySlot);
                }
              }
            }

            if (dx !== 0 || dy !== 0) {
              const len = Math.hypot(dx, dy) || 1;
              player.x += (dx / len) * player.speed;
              player.y += (dy / len) * player.speed;
              if (dx !== 0) player.facing = dx > 0 ? 1 : -1;
            }

            player.x = Math.max(80, Math.min(WORLD_W - 80, player.x));
            player.y = Math.max(BRIDGE_TOP + 20, Math.min(BRIDGE_BOT - 20, player.y));
          }
        }

        for (const u of st.units) {
          if (u.chatTimer > 0) u.chatTimer--;
          if (u.masteryTimer > 0) u.masteryTimer--;
          if (u.stunTimer > 0) {
            u.stunTimer--;
            continue;
          }

          if (u.dead) {
            if (u.kind === 'champ') {
              u.respawnTimer--;
              if (u.respawnTimer <= 0) {
                u.dead = false;
                u.hp = u.maxHp;
                u.x = u.team === 'blue' ? 230 : WORLD_W - 230;
                u.y = 180 + Math.random() * 140;
              }
            }
            continue;
          }

          const foes = st.units.filter(f => f.team !== u.team && !f.dead);
          let target: Unit | null = null;
          let minDist = Infinity;
          for (const f of foes) {
            const d = Math.hypot(f.x - u.x, f.y - u.y);
            if (d < minDist) {
              minDist = d;
              target = f;
            }
          }

          if (u.kind !== 'player' && u.kind !== 'turret' && u.kind !== 'nexus' && target) {
            u.facing = target.x >= u.x ? 1 : -1;
            if (minDist > u.range) {
              const ang = Math.atan2(target.y - u.y, target.x - u.x);
              u.x += Math.cos(ang) * u.speed;
              u.y = Math.max(BRIDGE_TOP + 22, Math.min(BRIDGE_BOT - 22, u.y + Math.sin(ang) * u.speed));
            }
            if (u.kind === 'champ') {
              u.aiSkillTimer--;
              if (u.aiSkillTimer <= 0 && minDist < 360) {
                u.aiSkillTimer = 130 + Math.floor(Math.random() * 80);
                const ang = Math.atan2(target.y - u.y, target.x - u.x);
                st.projectiles.push({
                  id: st.nextId++,
                  team: u.team,
                  kind: 'tornado',
                  x: u.x,
                  y: u.y,
                  vx: Math.cos(ang) * 7.5,
                  vy: Math.sin(ang) * 7.5,
                  radius: 16,
                  dmg: u.dmg * 1.45,
                  color: u.team === 'blue' ? '#38bdf8' : '#fb7185',
                  life: 48,
                  maxLife: 48,
                  pierce: false,
                  stun: 15,
                  hitIds: new Set(),
                });
                if (Math.random() < 0.35) {
                  u.masteryTimer = 80;
                  u.chatText = TROLL_CHATS[Math.floor(Math.random() * TROLL_CHATS.length)];
                  u.chatTimer = 80;
                }
              }
            }
          }

          if (u.atkCd > 0) u.atkCd--;
          if (target && minDist <= u.range + target.radius && u.atkCd <= 0 && u.dmg > 0) {
            u.atkCd = u.maxAtkCd;
            const ang = Math.atan2(target.y - u.y, target.x - u.x);
            const shots = u.kind === 'player' && st.augments.has('yasuo_010') ? 3 : 1;
            for (let s = 0; s < shots; s++) {
              const spread = shots === 1 ? 0 : (s - 1) * 0.18;
              st.projectiles.push({
                id: st.nextId++,
                team: u.team,
                kind: u.kind === 'turret' ? 'turret_shot' : 'basic',
                x: u.x,
                y: u.y,
                vx: Math.cos(ang + spread) * 9.5,
                vy: Math.sin(ang + spread) * 9.5,
                radius: u.kind === 'turret' ? 9 : 6,
                dmg: u.dmg,
                color: u.team === 'blue' ? '#38bdf8' : '#f43f5e',
                life: 38,
                maxLife: 38,
                pierce: false,
                stun: 0,
                hitIds: new Set(),
              });
            }
            if (u.kind === 'player') sfx.hit();
          }
        }

        for (let i = st.projectiles.length - 1; i >= 0; i--) {
          const p = st.projectiles[i];
          if (p.kind !== 'laser' && p.kind !== 'justice' && p.kind !== 'shroom') {
            p.x += p.vx;
            p.y += p.vy;
          }
          p.life--;

          for (const u of st.units) {
            if (u.team === p.team || u.dead || p.hitIds.has(u.id)) continue;

            let isHit = false;
            if (p.kind === 'laser') {
              const inDir = p.vx > 0 ? u.x >= p.x : u.x <= p.x;
              isHit = inDir && Math.abs(u.y - p.y) <= p.radius + u.radius;
            } else {
              isHit = Math.hypot(u.x - p.x, u.y - p.y) <= p.radius + u.radius;
            }

            if (isHit) {
              p.hitIds.add(u.id);
              let dmg = p.dmg;
              if (u.shield > 0) {
                const absorbed = Math.min(u.shield, dmg);
                u.shield -= absorbed;
                dmg -= absorbed;
              }
              u.hp -= dmg;
              if (p.stun > 0 && u.kind !== 'turret' && u.kind !== 'nexus') {
                u.stunTimer = Math.max(u.stunTimer, p.stun);
              }
              if (p.kind === 'hook' && p.pullOriginX !== undefined && p.pullOriginY !== undefined && u.kind !== 'turret' && u.kind !== 'nexus') {
                u.x = p.pullOriginX + 36;
                u.y = p.pullOriginY;
                st.floatTexts.push({
                  x: u.x,
                  y: u.y - 26,
                  vy: -1.8,
                  text: 'KÉO VỀ ĐẤM!',
                  color: '#facc15',
                  size: 14,
                  life: 40,
                });
              }
              if (p.kind === 'snowball' && p.team === 'blue') {
                st.markedTargetId = u.id;
              }

              const playerRef = st.units.find(unit => unit.kind === 'player');
              if (p.team === 'blue' && playerRef && !playerRef.dead && st.augments.has('vamp_lord')) {
                playerRef.hp = Math.min(playerRef.maxHp, playerRef.hp + dmg * 0.28);
              }

              if (u.kind === 'player' && st.augments.has('blame_jungle') && st.blameCooldown <= 0) {
                st.blameCooldown = 45;
                u.chatText = 'JUNGLE DIFF! TẠI RỪNG!';
                u.chatTimer = 70;
                for (let k = 0; k < 8; k++) {
                  const a = (Math.PI * 2 * k) / 8;
                  st.projectiles.push({
                    id: st.nextId++,
                    team: 'blue',
                    kind: 'fireball',
                    x: u.x,
                    y: u.y,
                    vx: Math.cos(a) * 8,
                    vy: Math.sin(a) * 8,
                    radius: 12,
                    dmg: u.dmg * 1.4,
                    color: '#fb923c',
                    life: 36,
                    maxLife: 36,
                    pierce: false,
                    stun: 0,
                    hitIds: new Set(),
                  });
                }
              }

              st.floatTexts.push({
                x: u.x + (Math.random() - 0.5) * 14,
                y: u.y - 16,
                vy: -1.4,
                text: `-${Math.round(p.dmg)}`,
                color: p.team === 'blue' ? '#fde047' : '#f87171',
                size: p.dmg > 90 ? 15 : 11,
                life: 28,
              });

              for (let k = 0; k < 5; k++) {
                st.particles.push({
                  x: u.x,
                  y: u.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: p.color,
                  size: 3,
                  life: 16,
                  maxLife: 16,
                });
              }

              if (!p.pierce || p.kind === 'shroom') {
                p.life = 0;
                break;
              }
            }
          }

          if (p.life <= 0) {
            st.projectiles.splice(i, 1);
          }
        }

        for (let i = st.units.length - 1; i >= 0; i--) {
          const u = st.units[i];
          if (!u.dead && u.hp <= 0) {
            u.hp = 0;
            u.dead = true;

            for (let k = 0; k < 16; k++) {
              st.particles.push({
                x: u.x,
                y: u.y,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                color: u.color,
                size: 4,
                life: 26,
                maxLife: 26,
              });
            }

            if (u.kind === 'nexus') {
              setPhase(u.team === 'red' ? 'victory' : 'defeat');
              return;
            } else if (u.kind === 'player') {
              st.deaths++;
              u.respawnTimer = st.champ.id === 'yasuo' ? 90 : 180;
              if (st.champ.id === 'yasuo') {
                u.dmg = Math.round(u.dmg * 1.25);
                showBanner('💀 YASUO ĐÃ CHẾT! TĂNG +25% SÁT THƯƠNG NỘI TẠI!');
              } else {
                showBanner('💀 BẠN ĐÃ LÊN BẢNG ĐẾM SỐ! HỒI SINH SAU 3 GIÂY!');
              }
            } else if (u.kind === 'champ') {
              u.respawnTimer = 210;
              if (u.team === 'red') addKillCredit(u);
            } else if (u.kind === 'turret') {
              if (u.team === 'red') addKillCredit(u);
              st.units.splice(i, 1);
            } else if (u.kind === 'minion') {
              if (u.team === 'red') addKillCredit(u);
              st.units.splice(i, 1);
            }
          }
        }

        if (player && !player.dead) {
          for (const rel of st.relics) {
            if (!rel.active) {
              rel.timer--;
              if (rel.timer <= 0) rel.active = true;
            } else if (Math.hypot(player.x - rel.x, player.y - rel.y) < player.radius + 20) {
              rel.active = false;
              rel.timer = 480;
              player.hp = Math.min(player.maxHp, player.hp + 320);
              st.floatTexts.push({
                x: rel.x,
                y: rel.y - 15,
                vy: -1.5,
                text: rel.isAugmentBox ? '🎁 HỘP LÕI MAYHEM!' : '+320 MÁU PORO',
                color: '#4ade80',
                size: 14,
                life: 40,
              });
              if (rel.isAugmentBox) {
                rollAugmentOptions();
              } else {
                sfx.augment();
              }
            }
          }
        }

        for (let i = st.particles.length - 1; i >= 0; i--) {
          const pt = st.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          if (pt.life <= 0) st.particles.splice(i, 1);
        }

        for (let i = st.floatTexts.length - 1; i >= 0; i--) {
          const ft = st.floatTexts[i];
          ft.y += ft.vy;
          ft.life--;
          if (ft.life <= 0) st.floatTexts.splice(i, 1);
        }

        for (const pr of st.poros) {
          pr.x += pr.vx;
          pr.y += pr.vy;
          if (pr.x < 250 || pr.x > WORLD_W - 250) pr.vx *= -1;
          if (pr.y < BRIDGE_TOP + 15 || pr.y > BRIDGE_BOT - 15) pr.vy *= -1;
        }

        if (player) {
          const targetCam = Math.max(0, Math.min(WORLD_W - CANVAS_W, player.x - CANVAS_W * 0.38));
          st.cameraX += (targetCam - st.cameraX) * 0.12;
        }

        if (st.frame % 6 === 0 && player) {
          const bNexus = st.units.find(u => u.kind === 'nexus' && u.team === 'blue');
          const rNexus = st.units.find(u => u.kind === 'nexus' && u.team === 'red');
          setHudState({
            hp: Math.round(player.hp),
            maxHp: Math.round(player.maxHp),
            shield: Math.round(player.shield),
            level: st.level,
            xp: st.xp,
            nextXp: st.nextXp,
            kills: st.kills,
            deaths: st.deaths,
            assists: st.assists,
            cds: st.cds.map(c => Number(c.toFixed(1))),
            maxCds: [...st.maxCds],
            blueTurrets: st.units.filter(u => u.kind === 'turret' && u.team === 'blue').length,
            redTurrets: st.units.filter(u => u.kind === 'turret' && u.team === 'red').length,
            blueNexusHp: bNexus ? Math.round((bNexus.hp / bNexus.maxHp) * 100) : 0,
            redNexusHp: rNexus ? Math.round((rNexus.hp / rNexus.maxHp) * 100) : 0,
          });
        }
      }

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#06101e';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const cam = stateRef.current.cameraX;
      ctx.save();
      ctx.translate(-cam, 0);

      for (let i = 0; i < 45; i++) {
        const sx = (i * 173) % WORLD_W;
        const sy = (i * 97) % CANVAS_H;
        if (sy < BRIDGE_TOP - 15 || sy > BRIDGE_BOT + 15) {
          ctx.fillStyle = i % 2 === 0 ? '#1e3a5f' : '#0ea5e9';
          ctx.fillRect(sx, sy, 4, 4);
        }
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, BRIDGE_TOP, WORLD_W - 80, BRIDGE_BOT - BRIDGE_TOP);

      ctx.fillStyle = '#334155';
      ctx.fillRect(40, BRIDGE_TOP, WORLD_W - 80, 14);
      ctx.fillRect(40, BRIDGE_BOT - 14, WORLD_W - 80, 14);

      for (let x = 80; x < WORLD_W - 80; x += 64) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, BRIDGE_TOP + 18, 4, BRIDGE_BOT - BRIDGE_TOP - 36);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 12, BRIDGE_TOP - 4, 24, 10);
        ctx.fillRect(x + 12, BRIDGE_BOT - 6, 24, 10);
      }

      [620, 980, 1340].forEach(bx => {
        ctx.fillStyle = '#14532d';
        ctx.fillRect(bx, BRIDGE_TOP + 18, 90, 26);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(bx + 6, BRIDGE_TOP + 22, 78, 16);
      });

      for (const pr of st.poros) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pr.x - 6, pr.y - 6, 12, 10);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(pr.x - 2, pr.y + 1, 4, 4);
      }

      for (const rel of st.relics) {
        if (!rel.active) continue;
        const bob = Math.sin(st.frame * 0.08) * 4;
        ctx.fillStyle = rel.isAugmentBox ? '#a855f7' : '#22c55e';
        ctx.fillRect(rel.x - 12, rel.y - 12 + bob, 24, 24);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(rel.x - 6, rel.y - 6 + bob, 12, 12);
      }

      for (const p of st.projectiles) {
        if (p.kind === 'laser') {
          ctx.fillStyle = '#fdf4ff';
          const lx = p.vx > 0 ? p.x : 0;
          const lw = p.vx > 0 ? WORLD_W - p.x : p.x;
          ctx.fillRect(lx, p.y - p.radius, lw, p.radius * 2);
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(lx, p.y - p.radius * 0.5, lw, p.radius);
        } else if (p.kind === 'justice') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (1 - p.life / (p.maxLife * 1.5)), 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#fde047';
          ctx.fillRect(p.x - 8, p.y - 90, 16, 95);
        } else if (p.kind === 'shroom') {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(p.x - 10, p.y - 10, 20, 12);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(p.x - 6, p.y - 7, 4, 4);
          ctx.fillRect(p.x + 2, p.y - 7, 4, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(p.x - 5, p.y + 2, 10, 8);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        }
      }

      const playerUnit = st.units.find(u => u.kind === 'player');
      if (playerUnit && !playerUnit.dead && st.augments.has('spin_blade')) {
        for (let b = 0; b < 4; b++) {
          const a = st.frame * 0.14 + (b * Math.PI) / 2;
          const bx = playerUnit.x + Math.cos(a) * 85;
          const by = playerUnit.y + Math.sin(a) * 85;
          ctx.fillStyle = '#facc15';
          ctx.fillRect(bx - 8, by - 8, 16, 16);
        }
      }

      for (const u of st.units) {
        if (u.dead) continue;

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(u.x - u.radius, u.y + u.radius - 3, u.radius * 2, 7);

        if (u.kind === 'nexus') {
          ctx.fillStyle = u.team === 'blue' ? '#0284c7' : '#dc2626';
          ctx.fillRect(u.x - 32, u.y - 32, 64, 64);
          ctx.fillStyle = u.team === 'blue' ? '#7dd3fc' : '#fca5a5';
          ctx.fillRect(u.x - 18, u.y - 18, 36, 36);
        } else if (u.kind === 'turret') {
          ctx.fillStyle = '#475569';
          ctx.fillRect(u.x - 20, u.y - 26, 40, 52);
          ctx.fillStyle = u.color;
          ctx.fillRect(u.x - 14, u.y - 34, 28, 22);
        } else if (u.kind === 'minion') {
          ctx.fillStyle = u.color;
          ctx.fillRect(u.x - 9, u.y - 9, 18, 18);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(u.x - 4, u.y - 5, 8, 5);
        } else {
          const def = CHAMPIONS.find(c => c.id === u.champId) || CHAMPIONS[0];
          drawPixelSprite(
            def.sprite,
            u.x,
            u.y,
            u.scale,
            u.team === 'blue' ? def.color : '#f43f5e',
            def.accent,
            u.facing < 0
          );
        }

        if (u.shield > 0) {
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          ctx.strokeRect(u.x - u.radius - 4, u.y - u.radius - 4, u.radius * 2 + 8, u.radius * 2 + 8);
        }

        const bw = u.kind === 'nexus' ? 76 : u.kind === 'turret' ? 56 : u.kind === 'minion' ? 26 : 46;
        const bh = u.kind === 'minion' ? 4 : 6;
        const bx = u.x - bw / 2;
        const by = u.y - u.radius * u.scale - 16;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.fillStyle = u.kind === 'player' ? '#22c55e' : u.team === 'blue' ? '#38bdf8' : '#ef4444';
        ctx.fillRect(bx, by, Math.max(0, (u.hp / u.maxHp) * bw), bh);

        if (u.kind === 'player' || u.kind === 'champ') {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(u.name, u.x, by - 4);
        }

        if (u.masteryTimer > 0) {
          const my = by - 26 - Math.sin(u.masteryTimer * 0.2) * 3;
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(u.x - 12, my - 12, 24, 18);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(u.x - 8, my - 16, 16, 6);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('M7', u.x, my + 1);
        }

        if (u.chatTimer > 0 && u.chatText) {
          ctx.font = 'bold 11px sans-serif';
          const tw = ctx.measureText(u.chatText).width + 14;
          const cy = by - (u.masteryTimer > 0 ? 48 : 26);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.fillRect(u.x - tw / 2, cy - 14, tw, 20);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1;
          ctx.strokeRect(u.x - tw / 2, cy - 14, tw, 20);
          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.fillText(u.chatText, u.x, cy);
        }
      }

      for (const pt of st.particles) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }

      for (const ft of st.floatTexts) {
        ctx.font = `bold ${ft.size}px monospace`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      ctx.restore();

      const mmW = 220;
      const mmH = 26;
      const mmX = CANVAS_W - mmW - 14;
      const mmY = 12;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(mmX, mmY, mmW, mmH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(mmX, mmY, mmW, mmH);
      for (const u of st.units) {
        if (u.dead) continue;
        const ux = mmX + (u.x / WORLD_W) * mmW;
        const uy = mmY + ((u.y - BRIDGE_TOP) / (BRIDGE_BOT - BRIDGE_TOP)) * mmH;
        ctx.fillStyle = u.kind === 'player' ? '#4ade80' : u.team === 'blue' ? '#38bdf8' : '#f43f5e';
        const sz = u.kind === 'nexus' || u.kind === 'turret' ? 5 : u.kind === 'minion' ? 2 : 4;
        ctx.fillRect(ux - sz / 2, uy - sz / 2, sz, sz);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, triggerSkill, flashMasteryAndTaunt, rollAugmentOptions, showBanner]);

  const moveStick = (dirX: number, dirY: number, active: boolean) => {
    const keys = stateRef.current.keys;
    keys.delete('arrowleft');
    keys.delete('arrowright');
    keys.delete('arrowup');
    keys.delete('arrowdown');
    if (!active) return;
    if (dirX < 0) keys.add('arrowleft');
    if (dirX > 0) keys.add('arrowright');
    if (dirY < 0) keys.add('arrowup');
    if (dirY > 0) keys.add('arrowdown');
  };

  const content = (
    <div className="space-y-5">
      {phase === 'select' && (
        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-7 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs font-black uppercase tracking-widest mb-2">
                <Sparkles size={14} />
                <span>LoL 2D Pixel • Chế Độ Chọn Lõi Hextech Hỗn Loạn</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">
                CHỌN TƯỚNG VÀO CẦU ARAM MAYHEM
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                1 làn đường duy nhất, chọn Lõi Kim Cương bá đạo, nháy Thông Thạo 7 và càn quét Nhà Chính Đỏ!
              </p>
            </div>
            {onBackToMenu && (
              <button
                onClick={onBackToMenu}
                className="self-start px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ← Menu Activity
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CHAMPIONS.map(c => {
              const active = selectedChamp.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedChamp(c)}
                  className={`text-left rounded-xl p-4 border-2 transition-all active:scale-[0.98] ${
                    active
                      ? 'border-orange-500 bg-orange-500/10 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117] hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/40"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      HP {c.hp}
                    </span>
                  </div>
                  <div className="font-black text-sm text-slate-800 dark:text-slate-100 leading-snug">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-2">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-orange-500 font-semibold leading-relaxed">
                    {c.passive}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              Bộ Kỹ Năng Của {selectedChamp.name}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedChamp.skills.map(sk => (
                <div
                  key={sk.key}
                  className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-xs font-black">
                      Phím {sk.key}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{sk.cd}s CD</span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{sk.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{sk.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => initMatch(selectedChamp)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl text-base tracking-wide transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
          >
            <Swords size={20} />
            <span>VÀO TRẬN ARAM MAYHEM & CHỌN LÕI NGAY</span>
          </button>
        </div>
      )}

      {(phase === 'playing' || phase === 'victory' || phase === 'defeat') && (
        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 md:p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 font-black">
                XANH: {hudState.blueTurrets} Trụ • Nhà Chính {hudState.blueNexusHp}%
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-black">
                Cấp {hudState.level} ({hudState.xp}/{hudState.nextXp} XP) • KDA: {hudState.kills}/{hudState.deaths}/{hudState.assists}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 font-black">
                ĐỎ: {hudState.redTurrets} Trụ • Nhà Chính {hudState.redNexusHp}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={rollAugmentOptions}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1 transition-colors"
              >
                <Sparkles size={13} />
                <span>Bốc Lõi Mayhem</span>
              </button>
              <button
                onClick={() => setAutoPlay(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg font-black text-xs transition-colors ${
                  autoPlay
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {autoPlay ? '🤖 Auto-Quẩy: BẬT' : '🤖 Auto-Quẩy: TẮT'}
              </button>
              <button
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  sfx.muted = next;
                }}
                aria-label="Toggle sound"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={() => setPhase('select')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                Đổi Tướng
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 bg-[#06101e]">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const scaleX = CANVAS_W / rect.width;
                const scaleY = CANVAS_H / rect.height;
                const cx = (e.clientX - rect.left) * scaleX + stateRef.current.cameraX;
                const cy = (e.clientY - rect.top) * scaleY;
                stateRef.current.targetMoveX = Math.max(80, Math.min(WORLD_W - 80, cx));
                stateRef.current.targetMoveY = Math.max(BRIDGE_TOP + 20, Math.min(BRIDGE_BOT - 20, cy));
              }}
              onContextMenu={e => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const scaleX = CANVAS_W / rect.width;
                const scaleY = CANVAS_H / rect.height;
                const cx = (e.clientX - rect.left) * scaleX + stateRef.current.cameraX;
                const cy = (e.clientY - rect.top) * scaleY;
                stateRef.current.targetMoveX = Math.max(80, Math.min(WORLD_W - 80, cx));
                stateRef.current.targetMoveY = Math.max(BRIDGE_TOP + 20, Math.min(BRIDGE_BOT - 20, cy));
              }}
              className="w-full h-auto block cursor-crosshair"
            />

            {bannerText && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-full bg-amber-500/95 text-slate-950 font-black text-xs md:text-sm tracking-wider shadow-xl animate-bounce">
                {bannerText}
              </div>
            )}

            {augmentChoices.length > 0 && (
              <div className="absolute inset-0 z-30 bg-slate-950/88 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                <div className="text-center mb-4">
                  <div className="text-xs font-black uppercase tracking-widest text-purple-400 mb-1">
                    ⚡ LÕI CÔNG NGHỆ HEXTECH ARAM MAYHEM ⚡
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    CHỌN 1 LÕI TROLL BỰA ĐỂ ĐỘT BIẾN SỨC MẠNH
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl w-full">
                  {augmentChoices.map(aug => {
                    const borderCls =
                      aug.tier === 'prismatic'
                        ? 'border-fuchsia-400 bg-gradient-to-b from-fuchsia-950/90 via-indigo-950/90 to-slate-900'
                        : aug.tier === 'gold'
                        ? 'border-amber-400 bg-gradient-to-b from-amber-950/90 to-slate-900'
                        : 'border-slate-400 bg-slate-900';
                    const badgeTxt =
                      aug.tier === 'prismatic' ? 'KIM CƯƠNG' : aug.tier === 'gold' ? 'VÀNG' : 'BẠC';
                    return (
                      <button
                        key={aug.id}
                        onClick={() => applyAugment(aug)}
                        className={`text-left rounded-xl p-4 border-2 ${borderCls} hover:scale-[1.02] transition-all flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">{aug.icon}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/10 text-white uppercase">
                              LÕI {badgeTxt}
                            </span>
                          </div>
                          <div className="font-black text-base text-white mb-1">{aug.name}</div>
                          <div className="text-xs text-slate-200 leading-relaxed mb-2">{aug.desc}</div>
                        </div>
                        <div className="text-[11px] italic text-amber-300 border-t border-white/10 pt-2">
                          "{aug.sub}"
                        </div>
                      </button>
                    );
                  })}
                </div>

                {rerollsLeft > 0 && (
                  <button
                    onClick={() => {
                      setRerollsLeft(r => r - 1);
                      rollAugmentOptions();
                    }}
                    className="mt-4 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2"
                  >
                    <Shuffle size={14} />
                    <span>Đổi Lõi Khác ({rerollsLeft} lượt)</span>
                  </button>
                )}
              </div>
            )}

            {(phase === 'victory' || phase === 'defeat') && (
              <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <Trophy
                  size={56}
                  className={phase === 'victory' ? 'text-amber-400 mb-3' : 'text-rose-500 mb-3'}
                />
                <h3 className="text-3xl md:text-5xl font-black text-white mb-2">
                  {phase === 'victory' ? '🏆 CHIẾN THẮNG HUY HOÀNG!' : '💀 NỔ NHÀ CHÍNH RỒI!'}
                </h3>
                <p className="text-sm text-slate-300 max-w-md mb-5">
                  {phase === 'victory'
                    ? `Bạn đã dẫn dắt đồng đội phá nát Nhà Chính Đỏ với KDA ${hudState.kills}/${hudState.deaths}/${hudState.assists} và ${pickedAugments.length} Lõi Mayhem!`
                    : 'Đội bạn đã cố gắng hết sức nhưng đối phương quá đông và hung hãn!'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => initMatch(selectedChamp)}
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm flex items-center gap-2"
                  >
                    <RotateCcw size={16} />
                    <span>Làm Trận Mới</span>
                  </button>
                  <button
                    onClick={() => setPhase('select')}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                  >
                    Đổi Tướng Khác
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-4 flex items-center gap-2 justify-center lg:justify-start">
              <button
                onMouseDown={() => moveStick(-1, 0, true)}
                onMouseUp={() => moveStick(0, 0, false)}
                onTouchStart={() => moveStick(-1, 0, true)}
                onTouchEnd={() => moveStick(0, 0, false)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-200 active:bg-orange-500 active:text-white"
              >
                ◀ Trái
              </button>
              <button
                onMouseDown={() => moveStick(0, -1, true)}
                onMouseUp={() => moveStick(0, 0, false)}
                onTouchStart={() => moveStick(0, -1, true)}
                onTouchEnd={() => moveStick(0, 0, false)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-200 active:bg-orange-500 active:text-white"
              >
                ▲ Lên
              </button>
              <button
                onMouseDown={() => moveStick(0, 1, true)}
                onMouseUp={() => moveStick(0, 0, false)}
                onTouchStart={() => moveStick(0, 1, true)}
                onTouchEnd={() => moveStick(0, 0, false)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-200 active:bg-orange-500 active:text-white"
              >
                ▼ Xuống
              </button>
              <button
                onMouseDown={() => moveStick(1, 0, true)}
                onMouseUp={() => moveStick(0, 0, false)}
                onTouchStart={() => moveStick(1, 0, true)}
                onTouchEnd={() => moveStick(0, 0, false)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-200 active:bg-orange-500 active:text-white"
              >
                Phải ▶
              </button>
            </div>

            <div className="lg:col-span-8 flex flex-wrap items-center justify-center lg:justify-end gap-2">
              {selectedChamp.skills.map((sk, idx) => {
                const cd = hudState.cds[idx];
                return (
                  <button
                    key={sk.key}
                    onClick={() => triggerSkill(idx)}
                    className={`relative px-3.5 py-2.5 rounded-xl font-black text-xs border transition-all active:scale-95 ${
                      cd > 0
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                        : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow'
                    }`}
                  >
                    <div>
                      [{sk.key}] {sk.name}
                    </div>
                    {cd > 0 && <div className="text-[10px] font-mono">{cd}s</div>}
                  </button>
                );
              })}

              <button
                onClick={() => triggerSkill(4)}
                className="px-3 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs"
              >
                ⛄ [D] Cầu Tuyết {hudState.cds[4] > 0 ? `(${hudState.cds[4]}s)` : ''}
              </button>
              <button
                onClick={() => triggerSkill(5)}
                className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
              >
                ✨ [F] Tốc Biến {hudState.cds[5] > 0 ? `(${hudState.cds[5]}s)` : ''}
              </button>
              <button
                onClick={flashMasteryAndTaunt}
                className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs"
              >
                👑 [T] Nháy M7
              </button>
            </div>
          </div>

          {pickedAugments.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Lõi Đang Có:</span>
              {pickedAugments.map((a, idx) => (
                <span
                  key={`${a.id}-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold"
                >
                  <span>{a.icon}</span>
                  <span>{a.name}</span>
                </span>
              ))}
            </div>
          )}

          <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Điều khiển: Phím Mũi Tên (hoặc nút trên màn hình) để di chuyển • Q W E R tung chiêu • D Ném Cầu Tuyết (bấm D lần 2 để bay vào) • F Tốc Biến • T Nháy Thông Thạo 7
          </div>
        </div>
      )}
    </div>
  );

  if (onBackToMenu) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-slate-100 p-4 md:p-8 max-w-5xl mx-auto">
        {content}
      </div>
    );
  }

  return (
    <PageShell title="ARAM Mayhem 8D - Chọn Lõi" backTo="/" icon="⚔️">
      {content}
    </PageShell>
  );
};

export default AramMayhem;
