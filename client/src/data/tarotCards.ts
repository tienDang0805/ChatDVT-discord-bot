export interface TarotCard {
  id: number;
  name: string;
  nameVi: string;
  image: string;
  arcana: 'major' | 'minor';
}

const W = 'https://upload.wikimedia.org/wikipedia/commons';

export const TAROT_DECK: TarotCard[] = [
  { id:0, name:'The Fool', nameVi:'Kẻ Khờ', image:`${W}/9/90/RWS_Tarot_00_Fool.jpg`, arcana:'major' },
  { id:1, name:'The Magician', nameVi:'Pháp Sư', image:`${W}/d/de/RWS_Tarot_01_Magician.jpg`, arcana:'major' },
  { id:2, name:'The High Priestess', nameVi:'Nữ Tư Tế', image:`${W}/8/88/RWS_Tarot_02_High_Priestess.jpg`, arcana:'major' },
  { id:3, name:'The Empress', nameVi:'Nữ Hoàng', image:`${W}/d/d2/RWS_Tarot_03_Empress.jpg`, arcana:'major' },
  { id:4, name:'The Emperor', nameVi:'Hoàng Đế', image:`${W}/c/c3/RWS_Tarot_04_Emperor.jpg`, arcana:'major' },
  { id:5, name:'The Hierophant', nameVi:'Giáo Hoàng', image:`${W}/8/8d/RWS_Tarot_05_Hierophant.jpg`, arcana:'major' },
  { id:6, name:'The Lovers', nameVi:'Đôi Tình Nhân', image:`${W}/3/3a/RWS_Tarot_06_Lovers.jpg`, arcana:'major' },
  { id:7, name:'The Chariot', nameVi:'Chiến Xa', image:`${W}/9/9b/RWS_Tarot_07_Chariot.jpg`, arcana:'major' },
  { id:8, name:'Strength', nameVi:'Sức Mạnh', image:`${W}/f/f5/RWS_Tarot_08_Strength.jpg`, arcana:'major' },
  { id:9, name:'The Hermit', nameVi:'Ẩn Sĩ', image:`${W}/4/4d/RWS_Tarot_09_Hermit.jpg`, arcana:'major' },
  { id:10, name:'Wheel of Fortune', nameVi:'Vòng Xoay Vận Mệnh', image:`${W}/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg`, arcana:'major' },
  { id:11, name:'Justice', nameVi:'Công Lý', image:`${W}/e/e0/RWS_Tarot_11_Justice.jpg`, arcana:'major' },
  { id:12, name:'The Hanged Man', nameVi:'Kẻ Bị Treo', image:`${W}/2/2b/RWS_Tarot_12_Hanged_Man.jpg`, arcana:'major' },
  { id:13, name:'Death', nameVi:'Thần Chết', image:`${W}/d/d7/RWS_Tarot_13_Death.jpg`, arcana:'major' },
  { id:14, name:'Temperance', nameVi:'Tiết Chế', image:`${W}/f/f8/RWS_Tarot_14_Temperance.jpg`, arcana:'major' },
  { id:15, name:'The Devil', nameVi:'Ác Quỷ', image:`${W}/5/55/RWS_Tarot_15_Devil.jpg`, arcana:'major' },
  { id:16, name:'The Tower', nameVi:'Tòa Tháp', image:`${W}/5/53/RWS_Tarot_16_Tower.jpg`, arcana:'major' },
  { id:17, name:'The Star', nameVi:'Ngôi Sao', image:`${W}/d/db/RWS_Tarot_17_Star.jpg`, arcana:'major' },
  { id:18, name:'The Moon', nameVi:'Mặt Trăng', image:`${W}/7/7f/RWS_Tarot_18_Moon.jpg`, arcana:'major' },
  { id:19, name:'The Sun', nameVi:'Mặt Trời', image:`${W}/1/17/RWS_Tarot_19_Sun.jpg`, arcana:'major' },
  { id:20, name:'Judgement', nameVi:'Phán Xét', image:`${W}/d/dd/RWS_Tarot_20_Judgement.jpg`, arcana:'major' },
  { id:21, name:'The World', nameVi:'Thế Giới', image:`${W}/f/ff/RWS_Tarot_21_World.jpg`, arcana:'major' },
  { id:22, name:'Ace of Wands', nameVi:'Át Gậy', image:`${W}/1/11/Wands01.jpg`, arcana:'minor' },
  { id:23, name:'Two of Wands', nameVi:'Hai Gậy', image:`${W}/0/0f/Wands02.jpg`, arcana:'minor' },
  { id:24, name:'Three of Wands', nameVi:'Ba Gậy', image:`${W}/f/ff/Wands03.jpg`, arcana:'minor' },
  { id:25, name:'Four of Wands', nameVi:'Bốn Gậy', image:`${W}/a/a4/Wands04.jpg`, arcana:'minor' },
  { id:26, name:'Five of Wands', nameVi:'Năm Gậy', image:`${W}/9/9d/Wands05.jpg`, arcana:'minor' },
  { id:27, name:'Six of Wands', nameVi:'Sáu Gậy', image:`${W}/3/3b/Wands06.jpg`, arcana:'minor' },
  { id:28, name:'Seven of Wands', nameVi:'Bảy Gậy', image:`${W}/e/e4/Wands07.jpg`, arcana:'minor' },
  { id:29, name:'Eight of Wands', nameVi:'Tám Gậy', image:`${W}/6/6a/Wands08.jpg`, arcana:'minor' },
  { id:30, name:'Nine of Wands', nameVi:'Chín Gậy', image:`${W}/e/e7/Wands09.jpg`, arcana:'minor' },
  { id:31, name:'Ten of Wands', nameVi:'Mười Gậy', image:`${W}/0/0b/Wands10.jpg`, arcana:'minor' },
  { id:32, name:'Page of Wands', nameVi:'Thị Đồng Gậy', image:`${W}/6/6a/Wands11.jpg`, arcana:'minor' },
  { id:33, name:'Knight of Wands', nameVi:'Hiệp Sĩ Gậy', image:`${W}/1/16/Wands12.jpg`, arcana:'minor' },
  { id:34, name:'Queen of Wands', nameVi:'Nữ Hoàng Gậy', image:`${W}/0/0d/Wands13.jpg`, arcana:'minor' },
  { id:35, name:'King of Wands', nameVi:'Vua Gậy', image:`${W}/c/ce/Wands14.jpg`, arcana:'minor' },
  { id:36, name:'Ace of Cups', nameVi:'Át Ly', image:`${W}/3/36/Cups01.jpg`, arcana:'minor' },
  { id:37, name:'Two of Cups', nameVi:'Hai Ly', image:`${W}/f/f8/Cups02.jpg`, arcana:'minor' },
  { id:38, name:'Three of Cups', nameVi:'Ba Ly', image:`${W}/7/7a/Cups03.jpg`, arcana:'minor' },
  { id:39, name:'Four of Cups', nameVi:'Bốn Ly', image:`${W}/3/35/Cups04.jpg`, arcana:'minor' },
  { id:40, name:'Five of Cups', nameVi:'Năm Ly', image:`${W}/d/d7/Cups05.jpg`, arcana:'minor' },
  { id:41, name:'Six of Cups', nameVi:'Sáu Ly', image:`${W}/1/17/Cups06.jpg`, arcana:'minor' },
  { id:42, name:'Seven of Cups', nameVi:'Bảy Ly', image:`${W}/a/ae/Cups07.jpg`, arcana:'minor' },
  { id:43, name:'Eight of Cups', nameVi:'Tám Ly', image:`${W}/6/60/Cups08.jpg`, arcana:'minor' },
  { id:44, name:'Nine of Cups', nameVi:'Chín Ly', image:`${W}/2/24/Cups09.jpg`, arcana:'minor' },
  { id:45, name:'Ten of Cups', nameVi:'Mười Ly', image:`${W}/8/84/Cups10.jpg`, arcana:'minor' },
  { id:46, name:'Page of Cups', nameVi:'Thị Đồng Ly', image:`${W}/a/ad/Cups11.jpg`, arcana:'minor' },
  { id:47, name:'Knight of Cups', nameVi:'Hiệp Sĩ Ly', image:`${W}/f/fa/Cups12.jpg`, arcana:'minor' },
  { id:48, name:'Queen of Cups', nameVi:'Nữ Hoàng Ly', image:`${W}/6/62/Cups13.jpg`, arcana:'minor' },
  { id:49, name:'King of Cups', nameVi:'Vua Ly', image:`${W}/0/04/Cups14.jpg`, arcana:'minor' },
  { id:50, name:'Ace of Swords', nameVi:'Át Kiếm', image:`${W}/1/1a/Swords01.jpg`, arcana:'minor' },
  { id:51, name:'Two of Swords', nameVi:'Hai Kiếm', image:`${W}/9/9e/Swords02.jpg`, arcana:'minor' },
  { id:52, name:'Three of Swords', nameVi:'Ba Kiếm', image:`${W}/0/02/Swords03.jpg`, arcana:'minor' },
  { id:53, name:'Four of Swords', nameVi:'Bốn Kiếm', image:`${W}/b/bf/Swords04.jpg`, arcana:'minor' },
  { id:54, name:'Five of Swords', nameVi:'Năm Kiếm', image:`${W}/2/23/Swords05.jpg`, arcana:'minor' },
  { id:55, name:'Six of Swords', nameVi:'Sáu Kiếm', image:`${W}/2/29/Swords06.jpg`, arcana:'minor' },
  { id:56, name:'Seven of Swords', nameVi:'Bảy Kiếm', image:`${W}/3/34/Swords07.jpg`, arcana:'minor' },
  { id:57, name:'Eight of Swords', nameVi:'Tám Kiếm', image:`${W}/a/a7/Swords08.jpg`, arcana:'minor' },
  { id:58, name:'Nine of Swords', nameVi:'Chín Kiếm', image:`${W}/2/2f/Swords09.jpg`, arcana:'minor' },
  { id:59, name:'Ten of Swords', nameVi:'Mười Kiếm', image:`${W}/d/d4/Swords10.jpg`, arcana:'minor' },
  { id:60, name:'Page of Swords', nameVi:'Thị Đồng Kiếm', image:`${W}/4/4c/Swords11.jpg`, arcana:'minor' },
  { id:61, name:'Knight of Swords', nameVi:'Hiệp Sĩ Kiếm', image:`${W}/b/b0/Swords12.jpg`, arcana:'minor' },
  { id:62, name:'Queen of Swords', nameVi:'Nữ Hoàng Kiếm', image:`${W}/d/d4/Swords13.jpg`, arcana:'minor' },
  { id:63, name:'King of Swords', nameVi:'Vua Kiếm', image:`${W}/3/33/Swords14.jpg`, arcana:'minor' },
  { id:64, name:'Ace of Pentacles', nameVi:'Át Tiền', image:`${W}/f/fd/Pents01.jpg`, arcana:'minor' },
  { id:65, name:'Two of Pentacles', nameVi:'Hai Tiền', image:`${W}/9/9f/Pents02.jpg`, arcana:'minor' },
  { id:66, name:'Three of Pentacles', nameVi:'Ba Tiền', image:`${W}/4/42/Pents03.jpg`, arcana:'minor' },
  { id:67, name:'Four of Pentacles', nameVi:'Bốn Tiền', image:`${W}/3/35/Pents04.jpg`, arcana:'minor' },
  { id:68, name:'Five of Pentacles', nameVi:'Năm Tiền', image:`${W}/9/96/Pents05.jpg`, arcana:'minor' },
  { id:69, name:'Six of Pentacles', nameVi:'Sáu Tiền', image:`${W}/a/a6/Pents06.jpg`, arcana:'minor' },
  { id:70, name:'Seven of Pentacles', nameVi:'Bảy Tiền', image:`${W}/6/6a/Pents07.jpg`, arcana:'minor' },
  { id:71, name:'Eight of Pentacles', nameVi:'Tám Tiền', image:`${W}/4/49/Pents08.jpg`, arcana:'minor' },
  { id:72, name:'Nine of Pentacles', nameVi:'Chín Tiền', image:`${W}/f/f0/Pents09.jpg`, arcana:'minor' },
  { id:73, name:'Ten of Pentacles', nameVi:'Mười Tiền', image:`${W}/4/42/Pents10.jpg`, arcana:'minor' },
  { id:74, name:'Page of Pentacles', nameVi:'Thị Đồng Tiền', image:`${W}/e/ec/Pents11.jpg`, arcana:'minor' },
  { id:75, name:'Knight of Pentacles', nameVi:'Hiệp Sĩ Tiền', image:`${W}/d/d5/Pents12.jpg`, arcana:'minor' },
  { id:76, name:'Queen of Pentacles', nameVi:'Nữ Hoàng Tiền', image:`${W}/8/88/Pents13.jpg`, arcana:'minor' },
  { id:77, name:'King of Pentacles', nameVi:'Vua Tiền', image:`${W}/1/1c/Pents14.jpg`, arcana:'minor' },
];

export const POSITIONS = ['Quá Khứ', 'Hiện Tại', 'Tương Lai'] as const;

export const TOPICS = [
  { id: 'love', label: '💕 Tình Yêu', value: 'Tình Yêu & Mối Quan Hệ' },
  { id: 'career', label: '💼 Sự Nghiệp', value: 'Sự Nghiệp & Công Việc' },
  { id: 'finance', label: '💰 Tài Chính', value: 'Tài Chính & Tiền Bạc' },
  { id: 'health', label: '🏥 Sức Khỏe', value: 'Sức Khỏe & Năng Lượng' },
  { id: 'general', label: '🌟 Tổng Quát', value: 'Tổng Quát & Định Hướng Cuộc Sống' },
];

export function drawThreeCards(): { card: TarotCard; isReversed: boolean }[] {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(card => ({
    card,
    isReversed: Math.random() > 0.5,
  }));
}
