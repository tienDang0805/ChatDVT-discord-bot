import type { GymBranch, GymBranchId, GymSessionPreset } from '../types/gym';

export const GYM_BRANCHES: Record<GymBranchId, GymBranch> = {
  "all": {
    "id": "all",
    "shortName": "Cả 2 Phòng Tập",
    "badge": "Tất cả máy (36 bài)",
    "name": "Kết Hợp: The New Gym UVK & Ways Station QL13",
    "address": "58D Ung Văn Khiêm (Bình Thạnh) & 361 Quốc Lộ 13 (Thủ Đức)",
    "hours": "Linh hoạt 24/7 (TNG UVK) & 05:00–22:30 (Ways QL13)",
    "highlights": [
      "Hiển thị toàn bộ 36 bài tập và thiết bị của cả 2 phòng tập.",
      "Tự động chỉ dẫn cách setup ghế, chốt tạ và vị trí máy tại từng cơ sở."
    ],
    "zones": []
  },
  "tng_uvk": {
    "id": "tng_uvk",
    "shortName": "The New Gym · UVK",
    "badge": "58D Ung Văn Khiêm · 24/7",
    "name": "The New Gym — Chi Nhánh 58D Ung Văn Khiêm",
    "address": "58D Ung Văn Khiêm, P. Thạnh Mỹ Tây (P.25 cũ), Quận Bình Thạnh, TP.HCM",
    "hours": "Mở cửa 24/7 xuyên lễ Tết (Từ 22:00–06:00 dùng tủ locker ngoài; có NV hỗ trợ 06:00–22:00)",
    "highlights": [
      "Diện tích >1.000m² chia 5 khu riêng biệt: Cardio, Strength (Máy chốt tạ), Free Weight, Functional & khu Giãn cơ tách biệt.",
      "Thế mạnh: Dàn máy kháng lực rút chốt tạ (Selectorized) có dán nhãn hướng dẫn trực quan, Khung Cáp Đôi, Máy Smith, Máy Leo Cầu Thang (Stair Stepper) & Máy Chèo Thuyền (Rowing)."
    ],
    "zones": [
      {
        "zoneName": "Khu Strength (Máy Kháng Lực Chốt Tạ)",
        "machines": [
          "Máy Đẩy Ngực Ngồi (Seated Chest Press Machine)",
          "Máy Ép Ngực & Vai Sau 2-in-1 (Pec Deck / Rear Delt)",
          "Máy Đẩy Vai Ngồi (Seated Shoulder Press)",
          "Máy Kéo Xô Cao & Kéo Cáp Ngồi (Lat Pulldown & Seated Row)",
          "Máy Trợ Lực Hít Xà & Xà Kép (Assisted Chin/Dip)",
          "Máy Đạp Đùi 45° & Đá Đùi Trước / Cuốn Đùi Sau (Leg Press, Extension, Curl)"
        ]
      },
      {
        "zoneName": "Khu Khung Cáp, Máy Smith & Free Weight",
        "machines": [
          "Khung Cáp Đôi Đa Năng (Dual Adjustable Pulley)",
          "Máy Smith Quỹ Đạo Cố Định (Counter-Balanced Smith Machine)",
          "Dàn Tạ Đơn (2kg – 40kg) + Ghế Dốc Đa Năng (0° – 30° – 75°)",
          "Ghế Đẩy Ngực Tạ Đòn Olympic & Giá Đỡ Squat Rack"
        ]
      },
      {
        "zoneName": "Khu Cardio & Khu Giãn Cơ Riêng",
        "machines": [
          "Máy Leo Cầu Thang Tự Động (Stair Stepper / StairMaster)",
          "Máy Chèo Thuyền Kháng Lực Gió (Rowing Machine)",
          "Dàn Máy Chạy Bộ Dốc (Incline Treadmill) & Máy Trượt Tuyết Elliptical",
          "Khu Thảm Giãn Cơ, Tạ Ấm Kettlebell, Bục Nhảy & Ghế Tập Bụng"
        ]
      }
    ]
  },
  "ways_ql13": {
    "id": "ways_ql13",
    "shortName": "Ways Station · QL13",
    "badge": "361 Quốc Lộ 13 · FaceID",
    "name": "Ways Station Gym — Chi Nhánh 361 Quốc Lộ 13",
    "address": "Lầu 4, 361 Quốc Lộ 13 (kế Vạn Phúc City), P. Hiệp Bình Phước, TP. Thủ Đức (Liên thông 165 UVK)",
    "hours": "05:00 – 22:30 hàng ngày tại 361 QL13 (Liên thông 38+ chi nhánh, 165 UVK mở 24/24) · Ra vào bằng FaceID",
    "highlights": [
      "Miễn phí giữ xe, khăn tập, nước uống, tắm nóng lạnh, đo InBody định kỳ và mượn con lăn giãn cơ (Foam Roller). Không PT/Sale chèo kéo.",
      "Thế mạnh: Dàn máy lắp bánh tạ rời (Plate-Loaded Iso-Lateral) cực đầm chắc, Máy Hack Squat, Máy Chèo Lưng T-Bar tựa ngực, Máy Đẩy Hông Glute Drive, Máy Bay Vai Ngang & Giàn Cáp 8 Trạm."
    ],
    "zones": [
      {
        "zoneName": "Khu Máy Lắp Bánh Tạ Rời (Plate-Loaded / Iso-Lateral)",
        "machines": [
          "Máy Đẩy Ngực Trên Lắp Tạ Rời (Iso-Lateral Incline Chest Press)",
          "Máy Kéo Xô Cao Lắp Tạ Rời (Iso-Lateral High Row / Pulldown)",
          "Máy Chèo Lưng T-Bar Đệm Ngực (Chest-Supported T-Bar Row)",
          "Máy Squat Nghiêng Tựa Lưng (Linear Hack Squat Machine)",
          "Máy Đạp Đùi Nghiêng 45° Hạng Nặng (Heavy Plate-Loaded Leg Press)",
          "Máy Đẩy Hông Chuyên Biệt (Glute Drive / Hip Thrust) & Máy Nhón Bắp Chân Ngồi"
        ]
      },
      {
        "zoneName": "Khu Máy Cô Lập & Giàn Cáp 8 Trạm",
        "machines": [
          "Giàn Cáp Chéo 8 Trạm Đa Năng (8-Stack Jungle Gym Cable Crossover)",
          "Máy Bay Vai Ngang Đệm Khuỷu Tay (Seated Lateral Raise Machine)",
          "Máy Cuốn Tay Trước Ghế Preacher (Preacher Curl Machine & Scott Bench)",
          "Máy Ép Ngực / Vai Sau (Pec Deck) & Máy Đá Đùi / Nằm Cuốn Đùi Sau"
        ]
      },
      {
        "zoneName": "Khu Power Rack, Tạ Đơn Nặng & Cardio",
        "machines": [
          "Khung Power Cage Đa Năng & Sàn Deadlift Giảm Chấn",
          "Dàn Tạ Đơn Nặng (2kg – 50kg) + Máy Smith Đa Năng",
          "Dàn Máy Chạy Bộ Dốc, Xe Đạp Tập, Máy Đo InBody & Con Lăn Foam Roller"
        ]
      }
    ]
  }
};

export const GYM_SESSION_PRESETS: Record<string, GymSessionPreset> = {
  "default": {
    "id": "default",
    "label": "Khung Chuẩn Mặc Định",
    "shortLabel": "Khung Mặc Định",
    "description": "Bộ khung gốc cân bằng giữa Tạ đơn, Máy cáp và Đi bộ dốc tập được ở mọi phòng.",
    "sessions": {
      "press_day": [
        "incline_db_press",
        "dumbbell_shoulder_press",
        "pec_deck_fly",
        "lateral_raise",
        "tricep_rope_pushdown",
        "incline_treadmill_walk"
      ],
      "pull_day": [
        "lat_pulldown",
        "seated_cable_row",
        "rope_face_pull",
        "dumbbell_curl_lateral",
        "plank_core",
        "incline_treadmill_walk"
      ],
      "legs_day": [
        "leg_press_45",
        "dumbbell_rdl",
        "seated_leg_extension",
        "seated_leg_curl_machine",
        "seated_calf_press",
        "incline_treadmill_walk"
      ],
      "upper_day": [
        "machine_chest_press",
        "lat_pulldown",
        "pec_deck_fly",
        "seated_cable_row",
        "lateral_raise",
        "tricep_rope_pushdown"
      ]
    }
  },
  "tng_uvk": {
    "id": "tng_uvk",
    "label": "Bộ Máy The New Gym · 58D Ung Văn Khiêm",
    "shortLabel": "Bộ Máy TNG UVK",
    "description": "Tối ưu theo dàn máy Selectorized chốt tạ, Máy Smith, Khung Cáp Đôi & Máy Leo Cầu Thang tại 58D Ung Văn Khiêm.",
    "sessions": {
      "press_day": [
        "smith_incline_press",
        "machine_shoulder_press",
        "pec_deck_fly",
        "cable_lateral_raise_single",
        "seated_dip_tricep_machine",
        "stair_stepper_cardio"
      ],
      "pull_day": [
        "close_neutral_pulldown",
        "machine_seated_row",
        "rope_face_pull",
        "cable_rope_hammer_curl",
        "ab_crunch_machine",
        "rowing_machine_cardio"
      ],
      "legs_day": [
        "leg_press_45",
        "smith_box_squat",
        "seated_leg_curl_machine",
        "seated_leg_extension",
        "ab_crunch_machine",
        "stair_stepper_cardio"
      ],
      "upper_day": [
        "machine_chest_press",
        "lat_pulldown",
        "cable_crossover_fly",
        "machine_seated_row",
        "reverse_pec_deck_delt",
        "tricep_rope_pushdown"
      ]
    }
  },
  "ways_ql13": {
    "id": "ways_ql13",
    "label": "Bộ Máy Ways Station · 361 Quốc Lộ 13",
    "shortLabel": "Bộ Máy Ways QL13",
    "description": "Tối ưu theo dàn máy lắp bánh tạ rời Iso-Lateral, Hack Squat, T-Bar Row, Glute Drive & Preacher Curl tại 361 Quốc Lộ 13.",
    "sessions": {
      "press_day": [
        "iso_incline_chest_press",
        "machine_shoulder_press",
        "cable_crossover_fly",
        "machine_lateral_raise",
        "overhead_cable_tricep_ext",
        "incline_treadmill_walk"
      ],
      "pull_day": [
        "iso_high_row_pulldown",
        "chest_supported_tbar_row",
        "rope_face_pull",
        "preacher_curl_machine",
        "plank_core",
        "incline_treadmill_walk"
      ],
      "legs_day": [
        "hack_squat_machine",
        "leg_press_45",
        "seated_leg_curl_machine",
        "glute_drive_hip_thrust",
        "seated_calf_press",
        "incline_treadmill_walk"
      ],
      "upper_day": [
        "iso_incline_chest_press",
        "iso_high_row_pulldown",
        "pec_deck_fly",
        "chest_supported_tbar_row",
        "machine_lateral_raise",
        "overhead_cable_tricep_ext"
      ]
    }
  }
};

export const ZONE_CATEGORY_LABELS: Record<string, string> = {
  "pin_machine": "Khu Máy Chốt Tạ (Strength)",
  "plate_loaded": "Khu Lắp Tạ Rời (Plate-Loaded)",
  "cable_smith": "Khu Khung Cáp & Máy Smith",
  "free_weight": "Khu Tạ Đơn & Ghế Rời",
  "cardio_core": "Khu Cardio & Thảm Giãn Cơ"
};

export const SLOT_GROUP_LABELS: Record<string, string> = {
  "chest_press": "Đẩy Ngực Chính (Chest Press)",
  "shoulder_press": "Đẩy Vai Chính (Overhead Press)",
  "chest_fly": "Ép Ngực Cô Lập (Chest Fly)",
  "lateral_delt": "Bay Vai Ngang (Side Delt)",
  "rear_delt_pull": "Vai Sau & Chóp Xoay (Rear Delt / Face Pull)",
  "triceps": "Tay Sau Cô Lập (Triceps)",
  "vertical_pull": "Kéo Lưng Xô Dọc (Lat Pulldown / Pull-Up)",
  "horizontal_row": "Chèo Lưng Giữa Ngang (Seated / T-Bar Row)",
  "biceps": "Cuốn Tay Trước (Biceps / Brachialis)",
  "quad_compound": "Đùi Trước & Tổng Hợp Chân (Leg Press / Squat / Extension)",
  "posterior_chain": "Đùi Sau & Cơ Mông (Leg Curl / RDL / Hip Thrust)",
  "calves": "Nhón Bắp Chân (Seated / Leg Press Calf)",
  "core_stability": "Core & Bụng Bảo Vệ Đĩa Đệm",
  "cardio_finisher": "Cardio Đốt Mỡ Êm Khớp Cuối Buổi"
};

export const SLOT_GROUP_SHORT_LABELS: Record<string, string> = {
  "chest_press": "Đẩy Ngực",
  "shoulder_press": "Đẩy Vai",
  "chest_fly": "Ép Ngực",
  "lateral_delt": "Vai Ngang",
  "rear_delt_pull": "Vai Sau & Face Pull",
  "triceps": "Tay Sau",
  "vertical_pull": "Kéo Xô Dọc",
  "horizontal_row": "Chèo Lưng Ngang",
  "biceps": "Tay Trước (Biceps)",
  "quad_compound": "Đùi Trước & Squat",
  "posterior_chain": "Đùi Sau & Mông",
  "calves": "Bắp Chân",
  "core_stability": "Core & Bụng",
  "cardio_finisher": "Cardio Đốt Mỡ"
};
