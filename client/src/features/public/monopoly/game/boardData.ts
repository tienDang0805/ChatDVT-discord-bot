import type { TileDef, CardDef, GlobalEventDef, TokenOption } from './types';

export const BOARD_TILES: TileDef[] = [
  { index: 0, type: 'start', name: 'XUẤT PHÁT', flavor: 'Đi qua đây nhận 200Đ' },

  { index: 1, type: 'property', name: 'Quận 4', flavor: 'Nhà Huy — Hẻm nhỏ nhưng có tình', group: 'green', price: 60, baseRent: 6 },
  { index: 2, type: 'community', name: 'Khí Vận', flavor: 'Rút 1 thẻ' },
  { index: 3, type: 'property', name: 'Bình Tân', flavor: 'Nhà Bảo — Xa trung tâm nhưng yên tĩnh', group: 'green', price: 70, baseRent: 8 },
  { index: 4, type: 'tax', name: 'Phạt Giao Thông', flavor: 'Vượt đèn đỏ!', taxAmount: 80 },
  { index: 5, type: 'station', name: 'Cà Phê HP Gia Lai', flavor: 'Tụ điểm 8D — Nơi bắt đầu mọi drama', price: 150, stationIcon: '☕' },
  { index: 6, type: 'property', name: 'Ninh Thuận', flavor: 'Nhà Tâm — Nắng gió quanh năm', group: 'green', price: 80, baseRent: 10 },
  { index: 7, type: 'property', name: 'Bình Dương', flavor: 'Khu Công Nghiệp bạt ngàn', group: 'green', price: 90, baseRent: 12 },
  { index: 8, type: 'chance', name: 'Cơ Hội', flavor: 'Rút 1 thẻ' },

  { index: 9, type: 'jail', name: 'TÙ / THĂM TÙ', flavor: 'Ở ngoài thì thăm thôi' },

  { index: 10, type: 'property', name: 'Thủ Đức', flavor: 'TP mới, đất đang lên', group: 'blue', price: 100, baseRent: 14 },
  { index: 11, type: 'property', name: 'Bình Thạnh', flavor: 'Gần sông, view đẹp', group: 'blue', price: 110, baseRent: 16 },
  { index: 12, type: 'community', name: 'Khí Vận', flavor: 'Rút 1 thẻ' },
  { index: 13, type: 'property', name: 'Tân Phú', flavor: 'Khu dân cư đông đúc', group: 'blue', price: 120, baseRent: 18 },
  { index: 14, type: 'station', name: 'Nhà Kim Liễu', flavor: 'Nơi anh 6 trấn giữ — vào là không muốn ra', price: 150, stationIcon: '💅' },
  { index: 15, type: 'property', name: 'Gò Vấp', flavor: 'Kẹt xe huyền thoại', group: 'blue', price: 130, baseRent: 20 },
  { index: 16, type: 'chance', name: 'Cơ Hội', flavor: 'Rút 1 thẻ' },
  { index: 17, type: 'property', name: 'Tân Bình', flavor: 'Gần sân bay, đất hot', group: 'blue', price: 140, baseRent: 22 },

  { index: 18, type: 'free_parking', name: 'Quán Cà Phê 8D', flavor: 'Nghỉ chân, nhặt quỹ charity' },

  { index: 19, type: 'property', name: 'Phú Nhuận', flavor: 'Sầm uất 24/7', group: 'yellow', price: 160, baseRent: 24 },
  { index: 20, type: 'property', name: 'Quận 1', flavor: 'Đất vàng Sài Gòn', group: 'yellow', price: 180, baseRent: 28 },
  { index: 21, type: 'community', name: 'Khí Vận', flavor: 'Rút 1 thẻ' },
  { index: 22, type: 'property', name: 'Quận 3', flavor: 'Trung tâm sang chảnh', group: 'yellow', price: 190, baseRent: 30 },
  { index: 23, type: 'station', name: 'Sân Bay Tân Sơn Nhất', flavor: 'Hàng không quốc tế', price: 150, stationIcon: '✈️' },
  { index: 24, type: 'property', name: 'Đà Lạt', flavor: 'Thành phố ngàn hoa', group: 'yellow', price: 200, baseRent: 32 },
  { index: 25, type: 'tax', name: 'Thuế Nhà Đất', flavor: 'Nộp thuế cho nhà nước!', taxAmount: 120 },
  { index: 26, type: 'property', name: 'Nha Trang', flavor: 'Biển xanh cát trắng', group: 'yellow', price: 210, baseRent: 34 },

  { index: 27, type: 'go_jail', name: 'BỊ CÔNG AN BẮT', flavor: 'Vào tù ngay!' },

  { index: 28, type: 'property', name: 'Đắk Nông', flavor: 'Thủ phủ Tây Nguyên', group: 'red', price: 240, baseRent: 36 },
  { index: 29, type: 'property', name: 'Gia Nghĩa Center', flavor: 'Trung tâm hành chính', group: 'red', price: 260, baseRent: 40 },
  { index: 30, type: 'chance', name: 'Cơ Hội', flavor: 'Rút 1 thẻ' },
  { index: 31, type: 'property', name: 'Chợ Gia Nghĩa', flavor: 'Chợ lớn nhất vùng', group: 'red', price: 280, baseRent: 44 },
  { index: 32, type: 'station', name: 'Nhà Chị Hân', flavor: 'Dọn trọ giúp chị nhưng chị đi chơi với thằng khác', price: 150, stationIcon: '💔' },
  { index: 33, type: 'property', name: 'Hà Nội', flavor: 'Thủ đô ngàn năm', group: 'purple', price: 320, baseRent: 50 },
  { index: 34, type: 'property', name: 'Huế', flavor: 'Cố đô vương triều', group: 'purple', price: 350, baseRent: 55 },
  { index: 35, type: 'property', name: 'Resort Gia Nghĩa 5⭐', flavor: 'Biệt Thự Tiến Đặng 👑', group: 'purple', price: 400, baseRent: 60 },
];

export const CHANCE_CARDS: CardDef[] = [
  { key: 'GANGSTER_CHASE', name: 'Bị giang hồ dí', icon: '🔫', description: 'Chạy thẳng 3 ô về phía trước', effect: { type: 'move_forward', steps: 3 } },
  { key: 'DIARRHEA', name: 'Ỉa chảy', icon: '💩', description: 'Mất lượt tiếp theo (ngồi toilet)', effect: { type: 'skip_turn' } },
  { key: 'LOTTERY_WIN', name: 'Trúng Vietlott', icon: '🎰', description: '+250Đ', effect: { type: 'gain_money', amount: 250 } },
  { key: 'HACKED_FB', name: 'Bị hack Facebook', icon: '📱', description: '-80Đ tiền chuộc', effect: { type: 'lose_money', amount: 80 } },
  { key: 'DRUNK_TELEPORT', name: 'Đi nhậu say xỉn', icon: '🍺', description: 'Dịch chuyển ngẫu nhiên', effect: { type: 'move_random' } },
  { key: 'POLICE_CATCH', name: 'Công an bắt', icon: '🚔', description: 'Vào tù ngay lập tức', effect: { type: 'go_jail' } },
  { key: 'BA_KHI_Q1', name: 'Múa bá khí giữa Q1', icon: '🕺', description: 'Nhận 100Đ tiền tips từ fan hâm mộ', effect: { type: 'gain_money', amount: 100 } },
  { key: 'TRUNG_DE', name: 'Trúng đề', icon: '🎯', description: '+200Đ trúng lô đề', effect: { type: 'gain_money', amount: 200 } },
  { key: 'LUA_DAO', name: 'Sập bẫy lừa đảo', icon: '🕳️', description: '-150Đ mất sạch vì tin lời ngọt', effect: { type: 'lose_money', amount: 150 } },
  { key: 'ANH_6_NHAP', name: 'Bị Anh 6 nhập', icon: '👻', description: 'Di chuyển ngay đến Nhà Kim Liễu!', effect: { type: 'move_to_tile', tileIndex: 14 } },
  { key: 'STEL_GAI', name: 'Được ăn với gái Stel', icon: '💃', description: 'Thu mỗi người 50Đ tiền VIP', effect: { type: 'collect_from_all', amount: 50 } },
  { key: 'BOP_VU_STEL', name: 'Lộ chuyện bóp vú ở Stel', icon: '🫣', description: 'Tổn thương tâm lý, khám bệnh -50Đ', effect: { type: 'lose_money', amount: 50 } },
  { key: 'PHONG_BAT', name: 'Mua đồ phông bạt đăng mạng', icon: '🤡', description: 'Flex ảo nhưng ví thật, -100Đ', effect: { type: 'lose_money', amount: 100 } },
  { key: 'ROBIN_COM_TAM', name: 'Dẫn Robin ăn cơm Tấm 1h đêm', icon: '🍚', description: 'Mất tiền cơm, bị chê phèn. Tổn thương -100Đ', effect: { type: 'lose_money', amount: 100 } },
  { key: 'NGAU_LOI', name: 'Bạn trở nên ngầu lòi', icon: '😎', description: 'Giữ thẻ. Vào nhà người khác không trả tiền (1 lần)', effect: { type: 'hold_insurance' } },
  { key: 'BA_HOA', name: 'Ba hoa trong công sở', icon: '🗣️', description: 'Vào tù lập tức vì tội mõm!', effect: { type: 'go_jail' } },
  { key: 'DANH_HOI_DONG', name: 'Đánh hội đồng con gái', icon: '👊', description: 'Vào tù ngay lập tức!', effect: { type: 'go_jail' } },
  { key: 'GIUT_DIEN_THOAI', name: 'Dẫn bạn đi giựt điện thoại', icon: '📱', description: 'Bị công an bắt → Vào tù!', effect: { type: 'go_jail' } },
  { key: 'PHI_DE_NHAP', name: 'Bị Phì Đế nhập', icon: '🍔', description: 'Ăn uống vô tội vạ -50Đ', effect: { type: 'lose_money', amount: 50 } },
  { key: 'DAM_THANG_3', name: 'Đấm thằng thứ 3', icon: '🥊', description: 'Bị trừ 50Đ tiền thuốc!', effect: { type: 'lose_money', amount: 50 } },
  { key: 'CTY_XU_TAXI', name: 'Bị công ty xù tiền taxi', icon: '🚕', description: 'Đi làm mà bị xù -100Đ', effect: { type: 'lose_money', amount: 100 } },
];

export const COMMUNITY_CARDS: CardDef[] = [
  { key: 'GROUP_MEETING', name: '8D họp nhóm', icon: '🎂', description: 'Mỗi player khác trả 30Đ', effect: { type: 'collect_from_all', amount: 30 } },
  { key: 'HOSPITAL_BILL', name: 'Viện phí (ăn bẩn)', icon: '🏥', description: '-80Đ', effect: { type: 'lose_money', amount: 80 } },
  { key: 'TAX_REFUND', name: 'Hoàn thuế', icon: '💰', description: '+120Đ', effect: { type: 'gain_money', amount: 120 } },
  { key: 'REPAIR_COST', name: 'Sửa xe hỏng', icon: '🔧', description: '-30Đ × số BĐS sở hữu', effect: { type: 'pay_per_property', amount: 30 } },
  { key: 'GET_OUT_JAIL', name: 'Thẻ Ra Tù', icon: '🚪', description: 'Giữ thẻ. Dùng khi bị vào tù.', effect: { type: 'hold_jail_free' } },
  { key: 'BAO_NHAU', name: 'Bao 8D đi nhậu', icon: '🍻', description: '-100Đ tiền nhậu cho cả nhóm', effect: { type: 'lose_money', amount: 100 } },
  { key: 'CHATDVT_GAU', name: 'ChatDVT gâu gâu', icon: '🐶', description: 'Cắn trộm 50Đ từ mỗi player', effect: { type: 'collect_from_all', amount: 50 } },
  { key: 'DON_TRO_CHI_HAN', name: 'Dọn trọ cho Chị Hân', icon: '📦', description: 'Di chuyển đến Nhà Chị Hân, thấy chị đi với thằng khác. Tổn thương -50Đ', effect: { type: 'move_to_tile', tileIndex: 32 } },
  { key: 'TANG_LUONG', name: 'Nhận mail tăng lương', icon: '📧', description: 'Lương tăng nhưng tâm lý tổn thương đi khám -50Đ', effect: { type: 'lose_money', amount: 50 } },
  { key: 'TAY_SI_TOM', name: 'Xem live anh Tày Sì Tơm', icon: '📺', description: 'Donate hết tiền túi -50Đ', effect: { type: 'lose_money', amount: 50 } },
  { key: 'YEAR_END_STEL', name: 'Đi Year End Cty Stel', icon: '🥄', description: 'Loot muỗng đũa, mỗi thành viên 8D nhận 25Đ', effect: { type: 'collect_from_all', amount: 25 } },
  { key: 'BAO_8D_KPUB', name: 'Bao 8D KPub', icon: '🎤', description: 'Hát karaoke xong cháy túi -150Đ', effect: { type: 'lose_money', amount: 150 } },
];

export const GLOBAL_EVENTS: GlobalEventDef[] = [
  { key: 'DAKNONG_FEVER', name: 'Sốt Đất Đắk Nông', icon: '🏔️', description: 'Thuê nhóm Đỏ ×3!', duration: 3, effect: { type: 'multiply_rent_group', group: 'red', multiplier: 3 } },
  { key: 'SAIGON_FLOOD', name: 'Ngập Lụt Sài Gòn', icon: '🌧️', description: 'Nhóm Xanh đóng băng', duration: 2, effect: { type: 'freeze_groups', groups: ['green', 'blue'] } },
  { key: 'INFLATION', name: 'Lạm Phát', icon: '📉', description: 'Mất 10% số tiền', duration: 0, effect: { type: 'lose_percent', percent: 10 } },
  { key: 'FESTIVAL_8D', name: 'Festival 8D', icon: '🎊', description: 'Qua START được 300Đ', duration: 3, effect: { type: 'bonus_go', amount: 300 } },
  { key: 'BLACKOUT', name: 'Mất Điện', icon: '🔌', description: 'Không ai được mua/xây', duration: 2, effect: { type: 'no_build' } },
  { key: 'DOG_ESCAPE', name: 'Chó Sổng Chuồng', icon: '🐕', description: 'BĐS cấp 0 bị reset', duration: 0, effect: { type: 'reset_level0' } },
  { key: 'CASINO_NIGHT', name: 'Casino Đêm', icon: '🃏', description: 'Tung xúc xắc: chẵn +150, lẻ -150', duration: 0, effect: { type: 'casino_roll' } },
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

export const STATION_RENTS = [0, 25, 50, 100, 200];

export function getGroupTiles(group: string): number[] {
  return BOARD_TILES.filter(t => t.group === group).map(t => t.index);
}

export function getStationTiles(): number[] {
  return BOARD_TILES.filter(t => t.type === 'station').map(t => t.index);
}
