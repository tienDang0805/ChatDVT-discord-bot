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
    inclineDbPress: "../assets/mascots/mascot_incline_db_press.png",
    machineChestPress: "../assets/mascots/mascot_machine_chest_press.png",
    isoInclinePress: "../assets/mascots/mascot_iso_incline_press.png",
    smithInclinePress: "../assets/mascots/mascot_smith_incline_press.png",
    assistedChestDip: "../assets/mascots/mascot_assisted_chest_dip.png",
    cableCrossoverFly: "../assets/mascots/mascot_cable_crossover_fly.png",
    machineShoulderPress: "../assets/mascots/mascot_machine_shoulder_press.png",
    smithShoulderPress: "../assets/mascots/mascot_smith_shoulder_press.png",
    cableLateralRaise: "../assets/mascots/mascot_cable_lateral_raise.png",
    machineLateralRaise: "../assets/mascots/mascot_machine_lateral_raise.png",
    reversePecDeck: "../assets/mascots/mascot_reverse_pec_deck.png",
    overheadTricepExt: "../assets/mascots/mascot_overhead_tricep_ext.png",
    seatedDipMachine: "../assets/mascots/mascot_seated_dip_machine.png",
    isoHighRow: "../assets/mascots/mascot_iso_high_row.png",
    closeNeutralPulldown: "../assets/mascots/mascot_close_neutral_pulldown.png",
    assistedPullUp: "../assets/mascots/mascot_assisted_pull_up.png",
    tbarRow: "../assets/mascots/mascot_tbar_row.png",
    machineSeatedRow: "../assets/mascots/mascot_machine_seated_row.png",
    oneArmDbRow: "../assets/mascots/mascot_one_arm_db_row.png",
    ropeFacePull: "../assets/mascots/mascot_rope_face_pull.png",
    preacherCurl: "../assets/mascots/mascot_preacher_curl.png",
    cableHammerCurl: "../assets/mascots/mascot_cable_hammer_curl.png",
    abCrunchMachine: "../assets/mascots/mascot_ab_crunch_machine.png",
    hackSquat: "../assets/mascots/mascot_hack_squat.png",
    smithBoxSquat: "../assets/mascots/mascot_smith_box_squat.png",
    legExtension: "../assets/mascots/mascot_leg_extension.png",
    seatedLegCurl: "../assets/mascots/mascot_seated_leg_curl.png",
    hipThrust: "../assets/mascots/mascot_hip_thrust.png",
    seatedCalfRaise: "../assets/mascots/mascot_seated_calf_raise.png",
    stairStepper: "../assets/mascots/mascot_stair_stepper.png",
    rowingMachine: "../assets/mascots/mascot_rowing_machine.png",
    ellipticalTrainer: "../assets/mascots/mascot_elliptical.png",
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
      mascot: "inclineDbPress",
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
      mascot: "machineChestPress",
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
    },
    iso_incline_chest_press: {
      id: "iso_incline_chest_press",
      name: "Máy Đẩy Ngực Trên Lắp Tạ Rời (Iso-Lateral Incline Press)",
      shortName: "Máy Ngực Trên Lắp Tạ",
      muscle: "Ngực Trên & Vai Trước",
      equipment: "Máy lắp bánh tạ rời (Plate-Loaded)",
      mascot: "isoInclinePress",
      tier: "Tier S · Đặc Trưng Ways QL13",
      priorityRank: 1,
      slotGroup: "chest_press",
      availableGyms: ["ways_ql13"],
      machineBrand: "Hammer / Iso-Lateral Plate-Loaded",
      gymSetup: {
        ways_ql13: "Khu Plate-Loaded tầng 4 Ways 361 QL13: Lắp bánh tạ 10–20kg mỗi bên, chỉnh yên ghế nấc 3 để tay cầm ngang xương đòn dưới.",
        tng_uvk: "Tại TNG 58D UVK không có máy ngực trên lắp tạ rời — dùng Máy Đẩy Ngực Ngồi Chốt Tạ hoặc Đẩy Tạ Đơn Ghế Dốc 30°."
      },
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Quỹ đạo hội tụ · Lưng ghim chặt đệm",
      tempoCue: "Hạ 2.5s — Đẩy hội tụ 1.2s",
      whyItWorks: "Hai tay đòn độc lập di chuyển theo cung hội tụ tự nhiên giúp cô lập ngực trên cực đại mà không sợ tạ đè.",
      formSteps: [
        "Lắp đều bánh tạ hai bên sừng máy, chỉnh ghế sao cho tay cầm ngang ngực trên.",
        "Khép chặt hai xương bả vai tì vào đệm lưng, đẩy hai tay cầm lên theo quỹ đạo hội tụ.",
        "Hạ chậm 2.5 giây cho tới khi cơ ngực trên căng sâu rồi phát lực đẩy lên."
      ],
      cues: "Tì chặt lưng trên vào đệm, đẩy hai tay đồng đều và kiểm soát nhịp hạ.",
      mistake: "Không nhấc mông hoặc rụt cổ khi đẩy hiệp cuối.",
      swapOptions: ["incline_db_press", "machine_chest_press", "smith_incline_press"],
      swapReason: "Máy chủ lực tại Ways Station 361 Quốc Lộ 13 thay cho đẩy tạ đơn dốc trên.",
      videoUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
      videoId: "xUm0BiZCWlQ",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Iso-Lateral Incline Chest Press Technique",
      defaultSets: [
        { type: "W", prev: "Khởi động 15kg/bên", weight: 30, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý 25kg/bên", weight: 50, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý 25kg/bên", weight: 50, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý 25kg/bên", weight: 50, reps: 9, effort: "good", done: false }
      ],
      progressionBadge: "Máy Plate-Loaded chủ lực tại Ways Station 361 QL13 (3 hiệp × 8–10 reps)"
    },
    smith_incline_press: {
      id: "smith_incline_press",
      name: "Đẩy Ngực Dốc 30° Trên Máy Smith (Smith Incline Press)",
      shortName: "Đẩy Ngực Dốc Máy Smith",
      muscle: "Ngực Trên & Ngực Giữa",
      equipment: "Máy Smith + Ghế dốc 30°",
      mascot: "smithInclinePress",
      tier: "Tier S · Có Ở Cả 2 Phòng",
      priorityRank: 1,
      slotGroup: "chest_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Counter-Balanced Smith Machine",
      gymSetup: {
        tng_uvk: "Khu Máy Smith TNG 58D UVK: Kéo ghế đa năng vào giữa khung Smith, chỉnh nấc dốc 30° (nấc 2), thanh đòn xuống ngang ngực trên.",
        ways_ql13: "Khu Khung Smith Ways 361 QL13: Đặt ghế dốc 30° chính giữa, xoay cổ tay mở chốt an toàn hai bên thanh đòn."
      },
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Đòn xuống ngang xương đòn · Chốt khóa an toàn",
      tempoCue: "Hạ 2.5s — Giữ đáy 0.5s — Đẩy 1.0s",
      whyItWorks: "Thanh trượt cố định trên máy Smith loại bỏ hoàn toàn công giữ thăng bằng, giúp dồn 100% lực vào sợi cơ ngực trên và có chốt cài bảo hiểm an toàn.",
      formSteps: [
        "Đặt ghế dốc 30° ngay tâm máy Smith sao cho khi hạ thanh đòn chạm cách xương đòn 3–4cm.",
        "Cài hai chốt bảo hiểm bên dưới ở tầm ngực để luôn an toàn khi tập một mình.",
        "Hạ đòn chậm 2.5 giây mở cùi chỏ góc 45°–60°, sau đó đẩy mạnh lên."
      ],
      cues: "Luôn cài chốt bảo hiểm dưới của máy Smith trước khi tập nặng.",
      mistake: "Không đặt ghế quá xa về phía trước làm đòn hạ xuống bụng hoặc quá cao lên cổ.",
      swapOptions: ["incline_db_press", "iso_incline_chest_press", "machine_chest_press"],
      swapReason: "Cực kỳ ổn định tại cả The New Gym UVK lẫn Ways Station QL13.",
      videoUrl: "https://www.youtube.com/watch?v=ky9eCfvuLRY",
      videoId: "ky9eCfvuLRY",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Smith Machine Incline Bench Press Setup",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 35, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 55, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 55, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 55, reps: 9, effort: "good", done: false }
      ],
      progressionBadge: "An toàn tuyệt đối khi đi tập 1 mình nhờ chốt hãm Máy Smith"
    },
    assisted_chest_dip: {
      id: "assisted_chest_dip",
      name: "Xà Kép Ngực Dưới Có Máy Trợ Lực (Assisted Chest Dip)",
      shortName: "Dip Ngực Máy Trợ Lực",
      muscle: "Ngực Dưới & Tay Sau",
      equipment: "Máy Dip/Pull-up trợ lực",
      mascot: "assistedChestDip",
      tier: "Tier A · Cắt Nét Ngực Dưới",
      priorityRank: 2,
      slotGroup: "chest_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Assisted Chin/Dip Pin-Loaded",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Xoay hai tay cầm Dip ra vị trí rộng, cắm chốt trợ lực 35–50kg (càng cắm nặng càng nhẹ).",
        ways_ql13: "Khu Máy Đa Năng Ways 361 QL13: Hạ đệm quỳ gối trợ lực, hơi đổ người về trước 20° để ăn vào ngực dưới."
      },
      repRange: [10, 12],
      defaultRestSec: 90,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Đổ người về trước 20° · Trợ lực đệm gối",
      tempoCue: "Hạ 2.0s — Đẩy lên 1.2s",
      whyItWorks: "Đệm trợ lực giúp người nặng 95–115kg thực hiện động tác Dip cắt nét ngực dưới êm ái mà không quá tải khớp vai.",
      formSteps: [
        "Cắm chốt tạ trợ lực khoảng 35–45% trọng lượng cơ thể, quỳ hai gối lên đệm nâng.",
        "Hơi đổ thân trên về phía trước 20°, hạ người tới khi cánh tay trên song song sàn.",
        "Ép ngực đẩy người lên mà không khóa cứng khớp khuỷu tay."
      ],
      cues: "Lưu ý trên máy Assisted: mức tạ cắm càng lớn thì lực nâng đỡ càng nhiều.",
      mistake: "Không hạ quá sâu quá 90° ở khuỷu tay.",
      swapOptions: ["machine_chest_press", "incline_db_press", "pec_deck_fly"],
      swapReason: "Tạo viền ngực dưới vuông vức với trợ lực bảo vệ vai.",
      videoUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
      videoId: "xUm0BiZCWlQ",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Assisted Machine Chest Dips",
      defaultSets: [
        { type: "1", prev: "Trợ lực 40kg", weight: 40, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Trợ lực 40kg", weight: 40, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Trợ lực 35kg", weight: 35, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Giảm dần số kg trợ lực theo từng tuần khi cơ ngực khỏe lên"
    },
    cable_crossover_fly: {
      id: "cable_crossover_fly",
      name: "Ép Ngực Khung Cáp Đôi Từ Cao Xuống Thấp (Dual Cable Fly)",
      shortName: "Ép Ngực Khung Cáp Đôi",
      muscle: "Rãnh Ngực & Ngực Dưới",
      equipment: "Khung Cáp Đôi (Dual Adjustable Pulley)",
      mascot: "cableCrossoverFly",
      tier: "Tier A · Cô Lập Rãnh Ngực",
      priorityRank: 3,
      slotGroup: "chest_fly",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Dual Adjustable Pulley / 8-Stack Cable",
      gymSetup: {
        tng_uvk: "Khung Cáp Đôi Đa Năng TNG 58D UVK: Chỉnh 2 ròng rọc lên nấc cao ngang đầu (nấc 14–16), bước 1 chân lên trước giữ thăng bằng.",
        ways_ql13: "Giàn Cáp Chéo 8 Trạm Ways 361 QL13: Dùng 2 tay cầm D-Handle ở ròng rọc trên, ép hai tay gặp nhau trước bụng trên."
      },
      repRange: [12, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ròng rọc ngang đầu · Bước 1 chân trước",
      tempoCue: "Mở 2.5s — Ép giữ 1.0s",
      whyItWorks: "Dây cáp đôi cho phép tùy chỉnh góc kéo linh hoạt theo đúng chiều sợi cơ ngực và giữ sức căng liên tục 100% biên độ.",
      formSteps: [
        "Chỉnh hai ròng rọc lên cao ngang đầu, nắm hai tay cầm D-Handle và bước chân trước chân sau.",
        "Hơi đổ nhẹ thân người, kéo hai tay cầm theo vòng cung xuống gặp nhau trước ngực dưới.",
        "Giữ siết ngực 1 giây rồi từ từ mở rộng cánh tay về vị trí căng ngực."
      ],
      cues: "Giữ góc cong nhẹ cố định ở khuỷu tay suốt động tác như đang ôm thân cây.",
      mistake: "Không biến động tác ép ngực thành đẩy tạ bằng tay sau.",
      swapOptions: ["pec_deck_fly", "machine_chest_press"],
      swapReason: "Thay thế trực tiếp khi máy Pec Deck đang có người ngồi tập.",
      videoUrl: "https://www.youtube.com/watch?v=iPSsUsShqZs",
      videoId: "iPSsUsShqZs",
      videoAuthor: "Jeff Nippard",
      videoTitle: "High-To-Low Cable Chest Fly Form",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý mỗi bên", weight: 15, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý mỗi bên", weight: 15, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý mỗi bên", weight: 15, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "Thay thế 1:1 cho Máy Pec Deck tại cả TNG UVK và Ways QL13"
    },
    machine_shoulder_press: {
      id: "machine_shoulder_press",
      name: "Máy Đẩy Vai Ngồi Có Tựa Lưng (Seated Shoulder Press Machine)",
      shortName: "Máy Đẩy Vai Ngồi",
      muscle: "Vai Trước & Vai Ngang",
      equipment: "Máy đẩy vai Pin-Loaded / Plate-Loaded",
      mascot: "machineShoulderPress",
      tier: "Tier S · Máy Chủ Lực Cả 2 Phòng",
      priorityRank: 2,
      slotGroup: "shoulder_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Matrix / Impulse & Iso-Lateral Shoulder",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Máy Shoulder Press rút chốt tạ (Pin-Loaded), chọn tay cầm hướng vào nhau (Neutral Grip) cực êm khớp vai.",
        ways_ql13: "Khu Vai Ways 361 QL13: Có cả Máy Đẩy Vai rút chốt tạ và Máy Đẩy Vai lắp bánh tạ rời Iso-Lateral."
      },
      repRange: [8, 12],
      defaultRestSec: 105,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Tay cầm ngang cằm · Lưng áp sát đệm",
      tempoCue: "Hạ 2.0s — Đẩy thẳng 1.0s",
      whyItWorks: "Không tốn sức nhấc cặp tạ đơn nặng lên vai (kick-up), bảo vệ tuyệt đối cột sống và chóp xoay vai.",
      formSteps: [
        "Chỉnh chiều cao yên ghế sao cho tay cầm ở vị trí thấp nhất nằm ngang cằm/tai.",
        "Tựa sát lưng vào đệm, nắm tay cầm rộng hoặc tay cầm song song (Neutral Grip) và đẩy lên cao.",
        "Hạ chậm 2 giây về ngang tai mà không để bánh tạ chạm rầm xuống chồng tạ."
      ],
      cues: "Dùng tay cầm song song (Neutral Grip) nếu khớp vai dễ mỏi hoặc cứng.",
      mistake: "Không ưỡn lưng dưới rời khỏi đệm ghế khi đẩy nặng.",
      swapOptions: ["dumbbell_shoulder_press", "smith_shoulder_press"],
      swapReason: "Một trong 5 máy kháng lực cốt lõi tại The New Gym UVK & Ways Station QL13.",
      videoUrl: "https://www.youtube.com/watch?v=oGZbB67Ff6Q",
      videoId: "oGZbB67Ff6Q",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Machine Overhead Shoulder Press Setup",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 25, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 40, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 40, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 40, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Máy kháng lực cốt lõi tại cả TNG 58D UVK & Ways 361 QL13"
    },
    smith_shoulder_press: {
      id: "smith_shoulder_press",
      name: "Đẩy Vai Ngồi Trước Mặt Trên Máy Smith (Smith Overhead Press)",
      shortName: "Đẩy Vai Máy Smith",
      muscle: "Vai Trước & Vai Ngang",
      equipment: "Máy Smith + Ghế tựa 75°",
      mascot: "smithShoulderPress",
      tier: "Tier A · Tải Nặng Ổn Định",
      priorityRank: 2,
      slotGroup: "shoulder_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Smith Machine + Adjustable Bench",
      gymSetup: {
        tng_uvk: "Khu Máy Smith TNG 58D UVK: Dựng ghế 75° sao cho thanh đòn trượt ngay trước cằm 3cm.",
        ways_ql13: "Khung Smith Ways 361 QL13: Cài chốt bảo hiểm ngang vai trước khi đẩy."
      },
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Ghế 75° · Đòn hạ ngang cằm trước mặt",
      tempoCue: "Hạ 2.2s — Đẩy 1.0s",
      whyItWorks: "Giúp kiểm soát đường đi thanh đòn chuẩn xác ngay trước mặt mà không cần giữ thăng bằng trước-sau.",
      formSteps: [
        "Dựng ghế tựa lưng 75°–80° trong khung Smith, ngồi thử để thanh đòn đi xuống ngay trước cằm/mũi.",
        "Nắm đòn rộng hơn vai một chút, cùi chỏ hơi hướng nhẹ về phía trước.",
        "Hạ thanh đòn ngang cằm rồi đẩy thẳng lên trên đầu."
      ],
      cues: "Tuyệt đối đẩy trước mặt, không đẩy thanh đòn sau gáy.",
      mistake: "Không để cùi chỏ banh ngang hoàn toàn ra sau.",
      swapOptions: ["dumbbell_shoulder_press", "machine_shoulder_press"],
      swapReason: "Thay thế tuyệt vời khi khu tạ đơn hoặc máy đẩy vai đang kín chỗ.",
      videoUrl: "https://www.youtube.com/watch?v=oGZbB67Ff6Q",
      videoId: "oGZbB67Ff6Q",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Seated Smith Machine Shoulder Press",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 25, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 40, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 40, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 40, reps: 9, effort: "good", done: false }
      ],
      progressionBadge: "Quỹ đạo cố định giúp tập trung 100% lực vào cơ vai"
    },
    cable_lateral_raise_single: {
      id: "cable_lateral_raise_single",
      name: "Kéo Cáp Đơn Bay Vai Ngang (Single-Arm Cable Lateral Raise)",
      shortName: "Bay Vai Ngang Cáp Đơn",
      muscle: "Vai Ngang (Căng Liên Tục)",
      equipment: "Ròng rọc cáp thấp (Tay cầm D-Handle)",
      mascot: "cableLateralRaise",
      tier: "Tier S · Căng Cơ Vai Tối Đa",
      priorityRank: 4,
      slotGroup: "lateral_delt",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Cable Tower Low Pulley",
      gymSetup: {
        tng_uvk: "Khung Cáp Đôi TNG 58D UVK: Hạ ròng rọc xuống nấc ngang cổ tay/đầu gối để cơ vai giữa căng ngay từ đầu biên độ.",
        ways_ql13: "Giàn Cáp 8 Trạm Ways 361 QL13: Một tay vịn trụ sắt, nghiêng nhẹ người ra ngoài và kéo cáp vòng sau lưng hoặc trước đùi."
      },
      repRange: [12, 15],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ròng rọc ngang cổ tay · Kéo ngang vai",
      tempoCue: "Nâng 1.2s — Giữ 0.5s — Hạ chậm 2.5s",
      whyItWorks: "Khác với tạ đơn bị mất lực ở vị trí dưới đùi, dây cáp tạo lực kéo căng cực đại ngay khi bó vai giữa đang duỗi dài nhất.",
      formSteps: [
        "Chỉnh ròng rọc cáp ở mức ngang cổ tay hoặc đầu gối, đứng xoay hông vuông góc với máy cáp.",
        "Tay trong nắm cột máy giữ cố định, tay ngoài kéo tay cầm D-Handle vươn sang ngang lên ngang vai.",
        "Hạ chậm 2.5 giây có kiểm soát rồi đổi bên."
      ],
      cues: "Hạ ròng rọc ngang cổ tay (thay vì sát đất) để lực căng tập trung đúng điểm khỏe nhất của vai ngang.",
      mistake: "Không chọn mức tạ quá nặng làm co rút cầu vai.",
      swapOptions: ["lateral_raise", "machine_lateral_raise", "reverse_pec_deck_delt"],
      swapReason: "Tác động vào cơ vai giữa tốt hơn tạ đơn truyền thống.",
      videoUrl: "https://www.youtube.com/watch?v=OvH73R0sHWE",
      videoId: "OvH73R0sHWE",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Cable Lateral Raise at Wrist Height",
      defaultSets: [
        { type: "1", prev: "Mỗi bên tay", weight: 7.5, reps: 14, effort: "good", done: false },
        { type: "2", prev: "Mỗi bên tay", weight: 7.5, reps: 14, effort: "good", done: false },
        { type: "3", prev: "Mỗi bên tay", weight: 7.5, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "Chỉnh ròng rọc ngang cổ tay để cô lập 100% bó vai ngang"
    },
    machine_lateral_raise: {
      id: "machine_lateral_raise",
      name: "Máy Bay Vai Ngang Đệm Khuỷu Tay (Seated Lateral Raise Machine)",
      shortName: "Máy Bay Vai Ngang",
      muscle: "Vai Ngang Cô Lập",
      equipment: "Máy bay vai ngang có đệm khuỷu tay",
      mascot: "machineLateralRaise",
      tier: "Tier S · Đặc Trưng Ways QL13",
      priorityRank: 4,
      slotGroup: "lateral_delt",
      availableGyms: ["ways_ql13", "tng_uvk"],
      machineBrand: "Seated Lateral Raise Pin-Loaded",
      gymSetup: {
        ways_ql13: "Khu Máy Vai Ways 361 QL13: Đặt mặt ngoài khuỷu tay áp vào đệm nâng, đẩy bằng cùi chỏ thay vì gồng cổ tay.",
        tng_uvk: "Khu Strength TNG 58D UVK: Chỉnh yên ghế sao cho trục xoay của máy trùng với khớp vai."
      },
      repRange: [12, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Đẩy bằng cùi chỏ vào đệm · Hạ cầu vai",
      tempoCue: "Nâng 1.2s — Giữ ngang vai 1.0s — Hạ 2.5s",
      whyItWorks: "Đệm đỡ trực tiếp ở khuỷu tay loại bỏ hoàn toàn mỏi cổ tay và cẳng tay, dồn toàn bộ áp lực vào bó vai giữa.",
      formSteps: [
        "Chỉnh ghế sao cho khớp vai ngang trục xoay của máy, ngực tì nhẹ vào đệm (hoặc lưng tựa đệm).",
        "Đặt cẳng tay/khuỷu tay vào hai đệm mút, dùng lực cùi chỏ nâng hai bên lên ngang vai.",
        "Giữ 1 giây ở đỉnh rồi hạ chậm 2.5 giây."
      ],
      cues: "Thả lỏng bàn tay, chỉ tập trung đẩy hai khuỷu tay sang ngang.",
      mistake: "Không nhún vai lên tai khi nâng.",
      swapOptions: ["lateral_raise", "cable_lateral_raise_single"],
      swapReason: "Máy cô lập vai ngang cực ăn cơ tại Ways Station QL13.",
      videoUrl: "https://www.youtube.com/watch?v=OvH73R0sHWE",
      videoId: "OvH73R0sHWE",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Machine Lateral Raise Technique",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 20, reps: 14, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 20, reps: 14, effort: "good", done: false },
        { type: "D", prev: "Drop Set nhẹ", weight: 15, reps: 15, effort: "max", done: false }
      ],
      progressionBadge: "Loại bỏ mỏi cổ tay, cô lập trực diện cơ vai ngang"
    },
    reverse_pec_deck_delt: {
      id: "reverse_pec_deck_delt",
      name: "Máy Ép Vai Sau Ngược (Reverse Pec Deck Rear Delt Fly)",
      shortName: "Máy Ép Vai Sau",
      muscle: "Vai Sau & Lưng Trên (Chống Gù)",
      equipment: "Máy Pec Deck / Rear Delt 2-in-1",
      mascot: "reversePecDeck",
      tier: "Tier A · Có Ở Cả 2 Phòng",
      priorityRank: 4,
      slotGroup: "rear_delt_pull",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "2-in-1 Pec Deck / Rear Delt Machine",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Đưa 2 tay đòn máy Pec Deck về nấc sát nhau nhất (nấc 1), ngồi quay ngực úp vào đệm ghế.",
        ways_ql13: "Khu Máy Ngực/Vai Ways 361 QL13: Chỉnh tay đòn về vị trí Rear Delt, nắm tay cầm ngang tầm vai."
      },
      repRange: [12, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ngực tì đệm · Mở rộng cánh tay ra sau",
      tempoCue: "Mở 1.2s — Giữ 1.0s — Khép 2.0s",
      whyItWorks: "Làm đầy bó cơ vai sau giúp bờ vai 3D tròn trịa và kéo thẳng hai vai bị gù do ngồi máy tính.",
      formSteps: [
        "Chỉnh hai tay đòn máy Pec Deck về sát nhau ở phía trước, ngồi quay ngực áp sát vào đệm tựa.",
        "Nắm hai tay cầm ngang vai, giữ tay hơi cong nhẹ rồi mở rộng hai cánh tay ra phía sau.",
        "Dừng lại khi cánh tay ngang thân người mà không ép bả vai quá mức, sau đó trả tạ chậm."
      ],
      cues: "Tưởng tượng đẩy hai mu bàn tay ra xa sang hai bên tường thay vì ép hai bả vai vào nhau.",
      mistake: "Không ngửa cổ hoặc dùng lực giật lưng.",
      swapOptions: ["lateral_raise", "rope_face_pull", "cable_lateral_raise_single"],
      swapReason: "Tận dụng ngay máy Pec Deck 2-in-1 sẵn có ở cả TNG UVK & Ways QL13.",
      videoUrl: "https://www.youtube.com/watch?v=iPSsUsShqZs",
      videoId: "iPSsUsShqZs",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Reverse Pec Deck For 3D Rear Delts",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 30, reps: 14, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 30, reps: 14, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 30, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "Tạo độ tròn 3D cho vai sau & mở ngực chống gù lưng"
    },
    overhead_cable_tricep_ext: {
      id: "overhead_cable_tricep_ext",
      name: "Duỗi Tay Sau Qua Đầu Với Cáp (Overhead Rope Triceps Extension)",
      shortName: "Duỗi Tay Sau Qua Đầu",
      muscle: "Đầu Dài Cơ Tay Sau (Long Head)",
      equipment: "Máy cáp + Dây thừng",
      mascot: "overheadTricepExt",
      tier: "Tier A · Phát Triển Độ Dày Tay Sau",
      priorityRank: 5,
      slotGroup: "triceps",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Cable Pulley + Rope Attachment",
      gymSetup: {
        tng_uvk: "Khung Cáp Đôi TNG 58D UVK: Đặt ròng rọc ngang hông/lưng giữa, quay lưng lại máy cáp và duỗi dây thừng qua đầu.",
        ways_ql13: "Giàn Cáp 8 Trạm Ways 361 QL13: Bước 1 chân lên trước giữ vững trọng tâm, duỗi thẳng cẳng tay về phía trước trên."
      },
      repRange: [10, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Quay lưng vào cáp · Cùi chỏ hướng trước",
      tempoCue: "Hạ sau gáy 2.2s — Duỗi thẳng 1.0s",
      whyItWorks: "Đưa cánh tay qua đầu kéo giãn tối đa đầu dài cơ tam đầu (chiếm phần lớn khối lượng bắp tay sau), kích thích phát triển cơ vượt trội.",
      formSteps: [
        "Gắn dây thừng vào ròng rọc ngang thắt lưng hoặc ngang vai, quay lưng lại với cột cáp.",
        "Bước 1 chân lên trước, đổ người 30°, giữ cố định hai cùi chỏ ngang tai.",
        "Duỗi thẳng hai cẳng tay đưa dây thừng vươn qua đầu rồi từ từ hạ sâu ra sau gáy."
      ],
      cues: "Cảm nhận cơ tay sau được kéo giãn sâu ở nhịp hạ ra sau đầu.",
      mistake: "Không để hai cùi chỏ bè rộng quá mức sang hai bên.",
      swapOptions: ["tricep_rope_pushdown", "seated_dip_tricep_machine"],
      swapReason: "Tác động sâu vào đầu dài cơ tay sau bổ sung hoàn hảo cho bài Pushdown.",
      videoUrl: "https://www.youtube.com/watch?v=TZw-AZS-r9M",
      videoId: "TZw-AZS-r9M",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Overhead Cable Triceps Extension Hypertrophy",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 20, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 20, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 20, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "Kéo giãn đầu dài cơ tay sau giúp bắp tay dày khỏe nhanh nhất"
    },
    seated_dip_tricep_machine: {
      id: "seated_dip_tricep_machine",
      name: "Máy Đẩy Tay Sau Ngồi / Dip Trợ Lực (Seated Triceps Dip Machine)",
      shortName: "Máy Đẩy Tay Sau Ngồi",
      muscle: "Tay Sau & Ngực Dưới",
      equipment: "Máy Seated Dip / Assisted Dip",
      mascot: "seatedDipMachine",
      tier: "Tier B · Tải Nặng Tay Sau",
      priorityRank: 5,
      slotGroup: "triceps",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Seated Triceps Press / Assisted Dip",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Xoay tay cầm máy Dip vào nấc hẹp, giữ lưng thẳng đứng để lực dồn vào tay sau.",
        ways_ql13: "Khu Máy Tay Ways 361 QL13: Tựa sát lưng vào ghế, khép cùi chỏ sát sườn và đẩy tay cầm xuống hết cỡ."
      },
      repRange: [10, 12],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Tay cầm hẹp · Giữ thân người thẳng đứng",
      tempoCue: "Đẩy xuống 1.0s — Giữ đáy 1.0s — Lên 2.0s",
      whyItWorks: "Cho phép tập cơ tay sau với tải trọng lớn và an toàn tuyệt đối cho cổ tay.",
      formSteps: [
        "Xoay hai tay cầm về chế độ hẹp, giữ thân trên thẳng đứng (không đổ người về trước như khi tập ngực).",
        "Khép sát hai khuỷu tay vào mạn sườn, ấn mạnh tay cầm xuống cho tới khi tay thẳng.",
        "Hạ chậm có kiểm soát về vị trí khuỷu tay vuông góc 90°."
      ],
      cues: "Thân người càng thẳng đứng và cùi chỏ càng khép sát sườn thì lực càng vào tay sau.",
      mistake: "Không nhún cầu vai lên tai khi trả tạ.",
      swapOptions: ["tricep_rope_pushdown", "overhead_cable_tricep_ext"],
      swapReason: "Đổi gió khi giàn cáp đang đông người tập.",
      videoUrl: "https://www.youtube.com/watch?v=TZw-AZS-r9M",
      videoId: "TZw-AZS-r9M",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Machine Triceps Dip Technique",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 45, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 45, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 45, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "An toàn khớp khuỷu tay và cổ tay cho người nặng cân"
    },
    iso_high_row_pulldown: {
      id: "iso_high_row_pulldown",
      name: "Máy Kéo Xô Cao Lắp Tạ Rời (Iso-Lateral High Row / Pulldown)",
      shortName: "Máy Kéo Xô Lắp Tạ Rời",
      muscle: "Lưng Xô Rộng & Xô Dưới",
      equipment: "Máy Kéo Xô Plate-Loaded",
      mascot: "isoHighRow",
      tier: "Tier S · Đặc Trưng Ways QL13",
      priorityRank: 1,
      slotGroup: "vertical_pull",
      availableGyms: ["ways_ql13"],
      machineBrand: "Hammer / Iso-Lateral High Row",
      gymSetup: {
        ways_ql13: "Khu Plate-Loaded tầng 4 Ways 361 QL13: Ngồi ép ngực vào đệm trước, khóa đùi và kéo hai tay đòn độc lập theo cung chéo xuống hông.",
        tng_uvk: "Tại TNG 58D UVK dùng Máy Kéo Xô Cáp Cao (Lat Pulldown) hoặc Kéo Xô Tay Cầm Hẹp."
      },
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Ngực áp sát đệm · Kéo cùi chỏ xuống hông",
      tempoCue: "Kéo mạnh 1.2s — Siết xô 1.0s — Thả 2.2s",
      whyItWorks: "Đệm ngực giữ cố định thân người giúp cô lập từng bên cơ xô theo quỹ đạo hình vòng cung tự nhiên nhất.",
      formSteps: [
        "Lắp bánh tạ đều hai bên, chỉnh chiều cao ghế và đệm ngực sao cho tay vươn cao thoải mái.",
        "Tì ngực vào đệm, kéo hai tay cầm xuống và ra sau bằng lực dẫn của khuỷu tay.",
        "Giữ siết cơ xô dưới 1 giây rồi thả lên chậm cho tới khi xô giãn hết biên độ."
      ],
      cues: "Có thể kéo từng tay một (Unilateral) để cảm nhận cơ xô sâu hơn.",
      mistake: "Không ngả người rời khỏi đệm ngực để giật tạ.",
      swapOptions: ["lat_pulldown", "close_neutral_pulldown", "assisted_pull_up"],
      swapReason: "Máy tập lưng xô ăn cơ bậc nhất tại Ways Station 361 Quốc Lộ 13.",
      videoUrl: "https://www.youtube.com/watch?v=SALxEARiMkw",
      videoId: "SALxEARiMkw",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Iso-Lateral High Row & Pulldown Form",
      defaultSets: [
        { type: "W", prev: "Khởi động 20kg/bên", weight: 40, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý 30kg/bên", weight: 60, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý 30kg/bên", weight: 60, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý 30kg/bên", weight: 60, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Máy Plate-Loaded cô lập lưng xô đặc trưng tại Ways Station QL13"
    },
    close_neutral_pulldown: {
      id: "close_neutral_pulldown",
      name: "Kéo Xô Cáp Tay Cầm Hẹp / Chữ V (Close-Grip Neutral Pulldown)",
      shortName: "Kéo Xô Tay Cầm Hẹp",
      muscle: "Xô Dưới & Độ Dày Lưng",
      equipment: "Máy kéo xô + Tay cầm V-Bar / MAG",
      mascot: "closeNeutralPulldown",
      tier: "Tier S · Có Ở Cả 2 Phòng",
      priorityRank: 1,
      slotGroup: "vertical_pull",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Lat Pulldown + V-Grip / MAG Grip",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Tháo thanh đòn dài, móc tay cầm đôi chữ V (V-Bar) vào ròng rọc máy Lat Pulldown.",
        ways_ql13: "Khu Máy Cáp Ways 361 QL13: Dùng thanh cầm hẹp Neutral Grip hoặc V-Bar kéo sát về ngực dưới."
      },
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Hai lòng bàn tay hướng vào nhau · Kéo về ức",
      tempoCue: "Kéo 1.2s — Siết xô dưới 1.0s — Thả 2.2s",
      whyItWorks: "Tư thế hai lòng bàn tay hướng vào nhau đặt khớp vai ở góc an toàn nhất và kéo dài biên độ co rút của phần cơ xô dưới.",
      formSteps: [
        "Gắn tay cầm chữ V (hoặc thanh cầm hẹp song song) vào cáp cao, khóa chặt đùi dưới đệm.",
        "Ưỡn cao lồng ngực, hơi ngả lưng 15°, kéo tay cầm chạm nhẹ vùng xương ức dưới.",
        "Ép sát hai cùi chỏ dọc mạn sườn rồi thả chậm lên cao."
      ],
      cues: "Giữ cùi chỏ đi sát trước sườn để kích hoạt phần xô dưới sát eo.",
      mistake: "Không cúi gập vai về phía trước khi kết thúc nhịp kéo.",
      swapOptions: ["lat_pulldown", "iso_high_row_pulldown", "assisted_pull_up"],
      swapReason: "Biến thể kéo xô êm khớp vai nhất tại cả 2 phòng tập.",
      videoUrl: "https://www.youtube.com/watch?v=SALxEARiMkw",
      videoId: "SALxEARiMkw",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Close-Grip Neutral Lat Pulldown Mechanics",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 35, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 52, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 52, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 52, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Tác động sâu vào phần xô dưới giúp lưng dày và gọn eo"
    },
    assisted_pull_up: {
      id: "assisted_pull_up",
      name: "Hít Xà Đơn Có Máy Đệm Quỳ Trợ Lực (Assisted Pull-Up)",
      shortName: "Hít Xà Máy Trợ Lực",
      muscle: "Toàn Bộ Lưng Xô & Tay Trước",
      equipment: "Máy Assisted Chin/Dip",
      mascot: "assistedPullUp",
      tier: "Tier A · Luyện Hít Xà Chuẩn",
      priorityRank: 1,
      slotGroup: "vertical_pull",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Assisted Chin-Up / Dip Station",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Cắm chốt trợ lực 45–55kg, quỳ gối lên đệm và nắm tay cầm rộng trên đỉnh máy.",
        ways_ql13: "Khu Đa Năng Ways 361 QL13: Dùng tay cầm song song hoặc rộng vai, kiểm soát nhịp hạ 2.5 giây."
      },
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Đệm quỳ nâng đỡ · Kéo ngực chạm xà",
      tempoCue: "Kéo lên 1.2s — Hạ chậm 2.5s",
      whyItWorks: "Cho phép người nặng 95–115kg tập chuẩn động tác Hít xà đơn mà không bị quá tải khớp vai và gân khuỷu tay.",
      formSteps: [
        "Cắm chốt tạ trợ lực (ví dụ 45kg: máy sẽ nâng bớt 45kg trọng lượng cơ thể).",
        "Quỳ hai gối lên đệm, nắm thanh xà rộng hơn vai, hạ bả vai rồi kéo ngực lên ngang xà.",
        "Hạ người xuống chậm 2.5 giây cho tới khi tay duỗi hết biên độ."
      ],
      cues: "Mỗi 2 tuần giảm bớt 1 nấc tạ trợ lực để tiến tới hít xà tự do.",
      mistake: "Không thả rơi người đột ngột ở điểm dưới cùng.",
      swapOptions: ["lat_pulldown", "iso_high_row_pulldown", "close_neutral_pulldown"],
      swapReason: "Có sẵn tại cả The New Gym 58D UVK và Ways Station 361 QL13.",
      videoUrl: "https://www.youtube.com/watch?v=SALxEARiMkw",
      videoId: "SALxEARiMkw",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Use The Assisted Pull-Up Machine",
      defaultSets: [
        { type: "1", prev: "Trợ lực 45kg", weight: 45, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Trợ lực 45kg", weight: 45, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Trợ lực 40kg", weight: 40, reps: 9, effort: "good", done: false }
      ],
      progressionBadge: "Rèn sức mạnh hít xà thực tế an toàn cho người >95kg"
    },
    chest_supported_tbar_row: {
      id: "chest_supported_tbar_row",
      name: "Máy Chèo Lưng T-Bar Có Đệm Tựa Ngực (Chest-Supported T-Bar Row)",
      shortName: "Chèo Lưng T-Bar Tựa Ngực",
      muscle: "Lưng Giữa Dày & Xô",
      equipment: "Máy T-Bar Row có đệm ngực",
      mascot: "tbarRow",
      tier: "Tier S · Đặc Trưng Ways QL13",
      priorityRank: 2,
      slotGroup: "horizontal_row",
      availableGyms: ["ways_ql13"],
      machineBrand: "Chest-Supported Plate-Loaded T-Bar Row",
      gymSetup: {
        ways_ql13: "Khu Lưng tầng 4 Ways 361 QL13: Nằm tì ngực lên đệm nghiêng, lắp bánh tạ 15–20kg ở đầu máy, chọn tay cầm rộng hoặc hẹp.",
        tng_uvk: "Tại TNG 58D UVK dùng Máy Chèo Lưng Ngồi Tựa Ngực (Seated Row Machine) hoặc Chèo Tạ Đơn Tựa Ghế Dốc 30°."
      },
      repRange: [8, 12],
      defaultRestSec: 120,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Ngực nằm trên đệm · Ép chặt 2 bả vai",
      tempoCue: "Kéo 1.2s — Giữ đỉnh 1.0s — Thả giãn 2.2s",
      whyItWorks: "Xây dựng độ dày khối cơ lưng giữa cực mạnh giống Barbell Row nhưng đệm ngực triệt tiêu 100% áp lực dội lên đốt sống L4-L5.",
      formSteps: [
        "Đặt hai bàn chân vững trên bệ, nằm áp sát lồng ngực lên đệm nghiêng của máy T-Bar.",
        "Nắm hai tay cầm, kéo tạ lên cao bằng cách khép chặt hai xương bả vai lại với nhau.",
        "Thả tạ xuống chậm để hai bả vai mở rộng tối đa ở đáy động tác."
      ],
      cues: "Giữ bụng và ngực luôn dính chặt vào đệm, không nhổm người giật tạ.",
      mistake: "Không lắp quá nặng làm biên độ kéo bị ngắn một nửa.",
      swapOptions: ["seated_cable_row", "machine_seated_row", "one_arm_db_row"],
      swapReason: "Máy tập độ dày lưng an toàn cột sống tốt nhất tại Ways Station QL13.",
      videoUrl: "https://www.youtube.com/watch?v=UCXxvVItLoM",
      videoId: "UCXxvVItLoM",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Chest-Supported T-Bar Row For Back Thickness",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 20, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 35, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 35, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 35, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "0% áp lực thắt lưng · Tối ưu độ dày lưng giữa tại Ways QL13"
    },
    machine_seated_row: {
      id: "machine_seated_row",
      name: "Máy Chèo Lưng Ngồi Tựa Ngực Chốt Tạ (Seated Row Machine)",
      shortName: "Máy Chèo Lưng Tựa Ngực",
      muscle: "Lưng Giữa & Xô Dưới",
      equipment: "Máy Seated Row có đệm ngực",
      mascot: "machineSeatedRow",
      tier: "Tier S · Máy Cốt Lõi Cả 2 Phòng",
      priorityRank: 2,
      slotGroup: "horizontal_row",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Selectorized Seated Row Machine",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Một trong 5 máy kháng lực cốt lõi của The New Gym — chỉnh đệm ngực vừa tầm tay vươn thẳng.",
        ways_ql13: "Khu Máy Lưng Ways 361 QL13: Chỉnh yên ghế để đệm tì ngang xương ức dưới."
      },
      repRange: [10, 12],
      defaultRestSec: 90,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ngực tì đệm · Kéo cùi chỏ ra sau hông",
      tempoCue: "Kéo 1.2s — Siết bả vai 1.0s — Thả 2.0s",
      whyItWorks: "Điểm tựa ngực cố định giúp người mới và người nặng cân cô lập hoàn toàn cơ lưng mà không mỏi lưng dưới.",
      formSteps: [
        "Chỉnh chiều cao yên ghế và khoảng cách đệm ngực sao cho khi nắm tay cầm, đầu ngón tay vừa chạm tới.",
        "Tì ngực vào đệm, kéo tay cầm về phía sau và ép sát hai xương bả vai.",
        "Thả tạ về trước có kiểm soát 2 giây."
      ],
      cues: "Hạ thấp vai khỏi tai trước khi bắt đầu kéo.",
      mistake: "Không dùng đà ngửa lưng ra khỏi đệm ngực.",
      swapOptions: ["seated_cable_row", "chest_supported_tbar_row", "one_arm_db_row"],
      swapReason: "Máy tập lưng an toàn nhất tại Khu Strength The New Gym 58D UVK.",
      videoUrl: "https://www.youtube.com/watch?v=UCXxvVItLoM",
      videoId: "UCXxvVItLoM",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Chest-Supported Machine Row Technique",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 45, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 45, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 45, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Thuộc Top 5 máy kháng lực cốt lõi của The New Gym UVK"
    },
    one_arm_db_row: {
      id: "one_arm_db_row",
      name: "Chèo Tạ Đơn 1 Tay Tựa Ghế (Single-Arm Dumbbell Row)",
      shortName: "Chèo Tạ Đơn 1 Tay",
      muscle: "Lưng Xô & Lưng Giữa",
      equipment: "Tạ đơn + Ghế phẳng",
      mascot: "oneArmDbRow",
      tier: "Tier A · Có Ở Cả 2 Phòng",
      priorityRank: 2,
      slotGroup: "horizontal_row",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Dumbbell Rack + Flat Bench",
      gymSetup: {
        tng_uvk: "Khu Free Weight TNG 58D UVK: Chống 1 tay và 1 gối lên ghế phẳng, kéo tạ đơn theo đường vòng cung về phía hông.",
        ways_ql13: "Dàn Tạ Đơn Ways 361 QL13: Tựa tay lên kệ tạ hoặc ghế phẳng, giữ lưng song song mặt sàn."
      },
      repRange: [10, 12],
      defaultRestSec: 90,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Tay chống ghế · Kéo tạ về túi quần",
      tempoCue: "Kéo vòng cung 1.2s — Hạ giãn 2.2s",
      whyItWorks: "Tập từng bên giúp cân bằng lực hai bên lưng xô trong khi tay chống ghế đỡ toàn bộ trọng lượng cho cột sống.",
      formSteps: [
        "Đặt một đầu gối và bàn tay cùng bên lên ghế phẳng, giữ lưng phẳng song song với sàn.",
        "Tay kia cầm tạ đơn, kéo cùi chỏ theo đường vòng cung về phía túi quần sau (hông).",
        "Hạ tạ xuống chậm cho tới khi bả vai được kéo giãn sâu rồi lặp lại."
      ],
      cues: "Tưởng tượng cưa gỗ kéo tạ về hông thay vì nhấc thẳng tạ lên ngực.",
      mistake: "Không xoay vặn cột sống để giật tạ quá nặng.",
      swapOptions: ["seated_cable_row", "machine_seated_row", "chest_supported_tbar_row"],
      swapReason: "Luôn tập được ngay tại Khu Free Weight khi các máy cáp đang bận.",
      videoUrl: "https://www.youtube.com/watch?v=UCXxvVItLoM",
      videoId: "UCXxvVItLoM",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Do One-Arm Dumbbell Rows Properly",
      defaultSets: [
        { type: "1", prev: "Mỗi bên tay", weight: 22, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mỗi bên tay", weight: 22, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mỗi bên tay", weight: 22, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Chống tay lên ghế bảo vệ lưng dưới 100%"
    },
    rope_face_pull: {
      id: "rope_face_pull",
      name: "Kéo Cáp Dây Thừng Về Mặt (High-Pulley Rope Face Pull)",
      shortName: "Kéo Cáp Face Pull",
      muscle: "Vai Sau & Chóp Xoay Vai",
      equipment: "Máy cáp cao + Dây thừng",
      mascot: "ropeFacePull",
      tier: "Tier A · Bảo Vệ Khớp Vai",
      priorityRank: 3,
      slotGroup: "rear_delt_pull",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Adjustable Cable Pulley + Rope",
      gymSetup: {
        tng_uvk: "Khung Cáp Đôi TNG 58D UVK: Đặt ròng rọc ngang trán, kéo tách dây thừng về hai bên tai.",
        ways_ql13: "Giàn Cáp 8 Trạm Ways 361 QL13: Nắm ngược dây thừng (ngón cái hướng về sau), kéo xoay ngoài khớp vai."
      },
      repRange: [12, 15],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Ròng rọc ngang trán · Xoay mở hai nắm tay",
      tempoCue: "Kéo 1.2s — Giữ 1.5s — Thả 2.0s",
      whyItWorks: "Cân bằng lại khớp vai sau các bài đẩy nặng, làm khỏe nhóm cơ chóp xoay (Rotator Cuff) và chữa tư thế gù vai.",
      formSteps: [
        "Chỉnh ròng rọc ngang mặt/trán, nắm hai đầu dây thừng và lùi lại 1.5 bước.",
        "Kéo dây thừng về phía trán đồng thời tách hai nắm tay ra hai bên tai (như tư thế gồng bắp tay đôi).",
        "Giữ siết vai sau và lưng trên 1.5 giây rồi thả chậm."
      ],
      cues: "Đưa hai nắm tay về ngang tai sao cho cẳng tay vuông góc với sàn ở điểm cuối.",
      mistake: "Không lắp tạ quá nặng rồi ngả cả người kéo bằng lưng dưới.",
      swapOptions: ["reverse_pec_deck_delt", "seated_cable_row"],
      swapReason: "Bài tập vàng bảo vệ khớp vai lâu dài cho mọi gymer.",
      videoUrl: "https://www.youtube.com/watch?v=UCXxvVItLoM",
      videoId: "UCXxvVItLoM",
      videoAuthor: "ATHLEAN-X",
      videoTitle: "How To Do Face Pulls For Shoulder Health",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 20, reps: 15, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 20, reps: 15, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 20, reps: 15, effort: "good", done: false }
      ],
      progressionBadge: "Làm khỏe chóp xoay vai & chống gù lưng dân văn phòng"
    },
    preacher_curl_machine: {
      id: "preacher_curl_machine",
      name: "Máy Cuốn Tay Trước Tựa Đệm Preacher (Preacher Curl Machine)",
      shortName: "Máy Cuốn Tay Trước Preacher",
      muscle: "Đỉnh Bắp Tay Trước (Biceps Peak)",
      equipment: "Máy Preacher Curl / Ghế Scott EZ",
      mascot: "preacherCurl",
      tier: "Tier A · Cô Lập Tay Trước Tuyệt Đối",
      priorityRank: 3,
      slotGroup: "biceps",
      availableGyms: ["ways_ql13", "tng_uvk"],
      machineBrand: "Preacher Curl Machine / Scott Bench",
      gymSetup: {
        ways_ql13: "Khu Máy Tay Ways 361 QL13: Có cả Máy Preacher Curl rút chốt tạ lẫn Ghế Scott cuốn thanh đòn cong EZ.",
        tng_uvk: "Khu Free Weight TNG 58D UVK: Dùng Ghế Preacher Scott Bench với thanh đòn cong EZ hoặc tạ đơn."
      },
      repRange: [10, 14],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Nách áp sát đỉnh đệm · Không đung đưa lưng",
      tempoCue: "Cuốn 1.2s — Siết 1.0s — Hạ chậm 2.5s",
      whyItWorks: "Đệm nghiêng khóa hoàn toàn bắp tay trên, không cho phép ăn gian bằng đà lưng hay vai, buộc 100% cơ nhị đầu làm việc.",
      formSteps: [
        "Chỉnh chiều cao yên ghế sao cho nách và toàn bộ mặt sau cánh tay áp sát lên đệm nghiêng.",
        "Nắm tay cầm cong (EZ Grip), cuốn lên cao và siết chặt bắp tay trước 1 giây.",
        "Hạ chậm 2.5 giây có kiểm soát, dừng khi khuỷu tay duỗi khoảng 95%."
      ],
      cues: "Giữ bắp tay trên dán chặt vào đệm suốt quá trình hạ và cuốn.",
      mistake: "Không nhổm mông khỏi ghế khi hạ tạ xuống đáy.",
      swapOptions: ["dumbbell_curl_lateral", "cable_rope_hammer_curl"],
      swapReason: "Cô lập bắp tay trước chuẩn xác nhất tại Ways Station QL13 & TNG UVK.",
      videoUrl: "https://www.youtube.com/watch?v=soxrZlIl35U",
      videoId: "soxrZlIl35U",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Preacher Curl Mechanics & Bicep Hypertrophy",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 25, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 25, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 25, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Khóa cố định khuỷu tay trên đệm Preacher giúp tạo đỉnh bắp tay"
    },
    cable_rope_hammer_curl: {
      id: "cable_rope_hammer_curl",
      name: "Cuốn Tay Trước Cáp Dây Thừng Kiểu Búa (Cable Rope Hammer Curl)",
      shortName: "Cuốn Cáp Dây Thừng Tay Trước",
      muscle: "Tay Trước & Cơ Cẳng Tay (Brachialis)",
      equipment: "Ròng rọc cáp thấp + Dây thừng",
      mascot: "cableHammerCurl",
      tier: "Tier B · Có Ở Cả 2 Phòng",
      priorityRank: 3,
      slotGroup: "biceps",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Low Pulley Cable + Rope",
      gymSetup: {
        tng_uvk: "Khung Cáp Đôi TNG 58D UVK: Gắn dây thừng vào ròng rọc sát sàn, hai lòng bàn tay hướng vào nhau.",
        ways_ql13: "Giàn Cáp 8 Trạm Ways 361 QL13: Khóa chặt cùi chỏ sát sườn, cuốn dây thừng lên ngang ngực."
      },
      repRange: [12, 15],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Cầm dọc dây thừng · Khóa cùi chỏ sát sườn",
      tempoCue: "Cuốn 1.0s — Xoay nhẹ đỉnh 1.0s — Hạ 2.2s",
      whyItWorks: "Tác động mạnh vào cơ Brachialis nằm dưới cơ nhị đầu, đẩy bắp tay nhìn to dày hơn từ góc nhìn ngang và cực êm cổ tay.",
      formSteps: [
        "Gắn dây thừng vào ròng rọc cáp thấp nhất, đứng thẳng cách máy nửa bước.",
        "Nắm hai đầu dây thừng hướng lòng bàn tay vào nhau, ép sát khuỷu tay vào sườn.",
        "Cuốn dây thừng lên sát ngực trên, giữ 1 giây rồi hạ chậm."
      ],
      cues: "Tư thế cầm dọc (Hammer Grip) loại bỏ hoàn toàn đau mỏi cổ tay.",
      mistake: "Không đưa khuỷu tay vung về phía trước khi cuốn.",
      swapOptions: ["dumbbell_curl_lateral", "preacher_curl_machine"],
      swapReason: "Tập ngay tại giàn cáp sau khi xong các bài kéo lưng.",
      videoUrl: "https://www.youtube.com/watch?v=soxrZlIl35U",
      videoId: "soxrZlIl35U",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Cable Rope Hammer Curl Technique",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 22, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 22, reps: 12, effort: "good", done: false },
        { type: "D", prev: "Drop Set nhẹ", weight: 15, reps: 15, effort: "max", done: false }
      ],
      progressionBadge: "Làm dày bắp tay và cẳng tay với áp lực cáp liên tục"
    },
    hack_squat_machine: {
      id: "hack_squat_machine",
      name: "Máy Squat Nghiêng Tựa Lưng Lắp Tạ (Linear Hack Squat Machine)",
      shortName: "Máy Hack Squat Tựa Lưng",
      muscle: "Đùi Trước & Cơ Mông",
      equipment: "Máy Hack Squat lắp bánh tạ",
      mascot: "hackSquat",
      tier: "Tier S · Đặc Trưng Ways QL13",
      priorityRank: 1,
      slotGroup: "quad_compound",
      availableGyms: ["ways_ql13"],
      machineBrand: "Linear Hack Squat Plate-Loaded",
      gymSetup: {
        ways_ql13: "Khu Chân tầng 4 Ways 361 QL13: Đặt vai dưới hai đệm mút, lưng dưới dán chặt vào mặt đệm trượt, đặt bàn chân hơi cao lên bàn đạp để giảm áp lực gối.",
        tng_uvk: "Tại TNG 58D UVK thực hiện biến thể Hack Squat Tựa Lưng Trên Máy Smith hoặc Máy Đạp Đùi 45°."
      },
      repRange: [8, 12],
      defaultRestSec: 150,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Lưng dán chặt đệm · Bàn chân đặt giữa-cao",
      tempoCue: "Hạ 2.5s — Đạp lên 1.2s",
      whyItWorks: "Mô phỏng hoàn hảo chuyển động Squat nhưng toàn bộ cột sống được khóa cố định trên mặt phẳng đệm nghiêng.",
      formSteps: [
        "Tựa toàn bộ lưng và mông vào đệm trượt, đặt vai dưới hai gối đệm, mở chốt an toàn hai bên.",
        "Đặt hai bàn chân rộng bằng vai ở nửa trên bàn đạp để bảo vệ khớp gối.",
        "Hạ chậm tới khi đùi vuông góc 90° với cẳng chân rồi đạp mạnh qua gót chân đẩy lên."
      ],
      cues: "Giữ lưng dưới ép sát vào đệm suốt từ đầu đến cuối hiệp.",
      mistake: "Không khóa cứng khớp gối ở đỉnh động tác.",
      swapOptions: ["leg_press_45", "smith_box_squat", "seated_leg_extension"],
      swapReason: "Máy tập đùi đỉnh cao tại khu chân Ways Station 361 Quốc Lộ 13.",
      videoUrl: "https://www.youtube.com/watch?v=yZmx_Ac3880",
      videoId: "yZmx_Ac3880",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "How To Hack Squat For Quads & Knee Safety",
      defaultSets: [
        { type: "W", prev: "Khởi động 20kg/bên", weight: 40, reps: 10, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý 35kg/bên", weight: 70, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý 35kg/bên", weight: 70, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý 35kg/bên", weight: 70, reps: 9, effort: "good", done: false }
      ],
      progressionBadge: "Cỗ máy phát triển cơ đùi số 1 tại Ways Station 361 QL13"
    },
    smith_box_squat: {
      id: "smith_box_squat",
      name: "Squat Máy Smith Chân Đặt Trước (Smith Machine Hack/Box Squat)",
      shortName: "Squat Máy Smith Êm Gối",
      muscle: "Đùi Trước & Cơ Mông",
      equipment: "Máy Smith + Ghế phẳng làm mốc",
      mascot: "smithBoxSquat",
      tier: "Tier S · Chuẩn Giáo Án TNG UVK",
      priorityRank: 1,
      slotGroup: "quad_compound",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Counter-Balanced Smith Machine",
      gymSetup: {
        tng_uvk: "Khu Máy Smith TNG 58D UVK: Đặt hai bàn chân tiến về phía trước thanh đòn 20–25cm (Smith Hack Squat) và đặt 1 ghế phẳng phía sau mông làm mốc độ sâu an toàn.",
        ways_ql13: "Khung Smith Ways 361 QL13: Cài chốt bảo hiểm ngang hông, tựa lưng vào thanh đòn và ngồi xuống chạm nhẹ ghế."
      },
      repRange: [10, 12],
      defaultRestSec: 120,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Bàn chân bước lên trước 20cm · Chạm nhẹ ghế",
      tempoCue: "Hạ 2.5s chạm ghế — Đứng lên 1.2s",
      whyItWorks: "Đặt bàn chân tiến về trước trên máy Smith giữ ống đồng gần như thẳng đứng, giảm 50% lực cắt lên dây chằng khớp gối.",
      formSteps: [
        "Đặt thanh đòn máy Smith lên phần cơ cầu vai, bước hai bàn chân về phía trước khoảng 20cm.",
        "Đặt một ghế tập phẳng phía sau làm điểm chuẩn độ sâu vuông góc 90°.",
        "Từ từ hạ hông xuống chạm nhẹ vào mặt ghế rồi đạp gót chân đứng thẳng lên."
      ],
      cues: "Tựa nhẹ lưng vào thanh đòn Smith khi hạ xuống để giữ thân người thẳng đứng.",
      mistake: "Không thả rơi mông đập mạnh xuống ghế.",
      swapOptions: ["leg_press_45", "hack_squat_machine", "seated_leg_extension"],
      swapReason: "Bài tập chân trên máy Smith được chính The New Gym khuyến nghị trong giáo án.",
      videoUrl: "https://www.youtube.com/watch?v=yZmx_Ac3880",
      videoId: "yZmx_Ac3880",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Smith Machine Squat Foot Placement For Knee Health",
      defaultSets: [
        { type: "W", prev: "Khởi động khớp", weight: 30, reps: 12, effort: "easy", done: false },
        { type: "1", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 50, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Giữ ống đồng thẳng đứng, bảo vệ sụn chêm khớp gối tối đa"
    },
    seated_leg_extension: {
      id: "seated_leg_extension",
      name: "Máy Đá Đùi Trước Ngồi (Seated Leg Extension Machine)",
      shortName: "Máy Đá Đùi Trước",
      muscle: "Đùi Trước & Cơ Giọt Lệ VMO (Bảo Vệ Gối)",
      equipment: "Máy đá đùi trước chốt tạ",
      mascot: "legExtension",
      tier: "Tier A · Có Ở Cả 2 Phòng",
      priorityRank: 2,
      slotGroup: "quad_compound",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Seated Leg Extension Pin-Loaded",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Chỉnh đệm lưng sao cho khoeo chân sát mép ghế, đệm cổ chân nằm ngay trên khớp cổ chân.",
        ways_ql13: "Khu Máy Chân Ways 361 QL13: Nắm chặt hai tay cầm bên hông ghế, giữ mông dính chặt đệm khi đá lên."
      },
      repRange: [12, 15],
      defaultRestSec: 75,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Khớp gối trùng trục xoay máy · Giữ đỉnh 1s",
      tempoCue: "Đá lên 1.2s — Siết đùi 1.0s — Hạ 2.2s",
      whyItWorks: "Tăng cường sức mạnh cơ giọt lệ (VMO) bao quanh xương bánh chè, giúp ổn định khớp gối cho người nặng cân.",
      formSteps: [
        "Chỉnh đệm tựa lưng sao cho khớp gối nằm ngay trục xoay tròn của máy.",
        "Đặt đệm mút ở ngay trên cổ chân, nắm chặt tay cầm hai bên hông ghế.",
        "Duỗi thẳng hai cẳng chân lên, giữ siết cơ đùi trước 1 giây ở đỉnh rồi hạ chậm."
      ],
      cues: "Chọn mức tạ vừa phải (12–15 reps) và giữ 1 giây ở đỉnh thay vì đá giật cục.",
      mistake: "Không đá vung lấy đà làm bật mông khỏi ghế.",
      swapOptions: ["leg_press_45", "smith_box_squat", "hack_squat_machine"],
      swapReason: "Có mặt tại cả The New Gym 58D UVK lẫn Ways Station 361 QL13.",
      videoUrl: "https://www.youtube.com/watch?v=yZmx_Ac3880",
      videoId: "yZmx_Ac3880",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "Leg Extension Setup & Quad Isolation",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 40, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 40, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 40, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "Làm khỏe bó cơ VMO giữ ổn định xương bánh chè"
    },
    seated_leg_curl_machine: {
      id: "seated_leg_curl_machine",
      name: "Máy Ngồi / Nằm Cuốn Đùi Sau (Seated / Lying Leg Curl)",
      shortName: "Máy Cuốn Đùi Sau",
      muscle: "Cơ Đùi Sau (Hamstrings)",
      equipment: "Máy cuốn đùi sau Pin-Loaded",
      mascot: "seatedLegCurl",
      tier: "Tier S · Có Ở Cả 2 Phòng",
      priorityRank: 2,
      slotGroup: "posterior_chain",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Seated & Lying Leg Curl Machine",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Máy Seated Leg Curl — khóa đệm đùi trên thật chặt xuống đùi trước trước khi móc gót chân.",
        ways_ql13: "Khu Máy Chân Ways 361 QL13: Có cả Máy Ngồi Cuốn Đùi Sau (Seated) và Máy Nằm Sấp Cuốn Đùi Sau (Lying Leg Curl)."
      },
      repRange: [10, 15],
      defaultRestSec: 90,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Khóa chặt đệm đùi · Móc sâu gót chân",
      tempoCue: "Cuốn 1.2s — Giữ đáy 1.0s — Nhả 2.5s",
      whyItWorks: "Cô lập hoàn toàn cơ đùi sau với 0% áp lực lên thắt lưng, đồng thời gân đùi sau khỏe sẽ giữ chặt khớp gối không bị trượt.",
      formSteps: [
        "Ngồi tựa sát lưng vào đệm, chỉnh đệm gót chân nằm ngay dưới bắp chân (sát gót).",
        "Hạ thanh khóa đùi ép sát mặt trên đùi để cố định hông.",
        "Móc mạnh gót chân xuống dưới ghế, giữ siết đùi sau 1 giây rồi nhả lên chậm 2.5 giây."
      ],
      cues: "Gập cổ chân hướng mũi chân về phía ống đồng (Dorsiflexion) khi cuốn để đùi sau ăn sâu hơn.",
      mistake: "Không để đệm khóa đùi quá lỏng làm nhổm đùi khi cuốn.",
      swapOptions: ["dumbbell_rdl", "glute_drive_hip_thrust"],
      swapReason: "Lựa chọn số 1 thay thế RDL khi muốn giải phóng hoàn toàn lưng dưới.",
      videoUrl: "https://www.youtube.com/watch?v=_oyxCn2iSjU",
      videoId: "_oyxCn2iSjU",
      videoAuthor: "Jeff Nippard",
      videoTitle: "Seated vs Lying Leg Curl Science",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 40, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 40, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 40, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "0% tải cột sống · Tăng sức bền dây chằng sau khớp gối"
    },
    glute_drive_hip_thrust: {
      id: "glute_drive_hip_thrust",
      name: "Máy Đẩy Hông Chuyên Biệt (Glute Drive / Hip Thrust Machine)",
      shortName: "Máy Đẩy Hông Hip Thrust",
      muscle: "Cơ Mông Lớn & Đùi Sau",
      equipment: "Máy Hip Thrust / Máy Smith",
      mascot: "hipThrust",
      tier: "Tier A · Đặc Trưng Ways QL13",
      priorityRank: 2,
      slotGroup: "posterior_chain",
      availableGyms: ["ways_ql13", "tng_uvk"],
      machineBrand: "Glute Drive Plate-Loaded / Smith Hip Thrust",
      gymSetup: {
        ways_ql13: "Khu Mông Đùi tầng 4 Ways 361 QL13: Có Máy Đẩy Hông (Glute Drive) chuyên biệt với dây đai đệm hông êm ái, không cần kê đòn.",
        tng_uvk: "Khu Máy Smith TNG 58D UVK: Đặt ghế ngang sau lưng, lót mút đệm lên thanh đòn Smith để đẩy hông."
      },
      repRange: [10, 12],
      defaultRestSec: 90,
      usesBarbell: true,
      jointSafe: true,
      angleCue: "Cằm thu nhẹ · Ống đồng thẳng đứng ở đỉnh",
      tempoCue: "Đẩy lên 1.0s — Siết mông 1.5s — Hạ 2.0s",
      whyItWorks: "Cơ mông khỏe là động cơ chính nâng đỡ khung chậu và giảm tới 40% tải trọng truyền xuống thắt lưng & đầu gối khi đi bộ.",
      formSteps: [
        "Tựa phần lưng trên (dưới xương bả vai) lên đệm tựa, cài đai đệm qua ngang xương hông.",
        "Đặt hai bàn chân trên bệ sao cho khi đẩy hông lên cao nhất, ống đồng vuông góc 90° với bệ.",
        "Đẩy mạnh qua gót chân, siết chặt cơ mông ở đỉnh 1.5 giây (mắt nhìn về trước) rồi hạ chậm."
      ],
      cues: "Giữ cằm hơi thu về ngực và xương sườn khép để không ưỡn lưng dưới ở đỉnh.",
      mistake: "Không đặt chân quá gần hoặc quá xa làm mỏi đùi trước.",
      swapOptions: ["dumbbell_rdl", "seated_leg_curl_machine"],
      swapReason: "Máy chuyên biệt cực tiện tại Ways Station 361 Quốc Lộ 13.",
      videoUrl: "https://www.youtube.com/watch?v=_oyxCn2iSjU",
      videoId: "_oyxCn2iSjU",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Hip Thrust With Perfect Form",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 60, reps: 12, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 60, reps: 12, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 60, reps: 10, effort: "good", done: false }
      ],
      progressionBadge: "Làm khỏe cơ mông nâng đỡ khung chậu và cột sống"
    },
    ab_crunch_machine: {
      id: "ab_crunch_machine",
      name: "Máy Gập Bụng Ngồi / Quỳ Kéo Cáp Bụng (Ab Crunch Machine / Cable)",
      shortName: "Máy Gập Bụng / Kéo Cáp",
      muscle: "Cơ Bụng 6 Múi & Core",
      equipment: "Máy Ab Crunch hoặc Cáp cao",
      mascot: "abCrunchMachine",
      tier: "Tier A · Có Ở Cả 2 Phòng",
      priorityRank: 3,
      slotGroup: "core_stability",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Seated Ab Crunch / Cable Rope Crunch",
      gymSetup: {
        tng_uvk: "Khu Tập Bụng & Giãn Cơ TNG 58D UVK: Dùng Máy Gập Bụng Ngồi hoặc Quỳ Kéo Dây Thừng ở Khung Cáp Đôi.",
        ways_ql13: "Khu Core Ways 361 QL13: Dùng Máy Ab Crunch hoặc quỳ trên thảm kéo cáp dây thừng."
      },
      repRange: [12, 15],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Cuộn xương ức về rốn · Thở hết hơi ở đáy",
      tempoCue: "Cuộn 1.5s — Thở cạn siết 1.0s — Mở 2.0s",
      whyItWorks: "Tạo kháng lực có thể tăng tiến cho cơ bụng thẳng mà không gây giật cổ như gập bụng nằm sàn.",
      formSteps: [
        "Ngồi vào máy Ab Crunch (hoặc quỳ dưới cáp cao cầm dây thừng hai bên thái dương).",
        "Cố định hông, thở mạnh ra đồng thời cuộn tròn phần ngực trên hướng về phía xương mu.",
        "Giữ siết cơ bụng 1 giây rồi từ từ mở người lên hít sâu."
      ],
      cues: "Tập trung cuộn lồng ngực xuống rốn thay vì gập khớp hông.",
      mistake: "Không dùng lực tay kéo ghì vào cổ.",
      swapOptions: ["plank_core", "seated_calf_press"],
      swapReason: "Đổi bài Core linh hoạt ngay tại khu bụng của cả 2 phòng tập.",
      videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
      videoId: "pSHjTRCQxIw",
      videoAuthor: "Jeff Nippard",
      videoTitle: "How To Train Abs Properly (Machine & Cable Crunch)",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 30, reps: 15, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 30, reps: 15, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 30, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "Làm dày múi cơ bụng với kháng lực máy/cáp có kiểm soát"
    },
    seated_calf_press: {
      id: "seated_calf_press",
      name: "Nhón Bắp Chân Máy Ngồi / Bàn Đạp Leg Press (Calf Raise)",
      shortName: "Nhón Bắp Chân Máy",
      muscle: "Cơ Bắp Chân (Soleus & Gastrocnemius)",
      equipment: "Máy Seated Calf / Bàn đạp Leg Press",
      mascot: "seatedCalfRaise",
      tier: "Tier B · Bảo Vệ Cổ Chân",
      priorityRank: 3,
      slotGroup: "calves",
      availableGyms: ["ways_ql13", "tng_uvk"],
      machineBrand: "Seated Calf Raise / 45° Leg Press Calf",
      gymSetup: {
        ways_ql13: "Khu Chân Ways 361 QL13: Có Máy Nhón Bắp Chân Ngồi (Seated Calf Raise lắp tạ rời) chuyên biệt.",
        tng_uvk: "Khu Strength TNG 58D UVK: Đặt nửa mũi bàn chân lên mép dưới bàn đạp Máy Leg Press 45° để nhón bắp chân."
      },
      repRange: [12, 15],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Hạ gót căng sâu 2s · Nhón hết tầm mũi chân",
      tempoCue: "Nhón 1.0s — Giữ đỉnh 1.5s — Hạ căng 2.0s",
      whyItWorks: "Bắp chân khỏe đóng vai trò như bơm máu thứ hai đẩy máu tĩnh mạch về tim và bảo vệ khớp cổ chân khi mang trọng lượng lớn.",
      formSteps: [
        "Đặt phần ức bàn chân lên mép bàn đạp (hoặc ngồi vào máy Seated Calf Raise đặt đệm lên gối).",
        "Hạ gót chân xuống sâu nhất có thể và giữ 2 giây để triệt tiêu lực đàn hồi của gân Achilles.",
        "Nhón mạnh mũi chân lên cao nhất, giữ siết bắp chân 1.5 giây."
      ],
      cues: "Dừng 2 giây ở điểm thấp nhất là bí quyết để bắp chân phát triển.",
      mistake: "Không nhấp nhổm nhanh lấy đà bằng gân cổ chân.",
      swapOptions: ["plank_core", "ab_crunch_machine"],
      swapReason: "Tăng sức bền cổ chân và bắp chân tại Ways Station QL13 & TNG UVK.",
      videoUrl: "https://www.youtube.com/watch?v=yZmx_Ac3880",
      videoId: "yZmx_Ac3880",
      videoAuthor: "Renaissance Periodization",
      videoTitle: "How To Train Calves Effectively (Pause At The Bottom)",
      defaultSets: [
        { type: "1", prev: "Mức gợi ý", weight: 40, reps: 15, effort: "good", done: false },
        { type: "2", prev: "Mức gợi ý", weight: 40, reps: 15, effort: "good", done: false },
        { type: "3", prev: "Mức gợi ý", weight: 40, reps: 15, effort: "good", done: false }
      ],
      progressionBadge: "Làm khỏe cổ chân & bơm tuần hoàn máu chi dưới"
    },
    stair_stepper_cardio: {
      id: "stair_stepper_cardio",
      name: "Máy Leo Cầu Thang Đốt Mỡ Sâu (Stair Stepper / StairMaster)",
      shortName: "Máy Leo Cầu Thang",
      muscle: "Tim Mạch, Mông & Đốt Mỡ Cực Mạnh",
      equipment: "Máy leo cầu thang (Stair Stepper)",
      mascot: "stairStepper",
      tier: "Tier S · Đặc Trưng TNG UVK",
      priorityRank: 6,
      slotGroup: "cardio_finisher",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Commercial Stair Stepper / Climber",
      gymSetup: {
        tng_uvk: "Khu Cardio TNG 58D UVK: Dàn máy leo cầu thang tự động — chỉnh tốc độ Level 5–7, đặt toàn bộ bàn chân lên bậc thang.",
        ways_ql13: "Khu Cardio Ways 361 QL13: Nếu máy leo cầu thang bận, dùng Máy Chạy Bộ chỉnh độ dốc tối đa 12%–15%."
      },
      repRange: [12, 15],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Level 5–7 · Lưng thẳng · Không tì người lên tay vịn",
      tempoCue: "Leo đều nhịp 12–15 phút cuối buổi",
      whyItWorks: "Được The New Gym xếp hạng là 'sát thủ đốt mỡ' giúp tiêu hao lượng calo cao gấp 1.3 lần đi bộ phẳng trong khi không có pha tiếp đất gây sốc khớp gối.",
      formSteps: [
        "Bước lên máy leo cầu thang, chọn chế độ Manual ở mức tốc độ vừa phải (Level 5–7).",
        "Đặt trọn bàn chân lên từng bậc thang, đạp qua gót chân để kích hoạt cả cơ mông và đùi.",
        "Chỉ chạm nhẹ đầu ngón tay vào thanh vịn để giữ thăng bằng, giữ lưng thẳng suốt 12–15 phút."
      ],
      cues: "Tuyệt đối không chống hai khuỷu tay đổ người lên bảng điều khiển.",
      mistake: "Không nhón mũi chân liên tục hoặc chỉnh tốc độ quá nhanh làm hụt hơi.",
      swapOptions: ["incline_treadmill_walk", "rowing_machine_cardio", "elliptical_cross_trainer"],
      swapReason: "Máy Cardio đốt mỡ đỉnh cao tại Khu Cardio The New Gym 58D Ung Văn Khiêm.",
      videoUrl: "https://www.youtube.com/watch?v=b5hB5n1T13M",
      videoId: "b5hB5n1T13M",
      videoAuthor: "Jeremy Ethier",
      videoTitle: "StairMaster vs Incline Treadmill For Fat Loss",
      defaultSets: [
        { type: "1", prev: "Level 6 × 15 phút", weight: 6, reps: 15, effort: "good", done: false }
      ],
      progressionBadge: "Sát thủ đốt mỡ & săn chắc cơ mông tại Khu Cardio TNG 58D UVK"
    },
    rowing_machine_cardio: {
      id: "rowing_machine_cardio",
      name: "Máy Chèo Thuyền Toàn Thân (Indoor Rowing Machine)",
      shortName: "Máy Chèo Thuyền 85% Cơ",
      muscle: "Toàn Thân (Chân, Lưng, Tay & Tim Mạch)",
      equipment: "Máy chèo thuyền kháng lực gió",
      mascot: "rowingMachine",
      tier: "Tier S · Đặc Trưng TNG UVK",
      priorityRank: 6,
      slotGroup: "cardio_finisher",
      availableGyms: ["tng_uvk"],
      machineBrand: "Concept2 / Air Resistance Rower",
      gymSetup: {
        tng_uvk: "Khu Cardio & Functional TNG 58D UVK: Chỉnh cần gió (Damper) ở mức 4–6, khóa đai bàn chân ngang phần rộng nhất của bàn chân.",
        ways_ql13: "Tại Ways 361 QL13 chuyển sang Đi Bộ Dốc 10% hoặc Xe Đạp Kháng Lực."
      },
      repRange: [12, 15],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Nhịp: Đạp Chân -> Ngả Lưng -> Kéo Tay",
      tempoCue: "Đạp mạnh 1s — Thu về 2s × 12 phút",
      whyItWorks: "Huy động tới 85% nhóm cơ toàn thân trong tư thế ngồi trượt ngang, giải phóng hoàn toàn trọng lượng cơ thể khỏi khớp gối và cổ chân.",
      formSteps: [
        "Chỉnh mức kháng lực gió (Damper) ở số 4–6, cài chặt dây đai qua mu bàn chân.",
        "Phát lực theo đúng thứ tự: 60% lực Đạp Chân -> 20% Ngả Lưng nhẹ -> 20% Kéo Tay cầm về dưới ngực.",
        "Trả người về theo thứ tự ngược lại: Duỗi Tay -> Gập Hông -> Co Gối trượt lên."
      ],
      cues: "Nhớ khẩu quyết: Chân - Lưng - Tay khi kéo, và Tay - Lưng - Chân khi thu về.",
      mistake: "Không kéo tay trước khi chân đạp thẳng làm vướng đầu gối.",
      swapOptions: ["incline_treadmill_walk", "stair_stepper_cardio", "elliptical_cross_trainer"],
      swapReason: "Đứng số 1 trong bảng máy Cardio đốt calo của The New Gym.",
      videoUrl: "https://www.youtube.com/watch?v=b5hB5n1T13M",
      videoId: "b5hB5n1T13M",
      videoAuthor: "Concept2",
      videoTitle: "Proper Indoor Rowing Technique",
      defaultSets: [
        { type: "1", prev: "Mức gió 5 × 12 phút", weight: 5, reps: 12, effort: "good", done: false }
      ],
      progressionBadge: "Huy động 85% cơ bắp toàn thân với 0% áp lực dồn lên khớp gối"
    },
    elliptical_cross_trainer: {
      id: "elliptical_cross_trainer",
      name: "Máy Trượt Tuyết Elliptical / Xe Đạp Từ Tính (Zero-Impact Cardio)",
      shortName: "Máy Elliptical Êm Khớp",
      muscle: "Tim Mạch & Đốt Mỡ Không Xung Lực",
      equipment: "Máy Elliptical hoặc Xe đạp tại chỗ",
      mascot: "ellipticalTrainer",
      tier: "Tier A · Bảo Vệ Khớp Gối 100%",
      priorityRank: 6,
      slotGroup: "cardio_finisher",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Elliptical Cross-Trainer / Upright Bike",
      gymSetup: {
        tng_uvk: "Khu Cardio TNG 58D UVK: Dàn máy Elliptical trượt tuyết có tay cầm chuyển động toàn thân, chỉnh kháng lực mức 7–9.",
        ways_ql13: "Khu Cardio Ways 361 QL13: Dùng máy Elliptical hoặc Xe Đạp Tập (Spin Bike) ở kháng lực vừa phải trong 15 phút."
      },
      repRange: [15, 20],
      defaultRestSec: 60,
      usesBarbell: false,
      jointSafe: true,
      angleCue: "Bàn chân luôn dính bàn đạp · Kháng lực 7–9",
      tempoCue: "Đạp kết hợp kéo đẩy tay đều đặn 15 phút",
      whyItWorks: "Bàn chân không bao giờ nhấc rời khỏi bàn đạp nên lực va chạm lên sụn khớp gối bằng 0 tuyệt đối, lý tưởng cho ngày chân mỏi hoặc người >105kg.",
      formSteps: [
        "Bước lên hai bàn đạp lớn của máy Elliptical, hai tay nắm vào cần chuyển động.",
        "Chỉnh mức kháng lực (Resistance) từ 7 đến 9 để giữ nhịp tim vùng đốt mỡ 125–140 bpm.",
        "Phối hợp nhịp nhàng cả chân đạp elip và tay kéo-đẩy liên tục trong 15 phút."
      ],
      cues: "Giữ toàn bộ lòng bàn chân tiếp xúc mặt bàn đạp để không bị tê mũi chân.",
      mistake: "Không để mức kháng lực quá nhẹ (dưới 3) rồi đạp quay tít theo quán tính.",
      swapOptions: ["incline_treadmill_walk", "stair_stepper_cardio", "rowing_machine_cardio"],
      swapReason: "Có sẵn tại cả The New Gym 58D UVK và Ways Station 361 QL13.",
      videoUrl: "https://www.youtube.com/watch?v=b5hB5n1T13M",
      videoId: "b5hB5n1T13M",
      videoAuthor: "Jeremy Ethier",
      videoTitle: "Low Impact Elliptical Cardio For Fat Loss",
      defaultSets: [
        { type: "1", prev: "Kháng lực 8 × 15 phút", weight: 8, reps: 15, effort: "good", done: false }
      ],
      progressionBadge: "0% xung lực tiếp đất — Lựa chọn êm sụn gối nhất cho người >100kg"
    }
  };

  const BASE_EXERCISE_GYM_META = {
    incline_db_press: {
      slotGroup: "chest_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Dumbbell Rack 2–50kg + Adjustable Incline Bench",
      gymSetup: {
        tng_uvk: "Khu Free Weight TNG 58D UVK: Kệ tạ đơn 2–40kg trước gương lớn, chỉnh ghế đa năng lên nấc 2 (dốc 30°).",
        ways_ql13: "Khu Free Weight tầng 4 Ways 361 QL13: Dàn tạ đơn bọc cao su 2–50kg + ghế dốc chỉnh nấc 30°."
      },
      swapOptions: ["machine_chest_press", "iso_incline_chest_press", "smith_incline_press", "barbell_bench_press", "assisted_chest_dip"]
    },
    dumbbell_shoulder_press: {
      slotGroup: "shoulder_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Dumbbell Rack + 75° Seated Bench",
      gymSetup: {
        tng_uvk: "Khu Free Weight TNG 58D UVK: Dựng lưng ghế đa năng lên nấc 5 (góc 75°–80°) đối diện gương.",
        ways_ql13: "Khu Tạ Đơn Ways 361 QL13: Ghế tựa lưng ngắn chuyên đẩy vai hoặc ghế đa năng dựng 75°."
      },
      swapOptions: ["machine_shoulder_press", "smith_shoulder_press", "cable_lateral_raise_single"]
    },
    pec_deck_fly: {
      slotGroup: "chest_fly",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "2-in-1 Pec Deck / Rear Delt Fly Pin-Loaded",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Máy Pec Deck 2-in-1 — chỉnh chốt tay đòn về nấc 3–4 (mở ngang ngực), yên ghế nấc 4.",
        ways_ql13: "Khu Máy Selectorized Ways 361 QL13: Máy ép ngực cánh bướm rút chốt tạ, tay cầm ngang ngực giữa."
      },
      swapOptions: ["cable_crossover_fly", "machine_chest_press", "assisted_chest_dip"]
    },
    lateral_raise: {
      slotGroup: "lateral_delt",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Dumbbell Rack (4kg – 14kg)",
      gymSetup: {
        tng_uvk: "Khu Free Weight TNG 58D UVK: Cặp tạ đơn nhỏ 6–10kg ở tầng trên của kệ tạ.",
        ways_ql13: "Khu Tạ Đơn Ways 361 QL13: Cặp tạ đơn 6–12kg hoặc chuyển ngay sang Máy Bay Vai Ngang kế bên."
      },
      swapOptions: ["cable_lateral_raise_single", "machine_lateral_raise", "reverse_pec_deck_delt", "rope_face_pull"]
    },
    tricep_rope_pushdown: {
      slotGroup: "triceps",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Cable Tower High Pulley + Rope",
      gymSetup: {
        tng_uvk: "Khung Cáp Đôi TNG 58D UVK: Móc dây thừng đơn/đôi vào ròng rọc cao nhất (nấc 18).",
        ways_ql13: "Giàn Cáp 8 Trạm Ways 361 QL13: Trạm cáp cao có sẵn dây thừng và thanh V-Bar."
      },
      swapOptions: ["overhead_cable_tricep_ext", "seated_dip_tricep_machine", "assisted_chest_dip"]
    },
    barbell_bench_press: {
      slotGroup: "chest_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Olympic Flat Barbell Bench (Đòn 20kg)",
      gymSetup: {
        tng_uvk: "Khu Free Weight TNG 58D UVK: Ghế đẩy ngực ngang Olympic kèm thanh đòn 20kg.",
        ways_ql13: "Khu Bench & Power Rack Ways 361 QL13: Ghế Bench tiêu chuẩn thi đấu và khung Power Cage có thanh bảo hiểm."
      },
      swapOptions: ["incline_db_press", "machine_chest_press", "iso_incline_chest_press", "smith_incline_press"]
    },
    machine_chest_press: {
      slotGroup: "chest_press",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Seated Chest Press Pin-Loaded (Matrix / Impulse)",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Một trong 5 máy kháng lực cốt lõi tại TNG — có sticker hướng dẫn trên thân máy, chỉnh ghế nấc 4.",
        ways_ql13: "Khu Máy Ngực Ways 361 QL13: Có cả Máy Đẩy Ngực Ngồi rút chốt tạ và Máy Iso-Lateral lắp bánh tạ rời."
      },
      swapOptions: ["incline_db_press", "iso_incline_chest_press", "smith_incline_press", "barbell_bench_press", "assisted_chest_dip"]
    },
    lat_pulldown: {
      slotGroup: "vertical_pull",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Lat Pulldown Station (Pin-Loaded)",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Máy Lat Pulldown cốt lõi — chỉnh đệm khóa đùi ép sát trước khi kéo.",
        ways_ql13: "Giàn Cáp 8 Trạm Ways 361 QL13: 2 trạm Lat Pulldown đối xứng kèm đủ thanh rộng, V-Bar và MAG Grip."
      },
      swapOptions: ["iso_high_row_pulldown", "close_neutral_pulldown", "assisted_pull_up", "machine_seated_row"]
    },
    seated_cable_row: {
      slotGroup: "horizontal_row",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Seated Low Cable Row Station",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Máy kéo cáp ngồi bàn đạp chân rộng, gắn tay cầm chữ V.",
        ways_ql13: "Giàn 8 Trạm Ways 361 QL13: Trạm Low Row cáp ngồi hoặc chuyển sang Máy T-Bar Row tựa ngực kế bên."
      },
      swapOptions: ["chest_supported_tbar_row", "machine_seated_row", "one_arm_db_row", "rope_face_pull"]
    },
    dumbbell_curl_lateral: {
      slotGroup: "biceps",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Dumbbell Rack + Adjustable Bench",
      gymSetup: {
        tng_uvk: "Khu Free Weight TNG 58D UVK: Ngồi tựa ghế dốc 60° hoặc đứng trước gương với cặp tạ đơn 8–14kg.",
        ways_ql13: "Khu Tạ Đơn Ways 361 QL13: Cặp tạ đơn 8–16kg hoặc dùng Máy Cuốn Tay Trước Preacher."
      },
      swapOptions: ["preacher_curl_machine", "cable_rope_hammer_curl"]
    },
    plank_core: {
      slotGroup: "core_stability",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Khu Thảm Tập & Functional Zone",
      gymSetup: {
        tng_uvk: "Khu Giãn Cơ & Tập Bụng Tách Biệt TNG 58D UVK: Thảm tập êm không vướng khu vực tạ nặng.",
        ways_ql13: "Khu Thảm & Giãn Cơ Ways 361 QL13: Có sẵn thảm tập và con lăn Foam Roller mượn miễn phí."
      },
      swapOptions: ["ab_crunch_machine"]
    },
    leg_press_45: {
      slotGroup: "quad_compound",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "45° Linear Leg Press & Seated Leg Press",
      gymSetup: {
        tng_uvk: "Khu Strength TNG 58D UVK: Có cả Máy Đạp Đùi Ngang rút chốt tạ (cho người mới) và Máy Đạp Đùi Nghiêng 45° lắp bánh tạ.",
        ways_ql13: "Khu Chân tầng 4 Ways 361 QL13: Máy Đạp Đùi Nghiêng 45° hạng nặng (Heavy Plate-Loaded) bàn đạp rộng."
      },
      swapOptions: ["hack_squat_machine", "smith_box_squat", "seated_leg_extension"]
    },
    dumbbell_rdl: {
      slotGroup: "posterior_chain",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Dumbbell Rack / Deadlift Platform",
      gymSetup: {
        tng_uvk: "Khu Free Weight TNG 58D UVK: Cặp tạ đơn 16–30kg hoặc thanh đòn Olympic.",
        ways_ql13: "Khu Sàn Deadlift & Tạ Đơn Ways 361 QL13: Có sàn giảm chấn chuyên dụng và tạ đơn lên tới 50kg."
      },
      swapOptions: ["seated_leg_curl_machine", "glute_drive_hip_thrust"]
    },
    incline_treadmill_walk: {
      slotGroup: "cardio_finisher",
      availableGyms: ["tng_uvk", "ways_ql13"],
      machineBrand: "Commercial Incline Treadmill (0% – 15%)",
      gymSetup: {
        tng_uvk: "Khu Cardio TNG 58D UVK: Hàng 20+ máy chạy bộ hiện đại — bấm Incline 10%, Speed 4.4 km/h.",
        ways_ql13: "Khu Cardio tầng 4 Ways 361 QL13: Dàn máy chạy bộ có chỉnh dốc tự động nhìn ra Quốc Lộ 13."
      },
      swapOptions: ["stair_stepper_cardio", "rowing_machine_cardio", "elliptical_cross_trainer"]
    }
  };

  Object.keys(BASE_EXERCISE_GYM_META).forEach((exId) => {
    if (EXERCISES[exId]) {
      Object.assign(EXERCISES[exId], BASE_EXERCISE_GYM_META[exId]);
    }
  });

  const ZONE_CATEGORY_LABELS = {
    pin_machine: "Khu Máy Chốt Tạ (Strength)",
    plate_loaded: "Khu Lắp Tạ Rời (Plate-Loaded)",
    cable_smith: "Khu Khung Cáp & Máy Smith",
    free_weight: "Khu Tạ Đơn & Ghế Rời",
    cardio_core: "Khu Cardio & Thảm Giãn Cơ"
  };

  const EXERCISE_ZONE_MAP = {
    incline_db_press: "free_weight",
    dumbbell_shoulder_press: "free_weight",
    pec_deck_fly: "pin_machine",
    lateral_raise: "free_weight",
    tricep_rope_pushdown: "cable_smith",
    barbell_bench_press: "free_weight",
    machine_chest_press: "pin_machine",
    lat_pulldown: "pin_machine",
    seated_cable_row: "pin_machine",
    plank_core: "cardio_core",
    leg_press_45: "plate_loaded",
    dumbbell_rdl: "free_weight",
    dumbbell_curl_lateral: "free_weight",
    incline_treadmill_walk: "cardio_core",
    iso_incline_chest_press: "plate_loaded",
    smith_incline_press: "cable_smith",
    assisted_chest_dip: "pin_machine",
    cable_crossover_fly: "cable_smith",
    machine_shoulder_press: "pin_machine",
    smith_shoulder_press: "cable_smith",
    cable_lateral_raise_single: "cable_smith",
    machine_lateral_raise: "pin_machine",
    reverse_pec_deck_delt: "pin_machine",
    overhead_cable_tricep_ext: "cable_smith",
    seated_dip_tricep_machine: "pin_machine",
    iso_high_row_pulldown: "plate_loaded",
    close_neutral_pulldown: "pin_machine",
    assisted_pull_up: "pin_machine",
    chest_supported_tbar_row: "plate_loaded",
    machine_seated_row: "pin_machine",
    one_arm_db_row: "free_weight",
    rope_face_pull: "cable_smith",
    preacher_curl_machine: "pin_machine",
    cable_rope_hammer_curl: "cable_smith",
    hack_squat_machine: "plate_loaded",
    smith_box_squat: "cable_smith",
    seated_leg_extension: "pin_machine",
    seated_leg_curl_machine: "pin_machine",
    glute_drive_hip_thrust: "plate_loaded",
    ab_crunch_machine: "pin_machine",
    seated_calf_press: "plate_loaded",
    stair_stepper_cardio: "cardio_core",
    rowing_machine_cardio: "cardio_core",
    elliptical_cross_trainer: "cardio_core"
  };

  Object.keys(EXERCISES).forEach((exId) => {
    const zCat = EXERCISE_ZONE_MAP[exId] || "pin_machine";
    EXERCISES[exId].zoneCategory = zCat;
    EXERCISES[exId].zoneLabel = ZONE_CATEGORY_LABELS[zCat] || "Khu Máy Tập";
  });

  const SLOT_GROUP_LABELS = {
    chest_press: "Đẩy Ngực Chính (Chest Press)",
    shoulder_press: "Đẩy Vai Chính (Overhead Press)",
    chest_fly: "Ép Ngực Cô Lập (Chest Fly)",
    lateral_delt: "Bay Vai Ngang (Side Delt)",
    rear_delt_pull: "Vai Sau & Chóp Xoay (Rear Delt / Face Pull)",
    triceps: "Tay Sau Cô Lập (Triceps)",
    vertical_pull: "Kéo Lưng Xô Dọc (Lat Pulldown / Pull-Up)",
    horizontal_row: "Chèo Lưng Giữa Ngang (Seated / T-Bar Row)",
    biceps: "Cuốn Tay Trước (Biceps / Brachialis)",
    quad_compound: "Đùi Trước & Tổng Hợp Chân (Leg Press / Squat / Extension)",
    posterior_chain: "Đùi Sau & Cơ Mông (Leg Curl / RDL / Hip Thrust)",
    calves: "Nhón Bắp Chân (Seated / Leg Press Calf)",
    core_stability: "Core & Bụng Bảo Vệ Đĩa Đệm",
    cardio_finisher: "Cardio Đốt Mỡ Êm Khớp Cuối Buổi"
  };

  const SLOT_GROUP_SHORT_LABELS = {
    chest_press: "Đẩy Ngực",
    shoulder_press: "Đẩy Vai",
    chest_fly: "Ép Ngực",
    lateral_delt: "Vai Ngang",
    rear_delt_pull: "Vai Sau & Face Pull",
    triceps: "Tay Sau",
    vertical_pull: "Kéo Xô Dọc",
    horizontal_row: "Chèo Lưng Ngang",
    biceps: "Tay Trước (Biceps)",
    quad_compound: "Đùi Trước & Squat",
    posterior_chain: "Đùi Sau & Mông",
    calves: "Bắp Chân",
    core_stability: "Core & Bụng",
    cardio_finisher: "Cardio Đốt Mỡ"
  };

  const SESSION_ALLOWED_SLOT_GROUPS = {
    press_day: ["chest_press", "shoulder_press", "chest_fly", "lateral_delt", "triceps", "cardio_finisher"],
    pull_day: ["vertical_pull", "horizontal_row", "rear_delt_pull", "biceps", "core_stability", "cardio_finisher"],
    legs_day: ["quad_compound", "posterior_chain", "calves", "core_stability", "cardio_finisher"],
    upper_day: [
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

  function normalizeVNSearch(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .trim();
  }

  const GYM_BRANCHES = {
    all: {
      id: "all",
      shortName: "Cả 2 Phòng Tập",
      badge: "Tất cả máy (36 bài)",
      name: "Kết Hợp: The New Gym UVK & Ways Station QL13",
      address: "58D Ung Văn Khiêm (Bình Thạnh) & 361 Quốc Lộ 13 (Thủ Đức)",
      hours: "Linh hoạt 24/7 (TNG UVK) & 05:00–22:30 (Ways QL13)",
      highlights: [
        "Hiển thị toàn bộ 36 bài tập và thiết bị của cả 2 phòng tập.",
        "Tự động chỉ dẫn cách setup ghế, chốt tạ và vị trí máy tại từng cơ sở."
      ],
      zones: []
    },
    tng_uvk: {
      id: "tng_uvk",
      shortName: "The New Gym · UVK",
      badge: "58D Ung Văn Khiêm · 24/7",
      name: "The New Gym — Chi Nhánh 58D Ung Văn Khiêm",
      address: "58D Ung Văn Khiêm, P. Thạnh Mỹ Tây (P.25 cũ), Quận Bình Thạnh, TP.HCM",
      hours: "Mở cửa 24/7 xuyên lễ Tết (Từ 22:00–06:00 dùng tủ locker ngoài; có NV hỗ trợ 06:00–22:00)",
      highlights: [
        "Diện tích >1.000m² chia 5 khu riêng biệt: Cardio, Strength (Máy chốt tạ), Free Weight, Functional & khu Giãn cơ tách biệt.",
        "Thế mạnh: Dàn máy kháng lực rút chốt tạ (Selectorized) có dán nhãn hướng dẫn trực quan, Khung Cáp Đôi, Máy Smith, Máy Leo Cầu Thang (Stair Stepper) & Máy Chèo Thuyền (Rowing)."
      ],
      zones: [
        {
          zoneName: "Khu Strength (Máy Kháng Lực Chốt Tạ)",
          machines: [
            "Máy Đẩy Ngực Ngồi (Seated Chest Press Machine)",
            "Máy Ép Ngực & Vai Sau 2-in-1 (Pec Deck / Rear Delt)",
            "Máy Đẩy Vai Ngồi (Seated Shoulder Press)",
            "Máy Kéo Xô Cao & Kéo Cáp Ngồi (Lat Pulldown & Seated Row)",
            "Máy Trợ Lực Hít Xà & Xà Kép (Assisted Chin/Dip)",
            "Máy Đạp Đùi 45° & Đá Đùi Trước / Cuốn Đùi Sau (Leg Press, Extension, Curl)"
          ]
        },
        {
          zoneName: "Khu Khung Cáp, Máy Smith & Free Weight",
          machines: [
            "Khung Cáp Đôi Đa Năng (Dual Adjustable Pulley)",
            "Máy Smith Quỹ Đạo Cố Định (Counter-Balanced Smith Machine)",
            "Dàn Tạ Đơn (2kg – 40kg) + Ghế Dốc Đa Năng (0° – 30° – 75°)",
            "Ghế Đẩy Ngực Tạ Đòn Olympic & Giá Đỡ Squat Rack"
          ]
        },
        {
          zoneName: "Khu Cardio & Khu Giãn Cơ Riêng",
          machines: [
            "Máy Leo Cầu Thang Tự Động (Stair Stepper / StairMaster)",
            "Máy Chèo Thuyền Kháng Lực Gió (Rowing Machine)",
            "Dàn Máy Chạy Bộ Dốc (Incline Treadmill) & Máy Trượt Tuyết Elliptical",
            "Khu Thảm Giãn Cơ, Tạ Ấm Kettlebell, Bục Nhảy & Ghế Tập Bụng"
          ]
        }
      ]
    },
    ways_ql13: {
      id: "ways_ql13",
      shortName: "Ways Station · QL13",
      badge: "361 Quốc Lộ 13 · FaceID",
      name: "Ways Station Gym — Chi Nhánh 361 Quốc Lộ 13",
      address: "Lầu 4, 361 Quốc Lộ 13 (kế Vạn Phúc City), P. Hiệp Bình Phước, TP. Thủ Đức (Liên thông 165 UVK)",
      hours: "05:00 – 22:30 hàng ngày tại 361 QL13 (Liên thông 38+ chi nhánh, 165 UVK mở 24/24) · Ra vào bằng FaceID",
      highlights: [
        "Miễn phí giữ xe, khăn tập, nước uống, tắm nóng lạnh, đo InBody định kỳ và mượn con lăn giãn cơ (Foam Roller). Không PT/Sale chèo kéo.",
        "Thế mạnh: Dàn máy lắp bánh tạ rời (Plate-Loaded Iso-Lateral) cực đầm chắc, Máy Hack Squat, Máy Chèo Lưng T-Bar tựa ngực, Máy Đẩy Hông Glute Drive, Máy Bay Vai Ngang & Giàn Cáp 8 Trạm."
      ],
      zones: [
        {
          zoneName: "Khu Máy Lắp Bánh Tạ Rời (Plate-Loaded / Iso-Lateral)",
          machines: [
            "Máy Đẩy Ngực Trên Lắp Tạ Rời (Iso-Lateral Incline Chest Press)",
            "Máy Kéo Xô Cao Lắp Tạ Rời (Iso-Lateral High Row / Pulldown)",
            "Máy Chèo Lưng T-Bar Đệm Ngực (Chest-Supported T-Bar Row)",
            "Máy Squat Nghiêng Tựa Lưng (Linear Hack Squat Machine)",
            "Máy Đạp Đùi Nghiêng 45° Hạng Nặng (Heavy Plate-Loaded Leg Press)",
            "Máy Đẩy Hông Chuyên Biệt (Glute Drive / Hip Thrust) & Máy Nhón Bắp Chân Ngồi"
          ]
        },
        {
          zoneName: "Khu Máy Cô Lập & Giàn Cáp 8 Trạm",
          machines: [
            "Giàn Cáp Chéo 8 Trạm Đa Năng (8-Stack Jungle Gym Cable Crossover)",
            "Máy Bay Vai Ngang Đệm Khuỷu Tay (Seated Lateral Raise Machine)",
            "Máy Cuốn Tay Trước Ghế Preacher (Preacher Curl Machine & Scott Bench)",
            "Máy Ép Ngực / Vai Sau (Pec Deck) & Máy Đá Đùi / Nằm Cuốn Đùi Sau"
          ]
        },
        {
          zoneName: "Khu Power Rack, Tạ Đơn Nặng & Cardio",
          machines: [
            "Khung Power Cage Đa Năng & Sàn Deadlift Giảm Chấn",
            "Dàn Tạ Đơn Nặng (2kg – 50kg) + Máy Smith Đa Năng",
            "Dàn Máy Chạy Bộ Dốc, Xe Đạp Tập, Máy Đo InBody & Con Lăn Foam Roller"
          ]
        }
      ]
    }
  };

  const GYM_SESSION_PRESETS = {
    default: {
      id: "default",
      label: "Khung Chuẩn Mặc Định",
      shortLabel: "Khung Mặc Định",
      description: "Bộ khung gốc cân bằng giữa Tạ đơn, Máy cáp và Đi bộ dốc tập được ở mọi phòng.",
      sessions: {
        press_day: ["incline_db_press", "dumbbell_shoulder_press", "pec_deck_fly", "lateral_raise", "tricep_rope_pushdown", "incline_treadmill_walk"],
        pull_day: ["lat_pulldown", "seated_cable_row", "dumbbell_curl_lateral", "plank_core", "incline_treadmill_walk"],
        legs_day: ["leg_press_45", "dumbbell_rdl", "plank_core", "incline_treadmill_walk"],
        upper_day: ["machine_chest_press", "lat_pulldown", "pec_deck_fly", "seated_cable_row", "lateral_raise", "tricep_rope_pushdown"]
      }
    },
    tng_uvk: {
      id: "tng_uvk",
      label: "Bộ Máy The New Gym · 58D Ung Văn Khiêm",
      shortLabel: "Bộ Máy TNG UVK",
      description: "Tối ưu theo dàn máy Selectorized chốt tạ, Máy Smith, Khung Cáp Đôi & Máy Leo Cầu Thang tại 58D Ung Văn Khiêm.",
      sessions: {
        press_day: ["smith_incline_press", "machine_shoulder_press", "pec_deck_fly", "cable_lateral_raise_single", "seated_dip_tricep_machine", "stair_stepper_cardio"],
        pull_day: ["close_neutral_pulldown", "machine_seated_row", "rope_face_pull", "cable_rope_hammer_curl", "ab_crunch_machine", "rowing_machine_cardio"],
        legs_day: ["leg_press_45", "smith_box_squat", "seated_leg_curl_machine", "seated_leg_extension", "ab_crunch_machine", "stair_stepper_cardio"],
        upper_day: ["machine_chest_press", "lat_pulldown", "cable_crossover_fly", "machine_seated_row", "reverse_pec_deck_delt", "tricep_rope_pushdown"]
      }
    },
    ways_ql13: {
      id: "ways_ql13",
      label: "Bộ Máy Ways Station · 361 Quốc Lộ 13",
      shortLabel: "Bộ Máy Ways QL13",
      description: "Tối ưu theo dàn máy lắp bánh tạ rời Iso-Lateral, Hack Squat, T-Bar Row, Glute Drive & Preacher Curl tại 361 Quốc Lộ 13.",
      sessions: {
        press_day: ["iso_incline_chest_press", "machine_shoulder_press", "cable_crossover_fly", "machine_lateral_raise", "overhead_cable_tricep_ext", "incline_treadmill_walk"],
        pull_day: ["iso_high_row_pulldown", "chest_supported_tbar_row", "rope_face_pull", "preacher_curl_machine", "plank_core", "incline_treadmill_walk"],
        legs_day: ["hack_squat_machine", "leg_press_45", "seated_leg_curl_machine", "glute_drive_hip_thrust", "seated_calf_press", "incline_treadmill_walk"],
        upper_day: ["iso_incline_chest_press", "iso_high_row_pulldown", "pec_deck_fly", "chest_supported_tbar_row", "machine_lateral_raise", "overhead_cable_tricep_ext"]
      }
    }
  };

  function getEffectiveSessionExerciseIds(sessionId, sessionSwaps, customSessionLists) {
    const sess = WORKOUT_SESSIONS[sessionId] || WORKOUT_SESSIONS.press_day;
    const baseList =
      customSessionLists && Array.isArray(customSessionLists[sessionId]) && customSessionLists[sessionId].length > 0
        ? customSessionLists[sessionId]
        : sess.exerciseIds;
    const swaps = sessionSwaps || {};
    return baseList.map((slotExId) => {
      const swappedId = swaps[`${sessionId}__${slotExId}`];
      return swappedId && EXERCISES[swappedId] ? swappedId : slotExId;
    });
  }

  function getSwapCandidatesForSlot(sessionId, slotOriginalId, currentExId, gymBranchId) {
    const activeEx = EXERCISES[currentExId] || EXERCISES[slotOriginalId] || EXERCISES.incline_db_press;
    const targetGroup = activeEx.slotGroup || "chest_press";
    const allExercises = Object.values(EXERCISES);

    const filterByGym = (ex) => {
      if (!gymBranchId || gymBranchId === "all") return true;
      return !Array.isArray(ex.availableGyms) || ex.availableGyms.includes(gymBranchId);
    };

    const scoreForGym = (ex) => {
      if (!gymBranchId || gymBranchId === "all") return 0;
      if (Array.isArray(ex.availableGyms) && ex.availableGyms[0] === gymBranchId) return 2;
      if (Array.isArray(ex.availableGyms) && ex.availableGyms.includes(gymBranchId)) return 1;
      return -1;
    };

    const sameGroup = allExercises
      .filter((ex) => ex.slotGroup === targetGroup && filterByGym(ex))
      .sort((a, b) => scoreForGym(b) - scoreForGym(a));

    const sessionAllowedGroups =
      SESSION_ALLOWED_SLOT_GROUPS[sessionId] || SESSION_ALLOWED_SLOT_GROUPS.press_day;

    const otherInSession = allExercises
      .filter(
        (ex) =>
          ex.slotGroup !== targetGroup &&
          sessionAllowedGroups.includes(ex.slotGroup) &&
          filterByGym(ex)
      )
      .sort((a, b) => scoreForGym(b) - scoreForGym(a));

    return {
      slotGroup: targetGroup,
      slotGroupLabel: SLOT_GROUP_LABELS[targetGroup] || activeEx.muscle,
      slotGroupShortLabel: SLOT_GROUP_SHORT_LABELS[targetGroup] || activeEx.muscle,
      allowedGroups: sessionAllowedGroups.map((g) => ({
        id: g,
        label: SLOT_GROUP_LABELS[g] || g,
        shortLabel: SLOT_GROUP_SHORT_LABELS[g] || g
      })),
      sameGroup,
      otherInSession
    };
  }

  function getSessionAddableExercises(sessionId, currentSlotIds, gymBranchId) {
    const curSlots = Array.isArray(currentSlotIds) ? currentSlotIds : [];
    const sessionAllowedGroups =
      SESSION_ALLOWED_SLOT_GROUPS[sessionId] || SESSION_ALLOWED_SLOT_GROUPS.press_day;
    const allExercises = Object.values(EXERCISES);

    const filterByGym = (ex) => {
      if (!gymBranchId || gymBranchId === "all") return true;
      return !Array.isArray(ex.availableGyms) || ex.availableGyms.includes(gymBranchId);
    };

    const scoreForGym = (ex) => {
      if (!gymBranchId || gymBranchId === "all") return 0;
      if (Array.isArray(ex.availableGyms) && ex.availableGyms[0] === gymBranchId) return 2;
      if (Array.isArray(ex.availableGyms) && ex.availableGyms.includes(gymBranchId)) return 1;
      return -1;
    };

    const candidates = allExercises
      .filter(
        (ex) =>
          !curSlots.includes(ex.id) &&
          sessionAllowedGroups.includes(ex.slotGroup) &&
          filterByGym(ex)
      )
      .sort((a, b) => scoreForGym(b) - scoreForGym(a));

    return {
      allowedGroups: sessionAllowedGroups.map((g) => ({
        id: g,
        label: SLOT_GROUP_LABELS[g] || g,
        shortLabel: SLOT_GROUP_SHORT_LABELS[g] || g
      })),
      candidates
    };
  }

  const MIN_WORKOUT_COMPLETION_PCT = 70;

  function calculateSessionCompletion(sessionId, dayLogs, sessionSwaps, customSessionLists) {
    const sess = WORKOUT_SESSIONS[sessionId];
    if (!sess || sessionId === "rest") {
      return {
        totalExercises: 0,
        completedExercises: 0,
        totalSetsCount: 0,
        completedSetsCount: 0,
        totalTargetReps: 0,
        completedRepsCount: 0,
        totalVolumeKg: 0,
        exercisePct: 100,
        setPct: 100,
        repPct: 100,
        completionPct: 100,
        minRequiredPct: MIN_WORKOUT_COMPLETION_PCT,
        minRequiredExercises: 0,
        minRequiredSets: 0,
        minRequiredReps: 0,
        meetsThreshold: true
      };
    }

    const activeExIds = getEffectiveSessionExerciseIds(sessionId, sessionSwaps, customSessionLists);
    const logs = dayLogs || {};
    let totalExercises = activeExIds.length;
    let completedExercises = 0;
    let totalSetsCount = 0;
    let completedSetsCount = 0;
    let totalTargetReps = 0;
    let completedRepsCount = 0;
    let totalVolumeKg = 0;

    activeExIds.forEach((exId) => {
      const hasCustomLog = Array.isArray(logs[exId]);
      const sets = hasCustomLog ? logs[exId] : (EXERCISES[exId] ? EXERCISES[exId].defaultSets : []);
      const exTotalSets = sets.length;
      let exDoneSets = 0;
      sets.forEach((s) => {
        const targetR = Math.max(1, Number(s.reps) || 0);
        totalSetsCount += 1;
        totalTargetReps += targetR;
        if (hasCustomLog && s.done) {
          exDoneSets += 1;
          completedSetsCount += 1;
          completedRepsCount += targetR;
          const w = Number(s.weight) || 0;
          if (w > 0 && targetR > 0) {
            totalVolumeKg += w * targetR;
          }
        }
      });
      if (exTotalSets > 0 && exDoneSets >= Math.ceil(exTotalSets * 0.7)) {
        completedExercises += 1;
      }
    });

    const exercisePct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    const setPct = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;
    const repPct = totalTargetReps > 0 ? Math.round((completedRepsCount / totalTargetReps) * 100) : 0;
    const completionPct = Math.max(exercisePct, setPct, repPct);
    const minRequiredExercises = Math.max(1, Math.ceil(totalExercises * (MIN_WORKOUT_COMPLETION_PCT / 100)));
    const minRequiredSets = Math.max(1, Math.ceil(totalSetsCount * (MIN_WORKOUT_COMPLETION_PCT / 100)));
    const minRequiredReps = Math.max(1, Math.ceil(totalTargetReps * (MIN_WORKOUT_COMPLETION_PCT / 100)));
    const meetsThreshold = completionPct >= MIN_WORKOUT_COMPLETION_PCT;

    return {
      totalExercises,
      completedExercises,
      totalSetsCount,
      completedSetsCount,
      totalTargetReps,
      completedRepsCount,
      totalVolumeKg,
      exercisePct,
      setPct,
      repPct,
      completionPct,
      minRequiredPct: MIN_WORKOUT_COMPLETION_PCT,
      minRequiredExercises,
      minRequiredSets,
      minRequiredReps,
      meetsThreshold
    };
  }

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
    const sessionProgress = isWorkoutDay && sess
      ? calculateSessionCompletion(sessionId, dayLogs, opts.sessionSwaps, opts.customSessionLists)
      : {
          totalExercises: 0,
          completedExercises: 0,
          totalSetsCount: 0,
          completedSetsCount: 0,
          totalTargetReps: 0,
          completedRepsCount: 0,
          totalVolumeKg: 0,
          exercisePct: 0,
          setPct: 0,
          repPct: 0,
          completionPct: 0,
          minRequiredPct: MIN_WORKOUT_COMPLETION_PCT,
          minRequiredExercises: 0,
          minRequiredSets: 0,
          minRequiredReps: 0,
          meetsThreshold: false
        };
    const totalSetsCount = sessionProgress.totalSetsCount;
    const completedSetsCount = sessionProgress.completedSetsCount;
    const totalVolumeKg = sessionProgress.totalVolumeKg;
    const totalExercisesCount = sessionProgress.totalExercises;
    const completedExercisesCount = sessionProgress.completedExercises;
    const totalTargetReps = sessionProgress.totalTargetReps;
    const completedRepsCount = sessionProgress.completedRepsCount;
    const completionPct = sessionProgress.completionPct;
    const exercisePct = sessionProgress.exercisePct;
    const setPct = sessionProgress.setPct;
    const repPct = sessionProgress.repPct;
    const minRequiredExercises = sessionProgress.minRequiredExercises;
    const minRequiredSets = sessionProgress.minRequiredSets;
    const minRequiredReps = sessionProgress.minRequiredReps;
    const meetsCompletionThreshold = sessionProgress.meetsThreshold;

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
      !isBeforeStart &&
      isWorkoutDay &&
      meetsCompletionThreshold &&
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
      completedExercisesCount,
      totalExercisesCount,
      completedRepsCount,
      totalTargetReps,
      completionPct,
      exercisePct,
      setPct,
      repPct,
      minRequiredExercises,
      minRequiredSets,
      minRequiredReps,
      meetsCompletionThreshold,
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

  const VN_FOOD_CATEGORIES = [
    { id: "all", label: "Tất cả món", shortLabel: "Tất cả" },
    { id: "noodle_soup", label: "🍜 Bún · Phở · Hủ Tiếu", shortLabel: "Bún · Phở · Hủ Tiếu" },
    { id: "rice_carb", label: "🍚 Cơm Tấm · Cơm · Tinh Bột", shortLabel: "Cơm Tấm · Cơm" },
    { id: "protein_dish", label: "🥩 Đạm Gym · Thịt Cá · Phụ", shortLabel: "Đạm Thịt Cá" },
    { id: "fruit", label: "🍎 Trái Cây (Táo · Ổi · Nho...)", shortLabel: "Trái Cây Tươi" }
  ];

  const VN_FOODS = [
    // 1. NHÓM BÚN · PHỞ · HỦ TIẾU · MÌ NƯỚC (10 MÓN CHUẨN VIỆT NAM)
    {
      id: "pho_bo_tai",
      name: "Phở bò tái nạc (Bớt 1/3 bánh, nước trong)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Sáng / Trưa",
      giLevel: "GI Vừa",
      portion: "1 tô vừa",
      kcal: 430,
      protein: 32,
      carb: 52,
      fat: 10,
      fiber: 2,
      tip: "Dặn quán không lấy nước béo, bớt 1/3 bánh phở và gọi thêm 50g thịt bò tái nạc."
    },
    {
      id: "pho_ga_xe",
      name: "Phở gà ta ức/đùi xé (Bỏ da, nước trong)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Sáng / Sau tập",
      giLevel: "GI Vừa",
      portion: "1 tô vừa",
      kcal: 410,
      protein: 34,
      carb: 50,
      fat: 8,
      fiber: 2,
      tip: "Chọn phần ức hoặc thịt đùi bỏ da; ăn kèm giá trụng để tăng chất xơ và no lâu."
    },
    {
      id: "bun_bo_hue_nac",
      name: "Bún bò Huế bắp bò nạc (Không giò heo, ít váng dầu)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Sáng / Trưa",
      giLevel: "GI Vừa",
      portion: "1 tô vừa",
      kcal: 480,
      protein: 33,
      carb: 56,
      fat: 13,
      fiber: 3,
      tip: "Gọi bắp bò + chả cua, bỏ móng giò mỡ và dặn quán không múc váng ớt sa tế dầu."
    },
    {
      id: "hu_tieu_nam_vang",
      name: "Hủ tiếu Nam Vang nước (Tôm, thịt nạc, trứng cút)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Sáng / Trưa",
      giLevel: "GI Vừa",
      portion: "1 tô vừa",
      kcal: 420,
      protein: 29,
      carb: 54,
      fat: 9,
      fiber: 2.5,
      tip: "Chọn hủ tiếu nước thay vì hủ tiếu khô trộn dầu tỏi để tiết kiệm ngay 120 kcal mỡ thừa."
    },
    {
      id: "hu_tieu_bo_kho",
      name: "Hủ tiếu bò kho nạc gân (Hớt mỡ, nhiều cà rốt)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Bữa sáng ngày tập nặng",
      giLevel: "GI Vừa",
      portion: "1 tô vừa",
      kcal: 495,
      protein: 34,
      carb: 53,
      fat: 15,
      fiber: 3,
      tip: "Phù hợp cho ngày tập Chân (Legs Day) hoặc Kéo nặng nhờ giàu sắt, kẽm và Collagen gân bò."
    },
    {
      id: "bun_thit_nuong_nac",
      name: "Bún thịt nướng thăn nạc (Không chả giò chiên)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Trưa / Tối",
      giLevel: "GI Vừa",
      portion: "1 tô vừa",
      kcal: 510,
      protein: 28,
      carb: 62,
      fat: 15,
      fiber: 3.5,
      tip: "Bỏ chả giò chiên ngập dầu, rưới 1/2 chén nước mắm chua ngọt và ăn gấp đôi rau sống, đồ chua."
    },
    {
      id: "bun_rieu_cua",
      name: "Bún riêu cua đồng (Riêu cua, thịt băm, đậu hũ, huyết)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Sáng / Trưa",
      giLevel: "GI Thấp",
      portion: "1 tô vừa",
      kcal: 440,
      protein: 26,
      carb: 52,
      fat: 12,
      fiber: 3,
      tip: "Không bỏ tóp mỡ chiên; riêu cua và đậu hũ cung cấp Canxi và đạm dễ tiêu hóa."
    },
    {
      id: "bun_cha_ha_noi",
      name: "Bún chả Hà Nội (Chả viên & thịt thăn nướng than)",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Trưa",
      giLevel: "GI Vừa",
      portion: "1 phần chuẩn",
      kcal: 520,
      protein: 30,
      carb: 58,
      fat: 17,
      fiber: 3,
      tip: "Ăn 2/3 đĩa bún, gắp thịt nướng chấm vừa phải nước mắm đường và ăn nhiều đu đủ xanh."
    },
    {
      id: "mien_ga_mang",
      name: "Miến gà ta nấu măng tươi / nấm hương",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Tối nhẹ bụng / Giảm mỡ",
      giLevel: "GI Thấp",
      portion: "1 tô vừa",
      kcal: 350,
      protein: 30,
      carb: 42,
      fat: 6,
      fiber: 3.5,
      tip: "Món nước ít Calo nhất cho bữa tối hoặc ngày nghỉ tập mà vẫn đủ 30g đạm thịt gà."
    },
    {
      id: "banh_canh_cua_tom",
      name: "Bánh canh cua thịt nạc & tôm bóc vỏ",
      category: "noodle_soup",
      categoryLabel: "Bún · Phở · Hủ Tiếu",
      mealTag: "Sau tập / Trưa",
      giLevel: "GI Vừa",
      portion: "1 tô vừa",
      kcal: 435,
      protein: 28,
      carb: 56,
      fat: 9,
      fiber: 2,
      tip: "Tôm và thịt cua giàu đạm nạc; hạn chế húp hết nước súp sánh bột năng khi đang siết mỡ."
    },

    // 2. NHÓM CƠM TẤM · CƠM VIỆT · TINH BỘT CHUẨN (10 MÓN)
    {
      id: "com_tam_suon_nac",
      name: "Cơm tấm sườn nướng nạc (Bớt 1/3 cơm, không bì/mỡ hành)",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Sáng / Trưa",
      giLevel: "GI Vừa",
      portion: "1 dĩa chuẩn gym",
      kcal: 580,
      protein: 36,
      carb: 66,
      fat: 17,
      fiber: 2.5,
      tip: "Chọn miếng sườn cốt lết nạc, bỏ mỡ hành/tóp mỡ, xin thêm dưa leo cà chua và canh rau."
    },
    {
      id: "com_tam_suon_op_la",
      name: "Cơm tấm sườn nướng + Trứng ốp la (Full đạm sau tập nặng)",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Sau tập nặng",
      giLevel: "GI Vừa",
      portion: "1 dĩa đầy đủ",
      kcal: 670,
      protein: 42,
      carb: 68,
      fat: 23,
      fiber: 2.5,
      tip: "Cung cấp tới 42g Protein; phù hợp cho bữa sáng 07:15 ngay sau ca tập tạ 6h sáng."
    },
    {
      id: "com_ga_bo_da",
      name: "Cơm gà xối mỡ / Cơm gà Hải Nam (Bỏ lớp da chiên)",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Trưa",
      giLevel: "GI Vừa",
      portion: "1 phần",
      kcal: 550,
      protein: 38,
      carb: 64,
      fat: 14,
      fiber: 2,
      tip: "Chỉ cần lột bỏ lớp da gà chiên giòn là bạn cắt giảm ngay 160 kcal chất béo bão hòa."
    },
    {
      id: "com_van_phong_bo",
      name: "Cơm trưa văn phòng (1.5 chén cơm + Bò/Cá + Rau luộc)",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Trưa chuẩn",
      giLevel: "GI Vừa",
      portion: "1 phần chuẩn",
      kcal: 640,
      protein: 44,
      carb: 74,
      fat: 16,
      fiber: 5,
      tip: "Ăn hết đĩa rau luộc trước khi ăn cơm để no lâu và ổn định đường huyết."
    },
    {
      id: "com_gao_lut_uc_ga",
      name: "Cơm gạo lứt + Ức gà áp chảo + Bông cải xanh luộc",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Siết mỡ / Trưa / Tối",
      giLevel: "GI Thấp",
      portion: "1 hộp (400g)",
      kcal: 460,
      protein: 45,
      carb: 48,
      fat: 9,
      fiber: 6,
      tip: "Tỷ lệ Macro vàng cho giai đoạn cắt mỡ: no suốt 5 tiếng, không gây buồn ngủ đầu giờ chiều."
    },
    {
      id: "banh_mi_uc_ga_bo",
      name: "Bánh mì thịt nướng / ức gà xé / bò áp chảo (Không bơ sốt)",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Sáng nhanh gọn",
      giLevel: "GI Vừa",
      portion: "1 ổ vừa",
      kcal: 420,
      protein: 25,
      carb: 52,
      fat: 12,
      fiber: 3,
      tip: "Dặn không quết bơ và pate béo, rút bớt ruột bánh mì và cho nhiều đồ chua, ngò, dưa leo."
    },
    {
      id: "banh_mi_2_trung",
      name: "Bánh mì 2 trứng ốp la + Dưa leo đồ chua",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Sáng / Trước tập",
      giLevel: "GI Vừa",
      portion: "1 ổ vừa",
      kcal: 390,
      protein: 18,
      carb: 48,
      fat: 13,
      fiber: 2.5,
      tip: "Bữa sáng nhanh rẻ khắp Sài Gòn; uống kèm 1 hộp sữa đậu nành không đường hoặc 1 muỗng Whey."
    },
    {
      id: "xoi_man_ga_xe",
      name: "Xôi gà xé + Trứng cút (Không lạp xưởng & mỡ hành)",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Trước/Sau tập nặng",
      giLevel: "GI Cao",
      portion: "1 gói nhỏ",
      kcal: 450,
      protein: 21,
      carb: 64,
      fat: 12,
      fiber: 2,
      tip: "Nếp cung cấp năng lượng bền bỉ cho buổi tập tạ nặng, nhưng chỉ nên ăn gói nhỏ vào buổi sáng."
    },
    {
      id: "khoai_lang_mat_luoc",
      name: "Khoai lang Nhật / Khoai lang mật luộc nguyên vỏ",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Thay cơm tối / Trước tập",
      giLevel: "GI Thấp",
      portion: "1 củ lớn (200g)",
      kcal: 172,
      protein: 3.2,
      carb: 40,
      fat: 0.3,
      fiber: 6,
      tip: "Nguồn tinh bột chậm tuyệt vời thay cơm trắng vào bữa tối giúp giảm mỡ bụng dưới cực nhanh."
    },
    {
      id: "yen_mach_sua_tuoi",
      name: "Yến mạch cán dẹt nấu sữa tươi không đường (Overnight Oats)",
      category: "rice_carb",
      categoryLabel: "Cơm Tấm · Cơm · Tinh Bột",
      mealTag: "Sáng / Bữa phụ chiều",
      giLevel: "GI Thấp",
      portion: "1 bát (50g yến mạch)",
      kcal: 260,
      protein: 13,
      carb: 38,
      fat: 6,
      fiber: 5.5,
      tip: "Giàu Beta-Glucan giảm mỡ máu và giữ đường huyết ổn định; thêm vài lát táo hoặc nho tươi."
    },

    // 3. NHÓM ĐẠM GYM · THỊT CÁ · BỮA PHỤ CAO ĐẠM (10 MÓN)
    {
      id: "uc_ga_ap_chao",
      name: "Ức gà phi lê áp chảo / luộc",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Đạm chủ lực",
      giLevel: "GI Thấp",
      portion: "200g chín",
      kcal: 330,
      protein: 62,
      carb: 0,
      fat: 7,
      fiber: 0,
      tip: "Nguồn đạm tinh khiết nhất; ướp tiêu chanh hoặc sốt teriyaki ít đường cho dễ ăn."
    },
    {
      id: "than_bo_ap_chao",
      name: "Thăn bò / Bắp bò Úc-Việt áp chảo hoặc nhúng giấm",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Giàu Creatine tự nhiên",
      giLevel: "GI Thấp",
      portion: "150g chín",
      kcal: 310,
      protein: 42,
      carb: 0,
      fat: 15,
      fiber: 0,
      tip: "Thịt bò đỏ giàu Sắt, Kẽm và Creatine tự nhiên giúp tăng sức mạnh đẩy/kéo tạ rõ rệt."
    },
    {
      id: "ca_hoi_hoac_ca_thu",
      name: "Cá hồi / Cá thu áp chảo + Đậu phụ + Rau luộc",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Bữa tối phục hồi khớp",
      giLevel: "GI Thấp",
      portion: "180g cá + 100g đậu",
      kcal: 460,
      protein: 46,
      carb: 12,
      fat: 22,
      fiber: 3,
      tip: "Bữa tối nhẹ bụng giàu Omega-3 giúp giảm viêm khớp và dễ ngủ lúc 21:45."
    },
    {
      id: "ca_ro_phi_hap",
      name: "Cá diêu hồng / Cá rô phi hấp hành gừng cuốn rau sống",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Trưa / Tối ít béo",
      giLevel: "GI Thấp",
      portion: "200g thịt cá",
      kcal: 255,
      protein: 50,
      carb: 2,
      fat: 5,
      fiber: 1,
      tip: "Cá trắng hấp giữ nguyên 50g đạm nạc mà gần như không có mỡ xấu; cực kỳ dễ tiêu hóa."
    },
    {
      id: "tom_hap_sa",
      name: "Tôm sú / Tôm thẻ hấp sả (Đạm siêu tinh khiết)",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Siết mỡ tối đa",
      giLevel: "GI Thấp",
      portion: "150g thịt tôm bóc vỏ",
      kcal: 150,
      protein: 34,
      carb: 1,
      fat: 1.5,
      fiber: 0,
      tip: "Chỉ 150 kcal nhưng chứa tới 34g Protein; món cứu cánh khi bạn lỡ ăn dư Calo vào buổi trưa."
    },
    {
      id: "whey_isolate",
      name: "Whey Protein Isolate (1 muỗng)",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Ngay sau tập / Phụ chiều",
      giLevel: "GI Thấp",
      portion: "1 scoop (30g)",
      kcal: 120,
      protein: 25,
      carb: 2,
      fat: 1,
      fiber: 0,
      tip: "Pha với 250ml nước lọc uống ngay sau tập hoặc kèm bữa phụ chiều."
    },
    {
      id: "trung_ga_luoc",
      name: "Trứng gà luộc / ốp la ít dầu",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Sáng / Bữa phụ",
      giLevel: "GI Thấp",
      portion: "2 quả lớn",
      kcal: 155,
      protein: 13,
      carb: 1,
      fat: 11,
      fiber: 0,
      tip: "Bữa sáng hoặc bữa phụ giàu choline và chất béo tốt cho hormone."
    },
    {
      id: "dau_hu_trang_luoc",
      name: "Đậu hũ non / Đậu hũ trắng luộc hoặc sốt cà chua",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Đạm thực vật mát gan",
      giLevel: "GI Thấp",
      portion: "2 bìa (200g)",
      kcal: 165,
      protein: 16,
      carb: 5,
      fat: 9,
      fiber: 2,
      tip: "Tránh đậu hũ chiên ngập dầu; chọn đậu hũ trắng luộc chấm xì dầu ớt hoặc nấu canh hẹ."
    },
    {
      id: "sua_chua_hy_lap",
      name: "Sữa chua Hy Lạp không đường",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Bữa phụ 16:00",
      giLevel: "GI Thấp",
      portion: "1 hộp (150g)",
      kcal: 130,
      protein: 15,
      carb: 6,
      fat: 4,
      fiber: 0,
      tip: "Ăn lúc 16h chiều giúp cắt cơn thèm ăn vặt lúc tan làm."
    },
    {
      id: "hat_hanh_nhan_dieu",
      name: "Hạt hạnh nhân / Hạt điều rang mộc không tẩm muối",
      category: "protein_dish",
      categoryLabel: "Đạm Gym · Thịt Cá · Phụ",
      mealTag: "Chất béo tốt",
      giLevel: "GI Thấp",
      portion: "1 nắm nhỏ (25g)",
      kcal: 145,
      protein: 5,
      carb: 5,
      fat: 12,
      fiber: 3,
      tip: "Giàu Magie và chất béo tốt giúp chống chuột rút cơ bắp; chỉ ăn đúng 1 nắm nhỏ (15–18 hạt)."
    },

    // 4. NHÓM TRÁI CÂY TƯƠI VIỆT NAM (12 LOẠI: TÁO, ỔI, NHO, CHUỐI, BƯỞI, ĐU ĐỦ, THANH LONG, DƯA HẤU, CAM, XOÀI, BƠ, DỨA)
    {
      id: "trai_oi_le",
      name: "Ổi lê / Ổi nữ hoàng giòn (Vua Vitamin C, cực ít đường)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Ăn vặt giảm mỡ #1",
      giLevel: "GI Thấp",
      portion: "1 quả vừa (200g)",
      kcal: 136,
      protein: 5,
      carb: 28,
      fat: 1.5,
      fiber: 9,
      tip: "Trái cây số 1 cho người tập gym giảm mỡ: lượng Vitamin C gấp 4 lần cam và 9g chất xơ giúp no bụng ngay lập tức (không chấm muối đường)."
    },
    {
      id: "trai_tao_envy",
      name: "Táo Envy / Táo Fuji đỏ giòn (Giàu chất xơ Pectin)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Trước tập / Phụ chiều",
      giLevel: "GI Thấp",
      portion: "1 quả vừa (180g)",
      kcal: 95,
      protein: 0.5,
      carb: 25,
      fat: 0.3,
      fiber: 4.4,
      tip: "Rửa sạch ăn cả vỏ để lấy trọn vẹn Polyphenol và chất xơ Pectin giúp kiểm soát cơn đói buổi chiều."
    },
    {
      id: "trai_nho_xanh_do",
      name: "Nho xanh / Nho đỏ không hạt (Bù Glycogen nhanh)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Ngay sau buổi tập",
      giLevel: "GI Vừa",
      portion: "1 chùm nhỏ (150g ~ 18 quả)",
      kcal: 104,
      protein: 1.1,
      carb: 27,
      fat: 0.2,
      fiber: 1.4,
      tip: "Chứa chất chống oxy hóa Resveratrol và đường tự nhiên giúp phục hồi cơ bắp nhanh sau tập nặng; để ngăn mát ăn cực ngon."
    },
    {
      id: "chuoi_chin",
      name: "Chuối chín + Cafe đen (Bữa nhẹ 05:25 trước tập)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Trước tập 30 phút",
      giLevel: "GI Vừa",
      portion: "1 quả vừa + 1 ly",
      kcal: 110,
      protein: 1,
      carb: 27,
      fat: 0,
      fiber: 3,
      tip: "Nạp đường huyết tức thì cho ca tập 6h sáng mà không gây xóc bụng."
    },
    {
      id: "trai_buoi_da_xanh",
      name: "Bưởi da xanh / Bưởi năm roi (Hỗ trợ đốt mỡ, giảm kháng Insulin)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Tráng miệng trưa/tối",
      giLevel: "GI Thấp",
      portion: "4 múi lớn (250g)",
      kcal: 95,
      protein: 1.8,
      carb: 24,
      fat: 0.2,
      fiber: 4,
      tip: "Hoạt chất Naringenin trong múi bưởi giúp gan chuyển hóa mỡ thừa tốt hơn và không làm tăng đường huyết."
    },
    {
      id: "trai_du_du_chin",
      name: "Đu đủ chín đỏ (Giàu Enzyme Papain tiêu hóa thịt & Whey)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Sau bữa ăn nhiều đạm",
      giLevel: "GI Vừa",
      portion: "1 đĩa vừa (250g)",
      kcal: 108,
      protein: 1.2,
      carb: 27,
      fat: 0.4,
      fiber: 4.3,
      tip: "Ăn 1 đĩa đu đủ sau bữa ăn nhiều ức gà/thịt bò giúp bụng nhẹ tênh, không bao giờ bị đầy hơi khó tiêu."
    },
    {
      id: "trai_thanh_long",
      name: "Thanh long ruột đỏ / ruột trắng (Mát cơ thể, giàu Magie)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Bữa phụ mát ruột",
      giLevel: "GI Thấp",
      portion: "1/2 quả lớn (250g)",
      kcal: 130,
      protein: 3,
      carb: 29,
      fat: 0.5,
      fiber: 6,
      tip: "Hạt thanh long chứa chất béo tốt và chất xơ giúp nhuận tràng khi ăn chế độ giàu Protein."
    },
    {
      id: "trai_dua_hau",
      name: "Dưa hấu đỏ ướp lạnh (Giàu L-Citrulline giảm đau nhức cơ)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Sau tập / Bù nước",
      giLevel: "GI Cao (GL Thấp)",
      portion: "2 miếng vừa (300g)",
      kcal: 90,
      protein: 1.8,
      carb: 22,
      fat: 0.4,
      fiber: 1.2,
      tip: "Chứa axit amin L-Citrulline tự nhiên giúp giãn mạch máu và giảm đau mỏi cơ (DOMS) vào ngày hôm sau."
    },
    {
      id: "trai_cam_sanh",
      name: "Cam sành / Quýt đường tươi (Bù điện giải & tăng đề kháng)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Sáng / Trưa",
      giLevel: "GI Thấp",
      portion: "1 quả lớn (200g)",
      kcal: 94,
      protein: 1.8,
      carb: 23,
      fat: 0.2,
      fiber: 4.5,
      tip: "Ăn nguyên múi cam cả tép xơ (thay vì vắt nước bỏ xác và pha thêm đường) để no lâu gấp 3 lần."
    },
    {
      id: "trai_xoai_chin",
      name: "Xoài cát chín / Xoài keo giòn (Nạp năng lượng nhanh)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Trước/Sau tập",
      giLevel: "GI Vừa",
      portion: "1/2 quả vừa (180g)",
      kcal: 108,
      protein: 1.5,
      carb: 27,
      fat: 0.6,
      fiber: 3,
      tip: "Nếu ăn xoài keo chua giòn thì tuyệt đối tránh chấm mắm đường hoặc muối tôm trộn đường."
    },
    {
      id: "trai_bo_sap",
      name: "Bơ sáp Đà Lạt tươi (Chất béo tốt, không dầm sữa đặc)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Bữa sáng / Salad",
      giLevel: "GI Thấp",
      portion: "1/2 quả vừa (100g)",
      kcal: 160,
      protein: 2,
      carb: 9,
      fat: 15,
      fiber: 7,
      tip: "Ăn bơ cắt lát kèm trứng ốp la hoặc trộn sữa chua Hy Lạp không đường; tránh xay sinh tố bơ nhiều sữa đặc."
    },
    {
      id: "trai_dua_thom",
      name: "Dứa (Thơm / Khóm) tươi gọt sẵn (Giàu Bromelain kháng viêm)",
      category: "fruit",
      categoryLabel: "Trái Cây Tươi",
      mealTag: "Sau bữa trưa/tối",
      giLevel: "GI Vừa",
      portion: "1/2 quả vừa (200g)",
      kcal: 100,
      protein: 1.1,
      carb: 26,
      fat: 0.2,
      fiber: 2.8,
      tip: "Enzyme Bromelain trong quả dứa giúp phân giải đạm thịt cực nhanh và giảm sưng viêm cơ khớp."
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
      startWeightKg: firstLog.weight,
      latestWeight: latestLog.weight,
      latestWeightKg: latestLog.weight,
      targetWeight,
      targetWeightKg: targetWeight,
      deltaFromStart,
      remainingToGoal,
      progressPct,
      nextWeighInISO,
      nextWeighInLabel: `${DAY_SHORT_NAMES[parseISODate(nextWeighInISO).getDay()]} · ${formatVNDate(nextWeighInISO)}`,
      nextWeighInShort: formatVNShortDate(nextWeighInISO),
      daysUntilNextWeighIn,
      nextWeighIn: {
        isoDate: nextWeighInISO,
        dayShort: DAY_SHORT_NAMES[parseISODate(nextWeighInISO).getDay()],
        shortDate: formatVNShortDate(nextWeighInISO),
        dateLabel: formatVNDate(nextWeighInISO),
        daysRemaining: daysUntilNextWeighIn
      },
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
    GYM_BRANCHES,
    GYM_SESSION_PRESETS,
    ZONE_CATEGORY_LABELS,
    SLOT_GROUP_LABELS,
    SLOT_GROUP_SHORT_LABELS,
    SESSION_ALLOWED_SLOT_GROUPS,
    MIN_WORKOUT_COMPLETION_PCT,
    normalizeVNSearch,
    getEffectiveSessionExerciseIds,
    getSwapCandidatesForSlot,
    getSessionAddableExercises,
    calculateSessionCompletion,
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
    VN_FOOD_CATEGORIES,
    VN_FOODS
  };
})(typeof window !== "undefined" ? window : globalThis);
