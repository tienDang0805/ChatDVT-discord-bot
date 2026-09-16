import tienDangSprite from '../assets/tien_dang_sprite.png';
import tienDangAvatar from '../assets/tien_dang_avatar.png';
import quangHuySprite from '../assets/quang_huy_sprite.png';
import ngocTamSprite from '../assets/ngoc_tam_sprite.png';
import giaBaoSprite from '../assets/gia_bao_sprite.png';
import thaiTaiSprite from '../assets/thai_tai_sprite.png';
import hoaTranSprite from '../assets/hoa_tran_sprite.png';
import chatdvtSprite from '../assets/chatdvt_bot_sprite.png';

import skillCodeFlame from '../assets/skill_code_flame.png';
import skillBugSwarm from '../assets/skill_bug_swarm.png';
import skillLightningChain from '../assets/skill_lightning_chain.png';
import skillShieldBash from '../assets/skill_shield_bash.png';
import skillRandomShot from '../assets/skill_random_shot.png';
import skillShadowBlade from '../assets/skill_shadow_blade.png';
import skillDataBeam from '../assets/skill_data_beam.png';

import ultInfernoStorm from '../assets/ult_inferno_storm.png';
import ultPlague from '../assets/ult_plague.png';
import ultThunderGod from '../assets/ult_thunder_god.png';
import ultFortress from '../assets/ult_fortress.png';
import ultBulletHell from '../assets/ult_bullet_hell.png';
import ultDeathDance from '../assets/ult_death_dance.png';
import ultSatellite from '../assets/ult_satellite.png';

export interface CharacterLore {
  tag: string;
  role: string;
  title: string;
  lore: string;
  quote: string;
  difficulty: 'Dễ' | 'Trung Bình' | 'Cao' | 'Khó';
  glowColor: string;
  gradient: string;
}

export const CHARACTER_AVATARS: Record<string, string> = {
  tien: tienDangAvatar,
  huy: quangHuySprite,
  tam: ngocTamSprite,
  bao: giaBaoSprite,
  tai: thaiTaiSprite,
  hoa: hoaTranSprite,
  bot: chatdvtSprite,
};

export const CHARACTER_FULL_SPRITES: Record<string, string> = {
  tien: tienDangSprite,
  huy: quangHuySprite,
  tam: ngocTamSprite,
  bao: giaBaoSprite,
  tai: thaiTaiSprite,
  hoa: hoaTranSprite,
  bot: chatdvtSprite,
};

export const SKILL_ICONS: Record<string, string> = {
  code_flame: skillCodeFlame,
  bug_swarm: skillBugSwarm,
  lightning_chain: skillLightningChain,
  shield_bash: skillShieldBash,
  random_shot: skillRandomShot,
  shadow_blade: skillShadowBlade,
  data_beam: skillDataBeam,
};

export const ULTIMATE_ICONS: Record<string, string> = {
  inferno_storm: ultInfernoStorm,
  plague: ultPlague,
  thunder_god: ultThunderGod,
  fortress: ultFortress,
  bullet_hell: ultBulletHell,
  death_dance: ultDeathDance,
  satellite: ultSatellite,
};

export const CHARACTER_DETAILS: Record<string, CharacterLore> = {
  tien: {
    tag: 'DPS / HỎA THẦN',
    role: 'Pháp Sư Mũ Gấu Tàn Phá',
    title: 'Phì Đế Mũ Gấu 🐻',
    lore: 'Phì Đế Tiến Đặng với chiếc mũ trùm đầu gấu bông huyền thoại, ánh mắt bí hiểm và ngọn lửa Code Flame bùng cháy rực rỡ thiêu rụi mọi quái vật.',
    quote: '"Đội mũ gấu cho ấm đầu, ném lửa code cho cháy máy!"',
    difficulty: 'Dễ',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
  },
  huy: {
    tag: 'CRIT / HACKER',
    role: 'Chuyên Gia Diệt Lỗi',
    title: 'Bug Hunter Điện Tử',
    lore: 'Thiên tài lập trình triệu hồi đàn bọ mạng tấn công dồn dập, tăng dần tỷ lệ chí mạng theo số quái hạ gục.',
    quote: '"Không có bug nào thoát khỏi con mắt của tao!"',
    difficulty: 'Trung Bình',
    glowColor: 'rgba(34, 197, 94, 0.65)',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
  },
  tam: {
    tag: 'CARRY / LÔI ĐẾ',
    role: 'Nữ Thần Sấm Sét',
    title: 'Chiến Binh Carry',
    lore: 'Mang trong mình dòng máu thần sấm, phóng ra những tia sét điện giật liên hoàn hủy diệt cả bầy quái.',
    quote: '"Sét đánh không trượt phát nào, để tao gánh!"',
    difficulty: 'Dễ',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
  },
  bao: {
    tag: 'TANK / HỘ VỆ',
    role: 'Bức Tường Bất Tử',
    title: 'Hộ Vệ Khiên Thần',
    lore: 'Lớp giáp dày cùng hào quang hộ vệ nghiền nát bất cứ sinh vật nào dám lại gần phạm vi an toàn.',
    quote: '"Đánh vào tao chẳng khác gì đập đầu vào núi đá!"',
    difficulty: 'Dễ',
    glowColor: 'rgba(99, 102, 241, 0.65)',
    gradient: 'from-indigo-400 via-violet-500 to-purple-700',
  },
  tai: {
    tag: 'LUCK / CASINO',
    role: 'Vận May Vô Tận',
    title: 'Thần Bài Tài Ba',
    lore: 'Dựa vào xúc xắc và bánh xe may mắn, tung ra những phát bắn ngẫu nhiên với sát thương ảo ma khó lường.',
    quote: '"Một ván bài định đoạt cả giang sơn!"',
    difficulty: 'Khó',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
  },
  hoa: {
    tag: 'SPEED / SÁT THỦ',
    role: 'Bóng Ma Đoạt Mạng',
    title: 'Sát Thủ Vô Ảnh',
    lore: 'Tốc độ di chuyển thần tốc lướt qua hàng ngũ kẻ thù, phi đao chém đứt bóng tối trong chớp mắt.',
    quote: '"Ngươi còn chưa kịp thấy ta thì đầu đã lìa khỏi cổ."',
    difficulty: 'Khó',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    gradient: 'from-purple-400 via-fuchsia-500 to-pink-600',
  },
  bot: {
    tag: 'AI DOG / CÔNG NGHỆ',
    role: 'Cún Cưng DJ Siêu Trí Tuệ',
    title: 'Linh Vật AI ChatDVT 🎧🐶',
    lore: 'Chú cún lông xù thông minh đeo kính tròn và tai nghe DJ, tay cầm máy tính bảng hologram robot điều khiển chùm tia dữ liệu tự hành và hồi máu liên tục.',
    quote: '"Gâu gâu! Đang bật nhạc Lofi và bắn laser dữ liệu quét sạch quái vật!"',
    difficulty: 'Trung Bình',
    glowColor: 'rgba(249, 115, 22, 0.65)',
    gradient: 'from-orange-400 via-red-500 to-rose-600',
  },
};
