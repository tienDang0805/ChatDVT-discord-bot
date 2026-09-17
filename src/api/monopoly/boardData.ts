import type { TileDef, CardDef, GlobalEventDef, TokenOption } from './types';

export const BOARD_TILES: TileDef[] = [
  { index: 0, type: 'start', name: 'XUẤT PHÁT', flavor: 'Đi qua đây nhận 200Đ' },
  { index: 1, type: 'property', name: 'Quận 4', flavor: 'Nhà Huy — Hẻm nhỏ nhưng có tình', group: 'green', price: 80, baseRent: 8 },
  { index: 2, type: 'community', name: 'Cộng Đồng', flavor: 'Rút 1 thẻ' },
  { index: 3, type: 'property', name: 'Bình Tân', flavor: 'Nhà Bảo — Xa trung tâm nhưng yên tĩnh', group: 'green', price: 90, baseRent: 10 },
  { index: 4, type: 'tax', name: 'Phạt Giao Thông', flavor: 'Vượt đèn đỏ!', taxAmount: 100 },
  { index: 5, type: 'station', name: 'Bến Xe Miền Đông', flavor: 'Xe khách liên tỉnh', price: 150 },
  { index: 6, type: 'property', name: 'Ninh Thuận', flavor: 'Nhà Tâm — Nắng gió quanh năm', group: 'green', price: 100, baseRent: 12 },
  { index: 7, type: 'jail', name: 'TÙ / THĂM TÙ', flavor: 'Ở ngoài thì thăm thôi' },
  { index: 8, type: 'property', name: 'Thủ Đức', flavor: 'TP mới, đất đang lên', group: 'blue', price: 140, baseRent: 16 },
  { index: 9, type: 'chance', name: 'Cơ Hội', flavor: 'Rút 1 thẻ' },
  { index: 10, type: 'property', name: 'Quận 1', flavor: 'Đất vàng Sài Gòn', group: 'yellow', price: 200, baseRent: 24 },
  { index: 11, type: 'property', name: 'Bình Thạnh', flavor: 'Gần sông, view đẹp', group: 'blue', price: 150, baseRent: 18 },
  { index: 12, type: 'station', name: 'Ga Sài Gòn', flavor: 'Tàu lửa Bắc-Nam', price: 150 },
  { index: 13, type: 'property', name: 'Tân Phú', flavor: 'Khu dân cư đông đúc', group: 'blue', price: 160, baseRent: 20 },
  { index: 14, type: 'free_parking', name: 'Quán Cà Phê 8D', flavor: 'Nghỉ chân, nhặt quỹ charity' },
  { index: 15, type: 'property', name: 'Phú Nhuận', flavor: 'Sầm uất 24/7', group: 'yellow', price: 220, baseRent: 26 },
  { index: 16, type: 'community', name: 'Cộng Đồng', flavor: 'Rút 1 thẻ' },
  { index: 17, type: 'property', name: 'Gò Vấp', flavor: 'Kẹt xe huyền thoại', group: 'yellow', price: 180, baseRent: 22 },
  { index: 18, type: 'property', name: 'Bình Dương', flavor: 'Khu Công Nghiệp bạt ngàn', group: 'yellow', price: 190, baseRent: 22 },
  { index: 19, type: 'station', name: 'Ga Biên Hoà', flavor: 'Ga lớn miền Đông', price: 150 },
  { index: 20, type: 'chance', name: 'Cơ Hội', flavor: 'Rút 1 thẻ' },
  { index: 21, type: 'go_jail', name: 'BỊ CÔNG AN BẮT', flavor: 'Vào tù ngay!' },
  { index: 22, type: 'property', name: 'Đắk Nông', flavor: 'Thủ phủ Tây Nguyên', group: 'red', price: 280, baseRent: 32 },
  { index: 23, type: 'chance', name: 'Cơ Hội', flavor: 'Rút 1 thẻ' },
  { index: 24, type: 'property', name: 'Gia Nghĩa Center', flavor: 'Trung tâm hành chính', group: 'red', price: 320, baseRent: 38 },
  { index: 25, type: 'tax', name: 'Thuế Nhà Đất', flavor: 'Nộp thuế cho nhà nước!', taxAmount: 150 },
  { index: 26, type: 'property', name: 'Chợ Gia Nghĩa', flavor: 'Chợ lớn nhất vùng', group: 'red', price: 350, baseRent: 42 },
  { index: 27, type: 'property', name: 'Resort Gia Nghĩa 5⭐', flavor: 'Biệt Thự Tiến Đặng 👑', group: 'red', price: 400, baseRent: 50 },
];

export const CHANCE_CARDS: CardDef[] = [
  { key: 'GANGSTER_CHASE', name: 'Bị giang hồ dí', icon: '🔫', description: 'Chạy thẳng 3 ô về phía trước', effect: { type: 'move_forward', steps: 3 } },
  { key: 'DIARRHEA', name: 'Ỉa chảy', icon: '💩', description: 'Mất lượt tiếp theo (ngồi toilet)', effect: { type: 'skip_turn' } },
  { key: 'LOTTERY_WIN', name: 'Trúng Vietlott', icon: '🎰', description: '+250Đ', effect: { type: 'gain_money', amount: 250 } },
  { key: 'HACKED_FB', name: 'Bị hack Facebook', icon: '📱', description: '-80Đ tiền chuộc', effect: { type: 'lose_money', amount: 80 } },
  { key: 'SHOPEE_RETURN', name: 'Shopee hoàn hàng', icon: '📦', description: '-60Đ', effect: { type: 'lose_money', amount: 60 } },
  { key: 'GOT_GF', name: 'Bắt được bồ', icon: '💕', description: '+100Đ quà sinh nhật', effect: { type: 'gain_money', amount: 100 } },
  { key: 'DUMPED', name: 'Bị bồ đá', icon: '💔', description: '-120Đ trả quà + nhậu giải sầu', effect: { type: 'lose_money', amount: 120 } },
  { key: 'DRUNK_TELEPORT', name: 'Đi nhậu say xỉn', icon: '🍺', description: 'Dịch chuyển ngẫu nhiên', effect: { type: 'move_random' } },
  { key: 'INSURANCE', name: 'Bảo hiểm VIP', icon: '🛡️', description: 'Giữ thẻ. Miễn thuê 1 lần.', effect: { type: 'hold_insurance' } },
  { key: 'BUG_PROD', name: 'Bug production', icon: '🐛', description: 'Về ô BĐS của mình gần nhất', effect: { type: 'move_to_own_or_start' } },
  { key: 'DEPLOY_SUCCESS', name: 'Deploy thành công', icon: '🚀', description: '+150Đ', effect: { type: 'gain_money', amount: 150 } },
  { key: 'POLICE_CATCH', name: 'Công an bắt', icon: '🚔', description: 'Vào tù ngay lập tức', effect: { type: 'go_jail' } },
  { key: 'SUGAR_DADDY', name: 'Sugar daddy cho tiền', icon: '💎', description: 'Mỗi player khác trả 40Đ', effect: { type: 'collect_from_all', amount: 40 } },
  { key: 'DISCORD_LAG', name: 'Lag Discord', icon: '📡', description: 'Hoán đổi vị trí với player gần nhất', effect: { type: 'swap_nearest' } },
  { key: 'FLASH_SALE', name: 'Flash Sale', icon: '⚡', description: 'Mua BĐS đang đứng giảm 50%', effect: { type: 'flash_sale' } },
];

export const COMMUNITY_CARDS: CardDef[] = [
  { key: 'GROUP_MEETING', name: '8D họp nhóm', icon: '🎂', description: 'Mỗi player khác trả 30Đ', effect: { type: 'collect_from_all', amount: 30 } },
  { key: 'HOSPITAL_BILL', name: 'Viện phí (ăn bẩn)', icon: '🏥', description: '-80Đ', effect: { type: 'lose_money', amount: 80 } },
  { key: 'TAX_REFUND', name: 'Hoàn thuế', icon: '💰', description: '+120Đ', effect: { type: 'gain_money', amount: 120 } },
  { key: 'BONUS_SALARY', name: 'Lương tháng 13', icon: '🎓', description: '+80Đ', effect: { type: 'gain_money', amount: 80 } },
  { key: 'REPAIR_COST', name: 'Sửa xe hỏng', icon: '🔧', description: '-30Đ × số BĐS sở hữu', effect: { type: 'pay_per_property', amount: 30 } },
  { key: 'GET_OUT_JAIL', name: 'Thẻ Ra Tù', icon: '🚪', description: 'Giữ thẻ. Dùng khi bị vào tù.', effect: { type: 'hold_jail_free' } },
  { key: 'GRAB_TIP', name: 'Tiền bo Grab', icon: '🛵', description: '-50Đ', effect: { type: 'lose_money', amount: 50 } },
  { key: 'SELL_GAME_ACC', name: 'Bán acc game', icon: '🎮', description: '+100Đ', effect: { type: 'gain_money', amount: 100 } },
  { key: 'DRAMA_CHAT', name: 'Drama group chat', icon: '😤', description: 'Giàu nhất trả 50Đ cho nghèo nhất', effect: { type: 'richest_pays_poorest', amount: 50 } },
  { key: 'CHARITY_8D', name: 'Charity 8D', icon: '❤️', description: 'Tất cả nộp 25Đ vào Free Parking', effect: { type: 'all_pay_to_pool', amount: 25 } },
];

export const GLOBAL_EVENTS: GlobalEventDef[] = [
  { key: 'DAKNONG_FEVER', name: 'Sốt Đất Đắk Nông', icon: '🏔️', description: 'Thuê nhóm Đỏ ×3!', duration: 3, effect: { type: 'multiply_rent_group', group: 'red', multiplier: 3 } },
  { key: 'SAIGON_FLOOD', name: 'Ngập Lụt Sài Gòn', icon: '🌧️', description: 'Nhóm Xanh đóng băng', duration: 2, effect: { type: 'freeze_groups', groups: ['green', 'blue'] } },
  { key: 'INFLATION', name: 'Lạm Phát', icon: '📉', description: 'Mất 10% số tiền', duration: 0, effect: { type: 'lose_percent', percent: 10 } },
  { key: 'FESTIVAL_8D', name: 'Festival 8D', icon: '🎊', description: 'Qua START được 300Đ', duration: 3, effect: { type: 'bonus_go', amount: 300 } },
  { key: 'BLACKOUT', name: 'Mất Điện', icon: '🔌', description: 'Không ai được mua/xây', duration: 2, effect: { type: 'no_build' } },
  { key: 'DOG_ESCAPE', name: 'Chó Sổng Chuồng', icon: '🐕', description: 'BĐS cấp 0 bị reset', duration: 0, effect: { type: 'reset_level0' } },
  { key: 'CASINO_NIGHT', name: 'Casino Đêm', icon: '🃏', description: 'Tung xúc xắc: chẵn +100, lẻ -100', duration: 0, effect: { type: 'casino_roll' } },
  { key: 'COVID_WAVE', name: 'Đại Dịch COVID', icon: '😷', description: 'Tất cả skip 1 lượt', duration: 1, effect: { type: 'skip_all' } },
  { key: 'FUND_8D', name: 'Quỹ Đầu Tư 8D', icon: '💼', description: 'Nghèo nhất nhận 200Đ', duration: 0, effect: { type: 'aid_poorest', amount: 200 } },
  { key: 'HOUSE_FIRE', name: 'Cháy Nhà', icon: '🧯', description: '1 BĐS cấp ≥2 bị hạ cấp', duration: 0, effect: { type: 'downgrade_random' } },
];

export const TOKEN_OPTIONS: TokenOption[] = [
  { emoji: '🐻', name: 'Tiến Đặng', color: '#f59e0b', avatar: '/images/chibi/tien_dang.jpg', title: 'Vua Đắk Nông 👑', desc: 'Trùm bất động sản Tây Nguyên, đụng là mua đất' },
  { emoji: '🐛', name: 'Quang Huy', color: '#22c55e', avatar: '/images/chibi/quang_huy.jpg', title: 'Chúa Hẻm Q4 🛵', desc: 'Lạng lách hẻm nhỏ né công an, thu tiền siêu nhanh' },
  { emoji: '💪', name: 'Ngọc Tâm', color: '#3b82f6', avatar: '/images/chibi/ngoc_tam.jpg', title: 'Lực Sĩ Ninh Thuận 💪', desc: 'Nắng gió tôi luyện, sức bền vô hạn khi bị phạt' },
  { emoji: '🛡️', name: 'Gia Bảo', color: '#6366f1', avatar: '/images/chibi/gia_bao.jpg', title: 'Hộ Vệ Bình Tân 🛡️', desc: 'Thủ nhà vững chắc, xây chuồng chó khắp nơi' },
  { emoji: '🎰', name: 'Thái Tài', color: '#eab308', avatar: '/images/chibi/thai_tai.jpg', title: 'Thần Bài 8D 🎰', desc: 'Cờ bạc là đam mê, chuyên gia nổ đôi xúc xắc' },
  { emoji: '🔇', name: 'Hoà Trần', color: '#8b5cf6', avatar: '/images/chibi/hoa_tran.jpg', title: 'Trùm Mute Mic 🔇', desc: 'Âm thầm gom đất đại gia, không nói một lời' },
  { emoji: '🐶', name: 'ChatDVT', color: '#f97316', avatar: '/images/chibi/chatdvt.jpg', title: 'Linh Vật ChatDVT 🐶', desc: 'Gâu gâu cắn trộm tiền thuê, may mắn nhân đôi' },
];

export const BUILD_LEVELS = [
  { level: 0, name: 'Chuồng Chó', icon: '🐕', cost: 0, rentMultiplier: 1 },
  { level: 1, name: 'Nhà Cấp 4', icon: '🏚️', cost: 50, rentMultiplier: 3 },
  { level: 2, name: 'Nhà Phố', icon: '🏠', cost: 100, rentMultiplier: 5 },
  { level: 3, name: 'Biệt Thự Mini', icon: '🏢', cost: 150, rentMultiplier: 8 },
  { level: 4, name: 'Biệt Thự Pha Ke', icon: '🏰', cost: 250, rentMultiplier: 15 },
];

export const STATION_RENTS = [0, 25, 50, 100];

export function getGroupTiles(group: string): number[] {
  return BOARD_TILES.filter(t => t.group === group).map(t => t.index);
}
