import type { SessionId, WorkoutSessionDef, WorkoutSplitDef } from '../types/gym';

export const MIN_WORKOUT_COMPLETION_PCT = 70;

export const WORKOUT_SESSIONS: Record<Exclude<SessionId, 'rest'>, WorkoutSessionDef> = {
  "press_day": {
    "id": "press_day",
    "code": "PRESS",
    "calendarLabel": "ĐẨY NGỰC·VAI",
    "focusShort": "Ngực · Vai · Tay sau",
    "shortName": "Buổi 1: Đẩy (Ngực · Vai · Tay sau)",
    "title": "Buổi 1: Đẩy (Press Day) — Ngực, Vai & Tay Sau",
    "subtitle": "Sắp xếp theo thứ tự ưu tiên từ bài Đa Khớp (Tier S) xuống bài Cô Lập & Đốt Mỡ",
    "durationMin": 55,
    "mascot": "benchPress",
    "targetMuscles": "Ngực trên · Ngực giữa · Vai trước/ngang · Tay sau",
    "sessionRationale": "Tập trung các bài đẩy có ghế tựa lưng 30°–75° giúp kích thích tối đa khối cơ thân trước mà không gây áp lực nén cột sống.",
    "exerciseIds": [
      "incline_db_press",
      "dumbbell_shoulder_press",
      "pec_deck_fly",
      "lateral_raise",
      "tricep_rope_pushdown",
      "incline_treadmill_walk"
    ]
  },
  "pull_day": {
    "id": "pull_day",
    "code": "PULL",
    "calendarLabel": "KÉO VAI·XÔ",
    "focusShort": "Vai · Lưng xô · Tay trước",
    "shortName": "Buổi 2: Kéo (Vai · Xô)",
    "title": "Buổi 2: Kéo (Pull Day) — Vai Sau, Lưng Xô & Tay Trước",
    "subtitle": "Mở rộng khung lưng chữ V, chống gù lưng và làm săn bắp tay trước",
    "durationMin": 55,
    "mascot": "latPulldown",
    "targetMuscles": "Vai sau · Lưng xô · Lưng giữa · Tay trước",
    "sessionRationale": "Sử dụng cáp kéo xô và cáp ngồi giúp cô lập toàn bộ khối cơ lưng dày rộng mà không cần gập lưng chịu tải nặng.",
    "exerciseIds": [
      "lat_pulldown",
      "seated_cable_row",
      "rope_face_pull",
      "dumbbell_curl_lateral",
      "plank_core",
      "incline_treadmill_walk"
    ]
  },
  "legs_day": {
    "id": "legs_day",
    "code": "LEGS",
    "calendarLabel": "BUỔI CHÂN",
    "focusShort": "Đùi · Mông · Bắp chân",
    "shortName": "Buổi 3: Chân (Legs)",
    "title": "Buổi 3: Chân (Legs Day) — Đùi, Mông & Bắp Chân",
    "subtitle": "Tăng cơ chân đốt mỡ mạnh mẽ với 0% áp lực chèn ép đĩa đệm",
    "durationMin": 55,
    "mascot": "legPress",
    "targetMuscles": "Đùi trước · Đùi sau · Cơ mông · Bắp chân",
    "sessionRationale": "Thay thế Back Squat thanh đòn bằng Đạp Đùi 45° và RDL tạ đơn để bảo vệ sụn gối & thắt lưng cho người nặng cân.",
    "exerciseIds": [
      "leg_press_45",
      "dumbbell_rdl",
      "seated_leg_extension",
      "seated_leg_curl_machine",
      "seated_calf_press",
      "incline_treadmill_walk"
    ]
  },
  "upper_day": {
    "id": "upper_day",
    "code": "UPPER",
    "calendarLabel": "T7 TỰ CHỌN",
    "focusShort": "Optional · Thân trên",
    "shortName": "Thứ 7 (Optional)",
    "title": "Buổi Thứ 7 Tự Chọn (Optional — Thân Trên & Đốt Mỡ)",
    "subtitle": "Kích thích lặp lại lần 2 trong tuần cho Ngực, Lưng Xô và Vai",
    "durationMin": 55,
    "mascot": "shoulderPress",
    "targetMuscles": "Ngực · Lưng xô · Vai ngang · Tay",
    "sessionRationale": "Tần suất tập 2 lần/tuần mỗi nhóm cơ là ngưỡng vàng khoa học giúp tối đa hóa tổng hợp protein cơ bắp.",
    "exerciseIds": [
      "machine_chest_press",
      "lat_pulldown",
      "pec_deck_fly",
      "seated_cable_row",
      "lateral_raise",
      "tricep_rope_pushdown"
    ]
  }
};

export const WORKOUT_SPLITS: Record<string, WorkoutSplitDef> = {
  "joint_safe_4d": {
    "id": "joint_safe_4d",
    "name": "Lịch 4 Buổi: Upper / Lower Bảo Vệ Khớp (Tối ưu cho BMI >= 28 / >95kg)",
    "badge": "Khuyên dùng cho 115kg",
    "daysPerWeek": 4,
    "description": "Loại bỏ hoàn toàn bài chạy nhảy chèn ép sụn gối & cột sống. Kết hợp 40p Tạ có điểm tựa + 15p Đi bộ dốc.",
    "sessions": [
      {
        "id": "js_upper_a",
        "title": "Buổi 1: Thân Trên A (Ngực, Lưng Xô, Tay & Đi Bộ Dốc)",
        "durationMin": 55,
        "mascot": "benchPress",
        "exerciseIds": [
          "incline_db_press",
          "lat_pulldown",
          "seated_cable_row",
          "dumbbell_shoulder_press",
          "dumbbell_curl_lateral",
          "incline_treadmill_walk"
        ]
      },
      {
        "id": "js_lower_a",
        "title": "Buổi 2: Thân Dưới A (Đạp Đùi 45°, Đùi Sau & Đi Bộ Dốc)",
        "durationMin": 50,
        "mascot": "legPress",
        "exerciseIds": [
          "leg_press_45",
          "dumbbell_rdl",
          "plank_core",
          "incline_treadmill_walk"
        ]
      }
    ]
  },
  "upper_lower_4d": {
    "id": "upper_lower_4d",
    "name": "Lịch 4 Buổi: Upper / Lower Tiêu Chuẩn (Tăng Cơ Toàn Diện)",
    "badge": "Phổ biến nhất",
    "daysPerWeek": 4,
    "description": "Kích thích mỗi nhóm cơ đúng 2 lần/tuần, cân bằng hoàn hảo cho người đi làm.",
    "sessions": [
      {
        "id": "ul_upper",
        "title": "Upper A: Đẩy Ngực, Kéo Xô & Tay Vai",
        "durationMin": 55,
        "mascot": "benchPress",
        "exerciseIds": [
          "barbell_bench_press",
          "lat_pulldown",
          "incline_db_press",
          "seated_cable_row",
          "dumbbell_curl_lateral"
        ]
      },
      {
        "id": "ul_lower",
        "title": "Lower A: Đạp Đùi, RDL & Core",
        "durationMin": 50,
        "mascot": "legPress",
        "exerciseIds": [
          "leg_press_45",
          "dumbbell_rdl",
          "incline_treadmill_walk"
        ]
      }
    ]
  },
  "full_body_3d": {
    "id": "full_body_3d",
    "name": "Lịch 3 Buổi: Full Body Linh Hoạt (T2 - T4 - T6)",
    "badge": "Dễ duy trì",
    "daysPerWeek": 3,
    "description": "Tác động toàn thân trong 50 phút, lỡ bận 1 buổi trong tuần cũng không bị lệch nhóm cơ.",
    "sessions": [
      {
        "id": "fb_a",
        "title": "Full Body A: Ngực, Lưng, Chân & Cardio Nhẹ",
        "durationMin": 55,
        "mascot": "dumbbellCurl",
        "exerciseIds": [
          "incline_db_press",
          "lat_pulldown",
          "leg_press_45",
          "dumbbell_curl_lateral",
          "incline_treadmill_walk"
        ]
      }
    ]
  }
};

export const SESSION_ALLOWED_SLOT_GROUPS: Record<string, string[]> = {
  "press_day": [
    "chest_press",
    "shoulder_press",
    "chest_fly",
    "lateral_delt",
    "triceps",
    "cardio_finisher"
  ],
  "pull_day": [
    "vertical_pull",
    "horizontal_row",
    "rear_delt_pull",
    "lateral_delt",
    "shoulder_press",
    "biceps",
    "core_stability",
    "cardio_finisher"
  ],
  "legs_day": [
    "quad_compound",
    "posterior_chain",
    "calves",
    "core_stability",
    "cardio_finisher"
  ],
  "upper_day": [
    "chest_press",
    "vertical_pull",
    "chest_fly",
    "horizontal_row",
    "shoulder_press",
    "lateral_delt",
    "rear_delt_pull",
    "triceps",
    "biceps",
    "cardio_finisher"
  ]
};

export const DEFAULT_USER_PROFILE = {
  "id": "user_115kg",
  "label": "Nam 115kg · 1m82 · 27 tuổi · Tập 06:00 (Giảm mỡ bảo vệ khớp)",
  "shortLabel": "115kg · 1m82",
  "name": "Gym Bro (115kg)",
  "gender": "male",
  "age": 27,
  "heightCm": 182,
  "weightKg": 115,
  "targetWeightKg": 95,
  "activity": 1.41,
  "goal": "cut",
  "workoutTime": "06:00",
  "preSleepLeadMin": 30,
  "daysPerWeek": 4,
  "barbellWeightKg": 20
} as const;
