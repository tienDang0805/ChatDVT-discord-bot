import type { ExerciseDef } from '../types/gym';

export const EXERCISES: Record<string, ExerciseDef> = {
  "incline_db_press": {
    "id": "incline_db_press",
    "name": "Đẩy Ngực Trên Tạ Đơn (Incline DB Press)",
    "shortName": "Đẩy Ngực Dốc 30°",
    "muscle": "Ngực Trên & Vai Trước",
    "equipment": "Tạ đơn · Ghế dốc 30°",
    "mascot": "inclineDbPress",
    "tier": "Tier S · Ưu tiên #1",
    "priorityRank": 1,
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ghế dốc 30° (nấc 2) · Cùi chỏ mở 45°",
    "tempoCue": "Hạ 2.5s — Giữ đáy 0.5s — Đẩy lên 1.2s",
    "whyItWorks": "Tạo khuôn ngực trên đầy đặn thẩm mỹ nhất và mở biên độ tự nhiên cho khớp vai hơn đòn ngang.",
    "formSteps": [
      "Chỉnh ghế dốc 30° (nấc 2), ngồi tựa chắc lưng và khép chặt 2 bả vai ép xuống đệm.",
      "Hạ tạ chậm 2.5 giây theo góc khuỷu tay mở 45°–60° (hình mũi tên) cho tới khi tạ ngang ngực.",
      "Đạp chắc chân xuống sàn, thở ra và đẩy tạ lên trên ngực mà không va mạnh hai đầu tạ."
    ],
    "cues": "Chỉnh ghế dốc 30°, ép bả vai xuống ghế, hạ tạ mở khuỷu tay góc 45° an toàn tuyệt đối cho khớp vai.",
    "mistake": "Không để ghế quá dốc (45–60°) làm mỏi vai trước; không banh ngang khuỷu tay 90°.",
    "swapOptions": [
      "machine_chest_press",
      "iso_incline_chest_press",
      "smith_incline_press",
      "barbell_bench_press",
      "assisted_chest_dip"
    ],
    "swapReason": "Nếu hết ghế dốc 30° hoặc hết cặp tạ đơn vừa sức, đổi ngay sang Máy Đẩy Ngực Ngồi hoặc Đẩy Đòn Ngang.",
    "videoUrl": "https://www.youtube.com/watch?v=ky9eCfvuLRY",
    "videoId": "ky9eCfvuLRY",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Do Incline Dumbbell Press (Form & Scapular Setup)",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 14,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 22,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 22,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 22,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp chính × 8–10 reps (Kiểm soát nhịp hạ 2.5s)",
    "slotGroup": "chest_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Dumbbell Rack 2–50kg + Adjustable Incline Bench",
    "gymSetup": {
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Kệ tạ đơn 2–40kg trước gương lớn, chỉnh ghế đa năng lên nấc 2 (dốc 30°).",
      "ways_ql13": "Khu Free Weight tầng 4 Ways 361 QL13: Dàn tạ đơn bọc cao su 2–50kg + ghế dốc chỉnh nấc 30°."
    },
    "zoneCategory": "free_weight",
    "zoneLabel": "Khu Tạ Đơn & Ghế Rời"
  },
  "dumbbell_shoulder_press": {
    "id": "dumbbell_shoulder_press",
    "name": "Đẩy Vai Tạ Đơn Ngồi Tựa Lưng (Seated DB Shoulder Press)",
    "shortName": "Đẩy Vai Tạ Đơn 75°",
    "muscle": "Vai Trước & Vai Ngang",
    "equipment": "Tạ đơn · Ghế tựa 75°",
    "mascot": "shoulderPress",
    "tier": "Tier S · Ưu tiên #2",
    "priorityRank": 2,
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ghế tựa 75° · Cùi chỏ hướng trước 30°",
    "tempoCue": "Hạ 2.0s — Dừng ngang tai — Đẩy 1.2s",
    "whyItWorks": "Phát triển toàn diện khối cơ vai săn khỏe trong khi điểm tựa lưng 75° bảo vệ cột sống thắt lưng.",
    "formSteps": [
      "Dựng ghế tựa lưng góc 75°–80° (hơi ngả nhẹ hơn góc vuông 90°), đặt hai bàn chân vững trên sàn.",
      "Đưa hai cùi chỏ hơi hướng nhẹ về phía trước 30° (mặt phẳng xương bả vai), hạ tạ ngang cằm/tai.",
      "Đẩy thẳng tạ lên cao nhưng giữ khuỷu tay hơi mềm ở đỉnh, kiểm soát nhịp hạ 2 giây."
    ],
    "cues": "Tựa lưng chắc vào ghế 75°, đưa hai cùi chỏ hơi hướng vào trong 30° để không cọ khớp vai.",
    "mistake": "Không ưỡn võng lưng dưới rời khỏi ghế; không banh ngang cùi chỏ 90°.",
    "swapOptions": [
      "machine_shoulder_press",
      "smith_shoulder_press",
      "cable_lateral_raise_single"
    ],
    "swapReason": "Nếu khu vực ghế tạ đơn đông người, chuyển sang Máy Đẩy Vai Ngồi (Seated Machine Press).",
    "videoUrl": "https://www.youtube.com/watch?v=oGZbB67Ff6Q",
    "videoId": "oGZbB67Ff6Q",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Seated Dumbbell Shoulder Press — Scapular Plane Form",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 10,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 16,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 16,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 16,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp chính × 10–12 reps (Tựa lưng ghế 75°)",
    "slotGroup": "shoulder_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Dumbbell Rack + 75° Seated Bench",
    "gymSetup": {
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Dựng lưng ghế đa năng lên nấc 5 (góc 75°–80°) đối diện gương.",
      "ways_ql13": "Khu Tạ Đơn Ways 361 QL13: Ghế tựa lưng ngắn chuyên đẩy vai hoặc ghế đa năng dựng 75°."
    },
    "zoneCategory": "free_weight",
    "zoneLabel": "Khu Tạ Đơn & Ghế Rời"
  },
  "pec_deck_fly": {
    "id": "pec_deck_fly",
    "name": "Ép Ngực Máy Pec Deck / Cáp (Seated Chest Fly)",
    "shortName": "Ép Ngực Pec Deck",
    "muscle": "Rãnh Ngực & Ngực Giữa",
    "equipment": "Máy Pec Deck hoặc Cáp đôi",
    "mascot": "chestFly",
    "tier": "Tier A · Ưu tiên #3",
    "priorityRank": 3,
    "repRange": [
      10,
      15
    ],
    "defaultRestSec": 90,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Tay cầm ngang ngực · Cùi chỏ hơi cong",
    "tempoCue": "Mở ngực 2.5s — Ép sát giữ 1.0s",
    "whyItWorks": "Giữ sức căng liên tục (constant tension) lên sợi cơ ngực ở cả điểm mở rộng lẫn điểm ép sát rãnh ngực mà tạ đơn không làm được.",
    "formSteps": [
      "Chỉnh chiều cao yên ghế sao cho tay cầm ngang giữa ngực, lưng và đầu tựa sát đệm.",
      "Mở rộng cánh tay về sau có kiểm soát (cùi chỏ hơi cong nhẹ cố định) cho tới khi ngực căng sâu.",
      "Tưởng tượng đang ôm một thân cây lớn, ép hai cùi chỏ lại gần nhau và giữ siết ngực 1 giây."
    ],
    "cues": "Giữ bả vai ghim cố định vào đệm ghế, dùng cơ ngực khép hai cánh tay lại và giữ đỉnh 1 giây.",
    "mistake": "Không nhô vai về phía trước khi ép cuối động tác; không thả tạ giật ngược ra sau quá tầm khớp vai.",
    "swapOptions": [
      "cable_crossover_fly",
      "machine_chest_press",
      "assisted_chest_dip"
    ],
    "swapReason": "Nếu máy Pec Deck đang bận, dùng Dây Cáp Đôi (Cable Fly) hoặc Máy Đẩy Ngực Ngồi.",
    "videoUrl": "https://www.youtube.com/watch?v=iPSsUsShqZs",
    "videoId": "iPSsUsShqZs",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Pec Deck Machine Chest Fly — Stretch & Contraction Technique",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp × 10–12 reps (Giữ 1 giây ở đỉnh ép ngực)",
    "slotGroup": "chest_fly",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "2-in-1 Pec Deck / Rear Delt Fly Pin-Loaded",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Máy Pec Deck 2-in-1 — chỉnh chốt tay đòn về nấc 3–4 (mở ngang ngực), yên ghế nấc 4.",
      "ways_ql13": "Khu Máy Selectorized Ways 361 QL13: Máy ép ngực cánh bướm rút chốt tạ, tay cầm ngang ngực giữa."
    },
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "lateral_raise": {
    "id": "lateral_raise",
    "name": "Bay Vai Ngang Tạ Đơn / Cáp (Lateral Raise)",
    "shortName": "Bay Vai Ngang",
    "muscle": "Vai Ngang (Tạo khung chữ V)",
    "equipment": "Cặp tạ đơn nhẹ hoặc Cáp thấp",
    "mascot": "lateralRaise",
    "tier": "Tier A · Ưu tiên #4",
    "priorityRank": 4,
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Đổ người 10° · Nâng hướng trước 20°",
    "tempoCue": "Nâng 1.2s — Giữ ngang vai 0.5s — Hạ 2.5s",
    "whyItWorks": "Bài tập duy nhất cô lập bó cơ vai giữa (Side Delts), giúp vai rộng ngang tạo tỉ lệ lưng chữ V gọn eo.",
    "formSteps": [
      "Đứng hơi đổ nhẹ thân trên về trước 10°, thả lỏng cầu vai, cầm tạ đơn hai bên đùi.",
      "Nâng hai cánh tay sang ngang hướng hơi chếch về phía trước 20° (dẫn đầu bằng cùi chỏ).",
      "Dừng khi tay ngang vai và hạ tạ chậm 2.5 giây để giữ áp lực liên tục lên vai giữa."
    ],
    "cues": "Chọn mức tạ vừa phải, hạ cầu vai xuống, nâng tạ ra xa thân người như đang vươn sải tay.",
    "mistake": "Không chọn tạ quá nặng rồi nhún cầu vai hoặc đung đưa lưng lấy đà.",
    "swapOptions": [
      "cable_lateral_raise_single",
      "machine_lateral_raise",
      "reverse_pec_deck_delt",
      "rope_face_pull"
    ],
    "swapReason": "Nếu muốn cảm nhận cơ căng liên tục hơn ở điểm dưới cùng, đổi sang Kéo Cáp Vai Ngang (Cable Lateral Raise).",
    "videoUrl": "https://www.youtube.com/watch?v=OvH73R0sHWE",
    "videoId": "OvH73R0sHWE",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Do Lateral Raises Properly For Wider Shoulders",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 8,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 8,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "D",
        "prev": "Drop Set nhẹ",
        "weight": 6,
        "reps": 15,
        "effort": "max",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 2 hiệp × 14–15 reps + 1 hiệp Drop Set bơm cơ vai",
    "slotGroup": "lateral_delt",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Dumbbell Rack (4kg – 14kg)",
    "gymSetup": {
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Cặp tạ đơn nhỏ 6–10kg ở tầng trên của kệ tạ.",
      "ways_ql13": "Khu Tạ Đơn Ways 361 QL13: Cặp tạ đơn 6–12kg hoặc chuyển ngay sang Máy Bay Vai Ngang kế bên."
    },
    "zoneCategory": "free_weight",
    "zoneLabel": "Khu Tạ Đơn & Ghế Rời"
  },
  "tricep_rope_pushdown": {
    "id": "tricep_rope_pushdown",
    "name": "Kéo Cáp Dây Thừng Tay Sau (Tricep Rope Pushdown)",
    "shortName": "Kéo Cáp Tay Sau",
    "muscle": "Tay Sau (Triceps)",
    "equipment": "Máy cáp cao · Dây thừng",
    "mascot": "tricepPushdown",
    "tier": "Tier B · Ưu tiên #5",
    "priorityRank": 5,
    "repRange": [
      10,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Cùi chỏ khóa sát sườn · Tách dây ở đáy",
    "tempoCue": "Duỗi 1.0s — Siết đáy 1.0s — Thả 2.0s",
    "whyItWorks": "Cô lập trọn vẹn 3 đầu cơ tay sau (chiếm 65% kích thước bắp tay) mà không gây đau khớp khuỷu tay như bài Skullcrusher.",
    "formSteps": [
      "Đứng cách ròng rọc 1 bước nhỏ, hơi gập hông 15°, khóa cố định hai cùi chỏ ép sát mạn sườn.",
      "Duỗi cẳng tay đẩy dây thừng xuống dưới và tách nhẹ hai đầu dây sang hai bên ở điểm đáy.",
      "Giữ siết cơ tay sau 1 giây rồi từ từ thả cẳng tay lên mà không để cùi chỏ bị kéo bật về trước."
    ],
    "cues": "Khóa chặt cùi chỏ sát hông, chỉ di chuyển cẳng tay và tách nhẹ dây thừng ở điểm thấp nhất.",
    "mistake": "Không chồm người đè cả trọng lượng cơ thể lên dây cáp.",
    "swapOptions": [
      "overhead_cable_tricep_ext",
      "seated_dip_tricep_machine",
      "assisted_chest_dip"
    ],
    "swapReason": "Nếu hết dây thừng, dùng thanh V-Bar thẳng hoặc tập Đẩy Tay Sau Tạ Đơn Qua Đầu (Overhead DB Extension).",
    "videoUrl": "https://www.youtube.com/watch?v=TZw-AZS-r9M",
    "videoId": "TZw-AZS-r9M",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Cable Rope Tricep Pushdown — Elbow Position & Lockout",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 25,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 25,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 25,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp × 10–12 reps (Khóa cố định khuỷu tay)",
    "slotGroup": "triceps",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Cable Tower High Pulley + Rope",
    "gymSetup": {
      "tng_uvk": "Khung Cáp Đôi TNG 58D UVK: Móc dây thừng đơn/đôi vào ròng rọc cao nhất (nấc 18).",
      "ways_ql13": "Giàn Cáp 8 Trạm Ways 361 QL13: Trạm cáp cao có sẵn dây thừng và thanh V-Bar."
    },
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "barbell_bench_press": {
    "id": "barbell_bench_press",
    "name": "Đẩy Ngực Thanh Đòn (Barbell Bench Press)",
    "shortName": "Đẩy Ngực Thanh Đòn",
    "muscle": "Ngực & Tay Sau",
    "equipment": "Thanh đòn 20kg",
    "mascot": "benchPress",
    "tier": "Bài Thay Thế Tier S",
    "priorityRank": 1,
    "repRange": [
      6,
      10
    ],
    "defaultRestSec": 150,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Ghế phẳng 0° · Chân đạp chắc sàn",
    "tempoCue": "Hạ chạm ngực dưới 2.0s — Đẩy 1.2s",
    "whyItWorks": "Tăng sức mạnh tổng thể thân trên và cho phép tăng tạ tuần tiến từng nấc nhỏ 2.5kg.",
    "formSteps": [
      "Nằm trên ghế phẳng, mắt nhìn thẳng dưới thanh đòn, khép bả vai và đặt chân vững dưới sàn.",
      "Nhấc đòn ra khỏi giá, hạ có kiểm soát về phía xương ức dưới.",
      "Đẩy đòn lên theo đường hơi chéo nhẹ về phía vai."
    ],
    "cues": "Chân đạp chắc xuống sàn, ép hai bả vai xuống ghế, hạ đòn chạm nhẹ ngang ngực dưới.",
    "mistake": "Không nhấc mông khỏi ghế, không khóa cứng khớp khuỷu tay đột ngột.",
    "swapOptions": [
      "incline_db_press",
      "machine_chest_press",
      "iso_incline_chest_press",
      "smith_incline_press"
    ],
    "swapReason": "Có thể đổi sang Đẩy Ngực Tạ Đơn Dốc 30° nếu muốn giảm áp lực khớp vai.",
    "videoUrl": "https://www.youtube.com/watch?v=vcBig73ojpE",
    "videoId": "vcBig73ojpE",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Barbell Bench Press With Proper Technique",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 40,
        "reps": 10,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 60,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 60,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 60,
        "reps": 8,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp chính × 8–10 reps (Khép bả vai bảo vệ khớp)",
    "slotGroup": "chest_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Olympic Flat Barbell Bench (Đòn 20kg)",
    "gymSetup": {
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Ghế đẩy ngực ngang Olympic kèm thanh đòn 20kg.",
      "ways_ql13": "Khu Bench & Power Rack Ways 361 QL13: Ghế Bench tiêu chuẩn thi đấu và khung Power Cage có thanh bảo hiểm."
    },
    "zoneCategory": "free_weight",
    "zoneLabel": "Khu Tạ Đơn & Ghế Rời"
  },
  "machine_chest_press": {
    "id": "machine_chest_press",
    "name": "Đẩy Ngực Máy Ngồi (Seated Chest Press)",
    "shortName": "Đẩy Ngực Máy Ngồi",
    "muscle": "Ngực Giữa & Tay Sau",
    "equipment": "Máy có tựa lưng",
    "mascot": "machineChestPress",
    "tier": "Thay Thế An Toàn Khớp",
    "priorityRank": 1,
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 90,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Tay cầm ngang ngực · Lưng áp sát đệm",
    "tempoCue": "Hạ chậm 2.0s — Đẩy mạnh 1.0s",
    "whyItWorks": "Quỹ đạo máy cố định giúp người mới hoặc người nặng cân đẩy sát ngưỡng mỏi cơ mà không lo tạ đè.",
    "formSteps": [
      "Chỉnh chiều cao yên ghế sao cho tay cầm ngang ngực giữa.",
      "Tựa chặt lưng và bả vai vào đệm, đẩy tay cầm ra trước và thở mạnh.",
      "Hạ chậm 2 giây về vị trí căng cơ ngực mà không để bánh tạ chạm rầm vào nhau."
    ],
    "cues": "Chỉnh yên ghế sao cho tay cầm ngang ngực giữa, lưng tựa sát đệm, đẩy ra thở mạnh.",
    "mistake": "Không nhún vai lên tai khi đẩy.",
    "swapOptions": [
      "incline_db_press",
      "iso_incline_chest_press",
      "smith_incline_press",
      "barbell_bench_press",
      "assisted_chest_dip"
    ],
    "swapReason": "Lựa chọn số 1 khi ghế tạ đơn đang kín người tập.",
    "videoUrl": "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
    "videoId": "xUm0BiZCWlQ",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Seated Machine Chest Press — Setup & Hypertrophy Cues",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp × 10–12 reps an toàn tuyệt đối với tựa lưng",
    "slotGroup": "chest_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Seated Chest Press Pin-Loaded (Matrix / Impulse)",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Một trong 5 máy kháng lực cốt lõi tại TNG — có sticker hướng dẫn trên thân máy, chỉnh ghế nấc 4.",
      "ways_ql13": "Khu Máy Ngực Ways 361 QL13: Có cả Máy Đẩy Ngực Ngồi rút chốt tạ và Máy Iso-Lateral lắp bánh tạ rời."
    },
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "lat_pulldown": {
    "id": "lat_pulldown",
    "name": "Kéo Xô Cáp Rộng Tay (Wide-Grip Lat Pulldown)",
    "shortName": "Kéo Xô Rộng Tay",
    "muscle": "Lưng Xô & Tay Trước",
    "equipment": "Máy kéo xô cáp cao",
    "mascot": "latPulldown",
    "tier": "Tier S · Ưu tiên #1",
    "priorityRank": 1,
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ngả lưng 15° · Kéo cùi chỏ xuống hông",
    "tempoCue": "Kéo xuống 1.2s — Giữ 0.5s — Thả giãn 2.2s",
    "whyItWorks": "Thay thế hoàn hảo cho Hít xà đơn (Pull-up) khi cơ thể nặng 90–115kg, giúp mở rộng lưng xô mà không quá tải gân khuỷu tay.",
    "formSteps": [
      "Ngồi khóa đùi dưới đệm cố định, nắm thanh đòn rộng hơn vai 1.5 lần.",
      "Hơi ngả nhẹ ngực 15°, hạ xương bả vai xuống rồi kéo thanh đòn về phía xương quai xanh.",
      "Thả thanh đòn lên có kiểm soát trong 2 giây cho tới khi cơ xô được kéo giãn hết cỡ."
    ],
    "cues": "Hơi ngả người 15°, ưỡn ngực, tưởng tượng kéo hai cùi chỏ xuống túi quần thay vì dùng bàn tay giật.",
    "mistake": "Tránh kéo thanh đòn ra sau gáy (rất hại khớp vai) hoặc dùng đà lưng giật quá mạnh.",
    "swapOptions": [
      "iso_high_row_pulldown",
      "close_neutral_pulldown",
      "assisted_pull_up",
      "machine_seated_row"
    ],
    "swapReason": "Nếu máy kéo xô cao đang bận, chuyển sang Kéo Cáp Ngồi Lưng Giữa.",
    "videoUrl": "https://www.youtube.com/watch?v=SALxEARiMkw",
    "videoId": "SALxEARiMkw",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Do Lat Pulldowns For A Wider Back",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 35,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp chính × 10–12 reps (Kéo bằng cùi chỏ xuống hông)",
    "slotGroup": "vertical_pull",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Lat Pulldown Station (Pin-Loaded)",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Máy Lat Pulldown cốt lõi — chỉnh đệm khóa đùi ép sát trước khi kéo.",
      "ways_ql13": "Giàn Cáp 8 Trạm Ways 361 QL13: 2 trạm Lat Pulldown đối xứng kèm đủ thanh rộng, V-Bar và MAG Grip."
    },
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "seated_cable_row": {
    "id": "seated_cable_row",
    "name": "Kéo Cáp Ngồi Lưng Giữa (Seated Cable Row)",
    "shortName": "Kéo Cáp Lưng Giữa",
    "muscle": "Lưng Giữa & Vai Sau",
    "equipment": "Máy cáp tay cầm V",
    "mascot": "cableRow",
    "tier": "Tier S · Ưu tiên #2",
    "priorityRank": 2,
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Lưng thẳng tự nhiên · Kéo sát rốn",
    "tempoCue": "Kéo 1.2s — Ép bả vai 1.0s — Thả 2.0s",
    "whyItWorks": "Tăng độ dày cơ lưng giữa và chống gù lưng văn phòng mà không gây áp lực nén cột sống như Barbell Row.",
    "formSteps": [
      "Đặt hai bàn chân lên bàn đạp, đầu gối hơi trùng nhẹ, giữ lưng thẳng tự nhiên.",
      "Kéo tay cầm về sát vùng bụng dưới/rốn, ép chặt hai xương bả vai lại với nhau giữ 1 giây.",
      "Duỗi tay về trước có kiểm soát để mở rộng bả vai mà không gù thắt lưng."
    ],
    "cues": "Giữ cột sống thẳng tự nhiên, kéo tay cầm về sát rốn, ép chặt 2 bả vai giữ 1 giây.",
    "mistake": "Không gù lưng dưới khi thả cáp về.",
    "swapOptions": [
      "chest_supported_tbar_row",
      "machine_seated_row",
      "one_arm_db_row",
      "rope_face_pull"
    ],
    "swapReason": "Có thể thay bằng Máy Kéo Lưng Tựa Ngực (Chest-Supported Machine Row).",
    "videoUrl": "https://www.youtube.com/watch?v=UCXxvVItLoM",
    "videoId": "UCXxvVItLoM",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Seated Cable Row — Proper Scapular Retraction Technique",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp × 10–12 reps (Ép sát hai bả vai giữ 1s)",
    "slotGroup": "horizontal_row",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Seated Low Cable Row Station",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Máy kéo cáp ngồi bàn đạp chân rộng, gắn tay cầm chữ V.",
      "ways_ql13": "Giàn 8 Trạm Ways 361 QL13: Trạm Low Row cáp ngồi hoặc chuyển sang Máy T-Bar Row tựa ngực kế bên."
    },
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "plank_core": {
    "id": "plank_core",
    "name": "Plank Gồng Core Bảo Vệ Cột Sống (McGill Core Stability)",
    "shortName": "Plank Gồng Core",
    "muscle": "Core & Lưng Dưới",
    "equipment": "Thảm tập",
    "mascot": "plankCore",
    "tier": "Tier A · Bảo Vệ Đĩa Đệm",
    "priorityRank": 3,
    "repRange": [
      45,
      60
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Cẳng tay vuông góc · Lưng-Mông thẳng hàng",
    "tempoCue": "Gồng cứng bụng & mông liên tục 45–50s",
    "whyItWorks": "Tạo lớp áo giáp cơ bụng ngang bảo vệ đĩa đệm L4-L5 mà không gây gập đốt sống như bài Sit-up truyền thống.",
    "formSteps": [
      "Chống hai cẳng tay vuông góc dưới vai, mũi chân chống sàn.",
      "Siết cứng cơ mông và gồng chặt vùng bụng như chuẩn bị đỡ lực tác động.",
      "Giữ cổ - lưng - mông trên một đường thẳng và hít thở đều."
    ],
    "cues": "Siết chặt cơ mông và cơ bụng như sắp bị đấm vào bụng, giữ lưng phẳng, thở đều không nín thở.",
    "mistake": "Không để võng lưng dưới gây đau thắt lưng; thay thế hoàn toàn cho gập bụng Sit-up.",
    "swapOptions": [
      "ab_crunch_machine"
    ],
    "swapReason": "Có thể kết hợp cùng bài Bird-Dog hoặc Deadbug trên thảm.",
    "videoUrl": "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    "videoId": "pSHjTRCQxIw",
    "videoAuthor": "ATHLEAN-X",
    "videoTitle": "How To Plank Properly For Core Stability & Back Safety",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 0,
        "reps": 45,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 0,
        "reps": 45,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 0,
        "reps": 45,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Đai lưng tự nhiên bảo vệ đĩa đệm L4-L5 (Mục tiêu 50 giây)",
    "slotGroup": "core_stability",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Khu Thảm Tập & Functional Zone",
    "gymSetup": {
      "tng_uvk": "Khu Giãn Cơ & Tập Bụng Tách Biệt TNG 58D UVK: Thảm tập êm không vướng khu vực tạ nặng.",
      "ways_ql13": "Khu Thảm & Giãn Cơ Ways 361 QL13: Có sẵn thảm tập và con lăn Foam Roller mượn miễn phí."
    },
    "zoneCategory": "cardio_core",
    "zoneLabel": "Khu Cardio & Thảm Giãn Cơ"
  },
  "leg_press_45": {
    "id": "leg_press_45",
    "name": "Đạp Đùi Máy 45° (Joint-Safe Leg Press)",
    "shortName": "Đạp Đùi Máy 45°",
    "muscle": "Đùi Trước & Mông",
    "equipment": "Máy đạp đùi 45°",
    "mascot": "legPress",
    "tier": "Tier S · Ưu tiên #1",
    "priorityRank": 1,
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 150,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Gối gập 90° · Mông dính chặt đệm ghế",
    "tempoCue": "Hạ 2.5s — Đạp lên 1.2s (Không khóa gối)",
    "whyItWorks": "Phát triển khối cơ đùi lớn nhất cơ thể giúp đốt calo mạnh mẽ trong khi lưng dưới được nâng đỡ hoàn toàn trên đệm ghế.",
    "formSteps": [
      "Ngồi tựa sát lưng dưới và mông vào đệm ghế, đặt hai bàn chân lên bàn đạp rộng bằng vai.",
      "Mở khóa an toàn, hạ bàn đạp xuống từ từ cho tới khi đùi và cẳng chân tạo góc 90° (mông vẫn dính chặt ghế).",
      "Đạp mạnh qua gót và giữa bàn chân đẩy tạ lên nhưng tuyệt đối giữ đầu gối hơi chùng nhẹ ở đỉnh."
    ],
    "cues": "Đặt bàn chân cao vừa phải rộng bằng vai, lưng dưới và mông ép chặt vào đệm ghế, không khóa thẳng khớp gối ở đỉnh.",
    "mistake": "Tuyệt đối không hạ quá sâu làm cụp mông rời khỏi ghế (gây thoát vị đĩa đệm) và không thẳng tưng đầu gối.",
    "swapOptions": [
      "hack_squat_machine",
      "smith_box_squat",
      "seated_leg_extension"
    ],
    "swapReason": "Nếu máy đạp đùi 45° đang bận, dùng Máy Đạp Đùi Ngang (Seated Horizontal Leg Press) hoặc Goblet Squat.",
    "videoUrl": "https://www.youtube.com/watch?v=yZmx_Ac3880",
    "videoId": "yZmx_Ac3880",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Do The 45° Leg Press Safely (Foot Placement & Depth)",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 80,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 130,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 130,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 130,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp chính × 10–12 reps (Không khóa thẳng khớp gối)",
    "slotGroup": "quad_compound",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "45° Linear Leg Press & Seated Leg Press",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Có cả Máy Đạp Đùi Ngang rút chốt tạ (cho người mới) và Máy Đạp Đùi Nghiêng 45° lắp bánh tạ.",
      "ways_ql13": "Khu Chân tầng 4 Ways 361 QL13: Máy Đạp Đùi Nghiêng 45° hạng nặng (Heavy Plate-Loaded) bàn đạp rộng."
    },
    "zoneCategory": "plate_loaded",
    "zoneLabel": "Khu Lắp Tạ Rời (Plate-Loaded)"
  },
  "dumbbell_rdl": {
    "id": "dumbbell_rdl",
    "name": "Romanian Deadlift Tạ Đơn (Dumbbell RDL)",
    "shortName": "RDL Tạ Đơn Đùi Sau",
    "muscle": "Đùi Sau & Mông",
    "equipment": "Cặp tạ đơn",
    "mascot": "deadliftRdl",
    "tier": "Tier S · Ưu tiên #2",
    "priorityRank": 2,
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Gối chùng 15° · Đẩy mông ra sau lưng phẳng",
    "tempoCue": "Trượt tạ xuống 2.5s — Siết mông lên 1.2s",
    "whyItWorks": "Rèn luyện bản lề hông (Hip Hinge), làm khỏe chuỗi cơ sau (đùi sau + mông) để bảo vệ khớp gối và lưng dưới lâu dài.",
    "formSteps": [
      "Đứng thẳng, hai chân rộng bằng hông, cầm cặp tạ đơn áp sát trước đùi.",
      "Mở khóa gối nhẹ (chùng gối 15° cố định), đẩy thẳng mông ra sau như đang đóng cánh cửa bằng mông.",
      "Dừng lại khi tạ xuống ngang giữa ống đồng và đùi sau căng hết cỡ, sau đó siết mông đứng thẳng dậy."
    ],
    "cues": "Hơi trùng nhẹ gối, đẩy mông ra sau như đang đóng cửa bằng mông, tạ trượt sát ống đồng, lưng thẳng tắp.",
    "mistake": "Không cúi cong lưng dưới hoặc hạ tạ quá sâu quá giữa ống đồng.",
    "swapOptions": [
      "seated_leg_curl_machine",
      "glute_drive_hip_thrust"
    ],
    "swapReason": "Nếu lưng dưới đang mỏi, đổi sang Máy Móc Đùi Sau Ngồi/Nằm (Seated/Lying Leg Curl).",
    "videoUrl": "https://www.youtube.com/watch?v=_oyxCn2iSjU",
    "videoId": "_oyxCn2iSjU",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Do Romanian Deadlifts (Hip Hinge Mechanics)",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Mục tiêu chuẩn: 3 hiệp × 10–11 reps (Đẩy hông ra sau, giữ lưng thẳng)",
    "slotGroup": "posterior_chain",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Dumbbell Rack / Deadlift Platform",
    "gymSetup": {
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Cặp tạ đơn 16–30kg hoặc thanh đòn Olympic.",
      "ways_ql13": "Khu Sàn Deadlift & Tạ Đơn Ways 361 QL13: Có sàn giảm chấn chuyên dụng và tạ đơn lên tới 50kg."
    },
    "zoneCategory": "free_weight",
    "zoneLabel": "Khu Tạ Đơn & Ghế Rời"
  },
  "dumbbell_curl_lateral": {
    "id": "dumbbell_curl_lateral",
    "name": "Cuốn Tạ Đơn Tay Trước (Incline / Standing DB Curl)",
    "shortName": "Cuốn Tạ Tay Trước",
    "muscle": "Tay Trước (Biceps)",
    "equipment": "Cặp tạ đơn",
    "mascot": "dumbbellCurl",
    "tier": "Tier B · Cô Lập Tay Trước",
    "priorityRank": 4,
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Khóa cùi chỏ sát hông · Xoay ngửa cổ tay",
    "tempoCue": "Cuốn 1.2s — Siết đỉnh 1.0s — Hạ 2.5s",
    "whyItWorks": "Tập trung làm săn chắc và rõ nét đỉnh cơ nhị đầu tay trước với áp lực cổ tay êm ái.",
    "formSteps": [
      "Đứng thẳng hoặc ngồi tựa ghế, khóa cố định hai cùi chỏ sát bên mạn sườn.",
      "Xoay ngửa lòng bàn tay khi cuốn tạ lên và siết chặt bắp tay trước ở đỉnh 1 giây.",
      "Hạ tạ chậm 2.5 giây cho tới khi cánh tay duỗi hết biên độ."
    ],
    "cues": "Khóa cố định cùi chỏ bên hông khi cuốn tay trước; hạ tạ chậm giữ sức căng.",
    "mistake": "Không đung đưa lưng lấy đà quăng tạ.",
    "swapOptions": [
      "preacher_curl_machine",
      "cable_rope_hammer_curl"
    ],
    "swapReason": "Có thể đổi sang Cuốn Tay Trước Với Dây Cáp Thấp (Cable Bicep Curl).",
    "videoUrl": "https://www.youtube.com/watch?v=soxrZlIl35U",
    "videoId": "soxrZlIl35U",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Build Bigger Biceps — Optimal Curl Form",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 10,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 10,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "D",
        "prev": "Drop Set nhẹ",
        "weight": 8,
        "reps": 15,
        "effort": "max",
        "done": false
      }
    ],
    "progressionBadge": "Khoảng 12–15 reps kèm 1 hiệp Drop Set bơm máu cơ tay",
    "slotGroup": "biceps",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Dumbbell Rack + Adjustable Bench",
    "gymSetup": {
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Ngồi tựa ghế dốc 60° hoặc đứng trước gương với cặp tạ đơn 8–14kg.",
      "ways_ql13": "Khu Tạ Đơn Ways 361 QL13: Cặp tạ đơn 8–16kg hoặc dùng Máy Cuốn Tay Trước Preacher."
    },
    "zoneCategory": "free_weight",
    "zoneLabel": "Khu Tạ Đơn & Ghế Rời"
  },
  "incline_treadmill_walk": {
    "id": "incline_treadmill_walk",
    "name": "Đi Bộ Dốc Đốt Mỡ Êm Khớp (Incline Walk Zone 2)",
    "shortName": "Đi Bộ Dốc 10%",
    "muscle": "Tim Mạch & Đốt Mỡ (Zero Knee Impact)",
    "equipment": "Máy chạy bộ (Dốc 10% · 4.4 km/h)",
    "mascot": "inclineWalk",
    "tier": "Tier S · Đốt Mỡ Cuối Buổi",
    "priorityRank": 6,
    "repRange": [
      15,
      20
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Độ dốc 10% · Tốc độ 4.4 km/h · Buông tay",
    "tempoCue": "Duy trì 15 phút nhịp tim 125–140 bpm",
    "whyItWorks": "Đốt cháy 160–210 kcal trực tiếp từ mỡ thừa ở vùng nhịp tim Zone 2 mà hoàn toàn không tạo xung lực dội lên sụn gối.",
    "formSteps": [
      "Bấm chỉnh độ dốc máy (Incline) lên mức 9.0%–12.0%, tốc độ đi bộ vừa phải 4.2–4.6 km/h.",
      "Bước sải chân đều đặn, đánh tay tự nhiên, tuyệt đối không vịn treo người lên tay nắm máy.",
      "Duy trì liên tục 15 phút cuối buổi tập ở nhịp tim vùng 125–140 nhịp/phút (vừa đi vừa nói chuyện ngắn được)."
    ],
    "cues": "Chỉnh độ dốc Incline 9%–12%, tốc độ đi bộ 4.2–4.6 km/h trong 15 phút. Buông tay tự nhiên, không vịn chặt vào đầu máy.",
    "mistake": "Không chạy bộ dồn lực mạnh lên gối khi BMI cao; không bám tay treo người lên thành máy làm giảm 40% calo tiêu hao.",
    "swapOptions": [
      "stair_stepper_cardio",
      "rowing_machine_cardio",
      "elliptical_cross_trainer"
    ],
    "swapReason": "Nếu hết máy đi bộ, chuyển sang Đạp Xe Tựa Lưng (Recumbent Bike) mức kháng lực 7 trong 15 phút.",
    "videoUrl": "https://www.youtube.com/watch?v=b5hB5n1T13M",
    "videoId": "b5hB5n1T13M",
    "videoAuthor": "Jeremy Ethier",
    "videoTitle": "Why Incline Walking Is The Best Cardio For Fat Loss",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Dốc 10% × 15 phút",
        "weight": 10,
        "reps": 15,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Giữ nhịp tim vùng đốt mỡ Zone 2 (125–140 bpm) suốt 15 phút cuối buổi",
    "slotGroup": "cardio_finisher",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Commercial Incline Treadmill (0% – 15%)",
    "gymSetup": {
      "tng_uvk": "Khu Cardio TNG 58D UVK: Hàng 20+ máy chạy bộ hiện đại — bấm Incline 10%, Speed 4.4 km/h.",
      "ways_ql13": "Khu Cardio tầng 4 Ways 361 QL13: Dàn máy chạy bộ có chỉnh dốc tự động nhìn ra Quốc Lộ 13."
    },
    "zoneCategory": "cardio_core",
    "zoneLabel": "Khu Cardio & Thảm Giãn Cơ"
  },
  "iso_incline_chest_press": {
    "id": "iso_incline_chest_press",
    "name": "Máy Đẩy Ngực Trên Lắp Tạ Rời (Iso-Lateral Incline Press)",
    "shortName": "Máy Ngực Trên Lắp Tạ",
    "muscle": "Ngực Trên & Vai Trước",
    "equipment": "Máy lắp bánh tạ rời (Plate-Loaded)",
    "mascot": "isoInclinePress",
    "tier": "Tier S · Đặc Trưng Ways QL13",
    "priorityRank": 1,
    "slotGroup": "chest_press",
    "availableGyms": [
      "ways_ql13"
    ],
    "machineBrand": "Hammer / Iso-Lateral Plate-Loaded",
    "gymSetup": {
      "ways_ql13": "Khu Plate-Loaded tầng 4 Ways 361 QL13: Lắp bánh tạ 10–20kg mỗi bên, chỉnh yên ghế nấc 3 để tay cầm ngang xương đòn dưới.",
      "tng_uvk": "Tại TNG 58D UVK không có máy ngực trên lắp tạ rời — dùng Máy Đẩy Ngực Ngồi Chốt Tạ hoặc Đẩy Tạ Đơn Ghế Dốc 30°."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Quỹ đạo hội tụ · Lưng ghim chặt đệm",
    "tempoCue": "Hạ 2.5s — Đẩy hội tụ 1.2s",
    "whyItWorks": "Hai tay đòn độc lập di chuyển theo cung hội tụ tự nhiên giúp cô lập ngực trên cực đại mà không sợ tạ đè.",
    "formSteps": [
      "Lắp đều bánh tạ hai bên sừng máy, chỉnh ghế sao cho tay cầm ngang ngực trên.",
      "Khép chặt hai xương bả vai tì vào đệm lưng, đẩy hai tay cầm lên theo quỹ đạo hội tụ.",
      "Hạ chậm 2.5 giây cho tới khi cơ ngực trên căng sâu rồi phát lực đẩy lên."
    ],
    "cues": "Tì chặt lưng trên vào đệm, đẩy hai tay đồng đều và kiểm soát nhịp hạ.",
    "mistake": "Không nhấc mông hoặc rụt cổ khi đẩy hiệp cuối.",
    "swapOptions": [
      "incline_db_press",
      "machine_chest_press",
      "smith_incline_press"
    ],
    "swapReason": "Máy chủ lực tại Ways Station 361 Quốc Lộ 13 thay cho đẩy tạ đơn dốc trên.",
    "videoUrl": "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
    "videoId": "xUm0BiZCWlQ",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Iso-Lateral Incline Chest Press Technique",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động 15kg/bên",
        "weight": 30,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý 25kg/bên",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý 25kg/bên",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý 25kg/bên",
        "weight": 50,
        "reps": 9,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Máy Plate-Loaded chủ lực tại Ways Station 361 QL13 (3 hiệp × 8–10 reps)",
    "zoneCategory": "plate_loaded",
    "zoneLabel": "Khu Lắp Tạ Rời (Plate-Loaded)"
  },
  "smith_incline_press": {
    "id": "smith_incline_press",
    "name": "Đẩy Ngực Dốc 30° Trên Máy Smith (Smith Incline Press)",
    "shortName": "Đẩy Ngực Dốc Máy Smith",
    "muscle": "Ngực Trên & Ngực Giữa",
    "equipment": "Máy Smith + Ghế dốc 30°",
    "mascot": "smithInclinePress",
    "tier": "Tier S · Có Ở Cả 2 Phòng",
    "priorityRank": 1,
    "slotGroup": "chest_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Counter-Balanced Smith Machine",
    "gymSetup": {
      "tng_uvk": "Khu Máy Smith TNG 58D UVK: Kéo ghế đa năng vào giữa khung Smith, chỉnh nấc dốc 30° (nấc 2), thanh đòn xuống ngang ngực trên.",
      "ways_ql13": "Khu Khung Smith Ways 361 QL13: Đặt ghế dốc 30° chính giữa, xoay cổ tay mở chốt an toàn hai bên thanh đòn."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Đòn xuống ngang xương đòn · Chốt khóa an toàn",
    "tempoCue": "Hạ 2.5s — Giữ đáy 0.5s — Đẩy 1.0s",
    "whyItWorks": "Thanh trượt cố định trên máy Smith loại bỏ hoàn toàn công giữ thăng bằng, giúp dồn 100% lực vào sợi cơ ngực trên và có chốt cài bảo hiểm an toàn.",
    "formSteps": [
      "Đặt ghế dốc 30° ngay tâm máy Smith sao cho khi hạ thanh đòn chạm cách xương đòn 3–4cm.",
      "Cài hai chốt bảo hiểm bên dưới ở tầm ngực để luôn an toàn khi tập một mình.",
      "Hạ đòn chậm 2.5 giây mở cùi chỏ góc 45°–60°, sau đó đẩy mạnh lên."
    ],
    "cues": "Luôn cài chốt bảo hiểm dưới của máy Smith trước khi tập nặng.",
    "mistake": "Không đặt ghế quá xa về phía trước làm đòn hạ xuống bụng hoặc quá cao lên cổ.",
    "swapOptions": [
      "incline_db_press",
      "iso_incline_chest_press",
      "machine_chest_press"
    ],
    "swapReason": "Cực kỳ ổn định tại cả The New Gym UVK lẫn Ways Station QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=ky9eCfvuLRY",
    "videoId": "ky9eCfvuLRY",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Smith Machine Incline Bench Press Setup",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 35,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 55,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 55,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 55,
        "reps": 9,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "An toàn tuyệt đối khi đi tập 1 mình nhờ chốt hãm Máy Smith",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "assisted_chest_dip": {
    "id": "assisted_chest_dip",
    "name": "Xà Kép Ngực Dưới Có Máy Trợ Lực (Assisted Chest Dip)",
    "shortName": "Dip Ngực Máy Trợ Lực",
    "muscle": "Ngực Dưới & Tay Sau",
    "equipment": "Máy Dip/Pull-up trợ lực",
    "mascot": "assistedChestDip",
    "tier": "Tier A · Cắt Nét Ngực Dưới",
    "priorityRank": 2,
    "slotGroup": "chest_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Assisted Chin/Dip Pin-Loaded",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Xoay hai tay cầm Dip ra vị trí rộng, cắm chốt trợ lực 35–50kg (càng cắm nặng càng nhẹ).",
      "ways_ql13": "Khu Máy Đa Năng Ways 361 QL13: Hạ đệm quỳ gối trợ lực, hơi đổ người về trước 20° để ăn vào ngực dưới."
    },
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 90,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Đổ người về trước 20° · Trợ lực đệm gối",
    "tempoCue": "Hạ 2.0s — Đẩy lên 1.2s",
    "whyItWorks": "Đệm trợ lực giúp người nặng 95–115kg thực hiện động tác Dip cắt nét ngực dưới êm ái mà không quá tải khớp vai.",
    "formSteps": [
      "Cắm chốt tạ trợ lực khoảng 35–45% trọng lượng cơ thể, quỳ hai gối lên đệm nâng.",
      "Hơi đổ thân trên về phía trước 20°, hạ người tới khi cánh tay trên song song sàn.",
      "Ép ngực đẩy người lên mà không khóa cứng khớp khuỷu tay."
    ],
    "cues": "Lưu ý trên máy Assisted: mức tạ cắm càng lớn thì lực nâng đỡ càng nhiều.",
    "mistake": "Không hạ quá sâu quá 90° ở khuỷu tay.",
    "swapOptions": [
      "machine_chest_press",
      "incline_db_press",
      "pec_deck_fly"
    ],
    "swapReason": "Tạo viền ngực dưới vuông vức với trợ lực bảo vệ vai.",
    "videoUrl": "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
    "videoId": "xUm0BiZCWlQ",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Assisted Machine Chest Dips",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Trợ lực 40kg",
        "weight": 40,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Trợ lực 40kg",
        "weight": 40,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Trợ lực 35kg",
        "weight": 35,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Giảm dần số kg trợ lực theo từng tuần khi cơ ngực khỏe lên",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "cable_crossover_fly": {
    "id": "cable_crossover_fly",
    "name": "Ép Ngực Khung Cáp Đôi Từ Cao Xuống Thấp (Dual Cable Fly)",
    "shortName": "Ép Ngực Khung Cáp Đôi",
    "muscle": "Rãnh Ngực & Ngực Dưới",
    "equipment": "Khung Cáp Đôi (Dual Adjustable Pulley)",
    "mascot": "cableCrossoverFly",
    "tier": "Tier A · Cô Lập Rãnh Ngực",
    "priorityRank": 3,
    "slotGroup": "chest_fly",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Dual Adjustable Pulley / 8-Stack Cable",
    "gymSetup": {
      "tng_uvk": "Khung Cáp Đôi Đa Năng TNG 58D UVK: Chỉnh 2 ròng rọc lên nấc cao ngang đầu (nấc 14–16), bước 1 chân lên trước giữ thăng bằng.",
      "ways_ql13": "Giàn Cáp Chéo 8 Trạm Ways 361 QL13: Dùng 2 tay cầm D-Handle ở ròng rọc trên, ép hai tay gặp nhau trước bụng trên."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ròng rọc ngang đầu · Bước 1 chân trước",
    "tempoCue": "Mở 2.5s — Ép giữ 1.0s",
    "whyItWorks": "Dây cáp đôi cho phép tùy chỉnh góc kéo linh hoạt theo đúng chiều sợi cơ ngực và giữ sức căng liên tục 100% biên độ.",
    "formSteps": [
      "Chỉnh hai ròng rọc lên cao ngang đầu, nắm hai tay cầm D-Handle và bước chân trước chân sau.",
      "Hơi đổ nhẹ thân người, kéo hai tay cầm theo vòng cung xuống gặp nhau trước ngực dưới.",
      "Giữ siết ngực 1 giây rồi từ từ mở rộng cánh tay về vị trí căng ngực."
    ],
    "cues": "Giữ góc cong nhẹ cố định ở khuỷu tay suốt động tác như đang ôm thân cây.",
    "mistake": "Không biến động tác ép ngực thành đẩy tạ bằng tay sau.",
    "swapOptions": [
      "pec_deck_fly",
      "machine_chest_press"
    ],
    "swapReason": "Thay thế trực tiếp khi máy Pec Deck đang có người ngồi tập.",
    "videoUrl": "https://www.youtube.com/watch?v=iPSsUsShqZs",
    "videoId": "iPSsUsShqZs",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "High-To-Low Cable Chest Fly Form",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý mỗi bên",
        "weight": 15,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý mỗi bên",
        "weight": 15,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý mỗi bên",
        "weight": 15,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Thay thế 1:1 cho Máy Pec Deck tại cả TNG UVK và Ways QL13",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "machine_shoulder_press": {
    "id": "machine_shoulder_press",
    "name": "Máy Đẩy Vai Ngồi Có Tựa Lưng (Seated Shoulder Press Machine)",
    "shortName": "Máy Đẩy Vai Ngồi",
    "muscle": "Vai Trước & Vai Ngang",
    "equipment": "Máy đẩy vai Pin-Loaded / Plate-Loaded",
    "mascot": "machineShoulderPress",
    "tier": "Tier S · Máy Chủ Lực Cả 2 Phòng",
    "priorityRank": 2,
    "slotGroup": "shoulder_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Matrix / Impulse & Iso-Lateral Shoulder",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Máy Shoulder Press rút chốt tạ (Pin-Loaded), chọn tay cầm hướng vào nhau (Neutral Grip) cực êm khớp vai.",
      "ways_ql13": "Khu Vai Ways 361 QL13: Có cả Máy Đẩy Vai rút chốt tạ và Máy Đẩy Vai lắp bánh tạ rời Iso-Lateral."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 105,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Tay cầm ngang cằm · Lưng áp sát đệm",
    "tempoCue": "Hạ 2.0s — Đẩy thẳng 1.0s",
    "whyItWorks": "Không tốn sức nhấc cặp tạ đơn nặng lên vai (kick-up), bảo vệ tuyệt đối cột sống và chóp xoay vai.",
    "formSteps": [
      "Chỉnh chiều cao yên ghế sao cho tay cầm ở vị trí thấp nhất nằm ngang cằm/tai.",
      "Tựa sát lưng vào đệm, nắm tay cầm rộng hoặc tay cầm song song (Neutral Grip) và đẩy lên cao.",
      "Hạ chậm 2 giây về ngang tai mà không để bánh tạ chạm rầm xuống chồng tạ."
    ],
    "cues": "Dùng tay cầm song song (Neutral Grip) nếu khớp vai dễ mỏi hoặc cứng.",
    "mistake": "Không ưỡn lưng dưới rời khỏi đệm ghế khi đẩy nặng.",
    "swapOptions": [
      "dumbbell_shoulder_press",
      "smith_shoulder_press"
    ],
    "swapReason": "Một trong 5 máy kháng lực cốt lõi tại The New Gym UVK & Ways Station QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=oGZbB67Ff6Q",
    "videoId": "oGZbB67Ff6Q",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Machine Overhead Shoulder Press Setup",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 25,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Máy kháng lực cốt lõi tại cả TNG 58D UVK & Ways 361 QL13",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "smith_shoulder_press": {
    "id": "smith_shoulder_press",
    "name": "Đẩy Vai Ngồi Trước Mặt Trên Máy Smith (Smith Overhead Press)",
    "shortName": "Đẩy Vai Máy Smith",
    "muscle": "Vai Trước & Vai Ngang",
    "equipment": "Máy Smith + Ghế tựa 75°",
    "mascot": "smithShoulderPress",
    "tier": "Tier A · Tải Nặng Ổn Định",
    "priorityRank": 2,
    "slotGroup": "shoulder_press",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Smith Machine + Adjustable Bench",
    "gymSetup": {
      "tng_uvk": "Khu Máy Smith TNG 58D UVK: Dựng ghế 75° sao cho thanh đòn trượt ngay trước cằm 3cm.",
      "ways_ql13": "Khung Smith Ways 361 QL13: Cài chốt bảo hiểm ngang vai trước khi đẩy."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Ghế 75° · Đòn hạ ngang cằm trước mặt",
    "tempoCue": "Hạ 2.2s — Đẩy 1.0s",
    "whyItWorks": "Giúp kiểm soát đường đi thanh đòn chuẩn xác ngay trước mặt mà không cần giữ thăng bằng trước-sau.",
    "formSteps": [
      "Dựng ghế tựa lưng 75°–80° trong khung Smith, ngồi thử để thanh đòn đi xuống ngay trước cằm/mũi.",
      "Nắm đòn rộng hơn vai một chút, cùi chỏ hơi hướng nhẹ về phía trước.",
      "Hạ thanh đòn ngang cằm rồi đẩy thẳng lên trên đầu."
    ],
    "cues": "Tuyệt đối đẩy trước mặt, không đẩy thanh đòn sau gáy.",
    "mistake": "Không để cùi chỏ banh ngang hoàn toàn ra sau.",
    "swapOptions": [
      "dumbbell_shoulder_press",
      "machine_shoulder_press"
    ],
    "swapReason": "Thay thế tuyệt vời khi khu tạ đơn hoặc máy đẩy vai đang kín chỗ.",
    "videoUrl": "https://www.youtube.com/watch?v=oGZbB67Ff6Q",
    "videoId": "oGZbB67Ff6Q",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Seated Smith Machine Shoulder Press",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 25,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 9,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Quỹ đạo cố định giúp tập trung 100% lực vào cơ vai",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "cable_lateral_raise_single": {
    "id": "cable_lateral_raise_single",
    "name": "Kéo Cáp Đơn Bay Vai Ngang (Single-Arm Cable Lateral Raise)",
    "shortName": "Bay Vai Ngang Cáp Đơn",
    "muscle": "Vai Ngang (Căng Liên Tục)",
    "equipment": "Ròng rọc cáp thấp (Tay cầm D-Handle)",
    "mascot": "cableLateralRaise",
    "tier": "Tier S · Căng Cơ Vai Tối Đa",
    "priorityRank": 4,
    "slotGroup": "lateral_delt",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Cable Tower Low Pulley",
    "gymSetup": {
      "tng_uvk": "Khung Cáp Đôi TNG 58D UVK: Hạ ròng rọc xuống nấc ngang cổ tay/đầu gối để cơ vai giữa căng ngay từ đầu biên độ.",
      "ways_ql13": "Giàn Cáp 8 Trạm Ways 361 QL13: Một tay vịn trụ sắt, nghiêng nhẹ người ra ngoài và kéo cáp vòng sau lưng hoặc trước đùi."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ròng rọc ngang cổ tay · Kéo ngang vai",
    "tempoCue": "Nâng 1.2s — Giữ 0.5s — Hạ chậm 2.5s",
    "whyItWorks": "Khác với tạ đơn bị mất lực ở vị trí dưới đùi, dây cáp tạo lực kéo căng cực đại ngay khi bó vai giữa đang duỗi dài nhất.",
    "formSteps": [
      "Chỉnh ròng rọc cáp ở mức ngang cổ tay hoặc đầu gối, đứng xoay hông vuông góc với máy cáp.",
      "Tay trong nắm cột máy giữ cố định, tay ngoài kéo tay cầm D-Handle vươn sang ngang lên ngang vai.",
      "Hạ chậm 2.5 giây có kiểm soát rồi đổi bên."
    ],
    "cues": "Hạ ròng rọc ngang cổ tay (thay vì sát đất) để lực căng tập trung đúng điểm khỏe nhất của vai ngang.",
    "mistake": "Không chọn mức tạ quá nặng làm co rút cầu vai.",
    "swapOptions": [
      "lateral_raise",
      "machine_lateral_raise",
      "reverse_pec_deck_delt"
    ],
    "swapReason": "Tác động vào cơ vai giữa tốt hơn tạ đơn truyền thống.",
    "videoUrl": "https://www.youtube.com/watch?v=OvH73R0sHWE",
    "videoId": "OvH73R0sHWE",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Cable Lateral Raise at Wrist Height",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mỗi bên tay",
        "weight": 7.5,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mỗi bên tay",
        "weight": 7.5,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mỗi bên tay",
        "weight": 7.5,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Chỉnh ròng rọc ngang cổ tay để cô lập 100% bó vai ngang",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "machine_lateral_raise": {
    "id": "machine_lateral_raise",
    "name": "Máy Bay Vai Ngang Đệm Khuỷu Tay (Seated Lateral Raise Machine)",
    "shortName": "Máy Bay Vai Ngang",
    "muscle": "Vai Ngang Cô Lập",
    "equipment": "Máy bay vai ngang có đệm khuỷu tay",
    "mascot": "machineLateralRaise",
    "tier": "Tier S · Đặc Trưng Ways QL13",
    "priorityRank": 4,
    "slotGroup": "lateral_delt",
    "availableGyms": [
      "ways_ql13",
      "tng_uvk"
    ],
    "machineBrand": "Seated Lateral Raise Pin-Loaded",
    "gymSetup": {
      "ways_ql13": "Khu Máy Vai Ways 361 QL13: Đặt mặt ngoài khuỷu tay áp vào đệm nâng, đẩy bằng cùi chỏ thay vì gồng cổ tay.",
      "tng_uvk": "Khu Strength TNG 58D UVK: Chỉnh yên ghế sao cho trục xoay của máy trùng với khớp vai."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Đẩy bằng cùi chỏ vào đệm · Hạ cầu vai",
    "tempoCue": "Nâng 1.2s — Giữ ngang vai 1.0s — Hạ 2.5s",
    "whyItWorks": "Đệm đỡ trực tiếp ở khuỷu tay loại bỏ hoàn toàn mỏi cổ tay và cẳng tay, dồn toàn bộ áp lực vào bó vai giữa.",
    "formSteps": [
      "Chỉnh ghế sao cho khớp vai ngang trục xoay của máy, ngực tì nhẹ vào đệm (hoặc lưng tựa đệm).",
      "Đặt cẳng tay/khuỷu tay vào hai đệm mút, dùng lực cùi chỏ nâng hai bên lên ngang vai.",
      "Giữ 1 giây ở đỉnh rồi hạ chậm 2.5 giây."
    ],
    "cues": "Thả lỏng bàn tay, chỉ tập trung đẩy hai khuỷu tay sang ngang.",
    "mistake": "Không nhún vai lên tai khi nâng.",
    "swapOptions": [
      "lateral_raise",
      "cable_lateral_raise_single"
    ],
    "swapReason": "Máy cô lập vai ngang cực ăn cơ tại Ways Station QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=OvH73R0sHWE",
    "videoId": "OvH73R0sHWE",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Machine Lateral Raise Technique",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "D",
        "prev": "Drop Set nhẹ",
        "weight": 15,
        "reps": 15,
        "effort": "max",
        "done": false
      }
    ],
    "progressionBadge": "Loại bỏ mỏi cổ tay, cô lập trực diện cơ vai ngang",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "reverse_pec_deck_delt": {
    "id": "reverse_pec_deck_delt",
    "name": "Máy Ép Vai Sau Ngược (Reverse Pec Deck Rear Delt Fly)",
    "shortName": "Máy Ép Vai Sau",
    "muscle": "Vai Sau & Lưng Trên (Chống Gù)",
    "equipment": "Máy Pec Deck / Rear Delt 2-in-1",
    "mascot": "reversePecDeck",
    "tier": "Tier A · Có Ở Cả 2 Phòng",
    "priorityRank": 4,
    "slotGroup": "rear_delt_pull",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "2-in-1 Pec Deck / Rear Delt Machine",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Đưa 2 tay đòn máy Pec Deck về nấc sát nhau nhất (nấc 1), ngồi quay ngực úp vào đệm ghế.",
      "ways_ql13": "Khu Máy Ngực/Vai Ways 361 QL13: Chỉnh tay đòn về vị trí Rear Delt, nắm tay cầm ngang tầm vai."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ngực tì đệm · Mở rộng cánh tay ra sau",
    "tempoCue": "Mở 1.2s — Giữ 1.0s — Khép 2.0s",
    "whyItWorks": "Làm đầy bó cơ vai sau giúp bờ vai 3D tròn trịa và kéo thẳng hai vai bị gù do ngồi máy tính.",
    "formSteps": [
      "Chỉnh hai tay đòn máy Pec Deck về sát nhau ở phía trước, ngồi quay ngực áp sát vào đệm tựa.",
      "Nắm hai tay cầm ngang vai, giữ tay hơi cong nhẹ rồi mở rộng hai cánh tay ra phía sau.",
      "Dừng lại khi cánh tay ngang thân người mà không ép bả vai quá mức, sau đó trả tạ chậm."
    ],
    "cues": "Tưởng tượng đẩy hai mu bàn tay ra xa sang hai bên tường thay vì ép hai bả vai vào nhau.",
    "mistake": "Không ngửa cổ hoặc dùng lực giật lưng.",
    "swapOptions": [
      "lateral_raise",
      "rope_face_pull",
      "cable_lateral_raise_single"
    ],
    "swapReason": "Tận dụng ngay máy Pec Deck 2-in-1 sẵn có ở cả TNG UVK & Ways QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=iPSsUsShqZs",
    "videoId": "iPSsUsShqZs",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Reverse Pec Deck For 3D Rear Delts",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 30,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 30,
        "reps": 14,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 30,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Tạo độ tròn 3D cho vai sau & mở ngực chống gù lưng",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "overhead_cable_tricep_ext": {
    "id": "overhead_cable_tricep_ext",
    "name": "Duỗi Tay Sau Qua Đầu Với Cáp (Overhead Rope Triceps Extension)",
    "shortName": "Duỗi Tay Sau Qua Đầu",
    "muscle": "Đầu Dài Cơ Tay Sau (Long Head)",
    "equipment": "Máy cáp + Dây thừng",
    "mascot": "overheadTricepExt",
    "tier": "Tier A · Phát Triển Độ Dày Tay Sau",
    "priorityRank": 5,
    "slotGroup": "triceps",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Cable Pulley + Rope Attachment",
    "gymSetup": {
      "tng_uvk": "Khung Cáp Đôi TNG 58D UVK: Đặt ròng rọc ngang hông/lưng giữa, quay lưng lại máy cáp và duỗi dây thừng qua đầu.",
      "ways_ql13": "Giàn Cáp 8 Trạm Ways 361 QL13: Bước 1 chân lên trước giữ vững trọng tâm, duỗi thẳng cẳng tay về phía trước trên."
    },
    "repRange": [
      10,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Quay lưng vào cáp · Cùi chỏ hướng trước",
    "tempoCue": "Hạ sau gáy 2.2s — Duỗi thẳng 1.0s",
    "whyItWorks": "Đưa cánh tay qua đầu kéo giãn tối đa đầu dài cơ tam đầu (chiếm phần lớn khối lượng bắp tay sau), kích thích phát triển cơ vượt trội.",
    "formSteps": [
      "Gắn dây thừng vào ròng rọc ngang thắt lưng hoặc ngang vai, quay lưng lại với cột cáp.",
      "Bước 1 chân lên trước, đổ người 30°, giữ cố định hai cùi chỏ ngang tai.",
      "Duỗi thẳng hai cẳng tay đưa dây thừng vươn qua đầu rồi từ từ hạ sâu ra sau gáy."
    ],
    "cues": "Cảm nhận cơ tay sau được kéo giãn sâu ở nhịp hạ ra sau đầu.",
    "mistake": "Không để hai cùi chỏ bè rộng quá mức sang hai bên.",
    "swapOptions": [
      "tricep_rope_pushdown",
      "seated_dip_tricep_machine"
    ],
    "swapReason": "Tác động sâu vào đầu dài cơ tay sau bổ sung hoàn hảo cho bài Pushdown.",
    "videoUrl": "https://www.youtube.com/watch?v=TZw-AZS-r9M",
    "videoId": "TZw-AZS-r9M",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Overhead Cable Triceps Extension Hypertrophy",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Kéo giãn đầu dài cơ tay sau giúp bắp tay dày khỏe nhanh nhất",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "seated_dip_tricep_machine": {
    "id": "seated_dip_tricep_machine",
    "name": "Máy Đẩy Tay Sau Ngồi / Dip Trợ Lực (Seated Triceps Dip Machine)",
    "shortName": "Máy Đẩy Tay Sau Ngồi",
    "muscle": "Tay Sau & Ngực Dưới",
    "equipment": "Máy Seated Dip / Assisted Dip",
    "mascot": "seatedDipMachine",
    "tier": "Tier B · Tải Nặng Tay Sau",
    "priorityRank": 5,
    "slotGroup": "triceps",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Seated Triceps Press / Assisted Dip",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Xoay tay cầm máy Dip vào nấc hẹp, giữ lưng thẳng đứng để lực dồn vào tay sau.",
      "ways_ql13": "Khu Máy Tay Ways 361 QL13: Tựa sát lưng vào ghế, khép cùi chỏ sát sườn và đẩy tay cầm xuống hết cỡ."
    },
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Tay cầm hẹp · Giữ thân người thẳng đứng",
    "tempoCue": "Đẩy xuống 1.0s — Giữ đáy 1.0s — Lên 2.0s",
    "whyItWorks": "Cho phép tập cơ tay sau với tải trọng lớn và an toàn tuyệt đối cho cổ tay.",
    "formSteps": [
      "Xoay hai tay cầm về chế độ hẹp, giữ thân trên thẳng đứng (không đổ người về trước như khi tập ngực).",
      "Khép sát hai khuỷu tay vào mạn sườn, ấn mạnh tay cầm xuống cho tới khi tay thẳng.",
      "Hạ chậm có kiểm soát về vị trí khuỷu tay vuông góc 90°."
    ],
    "cues": "Thân người càng thẳng đứng và cùi chỏ càng khép sát sườn thì lực càng vào tay sau.",
    "mistake": "Không nhún cầu vai lên tai khi trả tạ.",
    "swapOptions": [
      "tricep_rope_pushdown",
      "overhead_cable_tricep_ext"
    ],
    "swapReason": "Đổi gió khi giàn cáp đang đông người tập.",
    "videoUrl": "https://www.youtube.com/watch?v=TZw-AZS-r9M",
    "videoId": "TZw-AZS-r9M",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Machine Triceps Dip Technique",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "An toàn khớp khuỷu tay và cổ tay cho người nặng cân",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "iso_high_row_pulldown": {
    "id": "iso_high_row_pulldown",
    "name": "Máy Kéo Xô Cao Lắp Tạ Rời (Iso-Lateral High Row / Pulldown)",
    "shortName": "Máy Kéo Xô Lắp Tạ Rời",
    "muscle": "Lưng Xô Rộng & Xô Dưới",
    "equipment": "Máy Kéo Xô Plate-Loaded",
    "mascot": "isoHighRow",
    "tier": "Tier S · Đặc Trưng Ways QL13",
    "priorityRank": 1,
    "slotGroup": "vertical_pull",
    "availableGyms": [
      "ways_ql13"
    ],
    "machineBrand": "Hammer / Iso-Lateral High Row",
    "gymSetup": {
      "ways_ql13": "Khu Plate-Loaded tầng 4 Ways 361 QL13: Ngồi ép ngực vào đệm trước, khóa đùi và kéo hai tay đòn độc lập theo cung chéo xuống hông.",
      "tng_uvk": "Tại TNG 58D UVK dùng Máy Kéo Xô Cáp Cao (Lat Pulldown) hoặc Kéo Xô Tay Cầm Hẹp."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Ngực áp sát đệm · Kéo cùi chỏ xuống hông",
    "tempoCue": "Kéo mạnh 1.2s — Siết xô 1.0s — Thả 2.2s",
    "whyItWorks": "Đệm ngực giữ cố định thân người giúp cô lập từng bên cơ xô theo quỹ đạo hình vòng cung tự nhiên nhất.",
    "formSteps": [
      "Lắp bánh tạ đều hai bên, chỉnh chiều cao ghế và đệm ngực sao cho tay vươn cao thoải mái.",
      "Tì ngực vào đệm, kéo hai tay cầm xuống và ra sau bằng lực dẫn của khuỷu tay.",
      "Giữ siết cơ xô dưới 1 giây rồi thả lên chậm cho tới khi xô giãn hết biên độ."
    ],
    "cues": "Có thể kéo từng tay một (Unilateral) để cảm nhận cơ xô sâu hơn.",
    "mistake": "Không ngả người rời khỏi đệm ngực để giật tạ.",
    "swapOptions": [
      "lat_pulldown",
      "close_neutral_pulldown",
      "assisted_pull_up"
    ],
    "swapReason": "Máy tập lưng xô ăn cơ bậc nhất tại Ways Station 361 Quốc Lộ 13.",
    "videoUrl": "https://www.youtube.com/watch?v=SALxEARiMkw",
    "videoId": "SALxEARiMkw",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Iso-Lateral High Row & Pulldown Form",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động 20kg/bên",
        "weight": 40,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý 30kg/bên",
        "weight": 60,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý 30kg/bên",
        "weight": 60,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý 30kg/bên",
        "weight": 60,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Máy Plate-Loaded cô lập lưng xô đặc trưng tại Ways Station QL13",
    "zoneCategory": "plate_loaded",
    "zoneLabel": "Khu Lắp Tạ Rời (Plate-Loaded)"
  },
  "close_neutral_pulldown": {
    "id": "close_neutral_pulldown",
    "name": "Kéo Xô Cáp Tay Cầm Hẹp / Chữ V (Close-Grip Neutral Pulldown)",
    "shortName": "Kéo Xô Tay Cầm Hẹp",
    "muscle": "Xô Dưới & Độ Dày Lưng",
    "equipment": "Máy kéo xô + Tay cầm V-Bar / MAG",
    "mascot": "closeNeutralPulldown",
    "tier": "Tier S · Có Ở Cả 2 Phòng",
    "priorityRank": 1,
    "slotGroup": "vertical_pull",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Lat Pulldown + V-Grip / MAG Grip",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Tháo thanh đòn dài, móc tay cầm đôi chữ V (V-Bar) vào ròng rọc máy Lat Pulldown.",
      "ways_ql13": "Khu Máy Cáp Ways 361 QL13: Dùng thanh cầm hẹp Neutral Grip hoặc V-Bar kéo sát về ngực dưới."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Hai lòng bàn tay hướng vào nhau · Kéo về ức",
    "tempoCue": "Kéo 1.2s — Siết xô dưới 1.0s — Thả 2.2s",
    "whyItWorks": "Tư thế hai lòng bàn tay hướng vào nhau đặt khớp vai ở góc an toàn nhất và kéo dài biên độ co rút của phần cơ xô dưới.",
    "formSteps": [
      "Gắn tay cầm chữ V (hoặc thanh cầm hẹp song song) vào cáp cao, khóa chặt đùi dưới đệm.",
      "Ưỡn cao lồng ngực, hơi ngả lưng 15°, kéo tay cầm chạm nhẹ vùng xương ức dưới.",
      "Ép sát hai cùi chỏ dọc mạn sườn rồi thả chậm lên cao."
    ],
    "cues": "Giữ cùi chỏ đi sát trước sườn để kích hoạt phần xô dưới sát eo.",
    "mistake": "Không cúi gập vai về phía trước khi kết thúc nhịp kéo.",
    "swapOptions": [
      "lat_pulldown",
      "iso_high_row_pulldown",
      "assisted_pull_up"
    ],
    "swapReason": "Biến thể kéo xô êm khớp vai nhất tại cả 2 phòng tập.",
    "videoUrl": "https://www.youtube.com/watch?v=SALxEARiMkw",
    "videoId": "SALxEARiMkw",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Close-Grip Neutral Lat Pulldown Mechanics",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 35,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 52,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 52,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 52,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Tác động sâu vào phần xô dưới giúp lưng dày và gọn eo",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "assisted_pull_up": {
    "id": "assisted_pull_up",
    "name": "Hít Xà Đơn Có Máy Đệm Quỳ Trợ Lực (Assisted Pull-Up)",
    "shortName": "Hít Xà Máy Trợ Lực",
    "muscle": "Toàn Bộ Lưng Xô & Tay Trước",
    "equipment": "Máy Assisted Chin/Dip",
    "mascot": "assistedPullUp",
    "tier": "Tier A · Luyện Hít Xà Chuẩn",
    "priorityRank": 1,
    "slotGroup": "vertical_pull",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Assisted Chin-Up / Dip Station",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Cắm chốt trợ lực 45–55kg, quỳ gối lên đệm và nắm tay cầm rộng trên đỉnh máy.",
      "ways_ql13": "Khu Đa Năng Ways 361 QL13: Dùng tay cầm song song hoặc rộng vai, kiểm soát nhịp hạ 2.5 giây."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Đệm quỳ nâng đỡ · Kéo ngực chạm xà",
    "tempoCue": "Kéo lên 1.2s — Hạ chậm 2.5s",
    "whyItWorks": "Cho phép người nặng 95–115kg tập chuẩn động tác Hít xà đơn mà không bị quá tải khớp vai và gân khuỷu tay.",
    "formSteps": [
      "Cắm chốt tạ trợ lực (ví dụ 45kg: máy sẽ nâng bớt 45kg trọng lượng cơ thể).",
      "Quỳ hai gối lên đệm, nắm thanh xà rộng hơn vai, hạ bả vai rồi kéo ngực lên ngang xà.",
      "Hạ người xuống chậm 2.5 giây cho tới khi tay duỗi hết biên độ."
    ],
    "cues": "Mỗi 2 tuần giảm bớt 1 nấc tạ trợ lực để tiến tới hít xà tự do.",
    "mistake": "Không thả rơi người đột ngột ở điểm dưới cùng.",
    "swapOptions": [
      "lat_pulldown",
      "iso_high_row_pulldown",
      "close_neutral_pulldown"
    ],
    "swapReason": "Có sẵn tại cả The New Gym 58D UVK và Ways Station 361 QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=SALxEARiMkw",
    "videoId": "SALxEARiMkw",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Use The Assisted Pull-Up Machine",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Trợ lực 45kg",
        "weight": 45,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Trợ lực 45kg",
        "weight": 45,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Trợ lực 40kg",
        "weight": 40,
        "reps": 9,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Rèn sức mạnh hít xà thực tế an toàn cho người >95kg",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "chest_supported_tbar_row": {
    "id": "chest_supported_tbar_row",
    "name": "Máy Chèo Lưng T-Bar Có Đệm Tựa Ngực (Chest-Supported T-Bar Row)",
    "shortName": "Chèo Lưng T-Bar Tựa Ngực",
    "muscle": "Lưng Giữa Dày & Xô",
    "equipment": "Máy T-Bar Row có đệm ngực",
    "mascot": "tbarRow",
    "tier": "Tier S · Đặc Trưng Ways QL13",
    "priorityRank": 2,
    "slotGroup": "horizontal_row",
    "availableGyms": [
      "ways_ql13"
    ],
    "machineBrand": "Chest-Supported Plate-Loaded T-Bar Row",
    "gymSetup": {
      "ways_ql13": "Khu Lưng tầng 4 Ways 361 QL13: Nằm tì ngực lên đệm nghiêng, lắp bánh tạ 15–20kg ở đầu máy, chọn tay cầm rộng hoặc hẹp.",
      "tng_uvk": "Tại TNG 58D UVK dùng Máy Chèo Lưng Ngồi Tựa Ngực (Seated Row Machine) hoặc Chèo Tạ Đơn Tựa Ghế Dốc 30°."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Ngực nằm trên đệm · Ép chặt 2 bả vai",
    "tempoCue": "Kéo 1.2s — Giữ đỉnh 1.0s — Thả giãn 2.2s",
    "whyItWorks": "Xây dựng độ dày khối cơ lưng giữa cực mạnh giống Barbell Row nhưng đệm ngực triệt tiêu 100% áp lực dội lên đốt sống L4-L5.",
    "formSteps": [
      "Đặt hai bàn chân vững trên bệ, nằm áp sát lồng ngực lên đệm nghiêng của máy T-Bar.",
      "Nắm hai tay cầm, kéo tạ lên cao bằng cách khép chặt hai xương bả vai lại với nhau.",
      "Thả tạ xuống chậm để hai bả vai mở rộng tối đa ở đáy động tác."
    ],
    "cues": "Giữ bụng và ngực luôn dính chặt vào đệm, không nhổm người giật tạ.",
    "mistake": "Không lắp quá nặng làm biên độ kéo bị ngắn một nửa.",
    "swapOptions": [
      "seated_cable_row",
      "machine_seated_row",
      "one_arm_db_row"
    ],
    "swapReason": "Máy tập độ dày lưng an toàn cột sống tốt nhất tại Ways Station QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=UCXxvVItLoM",
    "videoId": "UCXxvVItLoM",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Chest-Supported T-Bar Row For Back Thickness",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 20,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 35,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 35,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 35,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "0% áp lực thắt lưng · Tối ưu độ dày lưng giữa tại Ways QL13",
    "zoneCategory": "plate_loaded",
    "zoneLabel": "Khu Lắp Tạ Rời (Plate-Loaded)"
  },
  "machine_seated_row": {
    "id": "machine_seated_row",
    "name": "Máy Chèo Lưng Ngồi Tựa Ngực Chốt Tạ (Seated Row Machine)",
    "shortName": "Máy Chèo Lưng Tựa Ngực",
    "muscle": "Lưng Giữa & Xô Dưới",
    "equipment": "Máy Seated Row có đệm ngực",
    "mascot": "machineSeatedRow",
    "tier": "Tier S · Máy Cốt Lõi Cả 2 Phòng",
    "priorityRank": 2,
    "slotGroup": "horizontal_row",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Selectorized Seated Row Machine",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Một trong 5 máy kháng lực cốt lõi của The New Gym — chỉnh đệm ngực vừa tầm tay vươn thẳng.",
      "ways_ql13": "Khu Máy Lưng Ways 361 QL13: Chỉnh yên ghế để đệm tì ngang xương ức dưới."
    },
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 90,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ngực tì đệm · Kéo cùi chỏ ra sau hông",
    "tempoCue": "Kéo 1.2s — Siết bả vai 1.0s — Thả 2.0s",
    "whyItWorks": "Điểm tựa ngực cố định giúp người mới và người nặng cân cô lập hoàn toàn cơ lưng mà không mỏi lưng dưới.",
    "formSteps": [
      "Chỉnh chiều cao yên ghế và khoảng cách đệm ngực sao cho khi nắm tay cầm, đầu ngón tay vừa chạm tới.",
      "Tì ngực vào đệm, kéo tay cầm về phía sau và ép sát hai xương bả vai.",
      "Thả tạ về trước có kiểm soát 2 giây."
    ],
    "cues": "Hạ thấp vai khỏi tai trước khi bắt đầu kéo.",
    "mistake": "Không dùng đà ngửa lưng ra khỏi đệm ngực.",
    "swapOptions": [
      "seated_cable_row",
      "chest_supported_tbar_row",
      "one_arm_db_row"
    ],
    "swapReason": "Máy tập lưng an toàn nhất tại Khu Strength The New Gym 58D UVK.",
    "videoUrl": "https://www.youtube.com/watch?v=UCXxvVItLoM",
    "videoId": "UCXxvVItLoM",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Chest-Supported Machine Row Technique",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 45,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Thuộc Top 5 máy kháng lực cốt lõi của The New Gym UVK",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "one_arm_db_row": {
    "id": "one_arm_db_row",
    "name": "Chèo Tạ Đơn 1 Tay Tựa Ghế (Single-Arm Dumbbell Row)",
    "shortName": "Chèo Tạ Đơn 1 Tay",
    "muscle": "Lưng Xô & Lưng Giữa",
    "equipment": "Tạ đơn + Ghế phẳng",
    "mascot": "oneArmDbRow",
    "tier": "Tier A · Có Ở Cả 2 Phòng",
    "priorityRank": 2,
    "slotGroup": "horizontal_row",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Dumbbell Rack + Flat Bench",
    "gymSetup": {
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Chống 1 tay và 1 gối lên ghế phẳng, kéo tạ đơn theo đường vòng cung về phía hông.",
      "ways_ql13": "Dàn Tạ Đơn Ways 361 QL13: Tựa tay lên kệ tạ hoặc ghế phẳng, giữ lưng song song mặt sàn."
    },
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 90,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Tay chống ghế · Kéo tạ về túi quần",
    "tempoCue": "Kéo vòng cung 1.2s — Hạ giãn 2.2s",
    "whyItWorks": "Tập từng bên giúp cân bằng lực hai bên lưng xô trong khi tay chống ghế đỡ toàn bộ trọng lượng cho cột sống.",
    "formSteps": [
      "Đặt một đầu gối và bàn tay cùng bên lên ghế phẳng, giữ lưng phẳng song song với sàn.",
      "Tay kia cầm tạ đơn, kéo cùi chỏ theo đường vòng cung về phía túi quần sau (hông).",
      "Hạ tạ xuống chậm cho tới khi bả vai được kéo giãn sâu rồi lặp lại."
    ],
    "cues": "Tưởng tượng cưa gỗ kéo tạ về hông thay vì nhấc thẳng tạ lên ngực.",
    "mistake": "Không xoay vặn cột sống để giật tạ quá nặng.",
    "swapOptions": [
      "seated_cable_row",
      "machine_seated_row",
      "chest_supported_tbar_row"
    ],
    "swapReason": "Luôn tập được ngay tại Khu Free Weight khi các máy cáp đang bận.",
    "videoUrl": "https://www.youtube.com/watch?v=UCXxvVItLoM",
    "videoId": "UCXxvVItLoM",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Do One-Arm Dumbbell Rows Properly",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mỗi bên tay",
        "weight": 22,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mỗi bên tay",
        "weight": 22,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mỗi bên tay",
        "weight": 22,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Chống tay lên ghế bảo vệ lưng dưới 100%",
    "zoneCategory": "free_weight",
    "zoneLabel": "Khu Tạ Đơn & Ghế Rời"
  },
  "rope_face_pull": {
    "id": "rope_face_pull",
    "name": "Kéo Cáp Dây Thừng Về Mặt (High-Pulley Rope Face Pull)",
    "shortName": "Kéo Cáp Face Pull",
    "muscle": "Vai Sau & Chóp Xoay Vai",
    "equipment": "Máy cáp cao + Dây thừng",
    "mascot": "ropeFacePull",
    "tier": "Tier A · Bảo Vệ Khớp Vai",
    "priorityRank": 3,
    "slotGroup": "rear_delt_pull",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Adjustable Cable Pulley + Rope",
    "gymSetup": {
      "tng_uvk": "Khung Cáp Đôi TNG 58D UVK: Đặt ròng rọc ngang trán, kéo tách dây thừng về hai bên tai.",
      "ways_ql13": "Giàn Cáp 8 Trạm Ways 361 QL13: Nắm ngược dây thừng (ngón cái hướng về sau), kéo xoay ngoài khớp vai."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Ròng rọc ngang trán · Xoay mở hai nắm tay",
    "tempoCue": "Kéo 1.2s — Giữ 1.5s — Thả 2.0s",
    "whyItWorks": "Cân bằng lại khớp vai sau các bài đẩy nặng, làm khỏe nhóm cơ chóp xoay (Rotator Cuff) và chữa tư thế gù vai.",
    "formSteps": [
      "Chỉnh ròng rọc ngang mặt/trán, nắm hai đầu dây thừng và lùi lại 1.5 bước.",
      "Kéo dây thừng về phía trán đồng thời tách hai nắm tay ra hai bên tai (như tư thế gồng bắp tay đôi).",
      "Giữ siết vai sau và lưng trên 1.5 giây rồi thả chậm."
    ],
    "cues": "Đưa hai nắm tay về ngang tai sao cho cẳng tay vuông góc với sàn ở điểm cuối.",
    "mistake": "Không lắp tạ quá nặng rồi ngả cả người kéo bằng lưng dưới.",
    "swapOptions": [
      "reverse_pec_deck_delt",
      "seated_cable_row"
    ],
    "swapReason": "Bài tập vàng bảo vệ khớp vai lâu dài cho mọi gymer.",
    "videoUrl": "https://www.youtube.com/watch?v=UCXxvVItLoM",
    "videoId": "UCXxvVItLoM",
    "videoAuthor": "ATHLEAN-X",
    "videoTitle": "How To Do Face Pulls For Shoulder Health",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 15,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 15,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 20,
        "reps": 15,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Làm khỏe chóp xoay vai & chống gù lưng dân văn phòng",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "preacher_curl_machine": {
    "id": "preacher_curl_machine",
    "name": "Máy Cuốn Tay Trước Tựa Đệm Preacher (Preacher Curl Machine)",
    "shortName": "Máy Cuốn Tay Trước Preacher",
    "muscle": "Đỉnh Bắp Tay Trước (Biceps Peak)",
    "equipment": "Máy Preacher Curl / Ghế Scott EZ",
    "mascot": "preacherCurl",
    "tier": "Tier A · Cô Lập Tay Trước Tuyệt Đối",
    "priorityRank": 3,
    "slotGroup": "biceps",
    "availableGyms": [
      "ways_ql13",
      "tng_uvk"
    ],
    "machineBrand": "Preacher Curl Machine / Scott Bench",
    "gymSetup": {
      "ways_ql13": "Khu Máy Tay Ways 361 QL13: Có cả Máy Preacher Curl rút chốt tạ lẫn Ghế Scott cuốn thanh đòn cong EZ.",
      "tng_uvk": "Khu Free Weight TNG 58D UVK: Dùng Ghế Preacher Scott Bench với thanh đòn cong EZ hoặc tạ đơn."
    },
    "repRange": [
      10,
      14
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Nách áp sát đỉnh đệm · Không đung đưa lưng",
    "tempoCue": "Cuốn 1.2s — Siết 1.0s — Hạ chậm 2.5s",
    "whyItWorks": "Đệm nghiêng khóa hoàn toàn bắp tay trên, không cho phép ăn gian bằng đà lưng hay vai, buộc 100% cơ nhị đầu làm việc.",
    "formSteps": [
      "Chỉnh chiều cao yên ghế sao cho nách và toàn bộ mặt sau cánh tay áp sát lên đệm nghiêng.",
      "Nắm tay cầm cong (EZ Grip), cuốn lên cao và siết chặt bắp tay trước 1 giây.",
      "Hạ chậm 2.5 giây có kiểm soát, dừng khi khuỷu tay duỗi khoảng 95%."
    ],
    "cues": "Giữ bắp tay trên dán chặt vào đệm suốt quá trình hạ và cuốn.",
    "mistake": "Không nhổm mông khỏi ghế khi hạ tạ xuống đáy.",
    "swapOptions": [
      "dumbbell_curl_lateral",
      "cable_rope_hammer_curl"
    ],
    "swapReason": "Cô lập bắp tay trước chuẩn xác nhất tại Ways Station QL13 & TNG UVK.",
    "videoUrl": "https://www.youtube.com/watch?v=soxrZlIl35U",
    "videoId": "soxrZlIl35U",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Preacher Curl Mechanics & Bicep Hypertrophy",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 25,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 25,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 25,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Khóa cố định khuỷu tay trên đệm Preacher giúp tạo đỉnh bắp tay",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "cable_rope_hammer_curl": {
    "id": "cable_rope_hammer_curl",
    "name": "Cuốn Tay Trước Cáp Dây Thừng Kiểu Búa (Cable Rope Hammer Curl)",
    "shortName": "Cuốn Cáp Dây Thừng Tay Trước",
    "muscle": "Tay Trước & Cơ Cẳng Tay (Brachialis)",
    "equipment": "Ròng rọc cáp thấp + Dây thừng",
    "mascot": "cableHammerCurl",
    "tier": "Tier B · Có Ở Cả 2 Phòng",
    "priorityRank": 3,
    "slotGroup": "biceps",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Low Pulley Cable + Rope",
    "gymSetup": {
      "tng_uvk": "Khung Cáp Đôi TNG 58D UVK: Gắn dây thừng vào ròng rọc sát sàn, hai lòng bàn tay hướng vào nhau.",
      "ways_ql13": "Giàn Cáp 8 Trạm Ways 361 QL13: Khóa chặt cùi chỏ sát sườn, cuốn dây thừng lên ngang ngực."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Cầm dọc dây thừng · Khóa cùi chỏ sát sườn",
    "tempoCue": "Cuốn 1.0s — Xoay nhẹ đỉnh 1.0s — Hạ 2.2s",
    "whyItWorks": "Tác động mạnh vào cơ Brachialis nằm dưới cơ nhị đầu, đẩy bắp tay nhìn to dày hơn từ góc nhìn ngang và cực êm cổ tay.",
    "formSteps": [
      "Gắn dây thừng vào ròng rọc cáp thấp nhất, đứng thẳng cách máy nửa bước.",
      "Nắm hai đầu dây thừng hướng lòng bàn tay vào nhau, ép sát khuỷu tay vào sườn.",
      "Cuốn dây thừng lên sát ngực trên, giữ 1 giây rồi hạ chậm."
    ],
    "cues": "Tư thế cầm dọc (Hammer Grip) loại bỏ hoàn toàn đau mỏi cổ tay.",
    "mistake": "Không đưa khuỷu tay vung về phía trước khi cuốn.",
    "swapOptions": [
      "dumbbell_curl_lateral",
      "preacher_curl_machine"
    ],
    "swapReason": "Tập ngay tại giàn cáp sau khi xong các bài kéo lưng.",
    "videoUrl": "https://www.youtube.com/watch?v=soxrZlIl35U",
    "videoId": "soxrZlIl35U",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Cable Rope Hammer Curl Technique",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 22,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 22,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "D",
        "prev": "Drop Set nhẹ",
        "weight": 15,
        "reps": 15,
        "effort": "max",
        "done": false
      }
    ],
    "progressionBadge": "Làm dày bắp tay và cẳng tay với áp lực cáp liên tục",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "hack_squat_machine": {
    "id": "hack_squat_machine",
    "name": "Máy Squat Nghiêng Tựa Lưng Lắp Tạ (Linear Hack Squat Machine)",
    "shortName": "Máy Hack Squat Tựa Lưng",
    "muscle": "Đùi Trước & Cơ Mông",
    "equipment": "Máy Hack Squat lắp bánh tạ",
    "mascot": "hackSquat",
    "tier": "Tier S · Đặc Trưng Ways QL13",
    "priorityRank": 1,
    "slotGroup": "quad_compound",
    "availableGyms": [
      "ways_ql13"
    ],
    "machineBrand": "Linear Hack Squat Plate-Loaded",
    "gymSetup": {
      "ways_ql13": "Khu Chân tầng 4 Ways 361 QL13: Đặt vai dưới hai đệm mút, lưng dưới dán chặt vào mặt đệm trượt, đặt bàn chân hơi cao lên bàn đạp để giảm áp lực gối.",
      "tng_uvk": "Tại TNG 58D UVK thực hiện biến thể Hack Squat Tựa Lưng Trên Máy Smith hoặc Máy Đạp Đùi 45°."
    },
    "repRange": [
      8,
      12
    ],
    "defaultRestSec": 150,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Lưng dán chặt đệm · Bàn chân đặt giữa-cao",
    "tempoCue": "Hạ 2.5s — Đạp lên 1.2s",
    "whyItWorks": "Mô phỏng hoàn hảo chuyển động Squat nhưng toàn bộ cột sống được khóa cố định trên mặt phẳng đệm nghiêng.",
    "formSteps": [
      "Tựa toàn bộ lưng và mông vào đệm trượt, đặt vai dưới hai gối đệm, mở chốt an toàn hai bên.",
      "Đặt hai bàn chân rộng bằng vai ở nửa trên bàn đạp để bảo vệ khớp gối.",
      "Hạ chậm tới khi đùi vuông góc 90° với cẳng chân rồi đạp mạnh qua gót chân đẩy lên."
    ],
    "cues": "Giữ lưng dưới ép sát vào đệm suốt từ đầu đến cuối hiệp.",
    "mistake": "Không khóa cứng khớp gối ở đỉnh động tác.",
    "swapOptions": [
      "leg_press_45",
      "smith_box_squat",
      "seated_leg_extension"
    ],
    "swapReason": "Máy tập đùi đỉnh cao tại khu chân Ways Station 361 Quốc Lộ 13.",
    "videoUrl": "https://www.youtube.com/watch?v=yZmx_Ac3880",
    "videoId": "yZmx_Ac3880",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "How To Hack Squat For Quads & Knee Safety",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động 20kg/bên",
        "weight": 40,
        "reps": 10,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý 35kg/bên",
        "weight": 70,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý 35kg/bên",
        "weight": 70,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý 35kg/bên",
        "weight": 70,
        "reps": 9,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Cỗ máy phát triển cơ đùi số 1 tại Ways Station 361 QL13",
    "zoneCategory": "plate_loaded",
    "zoneLabel": "Khu Lắp Tạ Rời (Plate-Loaded)"
  },
  "smith_box_squat": {
    "id": "smith_box_squat",
    "name": "Squat Máy Smith Chân Đặt Trước (Smith Machine Hack/Box Squat)",
    "shortName": "Squat Máy Smith Êm Gối",
    "muscle": "Đùi Trước & Cơ Mông",
    "equipment": "Máy Smith + Ghế phẳng làm mốc",
    "mascot": "smithBoxSquat",
    "tier": "Tier S · Chuẩn Giáo Án TNG UVK",
    "priorityRank": 1,
    "slotGroup": "quad_compound",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Counter-Balanced Smith Machine",
    "gymSetup": {
      "tng_uvk": "Khu Máy Smith TNG 58D UVK: Đặt hai bàn chân tiến về phía trước thanh đòn 20–25cm (Smith Hack Squat) và đặt 1 ghế phẳng phía sau mông làm mốc độ sâu an toàn.",
      "ways_ql13": "Khung Smith Ways 361 QL13: Cài chốt bảo hiểm ngang hông, tựa lưng vào thanh đòn và ngồi xuống chạm nhẹ ghế."
    },
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 120,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Bàn chân bước lên trước 20cm · Chạm nhẹ ghế",
    "tempoCue": "Hạ 2.5s chạm ghế — Đứng lên 1.2s",
    "whyItWorks": "Đặt bàn chân tiến về trước trên máy Smith giữ ống đồng gần như thẳng đứng, giảm 50% lực cắt lên dây chằng khớp gối.",
    "formSteps": [
      "Đặt thanh đòn máy Smith lên phần cơ cầu vai, bước hai bàn chân về phía trước khoảng 20cm.",
      "Đặt một ghế tập phẳng phía sau làm điểm chuẩn độ sâu vuông góc 90°.",
      "Từ từ hạ hông xuống chạm nhẹ vào mặt ghế rồi đạp gót chân đứng thẳng lên."
    ],
    "cues": "Tựa nhẹ lưng vào thanh đòn Smith khi hạ xuống để giữ thân người thẳng đứng.",
    "mistake": "Không thả rơi mông đập mạnh xuống ghế.",
    "swapOptions": [
      "leg_press_45",
      "hack_squat_machine",
      "seated_leg_extension"
    ],
    "swapReason": "Bài tập chân trên máy Smith được chính The New Gym khuyến nghị trong giáo án.",
    "videoUrl": "https://www.youtube.com/watch?v=yZmx_Ac3880",
    "videoId": "yZmx_Ac3880",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Smith Machine Squat Foot Placement For Knee Health",
    "defaultSets": [
      {
        "type": "W",
        "prev": "Khởi động khớp",
        "weight": 30,
        "reps": 12,
        "effort": "easy",
        "done": false
      },
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 50,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Giữ ống đồng thẳng đứng, bảo vệ sụn chêm khớp gối tối đa",
    "zoneCategory": "cable_smith",
    "zoneLabel": "Khu Khung Cáp & Máy Smith"
  },
  "seated_leg_extension": {
    "id": "seated_leg_extension",
    "name": "Máy Đá Đùi Trước Ngồi (Seated Leg Extension Machine)",
    "shortName": "Máy Đá Đùi Trước",
    "muscle": "Đùi Trước & Cơ Giọt Lệ VMO (Bảo Vệ Gối)",
    "equipment": "Máy đá đùi trước chốt tạ",
    "mascot": "legExtension",
    "tier": "Tier A · Có Ở Cả 2 Phòng",
    "priorityRank": 2,
    "slotGroup": "quad_compound",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Seated Leg Extension Pin-Loaded",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Chỉnh đệm lưng sao cho khoeo chân sát mép ghế, đệm cổ chân nằm ngay trên khớp cổ chân.",
      "ways_ql13": "Khu Máy Chân Ways 361 QL13: Nắm chặt hai tay cầm bên hông ghế, giữ mông dính chặt đệm khi đá lên."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 75,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Khớp gối trùng trục xoay máy · Giữ đỉnh 1s",
    "tempoCue": "Đá lên 1.2s — Siết đùi 1.0s — Hạ 2.2s",
    "whyItWorks": "Tăng cường sức mạnh cơ giọt lệ (VMO) bao quanh xương bánh chè, giúp ổn định khớp gối cho người nặng cân.",
    "formSteps": [
      "Chỉnh đệm tựa lưng sao cho khớp gối nằm ngay trục xoay tròn của máy.",
      "Đặt đệm mút ở ngay trên cổ chân, nắm chặt tay cầm hai bên hông ghế.",
      "Duỗi thẳng hai cẳng chân lên, giữ siết cơ đùi trước 1 giây ở đỉnh rồi hạ chậm."
    ],
    "cues": "Chọn mức tạ vừa phải (12–15 reps) và giữ 1 giây ở đỉnh thay vì đá giật cục.",
    "mistake": "Không đá vung lấy đà làm bật mông khỏi ghế.",
    "swapOptions": [
      "leg_press_45",
      "smith_box_squat",
      "hack_squat_machine"
    ],
    "swapReason": "Có mặt tại cả The New Gym 58D UVK lẫn Ways Station 361 QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=yZmx_Ac3880",
    "videoId": "yZmx_Ac3880",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "Leg Extension Setup & Quad Isolation",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Làm khỏe bó cơ VMO giữ ổn định xương bánh chè",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "seated_leg_curl_machine": {
    "id": "seated_leg_curl_machine",
    "name": "Máy Ngồi / Nằm Cuốn Đùi Sau (Seated / Lying Leg Curl)",
    "shortName": "Máy Cuốn Đùi Sau",
    "muscle": "Cơ Đùi Sau (Hamstrings)",
    "equipment": "Máy cuốn đùi sau Pin-Loaded",
    "mascot": "seatedLegCurl",
    "tier": "Tier S · Có Ở Cả 2 Phòng",
    "priorityRank": 2,
    "slotGroup": "posterior_chain",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Seated & Lying Leg Curl Machine",
    "gymSetup": {
      "tng_uvk": "Khu Strength TNG 58D UVK: Máy Seated Leg Curl — khóa đệm đùi trên thật chặt xuống đùi trước trước khi móc gót chân.",
      "ways_ql13": "Khu Máy Chân Ways 361 QL13: Có cả Máy Ngồi Cuốn Đùi Sau (Seated) và Máy Nằm Sấp Cuốn Đùi Sau (Lying Leg Curl)."
    },
    "repRange": [
      10,
      15
    ],
    "defaultRestSec": 90,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Khóa chặt đệm đùi · Móc sâu gót chân",
    "tempoCue": "Cuốn 1.2s — Giữ đáy 1.0s — Nhả 2.5s",
    "whyItWorks": "Cô lập hoàn toàn cơ đùi sau với 0% áp lực lên thắt lưng, đồng thời gân đùi sau khỏe sẽ giữ chặt khớp gối không bị trượt.",
    "formSteps": [
      "Ngồi tựa sát lưng vào đệm, chỉnh đệm gót chân nằm ngay dưới bắp chân (sát gót).",
      "Hạ thanh khóa đùi ép sát mặt trên đùi để cố định hông.",
      "Móc mạnh gót chân xuống dưới ghế, giữ siết đùi sau 1 giây rồi nhả lên chậm 2.5 giây."
    ],
    "cues": "Gập cổ chân hướng mũi chân về phía ống đồng (Dorsiflexion) khi cuốn để đùi sau ăn sâu hơn.",
    "mistake": "Không để đệm khóa đùi quá lỏng làm nhổm đùi khi cuốn.",
    "swapOptions": [
      "dumbbell_rdl",
      "glute_drive_hip_thrust"
    ],
    "swapReason": "Lựa chọn số 1 thay thế RDL khi muốn giải phóng hoàn toàn lưng dưới.",
    "videoUrl": "https://www.youtube.com/watch?v=_oyxCn2iSjU",
    "videoId": "_oyxCn2iSjU",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "Seated vs Lying Leg Curl Science",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "0% tải cột sống · Tăng sức bền dây chằng sau khớp gối",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "glute_drive_hip_thrust": {
    "id": "glute_drive_hip_thrust",
    "name": "Máy Đẩy Hông Chuyên Biệt (Glute Drive / Hip Thrust Machine)",
    "shortName": "Máy Đẩy Hông Hip Thrust",
    "muscle": "Cơ Mông Lớn & Đùi Sau",
    "equipment": "Máy Hip Thrust / Máy Smith",
    "mascot": "hipThrust",
    "tier": "Tier A · Đặc Trưng Ways QL13",
    "priorityRank": 2,
    "slotGroup": "posterior_chain",
    "availableGyms": [
      "ways_ql13",
      "tng_uvk"
    ],
    "machineBrand": "Glute Drive Plate-Loaded / Smith Hip Thrust",
    "gymSetup": {
      "ways_ql13": "Khu Mông Đùi tầng 4 Ways 361 QL13: Có Máy Đẩy Hông (Glute Drive) chuyên biệt với dây đai đệm hông êm ái, không cần kê đòn.",
      "tng_uvk": "Khu Máy Smith TNG 58D UVK: Đặt ghế ngang sau lưng, lót mút đệm lên thanh đòn Smith để đẩy hông."
    },
    "repRange": [
      10,
      12
    ],
    "defaultRestSec": 90,
    "usesBarbell": true,
    "jointSafe": true,
    "angleCue": "Cằm thu nhẹ · Ống đồng thẳng đứng ở đỉnh",
    "tempoCue": "Đẩy lên 1.0s — Siết mông 1.5s — Hạ 2.0s",
    "whyItWorks": "Cơ mông khỏe là động cơ chính nâng đỡ khung chậu và giảm tới 40% tải trọng truyền xuống thắt lưng & đầu gối khi đi bộ.",
    "formSteps": [
      "Tựa phần lưng trên (dưới xương bả vai) lên đệm tựa, cài đai đệm qua ngang xương hông.",
      "Đặt hai bàn chân trên bệ sao cho khi đẩy hông lên cao nhất, ống đồng vuông góc 90° với bệ.",
      "Đẩy mạnh qua gót chân, siết chặt cơ mông ở đỉnh 1.5 giây (mắt nhìn về trước) rồi hạ chậm."
    ],
    "cues": "Giữ cằm hơi thu về ngực và xương sườn khép để không ưỡn lưng dưới ở đỉnh.",
    "mistake": "Không đặt chân quá gần hoặc quá xa làm mỏi đùi trước.",
    "swapOptions": [
      "dumbbell_rdl",
      "seated_leg_curl_machine"
    ],
    "swapReason": "Máy chuyên biệt cực tiện tại Ways Station 361 Quốc Lộ 13.",
    "videoUrl": "https://www.youtube.com/watch?v=_oyxCn2iSjU",
    "videoId": "_oyxCn2iSjU",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Hip Thrust With Perfect Form",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 60,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 60,
        "reps": 12,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 60,
        "reps": 10,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Làm khỏe cơ mông nâng đỡ khung chậu và cột sống",
    "zoneCategory": "plate_loaded",
    "zoneLabel": "Khu Lắp Tạ Rời (Plate-Loaded)"
  },
  "ab_crunch_machine": {
    "id": "ab_crunch_machine",
    "name": "Máy Gập Bụng Ngồi / Quỳ Kéo Cáp Bụng (Ab Crunch Machine / Cable)",
    "shortName": "Máy Gập Bụng / Kéo Cáp",
    "muscle": "Cơ Bụng 6 Múi & Core",
    "equipment": "Máy Ab Crunch hoặc Cáp cao",
    "mascot": "abCrunchMachine",
    "tier": "Tier A · Có Ở Cả 2 Phòng",
    "priorityRank": 3,
    "slotGroup": "core_stability",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Seated Ab Crunch / Cable Rope Crunch",
    "gymSetup": {
      "tng_uvk": "Khu Tập Bụng & Giãn Cơ TNG 58D UVK: Dùng Máy Gập Bụng Ngồi hoặc Quỳ Kéo Dây Thừng ở Khung Cáp Đôi.",
      "ways_ql13": "Khu Core Ways 361 QL13: Dùng Máy Ab Crunch hoặc quỳ trên thảm kéo cáp dây thừng."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Cuộn xương ức về rốn · Thở hết hơi ở đáy",
    "tempoCue": "Cuộn 1.5s — Thở cạn siết 1.0s — Mở 2.0s",
    "whyItWorks": "Tạo kháng lực có thể tăng tiến cho cơ bụng thẳng mà không gây giật cổ như gập bụng nằm sàn.",
    "formSteps": [
      "Ngồi vào máy Ab Crunch (hoặc quỳ dưới cáp cao cầm dây thừng hai bên thái dương).",
      "Cố định hông, thở mạnh ra đồng thời cuộn tròn phần ngực trên hướng về phía xương mu.",
      "Giữ siết cơ bụng 1 giây rồi từ từ mở người lên hít sâu."
    ],
    "cues": "Tập trung cuộn lồng ngực xuống rốn thay vì gập khớp hông.",
    "mistake": "Không dùng lực tay kéo ghì vào cổ.",
    "swapOptions": [
      "plank_core",
      "seated_calf_press"
    ],
    "swapReason": "Đổi bài Core linh hoạt ngay tại khu bụng của cả 2 phòng tập.",
    "videoUrl": "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    "videoId": "pSHjTRCQxIw",
    "videoAuthor": "Jeff Nippard",
    "videoTitle": "How To Train Abs Properly (Machine & Cable Crunch)",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 30,
        "reps": 15,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 30,
        "reps": 15,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 30,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Làm dày múi cơ bụng với kháng lực máy/cáp có kiểm soát",
    "zoneCategory": "pin_machine",
    "zoneLabel": "Khu Máy Chốt Tạ (Strength)"
  },
  "seated_calf_press": {
    "id": "seated_calf_press",
    "name": "Nhón Bắp Chân Máy Ngồi / Bàn Đạp Leg Press (Calf Raise)",
    "shortName": "Nhón Bắp Chân Máy",
    "muscle": "Cơ Bắp Chân (Soleus & Gastrocnemius)",
    "equipment": "Máy Seated Calf / Bàn đạp Leg Press",
    "mascot": "seatedCalfRaise",
    "tier": "Tier B · Bảo Vệ Cổ Chân",
    "priorityRank": 3,
    "slotGroup": "calves",
    "availableGyms": [
      "ways_ql13",
      "tng_uvk"
    ],
    "machineBrand": "Seated Calf Raise / 45° Leg Press Calf",
    "gymSetup": {
      "ways_ql13": "Khu Chân Ways 361 QL13: Có Máy Nhón Bắp Chân Ngồi (Seated Calf Raise lắp tạ rời) chuyên biệt.",
      "tng_uvk": "Khu Strength TNG 58D UVK: Đặt nửa mũi bàn chân lên mép dưới bàn đạp Máy Leg Press 45° để nhón bắp chân."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Hạ gót căng sâu 2s · Nhón hết tầm mũi chân",
    "tempoCue": "Nhón 1.0s — Giữ đỉnh 1.5s — Hạ căng 2.0s",
    "whyItWorks": "Bắp chân khỏe đóng vai trò như bơm máu thứ hai đẩy máu tĩnh mạch về tim và bảo vệ khớp cổ chân khi mang trọng lượng lớn.",
    "formSteps": [
      "Đặt phần ức bàn chân lên mép bàn đạp (hoặc ngồi vào máy Seated Calf Raise đặt đệm lên gối).",
      "Hạ gót chân xuống sâu nhất có thể và giữ 2 giây để triệt tiêu lực đàn hồi của gân Achilles.",
      "Nhón mạnh mũi chân lên cao nhất, giữ siết bắp chân 1.5 giây."
    ],
    "cues": "Dừng 2 giây ở điểm thấp nhất là bí quyết để bắp chân phát triển.",
    "mistake": "Không nhấp nhổm nhanh lấy đà bằng gân cổ chân.",
    "swapOptions": [
      "plank_core",
      "ab_crunch_machine"
    ],
    "swapReason": "Tăng sức bền cổ chân và bắp chân tại Ways Station QL13 & TNG UVK.",
    "videoUrl": "https://www.youtube.com/watch?v=yZmx_Ac3880",
    "videoId": "yZmx_Ac3880",
    "videoAuthor": "Renaissance Periodization",
    "videoTitle": "How To Train Calves Effectively (Pause At The Bottom)",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 15,
        "effort": "good",
        "done": false
      },
      {
        "type": "2",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 15,
        "effort": "good",
        "done": false
      },
      {
        "type": "3",
        "prev": "Mức gợi ý",
        "weight": 40,
        "reps": 15,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Làm khỏe cổ chân & bơm tuần hoàn máu chi dưới",
    "zoneCategory": "plate_loaded",
    "zoneLabel": "Khu Lắp Tạ Rời (Plate-Loaded)"
  },
  "stair_stepper_cardio": {
    "id": "stair_stepper_cardio",
    "name": "Máy Leo Cầu Thang Đốt Mỡ Sâu (Stair Stepper / StairMaster)",
    "shortName": "Máy Leo Cầu Thang",
    "muscle": "Tim Mạch, Mông & Đốt Mỡ Cực Mạnh",
    "equipment": "Máy leo cầu thang (Stair Stepper)",
    "mascot": "stairStepper",
    "tier": "Tier S · Đặc Trưng TNG UVK",
    "priorityRank": 6,
    "slotGroup": "cardio_finisher",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Commercial Stair Stepper / Climber",
    "gymSetup": {
      "tng_uvk": "Khu Cardio TNG 58D UVK: Dàn máy leo cầu thang tự động — chỉnh tốc độ Level 5–7, đặt toàn bộ bàn chân lên bậc thang.",
      "ways_ql13": "Khu Cardio Ways 361 QL13: Nếu máy leo cầu thang bận, dùng Máy Chạy Bộ chỉnh độ dốc tối đa 12%–15%."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Level 5–7 · Lưng thẳng · Không tì người lên tay vịn",
    "tempoCue": "Leo đều nhịp 12–15 phút cuối buổi",
    "whyItWorks": "Được The New Gym xếp hạng là 'sát thủ đốt mỡ' giúp tiêu hao lượng calo cao gấp 1.3 lần đi bộ phẳng trong khi không có pha tiếp đất gây sốc khớp gối.",
    "formSteps": [
      "Bước lên máy leo cầu thang, chọn chế độ Manual ở mức tốc độ vừa phải (Level 5–7).",
      "Đặt trọn bàn chân lên từng bậc thang, đạp qua gót chân để kích hoạt cả cơ mông và đùi.",
      "Chỉ chạm nhẹ đầu ngón tay vào thanh vịn để giữ thăng bằng, giữ lưng thẳng suốt 12–15 phút."
    ],
    "cues": "Tuyệt đối không chống hai khuỷu tay đổ người lên bảng điều khiển.",
    "mistake": "Không nhón mũi chân liên tục hoặc chỉnh tốc độ quá nhanh làm hụt hơi.",
    "swapOptions": [
      "incline_treadmill_walk",
      "rowing_machine_cardio",
      "elliptical_cross_trainer"
    ],
    "swapReason": "Máy Cardio đốt mỡ đỉnh cao tại Khu Cardio The New Gym 58D Ung Văn Khiêm.",
    "videoUrl": "https://www.youtube.com/watch?v=b5hB5n1T13M",
    "videoId": "b5hB5n1T13M",
    "videoAuthor": "Jeremy Ethier",
    "videoTitle": "StairMaster vs Incline Treadmill For Fat Loss",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Level 6 × 15 phút",
        "weight": 6,
        "reps": 15,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Sát thủ đốt mỡ & săn chắc cơ mông tại Khu Cardio TNG 58D UVK",
    "zoneCategory": "cardio_core",
    "zoneLabel": "Khu Cardio & Thảm Giãn Cơ"
  },
  "rowing_machine_cardio": {
    "id": "rowing_machine_cardio",
    "name": "Máy Chèo Thuyền Toàn Thân (Indoor Rowing Machine)",
    "shortName": "Máy Chèo Thuyền 85% Cơ",
    "muscle": "Toàn Thân (Chân, Lưng, Tay & Tim Mạch)",
    "equipment": "Máy chèo thuyền kháng lực gió",
    "mascot": "rowingMachine",
    "tier": "Tier S · Đặc Trưng TNG UVK",
    "priorityRank": 6,
    "slotGroup": "cardio_finisher",
    "availableGyms": [
      "tng_uvk"
    ],
    "machineBrand": "Concept2 / Air Resistance Rower",
    "gymSetup": {
      "tng_uvk": "Khu Cardio & Functional TNG 58D UVK: Chỉnh cần gió (Damper) ở mức 4–6, khóa đai bàn chân ngang phần rộng nhất của bàn chân.",
      "ways_ql13": "Tại Ways 361 QL13 chuyển sang Đi Bộ Dốc 10% hoặc Xe Đạp Kháng Lực."
    },
    "repRange": [
      12,
      15
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Nhịp: Đạp Chân -> Ngả Lưng -> Kéo Tay",
    "tempoCue": "Đạp mạnh 1s — Thu về 2s × 12 phút",
    "whyItWorks": "Huy động tới 85% nhóm cơ toàn thân trong tư thế ngồi trượt ngang, giải phóng hoàn toàn trọng lượng cơ thể khỏi khớp gối và cổ chân.",
    "formSteps": [
      "Chỉnh mức kháng lực gió (Damper) ở số 4–6, cài chặt dây đai qua mu bàn chân.",
      "Phát lực theo đúng thứ tự: 60% lực Đạp Chân -> 20% Ngả Lưng nhẹ -> 20% Kéo Tay cầm về dưới ngực.",
      "Trả người về theo thứ tự ngược lại: Duỗi Tay -> Gập Hông -> Co Gối trượt lên."
    ],
    "cues": "Nhớ khẩu quyết: Chân - Lưng - Tay khi kéo, và Tay - Lưng - Chân khi thu về.",
    "mistake": "Không kéo tay trước khi chân đạp thẳng làm vướng đầu gối.",
    "swapOptions": [
      "incline_treadmill_walk",
      "stair_stepper_cardio",
      "elliptical_cross_trainer"
    ],
    "swapReason": "Đứng số 1 trong bảng máy Cardio đốt calo của The New Gym.",
    "videoUrl": "https://www.youtube.com/watch?v=b5hB5n1T13M",
    "videoId": "b5hB5n1T13M",
    "videoAuthor": "Concept2",
    "videoTitle": "Proper Indoor Rowing Technique",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Mức gió 5 × 12 phút",
        "weight": 5,
        "reps": 12,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "Huy động 85% cơ bắp toàn thân với 0% áp lực dồn lên khớp gối",
    "zoneCategory": "cardio_core",
    "zoneLabel": "Khu Cardio & Thảm Giãn Cơ"
  },
  "elliptical_cross_trainer": {
    "id": "elliptical_cross_trainer",
    "name": "Máy Trượt Tuyết Elliptical / Xe Đạp Từ Tính (Zero-Impact Cardio)",
    "shortName": "Máy Elliptical Êm Khớp",
    "muscle": "Tim Mạch & Đốt Mỡ Không Xung Lực",
    "equipment": "Máy Elliptical hoặc Xe đạp tại chỗ",
    "mascot": "ellipticalTrainer",
    "tier": "Tier A · Bảo Vệ Khớp Gối 100%",
    "priorityRank": 6,
    "slotGroup": "cardio_finisher",
    "availableGyms": [
      "tng_uvk",
      "ways_ql13"
    ],
    "machineBrand": "Elliptical Cross-Trainer / Upright Bike",
    "gymSetup": {
      "tng_uvk": "Khu Cardio TNG 58D UVK: Dàn máy Elliptical trượt tuyết có tay cầm chuyển động toàn thân, chỉnh kháng lực mức 7–9.",
      "ways_ql13": "Khu Cardio Ways 361 QL13: Dùng máy Elliptical hoặc Xe Đạp Tập (Spin Bike) ở kháng lực vừa phải trong 15 phút."
    },
    "repRange": [
      15,
      20
    ],
    "defaultRestSec": 60,
    "usesBarbell": false,
    "jointSafe": true,
    "angleCue": "Bàn chân luôn dính bàn đạp · Kháng lực 7–9",
    "tempoCue": "Đạp kết hợp kéo đẩy tay đều đặn 15 phút",
    "whyItWorks": "Bàn chân không bao giờ nhấc rời khỏi bàn đạp nên lực va chạm lên sụn khớp gối bằng 0 tuyệt đối, lý tưởng cho ngày chân mỏi hoặc người >105kg.",
    "formSteps": [
      "Bước lên hai bàn đạp lớn của máy Elliptical, hai tay nắm vào cần chuyển động.",
      "Chỉnh mức kháng lực (Resistance) từ 7 đến 9 để giữ nhịp tim vùng đốt mỡ 125–140 bpm.",
      "Phối hợp nhịp nhàng cả chân đạp elip và tay kéo-đẩy liên tục trong 15 phút."
    ],
    "cues": "Giữ toàn bộ lòng bàn chân tiếp xúc mặt bàn đạp để không bị tê mũi chân.",
    "mistake": "Không để mức kháng lực quá nhẹ (dưới 3) rồi đạp quay tít theo quán tính.",
    "swapOptions": [
      "incline_treadmill_walk",
      "stair_stepper_cardio",
      "rowing_machine_cardio"
    ],
    "swapReason": "Có sẵn tại cả The New Gym 58D UVK và Ways Station 361 QL13.",
    "videoUrl": "https://www.youtube.com/watch?v=b5hB5n1T13M",
    "videoId": "b5hB5n1T13M",
    "videoAuthor": "Jeremy Ethier",
    "videoTitle": "Low Impact Elliptical Cardio For Fat Loss",
    "defaultSets": [
      {
        "type": "1",
        "prev": "Kháng lực 8 × 15 phút",
        "weight": 8,
        "reps": 15,
        "effort": "good",
        "done": false
      }
    ],
    "progressionBadge": "0% xung lực tiếp đất — Lựa chọn êm sụn gối nhất cho người >100kg",
    "zoneCategory": "cardio_core",
    "zoneLabel": "Khu Cardio & Thảm Giãn Cơ"
  }
};
