(function (global) {
  "use strict";

  const MASCOT_ASSETS = {
    appIcon: "../assets/mascots/app_icon_512.png",
    appIconSherpa: "../assets/mascots/app_icon_sherpa_512.png",
    benchPress: "../assets/mascots/mascot_bench_press.png",
    dumbbellCurl: "../assets/mascots/mascot_dumbbell_curl.png",
    latPulldown: "../assets/mascots/mascot_lat_pulldown.png",
    legPress: "../assets/mascots/mascot_leg_press.png",
    inclineWalk: "../assets/mascots/mascot_incline_walk.png",
    restHydration: "../assets/mascots/mascot_rest_hydration.png",
    nutritionVn: "../assets/mascots/mascot_nutrition_vn.png",
    sleep6am: "../assets/mascots/mascot_sleep_6am.png",
    bodyCalc: "../assets/mascots/mascot_body_calc.png",
    prTrophy: "../assets/mascots/mascot_pr_trophy.png",
    streakFire: "../assets/mascots/mascot_pr_trophy.png",
    gymSheet9x: "../assets/mascots/mascot_gym_sheet_9x.png",
    warmupStretch: "../assets/mascots/mascot_warmup_stretch.png",
    deadliftRdl: "../assets/mascots/mascot_deadlift_rdl.png",
    coachThumbsup: "../assets/mascots/mascot_coach_thumbsup.png",
    shoulderPress: "../assets/mascots/mascot_shoulder_press.png",
    cableRow: "../assets/mascots/mascot_cable_row.png",
    plankCore: "../assets/mascots/mascot_plank_core.png",
    plateCalc: "../assets/mascots/mascot_plate_calc.png",
    morningBananaCoffee: "../assets/mascots/mascot_morning_banana_coffee.png",
    deloadRecovery: "../assets/mascots/mascot_deload_recovery.png",
    chestFly: "../assets/mascots/mascot_chest_fly.png",
    lateralRaise: "../assets/mascots/mascot_lateral_raise.png",
    tricepPushdown: "../assets/mascots/mascot_tricep_pushdown.png",
    calendarNotify: "../assets/mascots/mascot_calendar_notify.png",
    refDirections: "../assets/reference/tien_directions.png",
    refSingle: "../assets/reference/tien_single_ref.png"
  };

  function resolveAsset(key, basePrefix) {
    const raw = MASCOT_ASSETS[key] || MASCOT_ASSETS.appIconSherpa || MASCOT_ASSETS.appIcon;
    if (basePrefix) {
      const cleanPrefix = basePrefix.endsWith("/") ? basePrefix : basePrefix + "/";
      return raw.replace(/^\.\.\//, cleanPrefix);
    }
    if (typeof window !== "undefined" && window.location && /^\/gym8d(\/|$)/i.test(window.location.pathname)) {
      return raw.replace(/^\.\.\//, "/gym8D/");
    }
    if (typeof window !== "undefined" && window.location && !window.location.pathname.includes("/prototypes/")) {
      return raw.replace(/^\.\.\//, "./");
    }
    return raw;
  }

  const PRESET_PROFILES = {
    user_115kg: {
      id: "user_115kg",
      label: "Nam 115kg · 1m82 · 27 tuổi · Tập 06:00 (Giảm mỡ bảo vệ khớp)",
      shortLabel: "115kg · 1m82",
      name: "Gym Bro (115kg)",
      gender: "male",
      age: 27,
      heightCm: 182,
      weightKg: 115,
      targetWeightKg: 95,
      activity: 1.41,
      goal: "cut",
      workoutTime: "06:00",
      preSleepLeadMin: 30,
      daysPerWeek: 4,
      barbellWeightKg: 20
    },
    user_56kg: {
      id: "user_56kg",
      label: "Nam 56kg · 1m72 · 24 tuổi · Tập 17:30 (Tăng cơ tăng cân)",
      shortLabel: "56kg · 1m72",
      name: "Minh (Hardgainer)",
      gender: "male",
      age: 24,
      heightCm: 172,
      weightKg: 56,
      targetWeightKg: 65,
      activity: 1.45,
      goal: "bulk",
      workoutTime: "17:30",
      preSleepLeadMin: 30,
      daysPerWeek: 4,
      barbellWeightKg: 20
    },
    user_58kg_f: {
      id: "user_58kg_f",
      label: "Nữ 58kg · 1m60 · 26 tuổi · Tập 18:30 (Săn chắc Recomp)",
      shortLabel: "58kg · 1m60",
      name: "Linh (Recomp)",
      gender: "female",
      age: 26,
      heightCm: 160,
      weightKg: 58,
      targetWeightKg: 53,
      activity: 1.375,
      goal: "recomp",
      workoutTime: "18:30",
      preSleepLeadMin: 30,
      daysPerWeek: 3,
      barbellWeightKg: 15
    }
  };

  function pad2(n) {
    return String(Math.floor(n)).padStart(2, "0");
  }

  function minutesToHHMM(totalMin) {
    const norm = ((totalMin % 1440) + 1440) % 1440;
    const h = Math.floor(norm / 60);
    const m = Math.round(norm % 60);
    return `${pad2(h)}:${pad2(m)}`;
  }

  function parseHHMM(str) {
    const parts = String(str || "06:00").split(":");
    const h = Math.max(0, Math.min(23, Number(parts[0]) || 6));
    const m = Math.max(0, Math.min(59, Number(parts[1]) || 0));
    return h * 60 + m;
  }

  function buildCircadianSchedule(workoutTimeStr, waterMl, targetKcal, proteinG, jointSafeMode, preSleepLeadMin) {
    const wkMin = parseHHMM(workoutTimeStr);
    const isMorning = wkMin <= 9 * 60;
    const wakeMin = isMorning ? wkMin - 45 : 6 * 60 + 30;
    const sleepMin = wakeMin - 7.5 * 60;
    const leadMin = Math.max(15, Math.min(90, Number(preSleepLeadMin) || 30));
    const bedPrepMin = sleepMin - leadMin;
    const preMealMin = isMorning ? wkMin - 35 : wkMin - 75;
    const postMealMin = wkMin + 75;
    const caffeineCutoffMin = sleepMin - 8 * 60;

    const wakeTime = minutesToHHMM(wakeMin);
    const sleepTime = minutesToHHMM(sleepMin);
    const bedPrepTime = minutesToHHMM(bedPrepMin);
    const preWorkoutMealTime = minutesToHHMM(preMealMin);
    const postWorkoutMealTime = minutesToHHMM(postMealMin);
    const caffeineCutoffTime = minutesToHHMM(caffeineCutoffMin);

    const timelineItems = [
      {
        time: bedPrepTime,
        title: "Báo thức chuẩn bị ngủ & nhắc lịch tập sáng mai",
        desc: `Thông báo trước giờ ngủ ${leadMin} phút: Soạn sẵn quần áo tập, bình nước, tất giày để sáng mai dậy không phải suy nghĩ.`,
        mascot: "calendarNotify",
        tag: "Night Prep"
      },
      {
        time: sleepTime,
        title: "Lên giường ngủ sâu (Đủ 7.5 tiếng / 5 chu kỳ)",
        desc: `Bắt buộc ngủ trước ${sleepTime} để hồi phục hệ thần kinh & đĩa đệm cho ca tập ${workoutTimeStr}.`,
        mascot: "sleep6am",
        tag: "Giấc ngủ vàng"
      },
      {
        time: wakeTime,
        title: "Thức dậy + Uống 400ml nước ấm & Xả áp lực đĩa đệm",
        desc: isMorning
          ? "Sau 7.5h nằm ngủ, đĩa đệm đang ngậm căng nước — đi lại nhẹ 30 phút trước khi gánh/kéo tạ nặng."
          : "Uống ngay 400ml nước ấm kích hoạt trao đổi chất buổi sáng.",
        mascot: "warmupStretch",
        tag: "An toàn cột sống"
      },
      {
        time: preWorkoutMealTime,
        title: "Bữa nhẹ trước tập (Nạp năng lượng nhanh)",
        desc: isMorning
          ? "1 quả chuối chín + 1/2 muỗng Whey hoặc Cafe đen (tránh đồ nhiều mỡ/chất xơ gây đầy bụng)."
          : "1 quả chuối + 1 hộp sữa chua Hy Lạp hoặc 1 lát bánh mì + Whey.",
        mascot: "morningBananaCoffee",
        tag: "Pre-Workout"
      },
      {
        time: workoutTimeStr,
        title: jointSafeMode
          ? "Ca tập Tạ Bảo vệ Khớp (40p) + Đi bộ dốc 10% (15p)"
          : "Ca tập Tạ Trọng Tâm (45–55 phút)",
        desc: jointSafeMode
          ? "Ưu tiên bài có ghế tựa lưng, không chạy bộ/bật nhảy. Kết thúc bằng 15p Incline Walk."
          : "Áp dụng Double Progression: chạm trần số rep mục tiêu trước khi tăng 2.5kg.",
        mascot: jointSafeMode ? "inclineWalk" : "benchPress",
        tag: "Giờ Tập Chính"
      },
      {
        time: postWorkoutMealTime,
        title: `Bữa chính sau tập (Nạp ~45–55g Đạm / Tổng ngày ${proteinG}g)`,
        desc: "Phở bò tái nạc (bớt bánh phở, nước trong) + 1 muỗng Whey hoặc Cơm + 200g ức gà/thịt bò.",
        mascot: "nutritionVn",
        tag: "Post-Workout"
      },
      {
        time: caffeineCutoffTime,
        title: "Ngắt toàn bộ Cafe / Trà đậm / Pre-workout",
        desc: `Ngừng nạp cafein trước ${caffeineCutoffTime} (8 tiếng trước giờ ngủ ${sleepTime}) để giữ giấc ngủ sâu.`,
        mascot: "restHydration",
        tag: "Cutoff Cafein"
      }
    ];

    return {
      isMorning,
      wakeTime,
      sleepTime,
      bedPrepTime,
      preSleepLeadMin: leadMin,
      preWorkoutMealTime,
      postWorkoutMealTime,
      caffeineCutoffTime,
      timelineItems
    };
  }

  function calculateMetrics(input) {
    const p = Object.assign({}, PRESET_PROFILES.user_115kg, input || {});
    const gender = p.gender === "female" ? "female" : "male";
    const age = Math.max(14, Math.min(80, Number(p.age) || 27));
    const heightCm = Math.max(140, Math.min(215, Number(p.heightCm) || 175));
    const weightKg = Math.max(35, Math.min(200, Number(p.weightKg) || 70));
    const targetWeightKg = Math.max(35, Math.min(180, Number(p.targetWeightKg) || weightKg));
    const activity = Math.max(1.2, Math.min(1.9, Number(p.activity) || 1.375));
    const goal = ["cut", "recomp", "bulk"].includes(p.goal) ? p.goal : "cut";
    const workoutTime = p.workoutTime || "06:00";
    const preSleepLeadMin = Math.max(15, Math.min(90, Number(p.preSleepLeadMin) || 30));
    const daysPerWeek = Math.max(2, Math.min(6, Number(p.daysPerWeek) || 4));

    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

    let bmiCategory = "Bình thường (Chuẩn Châu Á)";
    let bmiBadgeColor = "green";
    if (bmi < 18.5) {
      bmiCategory = "Thiếu cân / Gầy";
      bmiBadgeColor = "blue";
    } else if (bmi < 23.0) {
      bmiCategory = "Cân đối (Chuẩn Châu Á)";
      bmiBadgeColor = "green";
    } else if (bmi < 25.0) {
      bmiCategory = "Thừa cân nhẹ";
      bmiBadgeColor = "amber";
    } else if (bmi < 30.0) {
      bmiCategory = "Béo phì độ I (Châu Á)";
      bmiBadgeColor = "amber";
    } else {
      bmiCategory = "Béo phì độ II (Ưu tiên bảo vệ khớp)";
      bmiBadgeColor = "red";
    }

    const rawLbm =
      gender === "male"
        ? 0.407 * weightKg + 0.267 * heightCm - 19.2
        : 0.252 * weightKg + 0.473 * heightCm - 48.3;
    const lbm = Number(
      Math.max(weightKg * 0.48, Math.min(weightKg * 0.88, rawLbm)).toFixed(1)
    );
    const bodyFatPct = Number(Math.max(8, Math.min(52, ((weightKg - lbm) / weightKg) * 100)).toFixed(1));

    const ibw = Number((22.5 * heightM * heightM).toFixed(1));
    const adjustedWeight = Number(
      (bmi >= 27 ? ibw + 0.4 * (weightKg - ibw) : weightKg).toFixed(1)
    );

    const bmr = Math.round(
      10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161)
    );
    const tdee = Math.round(bmr * activity);

    let targetKcal = tdee;
    if (goal === "cut") {
      const desiredCut = bmi >= 30 ? Math.round(tdee * 0.28) : 500;
      targetKcal = Math.max(bmr + 20, tdee - desiredCut);
    } else if (goal === "recomp") {
      targetKcal = Math.max(bmr, Math.round(tdee * 0.96));
    } else if (goal === "bulk") {
      targetKcal = tdee + 300;
    }
    targetKcal = Math.round(targetKcal / 10) * 10;

    const calorieDelta = targetKcal - tdee;
    const weeklyRateKg = Number(((calorieDelta * 7) / 7700).toFixed(2));
    const weightDiff = Math.abs(weightKg - targetWeightKg);
    const weeksToGoal =
      Math.abs(weeklyRateKg) > 0.05 && weightDiff > 0.5
        ? Math.ceil(weightDiff / Math.abs(weeklyRateKg))
        : 8;

    let proteinG =
      bmi >= 27
        ? Math.round(lbm * 2.28)
        : Math.round(weightKg * (goal === "recomp" ? 2.0 : 1.9));
    proteinG = Math.max(85, Math.min(210, Math.round(proteinG / 5) * 5));
    const proteinRuleNote =
      bmi >= 27
        ? `Tính theo khối cơ nạc LBM (${lbm}kg × 2.28g) thay vì tổng cân nặng để không quá tải thận.`
        : `Tính theo trọng lượng cơ thể (${weightKg}kg × ~2.0g) tối ưu tổng hợp cơ.`;

    const minFat = gender === "male" ? 55 : 45;
    const fatG = Math.max(minFat, Math.round((adjustedWeight * 0.75) / 2) * 2);

    const remainingKcal = Math.max(240, targetKcal - proteinG * 4 - fatG * 9);
    const carbG = Math.round(remainingKcal / 4);

    const waterMl = Math.round((adjustedWeight * 35 + 500) / 100) * 100;
    const waterLiters = Number((waterMl / 1000).toFixed(1));

    const maxHr = 220 - age;
    const zone2Min = Math.round(maxHr * 0.63);
    const zone2Max = Math.round(maxHr * 0.74);

    const jointSafeMode = bmi >= 28 || (gender === "male" && weightKg >= 95) || (gender === "female" && weightKg >= 75);

    let recommendedSplitId = "upper_lower_4d";
    if (jointSafeMode) {
      recommendedSplitId = "joint_safe_4d";
    } else if (daysPerWeek <= 3) {
      recommendedSplitId = "full_body_3d";
    } else if (daysPerWeek >= 5) {
      recommendedSplitId = "ppl_6d";
    }

    const circadianSchedule = buildCircadianSchedule(
      workoutTime,
      waterMl,
      targetKcal,
      proteinG,
      jointSafeMode,
      preSleepLeadMin
    );

    const dynamicMealPlan = [
      {
        slot: "Trước tập",
        time: circadianSchedule.preWorkoutMealTime,
        kcal: Math.round(targetKcal * 0.08),
        proteinG: Math.round(proteinG * 0.08),
        suggestion:
          "1 quả chuối chín + 1/2 muỗng Whey (hoặc 1 lát bánh mì trắng + Cafe đen) + 400ml nước ấm."
      },
      {
        slot: "Bữa sáng / Sau tập",
        time: circadianSchedule.postWorkoutMealTime,
        kcal: Math.round(targetKcal * 0.28),
        proteinG: Math.round(proteinG * 0.3),
        suggestion:
          "1 tô Phở bò tái nạc (dặn nước trong, lấy 2/3 bánh phở, thêm thịt) + 1 muỗng Whey (hoặc 3 quả trứng + 150g ức gà)."
      },
      {
        slot: "Bữa trưa",
        time: "12:00",
        kcal: Math.round(targetKcal * 0.31),
        proteinG: Math.round(proteinG * 0.28),
        suggestion: `${goal === "bulk" ? "2.5 chén" : "1.5 chén"} cơm trắng + 200g ức gà/cá/thịt bò nạc + 1 đĩa lớn rau luộc (ăn rau trước).`
      },
      {
        slot: "Bữa phụ chiều",
        time: "16:00",
        kcal: Math.round(targetKcal * 0.1),
        proteinG: Math.round(proteinG * 0.14),
        suggestion: "1 hộp sữa chua Hy Lạp không đường + 1/2 muỗng Whey (hoặc 2 lòng trắng trứng + 1 quả ổi/táo)."
      },
      {
        slot: "Bữa tối nhẹ bụng",
        time: "19:00",
        kcal: Math.round(targetKcal * 0.23),
        proteinG: Math.round(proteinG * 0.2),
        suggestion: `${goal === "cut" ? "1/2 chén cơm hoặc 1 củ khoai lang" : "1.5 chén cơm"} + 180g cá/thịt nạc/đậu phụ + canh rau xanh.`
      }
    ];

    return {
      profile: {
        name: p.name || "Gymmer",
        gender,
        age,
        heightCm,
        weightKg,
        targetWeightKg,
        activity,
        goal,
        workoutTime,
        preSleepLeadMin,
        daysPerWeek,
        barbellWeightKg: Number(p.barbellWeightKg) || 20
      },
      bmi,
      bmiCategory,
      bmiBadgeColor,
      lbm,
      bodyFatPct,
      ibw,
      adjustedWeight,
      bmr,
      tdee,
      targetKcal,
      calorieDelta,
      weeklyRateKg,
      weeksToGoal,
      proteinG,
      proteinRuleNote,
      fatG,
      carbG,
      waterMl,
      waterLiters,
      zone2Min,
      zone2Max,
      jointSafeMode,
      recommendedSplitId,
      circadianSchedule,
      dynamicMealPlan
    };
  }

  const EXERCISES = {
    incline_db_press: {
      id: "incline_db_press",
      name: "Đẩy Ngực Trên Tạ Đơn (Incline DB Press)",
      shortName: "Đẩy Ngực Dốc 30°",
      muscle: "Ngực Trên & Vai Trước",
      equipment: "Tạ đơn · Ghế dốc 30°",
      mascot: "benchPress",
      tier: "Tier S · Ưu tiên #1",
      priorityRank: 1,
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ghế dốc 30° (nấc 2) · Cùi chỏ mở 45°",
      tempoCue: "Hạ 2.5s — Giữ đáy 0.5s — Đẩy lên 1.2s",
      whyItWorks: "Tạo khuôn ngực trên đầy đặn thẩm mỹ nhất và mở biên độ tự nhiên cho khớp vai hơn đòn ngang.",
      formSteps: [
        "Chỉnh ghế dốc 30° (nấc 2), ngồi tựa chắc lưng và khép chặt 2 bả vai ép xuống đệm.",
        "Hạ tạ chậm 2.5 giây theo góc khuỷu tay mở 45°–60° (hình mũi tên) cho tới khi tạ ngang ngực.",
        "Đạp chắc chân xuống sàn, thở ra và đẩy tạ lên trên ngực mà không va mạnh hai đầu tạ."
      ],
      cues: "Chỉnh ghế dốc 30°, ép bả vai xuống ghế, hạ tạ mở khuỷu tay góc 45° an toàn tuyệt đối cho khớp vai.",
      mistake: "Không để ghế quá dốc (45–60°) làm mỏi vai trước; không banh ngang khuỷu tay 90°.",
      swapOptions: ["machine_chest_press", "barbell_bench_press"],
      swapReason: "Nếu hết ghế dốc 30° hoặc hết cặp tạ đơn vừa sức, đổi ngay sang Máy Đẩy Ngực Ngồi hoặc Đẩy Đòn Ngang.",
      videoUrl: "https://www.youtube.com/watch?v=ky9eCfvuLRY",
      videoId: "ky9eCfvuLRY",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Do Incline Dumbbell Press (Form & Scapular Setup)",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 14, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 22, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 22, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 22, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp chính × 8–10 reps (Kiểm soát nhịp hạ 2.5s)"
    },
    dumbbell_shoulder_press: {
      id: "dumbbell_shoulder_press",
      name: "Đẩy Vai Tạ Đơn Ngồi Tựa Lưng (Seated DB Shoulder Press)",
      shortName: "Đẩy Vai Tạ Đơn 75°",
      muscle: "Vai Trước & Vai Ngang",
      equipment: "Tạ đơn · Ghế tựa 75°",
      mascot: "shoulderPress",
      tier: "Tier S · Ưu tiên #2",
      priorityRank: 2,
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ghế tựa 75° · Cùi chỏ hướng trước 30°",
      tempoCue: "Hạ 2.0s — Dừng ngang tai — Đẩy 1.2s",
      whyItWorks: "Phát triển toàn diện khối cơ vai săn khỏe trong khi điểm tựa lưng 75° bảo vệ cột sống thắt lưng.",
      formSteps: [
        "Dựng ghế tựa lưng góc 75°–80° (hơi ngả nhẹ hơn góc vuông 90°), đặt hai bàn chân vững trên sàn.",
        "Đưa hai cùi chỏ hơi hướng nhẹ về phía trước 30° (mặt phẳng xương bả vai), hạ tạ ngang cằm/tai.",
        "Đẩy thẳng tạ lên cao nhưng giữ khuỷu tay hơi mềm ở đỉnh, kiểm soát nhịp hạ 2 giây."
      ],
      cues: "Tựa lưng chắc vào ghế 75°, đưa hai cùi chỏ hơi hướng vào trong 30° để không cọ khớp vai.",
      mistake: "Không ưỡn võng lưng dưới rời khỏi ghế; không banh ngang cùi chỏ 90°.",
      swapOptions: ["machine_chest_press", "lateral_raise"],
      swapReason: "Nếu khu vực ghế tạ đơn đông người, chuyển sang Máy Đẩy Vai Ngồi (Seated Machine Press).",
      videoUrl: "https://www.youtube.com/watch?v=oGZbB67Ff6Q",
      videoId: "oGZbB67Ff6Q",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Seated Dumbbell Shoulder Press — Scapular Plane Form",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 10, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 16, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 16, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 16, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp chính × 10–12 reps (Tựa lưng ghế 75°)"
    },
    pec_deck_fly: {
      id: "pec_deck_fly",
      name: "Ép Ngực Máy Pec Deck / Cáp (Seated Chest Fly)",
      shortName: "Ép Ngực Pec Deck",
      muscle: "Rãnh Ngực & Ngực Giữa",
      equipment: "Máy Pec Deck hoặc Cáp đôi",
      mascot: "chestFly",
      tier: "Tier A · Ưu tiên #3",
      priorityRank: 3,
      repRange: [10, 15],
      defaultRestSec: 90,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Tay cầm ngang ngực · Cùi chỏ hơi cong",
      tempoCue: "Mở ngực 2.5s — Ép sát giữ 1.0s",
      whyItWorks: "Giữ sức căng liên tục (constant tension) lên sợi cơ ngực ở cả điểm mở rộng lẫn điểm ép sát rãnh ngực mà tạ đơn không làm được.",
      formSteps: [
        "Chỉnh chiều cao yên ghế sao cho tay cầm ngang giữa ngực, lưng và đầu tựa sát đệm.",
        "Mở rộng cánh tay về sau có kiểm soát (cùi chỏ hơi cong nhẹ cố định) cho tới khi ngực căng sâu.",
        "Tưởng tượng đang ôm một thân cây lớn, ép hai cùi chỏ lại gần nhau và giữ siết ngực 1 giây."
      ],
      cues: "Giữ bả vai ghim cố định vào đệm ghế, dùng cơ ngực khép hai cánh tay lại và giữ đỉnh 1 giây.",
      mistake: "Không nhô vai về phía trước khi ép cuối động tác; không thả tạ giật ngược ra sau quá tầm khớp vai.",
      swapOptions: ["machine_chest_press", "incline_db_press"],
      swapReason: "Nếu máy Pec Deck đang bận, dùng Dây Cáp Đôi (Cable Fly) hoặc Máy Đẩy Ngực Ngồi.",
      videoUrl: "https://www.youtube.com/watch?v=iPSsUsShqZs",
      videoId: "iPSsUsShqZs",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Pec Deck Machine Chest Fly — Stretch & Contraction Technique",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 45, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 45, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 45, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp × 10–12 reps (Giữ 1 giây ở đỉnh ép ngực)"
    },
    lateral_raise: {
      id: "lateral_raise",
      name: "Bay Vai Ngang Tạ Đơn / Cáp (Lateral Raise)",
      shortName: "Bay Vai Ngang",
      muscle: "Vai Ngang (Tạo khung chữ V)",
      equipment: "Cặp tạ đơn nhẹ hoặc Cáp thấp",
      mascot: "lateralRaise",
      tier: "Tier A · Ưu tiên #4",
      priorityRank: 4,
      repRange: [12, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Đổ người 10° · Nâng hướng trước 20°",
      tempoCue: "Nâng 1.2s — Giữ ngang vai 0.5s — Hạ 2.5s",
      whyItWorks: "Bài tập duy nhất cô lập bó cơ vai giữa (Side Delts), giúp vai rộng ngang tạo tỉ lệ lưng chữ V gọn eo.",
      formSteps: [
        "Đứng hơi đổ nhẹ thân trên về trước 10°, thả lỏng cầu vai, cầm tạ đơn hai bên đùi.",
        "Nâng hai cánh tay sang ngang hướng hơi chếch về phía trước 20° (dẫn đầu bằng cùi chỏ).",
        "Dừng khi tay ngang vai và hạ tạ chậm 2.5 giây để giữ áp lực liên tục lên vai giữa."
      ],
      cues: "Chọn mức tạ vừa phải, hạ cầu vai xuống, nâng tạ ra xa thân người như đang vươn sải tay.",
      mistake: "Không chọn tạ quá nặng rồi nhún cầu vai hoặc đung đưa lưng lấy đà.",
      swapOptions: ["dumbbell_shoulder_press", "dumbbell_curl_lateral"],
      swapReason: "Nếu muốn cảm nhận cơ căng liên tục hơn ở điểm dưới cùng, đổi sang Kéo Cáp Vai Ngang (Cable Lateral Raise).",
      videoUrl: "https://www.youtube.com/watch?v=OvH73R0sHWE",
      videoId: "OvH73R0sHWE",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Do Lateral Raises Properly For Wider Shoulders",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 8, reps: 14, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 8, reps: 14, effort: "good", done: false },
        { type: "D", prev: "Drop Set nhẹ", weight: 6, reps: 15, effort: "max", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 2 hiệp × 14–15 reps + 1 hiệp Drop Set bơm cơ vai"
    },
    tricep_rope_pushdown: {
      id: "tricep_rope_pushdown",
      name: "Kéo Cáp Dây Thừng Tay Sau (Tricep Rope Pushdown)",
      shortName: "Kéo Cáp Tay Sau",
      muscle: "Tay Sau (Triceps)",
      equipment: "Máy cáp cao · Dây thừng",
      mascot: "tricepPushdown",
      tier: "Tier B · Ưu tiên #5",
      priorityRank: 5,
      repRange: [10, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Cùi chỏ khóa sát sườn · Tách dây ở đáy",
      tempoCue: "Duỗi 1.0s — Siết đáy 1.0s — Thả 2.0s",
      whyItWorks: "Cô lập trọn vẹn 3 đầu cơ tay sau (chiếm 65% kích thước bắp tay) mà không gây đau khớp khuỷu tay như bài Skullcrusher.",
      formSteps: [
        "Đứng cách ròng rọc 1 bước nhỏ, hơi gập hông 15°, khóa cố định hai cùi chỏ ép sát mạn sườn.",
        "Duỗi cẳng tay đẩy dây thừng xuống dưới và tách nhẹ hai đầu dây sang hai bên ở điểm đáy.",
        "Giữ siết cơ tay sau 1 giây rồi từ từ thả cẳng tay lên mà không để cùi chỏ bị kéo bật về trước."
      ],
      cues: "Khóa chặt cùi chỏ sát hông, chỉ di chuyển cẳng tay và tách nhẹ dây thừng ở điểm thấp nhất.",
      mistake: "Không chồm người đè cả trọng lượng cơ thể lên dây cáp.",
      swapOptions: ["machine_chest_press", "barbell_bench_press"],
      swapReason: "Nếu hết dây thừng, dùng thanh V-Bar thẳng hoặc tập Đẩy Tay Sau Tạ Đơn Qua Đầu (Overhead DB Extension).",
      videoUrl: "https://www.youtube.com/watch?v=TZw-AZS-r9M",
      videoId: "TZw-AZS-r9M",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Cable Rope Tricep Pushdown — Elbow Position & Lockout",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 25, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 25, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 25, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp × 10–12 reps (Khóa cố định khuỷu tay)"
    },
    barbell_bench_press: {
      id: "barbell_bench_press",
      name: "Đẩy Ngực Thanh Đòn (Barbell Bench Press)",
      shortName: "Đẩy Ngực Thanh Đòn",
      muscle: "Ngực & Tay Sau",
      equipment: "Thanh đòn 20kg",
      mascot: "benchPress",
      tier: "Bài Thay Thế Tier S",
      priorityRank: 1,
      repRange: [6, 10],
      defaultRestSec: 150,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Ghế phẳng 0° · Chân đạp chắc sàn",
      tempoCue: "Hạ chạm ngực dưới 2.0s — Đẩy 1.2s",
      whyItWorks: "Tăng sức mạnh tổng thể thân trên và cho phép tăng tạ tuần tiến từng nấc nhỏ 2.5kg.",
      formSteps: [
        "Nằm trên ghế phẳng, mắt nhìn thẳng dưới thanh đòn, khép bả vai và đặt chân vững dưới sàn.",
        "Nhấc đòn ra khỏi giá, hạ có kiểm soát về phía xương ức dưới.",
        "Đẩy đòn lên theo đường hơi chéo nhẹ về phía vai."
      ],
      cues: "Chân đạp chắc xuống sàn, ép hai bả vai xuống ghế, hạ đòn chạm nhẹ ngang ngực dưới.",
      mistake: "Không nhấc mông khỏi ghế, không khóa cứng khớp khuỷu tay đột ngột.",
      swapOptions: ["incline_db_press", "machine_chest_press"],
      swapReason: "Có thể đổi sang Đẩy Ngực Tạ Đơn Dốc 30° nếu muốn giảm áp lực khớp vai.",
      videoUrl: "https://www.youtube.com/watch?v=vcBig73ojpE",
      videoId: "vcBig73ojpE",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Barbell Bench Press With Proper Technique",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 40, reps: 10, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 60, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 60, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 60, reps: 8, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp chính × 8–10 reps (Khép bả vai bảo vệ khớp)"
    },
    machine_chest_press: {
      id: "machine_chest_press",
      name: "Đẩy Ngực Máy Ngồi (Seated Chest Press)",
      shortName: "Đẩy Ngực Máy Ngồi",
      muscle: "Ngực Giữa & Tay Sau",
      equipment: "Máy có tựa lưng",
      mascot: "benchPress",
      tier: "Thay Thế An Toàn Khớp",
      priorityRank: 1,
      repRange: [10, 12],
      defaultRestSec: 90,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Tay cầm ngang ngực · Lưng áp sát đệm",
      tempoCue: "Hạ chậm 2.0s — Đẩy mạnh 1.0s",
      whyItWorks: "Quỹ đạo máy cố định giúp người mới hoặc người nặng cân đẩy sát ngưỡng mỏi cơ mà không lo tạ đè.",
      formSteps: [
        "Chỉnh chiều cao yên ghế sao cho tay cầm ngang ngực giữa.",
        "Tựa chặt lưng và bả vai vào đệm, đẩy tay cầm ra trước và thở mạnh.",
        "Hạ chậm 2 giây về vị trí căng cơ ngực mà không để bánh tạ chạm rầm vào nhau."
      ],
      cues: "Chỉnh yên ghế sao cho tay cầm ngang ngực giữa, lưng tựa sát đệm, đẩy ra thở mạnh.",
      mistake: "Không nhún vai lên tai khi đẩy.",
      swapOptions: ["incline_db_press", "pec_deck_fly"],
      swapReason: "Lựa chọn số 1 khi ghế tạ đơn đang kín người tập.",
      videoUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
      videoId: "xUm0BiZCWlQ",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Seated Machine Chest Press — Setup & Hypertrophy Cues",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp × 10–12 reps an toàn tuyệt đối với tựa lưng"
    },
    lat_pulldown: {
      id: "lat_pulldown",
      name: "Kéo Xô Cáp Rộng Tay (Wide-Grip Lat Pulldown)",
      shortName: "Kéo Xô Rộng Tay",
      muscle: "Lưng Xô & Tay Trước",
      equipment: "Máy kéo xô cáp cao",
      mascot: "latPulldown",
      tier: "Tier S · Ưu tiên #1",
      priorityRank: 1,
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ngả lưng 15° · Kéo cùi chỏ xuống hông",
      tempoCue: "Kéo xuống 1.2s — Giữ 0.5s — Thả giãn 2.2s",
      whyItWorks: "Thay thế hoàn hảo cho Hít xà đơn (Pull-up) khi cơ thể nặng 90–115kg, giúp mở rộng lưng xô mà không quá tải gân khuỷu tay.",
      formSteps: [
        "Ngồi khóa đùi dưới đệm cố định, nắm thanh đòn rộng hơn vai 1.5 lần.",
        "Hơi ngả nhẹ ngực 15°, hạ xương bả vai xuống rồi kéo thanh đòn về phía xương quai xanh.",
        "Thả thanh đòn lên có kiểm soát trong 2 giây cho tới khi cơ xô được kéo giãn hết cỡ."
      ],
      cues: "Hơi ngả người 15°, ưỡn ngực, tưởng tượng kéo hai cùi chỏ xuống túi quần thay vì dùng bàn tay giật.",
      mistake: "Tránh kéo thanh đòn ra sau gáy (rất hại khớp vai) hoặc dùng đà lưng giật quá mạnh.",
      swapOptions: ["seated_cable_row"],
      swapReason: "Nếu máy kéo xô cao đang bận, chuyển sang Kéo Cáp Ngồi Lưng Giữa.",
      videoUrl: "https://www.youtube.com/watch?v=SALxEARiMkw",
      videoId: "SALxEARiMkw",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Do Lat Pulldowns For A Wider Back",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 35, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp chính × 10–12 reps (Kéo bằng cùi chỏ xuống hông)"
    },
    seated_cable_row: {
      id: "seated_cable_row",
      name: "Kéo Cáp Ngồi Lưng Giữa (Seated Cable Row)",
      shortName: "Kéo Cáp Lưng Giữa",
      muscle: "Lưng Giữa & Vai Sau",
      equipment: "Máy cáp tay cầm V",
      mascot: "cableRow",
      tier: "Tier S · Ưu tiên #2",
      priorityRank: 2,
      repRange: [10, 12],
      defaultRestSec: 120,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Lưng thẳng tự nhiên · Kéo sát rốn",
      tempoCue: "Kéo 1.2s — Ép bả vai 1.0s — Thả 2.0s",
      whyItWorks: "Tăng độ dày cơ lưng giữa và chống gù lưng văn phòng mà không gây áp lực nén cột sống như Barbell Row.",
      formSteps: [
        "Đặt hai bàn chân lên bàn đạp, đầu gối hơi trùng nhẹ, giữ lưng thẳng tự nhiên.",
        "Kéo tay cầm về sát vùng bụng dưới/rốn, ép chặt hai xương bả vai lại với nhau giữ 1 giây.",
        "Duỗi tay về trước có kiểm soát để mở rộng bả vai mà không gù thắt lưng."
      ],
      cues: "Giữ cột sống thẳng tự nhiên, kéo tay cầm về sát rốn, ép chặt 2 bả vai giữ 1 giây.",
      mistake: "Không gù lưng dưới khi thả cáp về.",
      swapOptions: ["lat_pulldown"],
      swapReason: "Có thể thay bằng Máy Kéo Lưng Tựa Ngực (Chest-Supported Machine Row).",
      videoUrl: "https://www.youtube.com/watch?v=UCXxvVItLoM",
      videoId: "UCXxvVItLoM",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Seated Cable Row — Proper Scapular Retraction Technique",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp × 10–12 reps (Ép sát hai bả vai giữ 1s)"
    },
    plank_core: {
      id: "plank_core",
      name: "Plank Gồng Core Bảo Vệ Cột Sống (McGill Core Stability)",
      shortName: "Plank Gồng Core",
      muscle: "Core & Lưng Dưới",
      equipment: "Thảm tập",
      mascot: "plankCore",
      tier: "Tier A · Bảo Vệ Đĩa Đệm",
      priorityRank: 3,
      repRange: [45, 60],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Cẳng tay vuông góc · Lưng-Mông thẳng hàng",
      tempoCue: "Gồng cứng bụng & mông liên tục 45–50s",
      whyItWorks: "Tạo lớp áo giáp cơ bụng ngang bảo vệ đĩa đệm L4-L5 mà không gây gập đốt sống như bài Sit-up truyền thống.",
      formSteps: [
        "Chống hai cẳng tay vuông góc dưới vai, mũi chân chống sàn.",
        "Siết cứng cơ mông và gồng chặt vùng bụng như chuẩn bị đỡ lực tác động.",
        "Giữ cổ - lưng - mông trên một đường thẳng và hít thở đều."
      ],
      cues: "Siết chặt cơ mông và cơ bụng như sắp bị đấm vào bụng, giữ lưng phẳng, thở đều không nín thở.",
      mistake: "Không để võng lưng dưới gây đau thắt lưng; thay thế hoàn toàn cho gập bụng Sit-up.",
      swapOptions: ["incline_treadmill_walk"],
      swapReason: "Có thể kết hợp cùng bài Bird-Dog hoặc Deadbug trên thảm.",
      videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
      videoId: "pSHjTRCQxIw",
      videoAuthor: "ATHLEAN-X",
      videoTitle: "How To Plank Properly For Core Stability & Back Safety",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 0, reps: 45, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 0, reps: 45, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 0, reps: 45, effort: "good", done: false }
      ],
      progressionBadge: "Đai lưng tự nhiên bảo vệ đĩa đệm L4-L5 (Mục tiêu 50 giây)"
    },
    leg_press_45: {
      id: "leg_press_45",
      name: "Đạp Đùi Máy 45° (Joint-Safe Leg Press)",
      shortName: "Đạp Đùi Máy 45°",
      muscle: "Đùi Trước & Mông",
      equipment: "Máy đạp đùi 45°",
      mascot: "legPress",
      tier: "Tier S · Ưu tiên #1",
      priorityRank: 1,
      repRange: [10, 12],
      defaultRestSec: 150,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Gối gập 90° · Mông dính chặt đệm ghế",
      tempoCue: "Hạ 2.5s — Đạp lên 1.2s (Không khóa gối)",
      whyItWorks: "Phát triển khối cơ đùi lớn nhất cơ thể giúp đốt calo mạnh mẽ trong khi lưng dưới được nâng đỡ hoàn toàn trên đệm ghế.",
      formSteps: [
        "Ngồi tựa sát lưng dưới và mông vào đệm ghế, đặt hai bàn chân lên bàn đạp rộng bằng vai.",
        "Mở khóa an toàn, hạ bàn đạp xuống từ từ cho tới khi đùi và cẳng chân tạo góc 90° (mông vẫn dính chặt ghế).",
        "Đạp mạnh qua gót và giữa bàn chân đẩy tạ lên nhưng tuyệt đối giữ đầu gối hơi chùng nhẹ ở đỉnh."
      ],
      cues: "Đặt bàn chân cao vừa phải rộng bằng vai, lưng dưới và mông ép chặt vào đệm ghế, không khóa thẳng khớp gối ở đỉnh.",
      mistake: "Tuyệt đối không hạ quá sâu làm cụp mông rời khỏi ghế (gây thoát vị đĩa đệm) và không thẳng tưng đầu gối.",
      swapOptions: ["dumbbell_rdl"],
      swapReason: "Nếu máy đạp đùi 45° đang bận, dùng Máy Đạp Đùi Ngang (Seated Horizontal Leg Press) hoặc Goblet Squat.",
      videoUrl: "https://www.youtube.com/watch?v=yZmx_Ac3880",
      videoId: "yZmx_Ac3880",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Do The 45° Leg Press Safely (Foot Placement & Depth)",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 80, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 130, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 130, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 130, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp chính × 10–12 reps (Không khóa thẳng khớp gối)"
    },
    dumbbell_rdl: {
      id: "dumbbell_rdl",
      name: "Romanian Deadlift Tạ Đơn (Dumbbell RDL)",
      shortName: "RDL Tạ Đơn Đùi Sau",
      muscle: "Đùi Sau & Mông",
      equipment: "Cặp tạ đơn",
      mascot: "deadliftRdl",
      tier: "Tier S · Ưu tiên #2",
      priorityRank: 2,
      repRange: [10, 12],
      defaultRestSec: 120,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Gối chùng 15° · Đẩy mông ra sau lưng phẳng",
      tempoCue: "Trượt tạ xuống 2.5s — Siết mông lên 1.2s",
      whyItWorks: "Rèn luyện bản lề hông (Hip Hinge), làm khỏe chuỗi cơ sau (đùi sau + mông) để bảo vệ khớp gối và lưng dưới lâu dài.",
      formSteps: [
        "Đứng thẳng, hai chân rộng bằng hông, cầm cặp tạ đơn áp sát trước đùi.",
        "Mở khóa gối nhẹ (chùng gối 15° cố định), đẩy thẳng mông ra sau như đang đóng cánh cửa bằng mông.",
        "Dừng lại khi tạ xuống ngang giữa ống đồng và đùi sau căng hết cỡ, sau đó siết mông đứng thẳng dậy."
      ],
      cues: "Hơi trùng nhẹ gối, đẩy mông ra sau như đang đóng cửa bằng mông, tạ trượt sát ống đồng, lưng thẳng tắp.",
      mistake: "Không cúi cong lưng dưới hoặc hạ tạ quá sâu quá giữa ống đồng.",
      swapOptions: ["leg_press_45"],
      swapReason: "Nếu lưng dưới đang mỏi, đổi sang Máy Móc Đùi Sau Ngồi/Nằm (Seated/Lying Leg Curl).",
      videoUrl: "https://www.youtube.com/watch?v=_oyxCn2iSjU",
      videoId: "_oyxCn2iSjU",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Do Romanian Deadlifts (Hip Hinge Mechanics)",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 20, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 20, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 20, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Mục tiêu chuẩn: 3 hiệp × 10–11 reps (Đẩy hông ra sau, giữ lưng thẳng)"
    },
    dumbbell_curl_lateral: {
      id: "dumbbell_curl_lateral",
      name: "Cuốn Tạ Đơn Tay Trước (Incline / Standing DB Curl)",
      shortName: "Cuốn Tạ Tay Trước",
      muscle: "Tay Trước (Biceps)",
      equipment: "Cặp tạ đơn",
      mascot: "dumbbellCurl",
      tier: "Tier B · Cô Lập Tay Trước",
      priorityRank: 4,
      repRange: [12, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Khóa cùi chỏ sát hông · Xoay ngửa cổ tay",
      tempoCue: "Cuốn 1.2s — Siết đỉnh 1.0s — Hạ 2.5s",
      whyItWorks: "Tập trung làm săn chắc và rõ nét đỉnh cơ nhị đầu tay trước với áp lực cổ tay êm ái.",
      formSteps: [
        "Đứng thẳng hoặc ngồi tựa ghế, khóa cố định hai cùi chỏ sát bên mạn sườn.",
        "Xoay ngửa lòng bàn tay khi cuốn tạ lên và siết chặt bắp tay trước ở đỉnh 1 giây.",
        "Hạ tạ chậm 2.5 giây cho tới khi cánh tay duỗi hết biên độ."
      ],
      cues: "Khóa cố định cùi chỏ bên hông khi cuốn tay trước; hạ tạ chậm giữ sức căng.",
      mistake: "Không đung đưa lưng lấy đà quăng tạ.",
      swapOptions: ["seated_cable_row"],
      swapReason: "Có thể đổi sang Cuốn Tay Trước Với Dây Cáp Thấp (Cable Bicep Curl).",
      videoUrl: "https://www.youtube.com/watch?v=soxrZlIl35U",
      videoId: "soxrZlIl35U",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Build Bigger Biceps — Optimal Curl Form",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 10, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 10, reps: 12, effort: "good", done: false },
        { type: "D", prev: "Drop Set nhẹ", weight: 8, reps: 15, effort: "max", done: false }
      ],
      progressionBadge: "Khoảng 12–15 reps kèm 1 hiệp Drop Set bơm máu cơ tay"
    },
    incline_treadmill_walk: {
      id: "incline_treadmill_walk",
      name: "Đi Bộ Dốc Đốt Mỡ Êm Khớp (Incline Walk Zone 2)",
      shortName: "Đi Bộ Dốc 10%",
      muscle: "Tim Mạch & Đốt Mỡ (Zero Knee Impact)",
      equipment: "Máy chạy bộ (Dốc 10% · 4.4 km/h)",
      mascot: "inclineWalk",
      tier: "Tier S · Đốt Mỡ Cuối Buổi",
      priorityRank: 6,
      repRange: [15, 20],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Độ dốc 10% · Tốc độ 4.4 km/h · Buông tay",
      tempoCue: "Duy trì 15 phút nhịp tim 125–140 bpm",
      whyItWorks: "Đốt cháy 160–210 kcal trực tiếp từ mỡ thừa ở vùng nhịp tim Zone 2 mà hoàn toàn không tạo xung lực dội lên sụn gối.",
      formSteps: [
        "Bấm chỉnh độ dốc máy (Incline) lên mức 9.0%–12.0%, tốc độ đi bộ vừa phải 4.2–4.6 km/h.",
        "Bước sải chân đều đặn, đánh tay tự nhiên, tuyệt đối không vịn treo người lên tay nắm máy.",
        "Duy trì liên tục 15 phút cuối buổi tập ở nhịp tim vùng 125–140 nhịp/phút (vừa đi vừa nói chuyện ngắn được)."
      ],
      cues: "Chỉnh độ dốc Incline 9%–12%, tốc độ đi bộ 4.2–4.6 km/h trong 15 phút. Buông tay tự nhiên, không vịn chặt vào đầu máy.",
      mistake: "Không chạy bộ dồn lực mạnh lên gối khi BMI cao; không bám tay treo người lên thành máy làm giảm 40% calo tiêu hao.",
      swapOptions: [],
      swapReason: "Nếu hết máy đi bộ, chuyển sang Đạp Xe Tựa Lưng (Recumbent Bike) mức kháng lực 7 trong 15 phút.",
      videoUrl: "https://www.youtube.com/watch?v=b5hB5n1T13M",
      videoId: "b5hB5n1T13M",
      videoAuthor: "Jeremy Ethier",
      videoTitle: "Why Incline Walking Is The Best Cardio For Fat Loss",
      defaultSets: [
        { type: "1", prev: "Dốc 10% × 15 phút", weight: 10, reps: 15, effort: "good", done: false }
      ],
      progressionBadge: "Giữ nhịp tim vùng đốt mỡ Zone 2 (125–140 bpm) suốt 15 phút cuối buổi"
    }
  };

  const WORKOUT_SESSIONS = {
    press_day: {
      id: "press_day",
      code: "PRESS",
      calendarLabel: "ĐẨY NGỰC·VAI",
      focusShort: "Ngực · Vai · Tay sau",
      shortName: "Buổi Đẩy (Press)",
      title: "Buổi Đẩy (Press Day) — Ngực, Vai & Tay Sau",
      subtitle: "Sắp xếp theo thứ tự ưu tiên từ bài Đa Khớp (Tier S) xuống bài Cô Lập & Đốt Mỡ",
      durationMin: 55,
      mascot: "benchPress",
      targetMuscles: "Ngực trên · Ngực giữa · Vai trước/ngang · Tay sau",
      sessionRationale: "Tập trung các bài đẩy có ghế tựa lưng 30°–75° giúp kích thích tối đa khối cơ thân trước mà không gây áp lực nén cột sống.",
      exerciseIds: [
        "incline_db_press",
        "dumbbell_shoulder_press",
        "pec_deck_fly",
        "lateral_raise",
        "tricep_rope_pushdown",
        "incline_treadmill_walk"
      ]
    },
    pull_day: {
      id: "pull_day",
      code: "PULL",
      calendarLabel: "KÉO LƯNG·XÔ",
      focusShort: "Lưng xô · Tay trước",
      shortName: "Buổi Kéo (Pull)",
      title: "Buổi Kéo (Pull Day) — Lưng Xô, Lưng Giữa & Tay Trước",
      subtitle: "Mở rộng khung lưng chữ V, chống gù lưng và làm săn bắp tay trước",
      durationMin: 50,
      mascot: "latPulldown",
      targetMuscles: "Lưng xô · Lưng giữa · Vai sau · Tay trước",
      sessionRationale: "Sử dụng cáp kéo xô và cáp ngồi giúp cô lập toàn bộ khối cơ lưng dày rộng mà không cần gập lưng chịu tải nặng.",
      exerciseIds: [
        "lat_pulldown",
        "seated_cable_row",
        "dumbbell_curl_lateral",
        "plank_core",
        "incline_treadmill_walk"
      ]
    },
    legs_day: {
      id: "legs_day",
      code: "LEGS",
      calendarLabel: "CHÂN · ĐÙI",
      focusShort: "Đùi · Mông · Core",
      shortName: "Buổi Chân & Core",
      title: "Buổi Chân & Core (Joint-Safe Legs) — Đùi, Mông & Bảo Vệ Gối",
      subtitle: "Tăng cơ chân đốt mỡ mạnh mẽ với 0% áp lực chèn ép đĩa đệm",
      durationMin: 50,
      mascot: "legPress",
      targetMuscles: "Đùi trước · Đùi sau · Cơ mông · Core L4-L5",
      sessionRationale: "Thay thế Back Squat thanh đòn bằng Đạp Đùi 45° và RDL tạ đơn để bảo vệ sụn gối & thắt lưng cho người nặng cân.",
      exerciseIds: [
        "leg_press_45",
        "dumbbell_rdl",
        "plank_core",
        "incline_treadmill_walk"
      ]
    },
    upper_day: {
      id: "upper_day",
      code: "UPPER",
      calendarLabel: "THÂN TRÊN",
      focusShort: "Ngực · Xô · Vai",
      shortName: "Buổi Thân Trên",
      title: "Buổi Thân Trên Tổng Hợp (Upper Body Hypertrophy)",
      subtitle: "Kích thích lặp lại lần 2 trong tuần cho Ngực, Lưng Xô và Vai",
      durationMin: 55,
      mascot: "shoulderPress",
      targetMuscles: "Ngực · Lưng xô · Vai ngang · Tay",
      sessionRationale: "Tần suất tập 2 lần/tuần mỗi nhóm cơ là ngưỡng vàng khoa học giúp tối đa hóa tổng hợp protein cơ bắp.",
      exerciseIds: [
        "machine_chest_press",
        "lat_pulldown",
        "pec_deck_fly",
        "seated_cable_row",
        "lateral_raise",
        "tricep_rope_pushdown"
      ]
    }
  };

  const DEFAULT_WEEKLY_SCHEDULE = [
    {
      id: "mon_2026_11_09",
      isoDate: "2026-11-09",
      dayShort: "Thứ 2",
      dateLabel: "09/11/2026",
      badge: "Hôm nay · Chuẩn bị",
      isToday: true,
      isWorkoutDay: false,
      sessionId: "rest",
      workoutTime: "06:00",
      preSleepAlertTime: "21:15",
      sleepTargetTime: "21:45",
      note: "Tối nay 21:15 hệ thống báo soạn đồ tập & bình nước để 06:00 sáng mai (Thứ 3 10/11) bắt đầu Buổi 1: Buổi Đẩy (Press)."
    },
    {
      id: "tue_2026_11_10",
      isoDate: "2026-11-10",
      dayShort: "Thứ 3",
      dateLabel: "10/11/2026",
      badge: "Ngày mai · Khởi đầu",
      isFirstWorkout: true,
      isWorkoutDay: true,
      sessionId: "press_day",
      workoutTime: "06:00",
      preSleepAlertTime: "21:15",
      sleepTargetTime: "21:45",
      note: "Buổi tập đầu tiên: Buổi Đẩy (Press Day) lúc 06:00 sáng — Ưu tiên Đẩy Ngực Dốc 30° & Đẩy Vai Tạ Đơn."
    },
    {
      id: "wed_2026_11_11",
      isoDate: "2026-11-11",
      dayShort: "Thứ 4",
      dateLabel: "11/11/2026",
      badge: "Buổi 2",
      isWorkoutDay: true,
      sessionId: "pull_day",
      workoutTime: "06:00",
      preSleepAlertTime: "21:15",
      sleepTargetTime: "21:45",
      note: "Buổi Kéo (Pull Day): Kéo Xô Cáp Rộng Tay & Kéo Cáp Lưng Giữa."
    },
    {
      id: "thu_2026_11_12",
      isoDate: "2026-11-12",
      dayShort: "Thứ 5",
      dateLabel: "12/11/2026",
      badge: "Nghỉ hồi phục",
      isWorkoutDay: false,
      sessionId: "rest",
      workoutTime: "06:00",
      preSleepAlertTime: "21:15",
      sleepTargetTime: "21:45",
      note: "Nghỉ tập tạ — Đi bộ nhẹ nhàng 7,000 bước trong ngày và uống đủ 3.9L nước."
    },
    {
      id: "fri_2026_11_13",
      isoDate: "2026-11-13",
      dayShort: "Thứ 6",
      dateLabel: "13/11/2026",
      badge: "Buổi 3",
      isWorkoutDay: true,
      sessionId: "legs_day",
      workoutTime: "06:00",
      preSleepAlertTime: "21:15",
      sleepTargetTime: "21:45",
      note: "Buổi Chân & Core: Đạp Đùi 45°, RDL Tạ Đơn & Plank Bảo Vệ Lưng."
    },
    {
      id: "sat_2026_11_14",
      isoDate: "2026-11-14",
      dayShort: "Thứ 7",
      dateLabel: "14/11/2026",
      badge: "Buổi 4",
      isWorkoutDay: true,
      sessionId: "upper_day",
      workoutTime: "07:00",
      preSleepAlertTime: "22:00",
      sleepTargetTime: "22:30",
      note: "Buổi Thân Trên Tổng Hợp (Upper Body) cuối tuần."
    },
    {
      id: "sun_2026_11_15",
      isoDate: "2026-11-15",
      dayShort: "Chủ Nhật",
      dateLabel: "15/11/2026",
      badge: "Nghỉ ngơi",
      isWorkoutDay: false,
      sessionId: "rest",
      workoutTime: "07:00",
      preSleepAlertTime: "21:15",
      sleepTargetTime: "21:45",
      note: "Nghỉ hoàn toàn, chuẩn bị thực đơn tuần mới và ngủ sớm lúc 21:45 cho tuần kế tiếp."
    }
  ];

  const DAY_SHORT_NAMES = {
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    0: "Chủ Nhật"
  };

  function formatISODate(dateObj) {
    const y = dateObj.getFullYear();
    const m = pad2(dateObj.getMonth() + 1);
    const d = pad2(dateObj.getDate());
    return `${y}-${m}-${d}`;
  }

  function parseISODate(isoStr) {
    const parts = String(isoStr || "").split("-").map(Number);
    if (parts.length !== 3 || !parts[0]) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    }
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }

  function getTodayISO() {
    const now = new Date();
    return formatISODate(now);
  }

  function addDaysISO(isoStr, deltaDays) {
    const dt = parseISODate(isoStr);
    dt.setDate(dt.getDate() + Number(deltaDays || 0));
    return formatISODate(dt);
  }

  function diffDaysISO(isoA, isoB) {
    const a = parseISODate(isoA);
    const b = parseISODate(isoB);
    return Math.round((a.getTime() - b.getTime()) / 86400000);
  }

  function getMondayISO(isoStr) {
    const dt = parseISODate(isoStr);
    const dow = dt.getDay();
    const offsetToMonday = dow === 0 ? -6 : 1 - dow;
    dt.setDate(dt.getDate() + offsetToMonday);
    return formatISODate(dt);
  }

  function formatVNDate(isoStr) {
    const dt = parseISODate(isoStr);
    return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;
  }

  function formatVNShortDate(isoStr) {
    const dt = parseISODate(isoStr);
    return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}`;
  }

  function buildDefaultWeeklyPattern(todayISO) {
    const baseToday = todayISO || getTodayISO();
    const tomorrowISO = addDaysISO(baseToday, 1);
    const tomorrowDow = parseISODate(tomorrowISO).getDay();
    const cycleOffsets = [
      { offset: 0, sessionId: "press_day", workoutTime: "06:00" },
      { offset: 1, sessionId: "pull_day", workoutTime: "06:00" },
      { offset: 2, sessionId: "rest", workoutTime: "06:00" },
      { offset: 3, sessionId: "legs_day", workoutTime: "06:00" },
      { offset: 4, sessionId: "upper_day", workoutTime: "07:00" },
      { offset: 5, sessionId: "rest", workoutTime: "07:00" },
      { offset: 6, sessionId: "rest", workoutTime: "06:00" }
    ];
    const pattern = {};
    cycleOffsets.forEach((item) => {
      const dow = (tomorrowDow + item.offset) % 7;
      pattern[dow] = {
        sessionId: item.sessionId,
        workoutTime: item.workoutTime
      };
    });
    return pattern;
  }

  function buildDayScheduleEntry(isoDate, options) {
    const opts = options || {};
    const todayISO = opts.todayISO || getTodayISO();
    const tomorrowISO = addDaysISO(todayISO, 1);
    const startDateISO = opts.startDateISO || tomorrowISO;
    const weeklyPattern = opts.weeklyPattern || buildDefaultWeeklyPattern(todayISO);
    const dateOverrides = opts.dateOverrides || {};
    const logsByDate = opts.logsByDate || {};
    const dayStatusByDate = opts.dayStatusByDate || {};
    const preSleepLeadMin = Math.max(15, Math.min(90, Number(opts.preSleepLeadMin) || 30));

    const dt = parseISODate(isoDate);
    const dow = dt.getDay();
    const dayShort = DAY_SHORT_NAMES[dow];
    const patternRule = weeklyPattern[dow] || { sessionId: "rest", workoutTime: "06:00" };
    const override = dateOverrides[isoDate] || {};
    const statusRecord = dayStatusByDate[isoDate] || null;

    const isBeforeStart = diffDaysISO(isoDate, startDateISO) < 0;
    const sessionId =
      override.sessionId ||
      statusRecord?.sessionId ||
      (isBeforeStart ? "rest" : patternRule.sessionId || "rest");
    const workoutTime = override.workoutTime || patternRule.workoutTime || "06:00";
    const isWorkoutDay = sessionId !== "rest" && Boolean(WORKOUT_SESSIONS[sessionId]);

    const wkMin = parseHHMM(workoutTime);
    const isMorning = wkMin <= 9 * 60;
    const wakeMin = isMorning ? wkMin - 45 : 6 * 60 + 30;
    const sleepMin = wakeMin - 7.5 * 60;
    const bedPrepMin = sleepMin - preSleepLeadMin;
    const sleepTargetTime = minutesToHHMM(sleepMin);
    const preSleepAlertTime = minutesToHHMM(bedPrepMin);
    const wakeAlertTime = minutesToHHMM(wakeMin);

    const sess = WORKOUT_SESSIONS[sessionId];
    const dayLogs = logsByDate[isoDate] || {};
    let totalSetsCount = 0;
    let completedSetsCount = 0;
    let totalVolumeKg = 0;
    if (isWorkoutDay && sess) {
      sess.exerciseIds.forEach((exId) => {
        const hasCustomLog = Array.isArray(dayLogs[exId]);
        const sets = hasCustomLog ? dayLogs[exId] : (EXERCISES[exId] ? EXERCISES[exId].defaultSets : []);
        totalSetsCount += sets.length;
        sets.forEach((s) => {
          const setDone = (hasCustomLog && s.done) || statusRecord?.status === "done";
          if (setDone) {
            completedSetsCount += 1;
            const w = Number(s.weight) || 0;
            const r = Number(s.reps) || 0;
            if (w > 0 && r > 0) {
              totalVolumeKg += w * r;
            }
          }
        });
      });
    }
    if (statusRecord?.status === "done" && completedSetsCount < totalSetsCount) {
      completedSetsCount = totalSetsCount;
    }

    const isToday = isoDate === todayISO;
    const isTomorrow = isoDate === tomorrowISO;
    const isFirstWorkout = isoDate === startDateISO;
    const isPastDay = diffDaysISO(isoDate, todayISO) < 0;
    const isFutureDay = diffDaysISO(isoDate, todayISO) > 0;
    const daysFromToday = diffDaysISO(isoDate, todayISO);
    const daysSinceStart = diffDaysISO(isoDate, startDateISO);
    const weighInIntervalDays = Number(opts.weighInIntervalDays) === 14 ? 14 : 7;
    const isWeighInDay = daysSinceStart >= 0 && daysSinceStart % weighInIntervalDays === 0;
    const weighInIndex = isWeighInDay ? Math.floor(daysSinceStart / weighInIntervalDays) + 1 : null;

    const explicitStatus = statusRecord?.status || null;
    const isCompleted =
      !isFutureDay &&
      (explicitStatus === "done" ||
        (explicitStatus !== "missed" && totalSetsCount > 0 && completedSetsCount >= totalSetsCount));
    const isMissed =
      !isFutureDay &&
      !isBeforeStart &&
      isWorkoutDay &&
      (explicitStatus === "missed" || (!isCompleted && isPastDay));
    const kcalBurned = isCompleted ? (sess ? sess.durationMin * 7 : 350) : 0;
    const isUnreportedToday = isToday && isWorkoutDay && !isCompleted && !isMissed;
    const canReportStatus = !isFutureDay && !isBeforeStart && (isWorkoutDay || isCompleted || isMissed);
    const lockReason = isFutureDay
      ? `Chưa tới ngày tập (còn ${daysFromToday} ngày) — Không thể chốt Done trước tương lai.`
      : isBeforeStart
      ? `Trước ngày khởi đầu (${formatVNShortDate(startDateISO)}) — Lộ trình chưa bắt đầu.`
      : !isWorkoutDay
      ? "Ngày nghỉ hồi phục — Đổi sang Giáo án tập nếu bạn muốn tập thêm hôm nay."
      : null;

    let badge = dayShort;
    if (isCompleted) {
      badge = "Đã tập Done";
    } else if (isMissed) {
      badge = "Bỏ tập · Cần bù";
    } else if (isBeforeStart) {
      badge = isToday ? "Hôm nay · Chuẩn bị" : "Chưa bắt đầu";
    } else if (isToday) {
      badge = isWorkoutDay ? "Hôm nay · Lịch tập" : "Hôm nay · Chuẩn bị";
    } else if (isFirstWorkout) {
      badge = isTomorrow ? "Ngày mai · Khởi đầu" : "Buổi 1 · Khởi đầu";
    } else if (isTomorrow) {
      badge = "Ngày mai";
    } else if (isWorkoutDay && sess) {
      badge = sess.shortName;
    } else {
      badge = "Nghỉ hồi phục";
    }

    let note = "";
    if (isCompleted && sess) {
      note = `Đã hoàn thành ${sess.title} (${completedSetsCount}/${totalSetsCount} hiệp · Tổng tạ ${totalVolumeKg.toLocaleString("vi-VN")}kg · Đốt ~${kcalBurned} kcal).`;
    } else if (isMissed && sess) {
      note = `Bỏ lỡ ${sess.title} ngày ${formatVNShortDate(isoDate)}. Hệ thống khuyên dời bù buổi này sang ngày nghỉ gần nhất để không đứt chuỗi tăng cơ.`;
    } else if (isToday && !isWorkoutDay) {
      const nextTomorrow = addDaysISO(todayISO, 1);
      const nextDow = parseISODate(nextTomorrow).getDay();
      const nextRule = dateOverrides[nextTomorrow] || weeklyPattern[nextDow] || { sessionId: "press_day", workoutTime: "06:00" };
      const nextSess = WORKOUT_SESSIONS[nextRule.sessionId] || WORKOUT_SESSIONS.press_day;
      note = `Hôm nay (${formatVNShortDate(todayISO)}): Tối nay lúc ${preSleepAlertTime} hệ thống báo soạn sẵn đồ tập & bình nước để ${nextRule.workoutTime} sáng mai (${DAY_SHORT_NAMES[nextDow]} ${formatVNShortDate(nextTomorrow)}) bắt đầu ${nextSess.shortName}.`;
    } else if (isWorkoutDay && sess) {
      note = `${sess.title} lúc ${workoutTime}. Nhắc đi ngủ từ tối hôm trước lúc ${preSleepAlertTime} (Ngủ lúc ${sleepTargetTime}).`;
    } else {
      note = `Nghỉ tập tạ — Đi bộ nhẹ 7,000 bước, giãn cơ đĩa đệm và uống đủ nước trong ngày.`;
    }

    return {
      id: `day_${isoDate}`,
      isoDate,
      dayOfWeek: dow,
      dayShort,
      dayNumber: dt.getDate(),
      dateLabel: formatVNDate(isoDate),
      shortDate: formatVNShortDate(isoDate),
      badge,
      isToday,
      isTomorrow,
      isFirstWorkout,
      isBeforeStart,
      isPastDay,
      isFutureDay,
      daysFromToday,
      isWeighInDay,
      weighInIndex,
      isUnreportedToday,
      canReportStatus,
      lockReason,
      isWorkoutDay,
      isOverridden: Boolean(dateOverrides[isoDate]),
      sessionId,
      workoutTime,
      preSleepAlertTime,
      sleepTargetTime,
      wakeAlertTime,
      completedSetsCount,
      totalSetsCount,
      totalVolumeKg,
      kcalBurned,
      explicitStatus,
      completedAt: statusRecord?.completedAt || null,
      isCompleted,
      isMissed,
      note
    };
  }

  function buildDefaultDayStatusMap() {
    return {};
  }

  function buildStreakSummary(options) {
    const opts = options || {};
    const todayISO = opts.todayISO || getTodayISO();
    const allEntries = [];
    for (let offset = -14; offset <= 7; offset++) {
      const dISO = addDaysISO(todayISO, offset);
      allEntries.push(buildDayScheduleEntry(dISO, opts));
    }

    const doneDays = allEntries
      .filter((d) => d.isCompleted)
      .sort((a, b) => diffDaysISO(b.isoDate, a.isoDate));

    const missedDays = allEntries
      .filter((d) => d.isMissed)
      .sort((a, b) => diffDaysISO(b.isoDate, a.isoDate));

    let currentStreak = 0;
    let bestStreak = 0;
    let running = 0;

    allEntries.forEach((d) => {
      if (d.isCompleted) {
        running += 1;
        if (running > bestStreak) bestStreak = running;
      } else if (d.isMissed) {
        running = 0;
      }
    });

    const pastOrTodayWorkouts = allEntries.filter(
      (d) => (d.isWorkoutDay || d.isCompleted || d.isMissed) && diffDaysISO(d.isoDate, todayISO) <= 0
    );
    for (let i = pastOrTodayWorkouts.length - 1; i >= 0; i--) {
      const item = pastOrTodayWorkouts[i];
      if (item.isCompleted) {
        currentStreak += 1;
      } else if (item.isMissed) {
        break;
      }
    }

    const totalVolumeKg = doneDays.reduce((acc, d) => acc + (d.totalVolumeKg || 0), 0);
    const totalKcalBurned = doneDays.reduce((acc, d) => acc + (d.kcalBurned || 0), 0);
    const totalSetsDone = doneDays.reduce((acc, d) => acc + (d.completedSetsCount || 0), 0);
    const totalTracked = doneDays.length + missedDays.length;
    const disciplineScore = totalTracked > 0 ? Math.round((doneDays.length / totalTracked) * 100) : 100;

    const mondayISO = getMondayISO(todayISO);
    const timeline14 = [];
    for (let i = 0; i < 14; i++) {
      timeline14.push(buildDayScheduleEntry(addDaysISO(mondayISO, i), opts));
    }

    const nextRestDayForMakeup =
      allEntries.find(
        (d) => diffDaysISO(d.isoDate, opts.startDateISO || todayISO) >= 0 && diffDaysISO(d.isoDate, todayISO) >= 0 && !d.isWorkoutDay && !d.isCompleted
      ) || null;

    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      doneCount: doneDays.length,
      missedCount: missedDays.length,
      disciplineScore,
      totalVolumeKg,
      totalKcalBurned,
      totalSetsDone,
      doneDays,
      missedDays,
      timeline14,
      nextRestDayForMakeup
    };
  }

  function buildDynamicWeek(weekOffset, options) {
    const opts = options || {};
    const todayISO = opts.todayISO || getTodayISO();
    const baseMondayISO = getMondayISO(todayISO);
    const targetMondayISO = addDaysISO(baseMondayISO, Number(weekOffset || 0) * 7);
    const targetSundayISO = addDaysISO(targetMondayISO, 6);

    const startDateISO = opts.startDateISO || addDaysISO(todayISO, 1);
    const startMondayISO = getMondayISO(startDateISO);
    const weeksSinceStart = Math.floor(diffDaysISO(targetMondayISO, startMondayISO) / 7);
    const programWeekNumber = weeksSinceStart >= 0 ? weeksSinceStart + 1 : 1;
    const cycleWeek = ((programWeekNumber - 1) % 4) + 1;
    const isDeloadWeek = cycleWeek === 4 && weeksSinceStart >= 0;

    let mesocycleTitle = `Tuần ${programWeekNumber} · Giai đoạn Tích Lũy & Chuẩn Kỹ Thuật`;
    let mesocycleAdvice = "Giữ đúng nhịp độ 3 pha, hoàn thành đủ số hiệp mục tiêu.";
    if (cycleWeek === 2) {
      mesocycleTitle = `Tuần ${programWeekNumber} · Tăng Tải Tuần Tiến (Progressive Overload)`;
      mesocycleAdvice = "Cố gắng tăng thêm +1 rep mỗi hiệp hoặc +2.5kg ở bài chủ lực Tier S so với tuần trước.";
    } else if (cycleWeek === 3) {
      mesocycleTitle = `Tuần ${programWeekNumber} · Đỉnh Khối Lượng Chu Kỳ (Peak Volume)`;
      mesocycleAdvice = "Tuần tập sung sức nhất trước khi bước vào tuần giảm tải hồi phục khớp.";
    } else if (isDeloadWeek) {
      mesocycleTitle = `Tuần ${programWeekNumber} · DELOAD Giảm Tải Hồi Phục Sụn Khớp`;
      mesocycleAdvice = "Giảm 30% số hiệp hoặc giảm 10% mức tạ để gân, khớp vai và đĩa đệm siêu hồi phục.";
    }

    const weeklyRateKg = Number(opts.weeklyRateKg) || -0.75;
    const currentWeightKg = Number(opts.currentWeightKg) || 115;
    const targetWeightKg = Number(opts.targetWeightKg) || 95;
    const rawProjected = currentWeightKg + Math.max(0, weeksSinceStart) * weeklyRateKg;
    const projectedWeightKg = Number(
      (weeklyRateKg < 0
        ? Math.max(targetWeightKg, rawProjected)
        : Math.min(targetWeightKg, rawProjected)
      ).toFixed(1)
    );

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dISO = addDaysISO(targetMondayISO, i);
      days.push(buildDayScheduleEntry(dISO, opts));
    }

    const monDt = parseISODate(targetMondayISO);
    return {
      weekOffset: Number(weekOffset || 0),
      mondayISO: targetMondayISO,
      sundayISO: targetSundayISO,
      weekRangeLabel: `${formatVNShortDate(targetMondayISO)} – ${formatVNDate(targetSundayISO)}`,
      monthYearLabel: `Tháng ${monDt.getMonth() + 1} / ${monDt.getFullYear()}`,
      programWeekNumber,
      cycleWeek,
      isDeloadWeek,
      mesocycleTitle,
      mesocycleAdvice,
      projectedWeightKg,
      days
    };
  }

  function buildDynamicMonth(monthOffset, options) {
    const opts = options || {};
    const todayISO = opts.todayISO || getTodayISO();
    const todayDt = parseISODate(todayISO);
    const firstOfMonth = new Date(todayDt.getFullYear(), todayDt.getMonth() + Number(monthOffset || 0), 1, 12, 0, 0);
    const year = firstOfMonth.getFullYear();
    const month = firstOfMonth.getMonth();
    const firstISO = formatISODate(firstOfMonth);
    const gridStartMondayISO = getMondayISO(firstISO);

    const cells = [];
    for (let i = 0; i < 35; i++) {
      const dISO = addDaysISO(gridStartMondayISO, i);
      const dt = parseISODate(dISO);
      const entry = buildDayScheduleEntry(dISO, opts);
      entry.inCurrentMonth = dt.getMonth() === month;
      cells.push(entry);
    }

    return {
      monthOffset: Number(monthOffset || 0),
      monthLabel: `Tháng ${month + 1} / ${year}`,
      year,
      month: month + 1,
      cells
    };
  }

  function generateICSCalendar(scheduleList, profile) {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//8D Gym Check//Sherpa Coach//VI",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];
    (scheduleList || DEFAULT_WEEKLY_SCHEDULE).forEach((day) => {
      if (!day.isWorkoutDay || !day.sessionId || day.sessionId === "rest") return;
      const sess = WORKOUT_SESSIONS[day.sessionId] || WORKOUT_SESSIONS.press_day;
      const dateCompact = String(day.isoDate || "2026-11-10").replace(/-/g, "");
      const wkParts = String(day.workoutTime || "06:00").split(":");
      const hh = pad2(Number(wkParts[0]) || 6);
      const mm = pad2(Number(wkParts[1]) || 0);
      const endMin = (Number(wkParts[0]) || 6) * 60 + (Number(wkParts[1]) || 0) + (sess.durationMin || 55);
      const endHH = pad2(Math.floor(endMin / 60) % 24);
      const endMM = pad2(endMin % 60);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:8dgym-${day.id}@sherpa.local`);
      lines.push(`DTSTAMP:20261109T080000Z`);
      lines.push(`DTSTART;TZID=Asia/Ho_Chi_Minh:${dateCompact}T${hh}${mm}00`);
      lines.push(`DTEND;TZID=Asia/Ho_Chi_Minh:${dateCompact}T${endHH}${endMM}00`);
      lines.push(`RRULE:FREQ=WEEKLY;COUNT=12`);
      lines.push(`SUMMARY:[Gấu Gym 8D] ${sess.title}`);
      lines.push(`DESCRIPTION:Mục tiêu: ${sess.targetMuscles}. Chuẩn bị chuối + nước ấm trước tập 35 phút. Ngủ đủ từ tối hôm trước (${day.sleepTargetTime}).`);
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-PT8H45M");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:Nhắc trước khi đi ngủ (${day.preSleepAlertTime}): Soạn đồ tập cho ${sess.shortName} lúc ${day.workoutTime} sáng mai!`);
      lines.push("END:VALARM");
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-PT45M");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:Thức dậy uống 400ml nước ấm & ăn nhẹ trước ${sess.shortName} lúc ${day.workoutTime}!`);
      lines.push("END:VALARM");
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:PT12H");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:Bạn có 1 buổi tập hôm nay (${sess.shortName})? Vào Gấu Gym 8D báo cáo ngay (Chốt Done hoặc Báo Bận) để giữ Streak!`);
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    });

    const firstDay = (scheduleList && scheduleList[0]?.isoDate) || getTodayISO();
    const weighCompact = String(firstDay).replace(/-/g, "");
    const intervalWeeks = Number(profile?.weighInIntervalDays) === 14 ? 2 : 1;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:8dgym-weighin-${weighCompact}@sherpa.local`);
    lines.push(`DTSTAMP:20261109T080000Z`);
    lines.push(`DTSTART;TZID=Asia/Ho_Chi_Minh:${weighCompact}T053000`);
    lines.push(`DTEND;TZID=Asia/Ho_Chi_Minh:${weighCompact}T054500`);
    lines.push(`RRULE:FREQ=WEEKLY;INTERVAL=${intervalWeeks};COUNT=16`);
    lines.push(`SUMMARY:[Gấu Gym 8D] Kỳ Cân Định Kỳ (${intervalWeeks} Tuần/Lần) & Cập Nhật Biểu Đồ`);
    lines.push(`DESCRIPTION:Cân lúc sáng sớm sau khi vệ sinh, trước khi ăn uống rồi nhập vào tab Thể Trạng -> Biểu Đồ Cân Nặng để hệ thống tính toán lại Calo & TDEE.`);
    lines.push("BEGIN:VALARM");
    lines.push("TRIGGER:-PT5M");
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:Đến kỳ cân kiểm tra định kỳ (${intervalWeeks} tuần/lần)! Hãy cân sáng bụng rỗng và cập nhật vào Gấu Gym 8D.`);
    lines.push("END:VALARM");
    lines.push("END:VEVENT");

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  const WORKOUT_SPLITS = {
    joint_safe_4d: {
      id: "joint_safe_4d",
      name: "Lịch 4 Buổi: Upper / Lower Bảo Vệ Khớp (Tối ưu cho BMI >= 28 / >95kg)",
      badge: "Khuyên dùng cho 115kg",
      daysPerWeek: 4,
      description: "Loại bỏ hoàn toàn bài chạy nhảy chèn ép sụn gối & cột sống. Kết hợp 40p Tạ có điểm tựa + 15p Đi bộ dốc.",
      sessions: [
        {
          id: "js_upper_a",
          title: "Buổi 1: Thân Trên A (Ngực, Lưng Xô, Tay & Đi Bộ Dốc)",
          durationMin: 55,
          mascot: "benchPress",
          exerciseIds: ["incline_db_press", "lat_pulldown", "seated_cable_row", "dumbbell_shoulder_press", "dumbbell_curl_lateral", "incline_treadmill_walk"]
        },
        {
          id: "js_lower_a",
          title: "Buổi 2: Thân Dưới A (Đạp Đùi 45°, Đùi Sau & Đi Bộ Dốc)",
          durationMin: 50,
          mascot: "legPress",
          exerciseIds: ["leg_press_45", "dumbbell_rdl", "plank_core", "incline_treadmill_walk"]
        }
      ]
    },
    upper_lower_4d: {
      id: "upper_lower_4d",
      name: "Lịch 4 Buổi: Upper / Lower Tiêu Chuẩn (Tăng Cơ Toàn Diện)",
      badge: "Phổ biến nhất",
      daysPerWeek: 4,
      description: "Kích thích mỗi nhóm cơ đúng 2 lần/tuần, cân bằng hoàn hảo cho người đi làm.",
      sessions: [
        {
          id: "ul_upper",
          title: "Upper A: Đẩy Ngực, Kéo Xô & Tay Vai",
          durationMin: 55,
          mascot: "benchPress",
          exerciseIds: ["barbell_bench_press", "lat_pulldown", "incline_db_press", "seated_cable_row", "dumbbell_curl_lateral"]
        },
        {
          id: "ul_lower",
          title: "Lower A: Đạp Đùi, RDL & Core",
          durationMin: 50,
          mascot: "legPress",
          exerciseIds: ["leg_press_45", "dumbbell_rdl", "incline_treadmill_walk"]
        }
      ]
    },
    full_body_3d: {
      id: "full_body_3d",
      name: "Lịch 3 Buổi: Full Body Linh Hoạt (T2 - T4 - T6)",
      badge: "Dễ duy trì",
      daysPerWeek: 3,
      description: "Tác động toàn thân trong 50 phút, lỡ bận 1 buổi trong tuần cũng không bị lệch nhóm cơ.",
      sessions: [
        {
          id: "fb_a",
          title: "Full Body A: Ngực, Lưng, Chân & Cardio Nhẹ",
          durationMin: 55,
          mascot: "dumbbellCurl",
          exerciseIds: ["incline_db_press", "lat_pulldown", "leg_press_45", "dumbbell_curl_lateral", "incline_treadmill_walk"]
        }
      ]
    }
  };

  function calculatePlates(totalKg, barKg) {
    const bar = Number(barKg) || 20;
    const target = Math.max(bar, Number(totalKg) || bar);
    let perSide = Number(((target - bar) / 2).toFixed(2));
    const denominations = [20, 15, 10, 5, 2.5, 1.25];
    const plates = [];
    let rem = perSide;
    for (const d of denominations) {
      while (rem >= d - 0.001) {
        plates.push(d);
        rem = Number((rem - d).toFixed(2));
      }
    }
    return {
      totalKg: target,
      barKg: bar,
      perSideKg: perSide,
      platesPerSide: plates
    };
  }

  const VN_FOODS = [
    {
      id: "pho_bo_tai",
      name: "Phở bò tái nạc (Bớt 1/3 bánh, nước trong)",
      portion: "1 tô vừa",
      kcal: 430,
      protein: 32,
      carb: 52,
      fat: 10,
      tip: "Dặn quán không lấy nước béo, bớt bánh phở, gọi thêm 50g thịt bò tái."
    },
    {
      id: "uc_ga_ap_chao",
      name: "Ức gà phi lê áp chảo / luộc",
      portion: "200g chín",
      kcal: 330,
      protein: 62,
      carb: 0,
      fat: 7,
      tip: "Nguồn đạm tinh khiết nhất; ướp tiêu chanh hoặc sốt teriyaki ít đường cho dễ ăn."
    },
    {
      id: "whey_isolate",
      name: "Whey Protein Isolate (1 muỗng)",
      portion: "1 scoop (30g)",
      kcal: 120,
      protein: 25,
      carb: 2,
      fat: 1,
      tip: "Pha với 250ml nước lọc uống ngay sau tập hoặc kèm bữa phụ chiều."
    },
    {
      id: "com_van_phong_bo",
      name: "Cơm trưa văn phòng (1.5 chén cơm + Bò/Cá + Rau)",
      portion: "1 phần chuẩn",
      kcal: 640,
      protein: 44,
      carb: 74,
      fat: 16,
      tip: "Ăn hết đĩa rau luộc trước khi ăn cơm để no lâu và ổn định đường huyết."
    },
    {
      id: "trung_ga_luoc",
      name: "Trứng gà luộc / ốp la ít dầu",
      portion: "2 quả lớn",
      kcal: 155,
      protein: 13,
      carb: 1,
      fat: 11,
      tip: "Bữa sáng hoặc bữa phụ giàu choline và chất béo tốt cho hormone."
    },
    {
      id: "chuoi_chin",
      name: "Chuối chín + Cafe đen (Bữa nhẹ 05:25 trước tập)",
      portion: "1 quả vừa + 1 ly",
      kcal: 110,
      protein: 1,
      carb: 27,
      fat: 0,
      tip: "Nạp đường huyết tức thì cho ca tập 6h sáng mà không gây xóc bụng."
    },
    {
      id: "sua_chua_hy_lap",
      name: "Sữa chua Hy Lạp không đường",
      portion: "1 hộp (150g)",
      kcal: 130,
      protein: 15,
      carb: 6,
      fat: 4,
      tip: "Ăn lúc 16h chiều giúp cắt cơn thèm ăn vặt lúc tan làm."
    },
    {
      id: "ca_hoi_hoac_ca_thu",
      name: "Cá áp chảo / kho nhạt + Đậu phụ + Rau",
      portion: "180g cá + 100g đậu",
      kcal: 460,
      protein: 46,
      carb: 12,
      fat: 22,
      tip: "Bữa tối nhẹ bụng giàu Omega-3 giúp giảm viêm khớp và dễ ngủ lúc 21:45."
    }
  ];

  function calculateWeightTrend(logs) {
    const list = Array.isArray(logs) ? logs : [];
    return list.map((item, idx) => {
      const slice = list.slice(Math.max(0, idx - 6), idx + 1);
      const avg = slice.reduce((s, x) => s + Number(x.weight), 0) / slice.length;
      return {
        date: item.date,
        isoDate: item.isoDate || null,
        scaleWeight: Number(item.weight),
        trendWeight: Number(avg.toFixed(2))
      };
    });
  }

  function buildWeightTrackerSummary(options) {
    const opts = options || {};
    const todayISO = opts.todayISO || getTodayISO();
    const startDateISO = opts.startDateISO || addDaysISO(todayISO, 1);
    const intervalDays = Number(opts.weighInIntervalDays) === 14 ? 14 : 7;
    const startWeight = Number(opts.initialWeightKg || opts.currentWeightKg || 115);
    const currentWeight = Number(opts.currentWeightKg || startWeight);
    const targetWeight = Number(opts.targetWeightKg || 95);
    const weeklyRate = Number(opts.weeklyRateKg || -0.75);
    const rawLogs = Array.isArray(opts.weightLogs) ? opts.weightLogs : [];

    const normalizedLogs = rawLogs
      .filter((x) => x && Number.isFinite(Number(x.weight)))
      .map((x) => ({
        isoDate: x.isoDate || todayISO,
        dateLabel: x.dateLabel || formatVNShortDate(x.isoDate || todayISO),
        weight: Number(Number(x.weight).toFixed(1)),
        note: x.note || "Cân sáng bụng rỗng"
      }))
      .sort((a, b) => diffDaysISO(a.isoDate, b.isoDate));

    const effectiveLogs =
      normalizedLogs.length > 0
        ? normalizedLogs
        : [
            {
              isoDate: todayISO,
              dateLabel: formatVNShortDate(todayISO),
              weight: startWeight,
              note: "Cân nặng khởi điểm"
            }
          ];

    const latestLog = effectiveLogs[effectiveLogs.length - 1];
    const firstLog = effectiveLogs[0];
    const deltaFromStart = Number((latestLog.weight - firstLog.weight).toFixed(1));
    const remainingToGoal = Number(Math.abs(targetWeight - latestLog.weight).toFixed(1));
    const totalGoalSpan = Math.max(0.5, Math.abs(targetWeight - firstLog.weight));
    const achievedSpan = Math.max(0, Math.abs(firstLog.weight - latestLog.weight));
    const progressPct = Math.min(100, Math.round((achievedSpan / totalGoalSpan) * 100));

    // Find next weigh-in date aligned with startDateISO + k * intervalDays
    let nextWeighInISO = startDateISO;
    let k = 0;
    while (diffDaysISO(nextWeighInISO, todayISO) < 0 && k < 100) {
      k += 1;
      nextWeighInISO = addDaysISO(startDateISO, k * intervalDays);
    }
    // If today already has a weigh-in logged and nextWeighInISO === todayISO, advance to next cycle
    const hasLoggedToday = normalizedLogs.some((l) => l.isoDate === todayISO);
    if (nextWeighInISO === todayISO && hasLoggedToday) {
      nextWeighInISO = addDaysISO(todayISO, intervalDays);
    }
    const daysUntilNextWeighIn = Math.max(0, diffDaysISO(nextWeighInISO, todayISO));
    const isWeighInDueToday =
      (diffDaysISO(todayISO, startDateISO) >= 0 &&
        diffDaysISO(todayISO, startDateISO) % intervalDays === 0 &&
        !hasLoggedToday) ||
      (normalizedLogs.length > 0 && diffDaysISO(todayISO, latestLog.isoDate) >= intervalDays);

    // Build 7 checkpoints for the SVG chart (Checkpoints 0..6 spaced by intervalDays)
    const checkpoints = [];
    for (let i = 0; i < 7; i++) {
      const cpISO = addDaysISO(startDateISO, i * intervalDays);
      const weeksElapsed = (i * intervalDays) / 7;
      const rawExpected = firstLog.weight + weeksElapsed * weeklyRate;
      const expectedWeight = Number(
        (weeklyRate < 0
          ? Math.max(targetWeight, rawExpected)
          : Math.min(targetWeight, rawExpected)
        ).toFixed(1)
      );
      // Match logged weight if within +/-3 days of checkpoint, or at i === 0 use firstLog
      let matchedLog = null;
      if (i === 0) {
        matchedLog = firstLog;
      } else {
        matchedLog =
          normalizedLogs.find((l) => Math.abs(diffDaysISO(l.isoDate, cpISO)) <= 3) || null;
      }
      checkpoints.push({
        index: i + 1,
        isoDate: cpISO,
        shortDate: formatVNShortDate(cpISO),
        label: i === 0 ? "Khởi điểm" : `Kỳ ${i}`,
        expectedWeight,
        actualWeight: matchedLog ? matchedLog.weight : null,
        isFuture: diffDaysISO(cpISO, todayISO) > 0
      });
    }

    return {
      intervalDays,
      startWeight: firstLog.weight,
      latestWeight: latestLog.weight,
      targetWeight,
      deltaFromStart,
      remainingToGoal,
      progressPct,
      nextWeighInISO,
      nextWeighInLabel: `${DAY_SHORT_NAMES[parseISODate(nextWeighInISO).getDay()]} · ${formatVNDate(nextWeighInISO)}`,
      nextWeighInShort: formatVNShortDate(nextWeighInISO),
      daysUntilNextWeighIn,
      isWeighInDueToday,
      hasLoggedToday,
      logs: effectiveLogs,
      checkpoints
    };
  }

  function buildPersonalizedRecommendation(metrics, firstSessionId, startDateISO) {
    const p = metrics.profile;
    const sess = WORKOUT_SESSIONS[firstSessionId || "press_day"] || WORKOUT_SESSIONS.press_day;
    const startVN = formatVNDate(startDateISO || addDaysISO(getTodayISO(), 1));
    const startDow = DAY_SHORT_NAMES[parseISODate(startDateISO || addDaysISO(getTodayISO(), 1)).getDay()];

    let strategyHeadline = "";
    let trainingStrategy = "";
    let cardioStrategy = "";
    let calorieStrategy = "";

    if (metrics.jointSafeMode) {
      strategyHeadline = `Phác Đồ Giảm Mỡ Bảo Vệ Sụn Khớp & Cột Sống (${p.weightKg}kg -> ${p.targetWeightKg}kg)`;
      trainingStrategy = `Với BMI ${metrics.bmi} (${metrics.bmiCategory}), áp lực dội lên khớp gối khi chạy nhảy gấp 4 lần trọng lượng cơ thể. Hệ thống tự động khóa các bài nhảy/chạy bộ và ưu tiên 100% bài tập Tạ có ghế tựa lưng (Đẩy ngực dốc 30°, Đẩy vai tựa 75°, Đạp đùi 45°, Kéo xô cáp).`;
      cardioStrategy = `Thay thế hoàn toàn chạy bộ bằng 15 phút Đi Bộ Dốc (Incline 10% · Tốc độ 4.4 km/h) cuối buổi tập ở vùng nhịp tim đốt mỡ Zone 2 (${metrics.zone2Min}–${metrics.zone2Max} nhịp/phút).`;
    } else if (p.goal === "bulk" || metrics.bmi < 19.5) {
      strategyHeadline = `Phác Đồ Tăng Cơ Nạc & Cải Thiện Khung Xương (${p.weightKg}kg -> ${p.targetWeightKg}kg)`;
      trainingStrategy = `Tập trung 80% năng lượng vào các bài Đa Khớp Tier S (Đẩy ngực tạ đơn/đòn, Kéo xô, Đạp đùi, RDL) trong khoảng 8–12 reps, áp dụng nguyên tắc Double Progression tăng dần mức tạ.`;
      cardioStrategy = `Chỉ đi bộ nhẹ 10 phút sau tập để kích thích tuần hoàn và tiêu hóa, giữ năng lượng phục vụ tăng cơ.`;
    } else {
      strategyHeadline = `Phác Đồ Tái Cấu Trúc Cơ Thể — Tăng Cơ Giảm Mỡ (${p.weightKg}kg -> ${p.targetWeightKg}kg)`;
      trainingStrategy = `Kết hợp lịch tập 4 buổi/tuần (Buổi Đẩy · Buổi Kéo · Buổi Chân · Thân Trên) giúp kích thích mỗi nhóm cơ đúng 2 lần/tuần — tần suất vàng để săn chắc cơ bắp.`;
      cardioStrategy = `Kết hợp 12–15 phút Đi bộ dốc cuối buổi tập và duy trì 7,000 bước chân mỗi ngày.`;
    }

    if (metrics.calorieDelta < -100) {
      calorieStrategy = `TDEE tiêu hao của bạn là ${metrics.tdee} kcal/ngày. Để giảm mỡ bền vững mà không bị mất cơ hay tụt huyết áp lúc tập ${p.workoutTime}, hệ thống đề xuất cắt giảm ${Math.abs(metrics.calorieDelta)} kcal/ngày -> Mục tiêu ăn ${metrics.targetKcal} kcal/ngày (giữ cao hơn mức BMR nền tảng ${metrics.bmr} kcal). Dự kiến giảm ~${Math.abs(metrics.weeklyRateKg)} kg/tuần và đạt ${p.targetWeightKg}kg sau khoảng ${metrics.weeksToGoal} tuần.`;
    } else if (metrics.calorieDelta > 100) {
      calorieStrategy = `TDEE của bạn là ${metrics.tdee} kcal/ngày. Hệ thống đề xuất thặng dư sạch +${metrics.calorieDelta} kcal/ngày -> Mục tiêu ăn ${metrics.targetKcal} kcal/ngày để xây dựng cơ bắp tối đa mà không tích mỡ bụng.`;
    } else {
      calorieStrategy = `Duy trì mức năng lượng cân bằng ${metrics.targetKcal} kcal/ngày kết hợp lượng đạm cao ${metrics.proteinG}g/ngày để vừa đốt mỡ vừa tăng khối lượng cơ nạc.`;
    }

    const habitBlueprint = [
      {
        time: metrics.circadianSchedule.bedPrepTime,
        title: "Thông báo trước khi ngủ (Tối hôm trước)",
        detail: `Nhắc soạn sẵn quần áo tập, bình nước 1L và ngừng xem điện thoại để chuẩn bị cho ca tập ${p.workoutTime} sáng mai.`
      },
      {
        time: metrics.circadianSchedule.sleepTime,
        title: "Giờ ngủ bắt buộc (Đủ 7.5 tiếng / 5 chu kỳ)",
        detail: `Giúp tiết Hormone tăng trưởng (GH), giảm Cortisol tích mỡ bụng và phục hồi hệ thần kinh trung ương.`
      },
      {
        time: metrics.circadianSchedule.wakeTime,
        title: "Thức dậy + Uống 400ml nước ấm",
        detail: `Đi lại nhẹ nhàng 30 phút để đĩa đệm cột sống xả bớt áp lực nước trước khi chịu tải tạ.`
      },
      {
        time: metrics.circadianSchedule.preWorkoutMealTime,
        title: "Nạp năng lượng nhanh trước tập",
        detail: `1 quả chuối chín + 1/2 muỗng Whey (hoặc 1 ly Cafe đen không đường) giúp tỉnh táo và không bị xóc bụng.`
      },
      {
        time: p.workoutTime,
        title: `Khởi đầu: ${startDow} (${startVN}) — ${sess.shortName}`,
        detail: `Thực hiện ${sess.exerciseIds.length} bài tập theo thứ tự ưu tiên từ Tier S xuống bài bổ trợ trong ${sess.durationMin} phút.`
      }
    ];

    return {
      strategyHeadline,
      trainingStrategy,
      cardioStrategy,
      calorieStrategy,
      habitBlueprint,
      firstSessionTitle: sess.title,
      startLabel: `${startDow} · ${startVN}`
    };
  }

  global.GymCore = {
    MASCOT_ASSETS,
    resolveAsset,
    PRESET_PROFILES,
    calculateMetrics,
    EXERCISES,
    WORKOUT_SESSIONS,
    WORKOUT_SPLITS,
    DEFAULT_WEEKLY_SCHEDULE,
    DAY_SHORT_NAMES,
    getTodayISO,
    addDaysISO,
    diffDaysISO,
    getMondayISO,
    formatVNDate,
    formatVNShortDate,
    buildDefaultWeeklyPattern,
    buildDefaultDayStatusMap,
    buildDayScheduleEntry,
    buildStreakSummary,
    buildDynamicWeek,
    buildDynamicMonth,
    buildPersonalizedRecommendation,
    generateICSCalendar,
    calculatePlates,
    calculateWeightTrend,
    buildWeightTrackerSummary,
    VN_FOODS
  };
})(typeof window !== "undefined" ? window : globalThis);
