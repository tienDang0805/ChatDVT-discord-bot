import React, { useMemo, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { SvgIcon } from '../components/Icons';
import { resolveMascotAsset } from '../data/assets';
import { VN_FOODS } from '../data/foods';
import { addDaysISO, diffDaysISO, formatVNShortDate } from '../domain/dateUtils';
import type { CalculatedMetrics } from '../domain/metrics';
import type { CustomMacroItem } from '../types/gym';

interface NutritionTotals {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  itemCount: number;
  waterMl: number;
  servingsMap: Record<string, number>;
  customList: CustomMacroItem[];
}

interface NutritionViewProps {
  todayISO: string;
  nutritionDateISO: string;
  metrics: CalculatedMetrics;
  totals: NutritionTotals;
  onChangeDate: (isoDate: string) => void;
  onAddWater: (deltaMl: number) => void;
  onAdjustFoodServing: (foodId: string, delta: number) => void;
  onAddCustomMacro: (entry: Omit<CustomMacroItem, 'id'>) => void;
  onRemoveCustomMacro: (entryId: string) => void;
  onOpenCoach: (prefill?: string, returnLabel?: string) => void;
}

const QUICK_OUTSIDE_PRESETS: Array<Omit<CustomMacroItem, 'id'>> = [
  { name: '1 muỗng Whey Isolate', kcal: 120, protein: 25, carb: 2, fat: 1 },
  { name: '2 quả trứng gà luộc', kcal: 155, protein: 13, carb: 1, fat: 10 },
  { name: 'Ức gà áp chảo 200g', kcal: 330, protein: 62, carb: 0, fat: 7 },
  { name: 'Cơm tấm sườn nạc (bớt mỡ)', kcal: 620, protein: 36, carb: 72, fat: 18 },
  { name: 'Cà phê đen / Americano đá', kcal: 15, protein: 0, carb: 3, fat: 0 },
];

export const NutritionView: React.FC<NutritionViewProps> = ({
  todayISO,
  nutritionDateISO,
  metrics,
  totals,
  onChangeDate,
  onAddWater,
  onAdjustFoodServing,
  onAddCustomMacro,
  onRemoveCustomMacro,
  onOpenCoach,
}) => {
  const [aiMealText, setAiMealText] = useState<string>('');
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [mealPlanOpen, setMealPlanOpen] = useState<boolean>(false);

  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('350');
  const [customProtein, setCustomProtein] = useState('30');
  const [customCarb, setCustomCarb] = useState('30');
  const [customFat, setCustomFat] = useState('10');

  const dayDiff = diffDaysISO(nutritionDateISO, todayISO);
  const dateTitle =
    dayDiff === 0
      ? `Hôm nay (${formatVNShortDate(nutritionDateISO)})`
      : dayDiff === -1
      ? `Hôm qua (${formatVNShortDate(nutritionDateISO)})`
      : `Ngày ${formatVNShortDate(nutritionDateISO)}`;

  const kcalPct = Math.min(100, Math.round((totals.kcal / Math.max(1, metrics.targetKcal)) * 100));
  const proteinPct = Math.min(100, Math.round((totals.protein / Math.max(1, metrics.proteinG)) * 100));
  const carbPct = Math.min(100, Math.round((totals.carb / Math.max(1, metrics.carbG)) * 100));
  const fatPct = Math.min(100, Math.round((totals.fat / Math.max(1, metrics.fatG)) * 100));
  const waterPct = Math.min(100, Math.round((totals.waterMl / Math.max(1, metrics.waterMl)) * 100));
  const remainingKcal = metrics.targetKcal - totals.kcal;

  const loggedCatalogItems = useMemo(
    () =>
      VN_FOODS.filter((f) => (totals.servingsMap[f.id] || 0) > 0).map((f) => {
        const qty = totals.servingsMap[f.id] || 0;
        return {
          food: f,
          qty,
          kcal: Math.round(f.kcal * qty),
          protein: Math.round(f.protein * qty),
          carb: Math.round(f.carb * qty),
          fat: Math.round(f.fat * qty),
        };
      }),
    [totals.servingsMap]
  );

  const totalLoggedRows = totals.customList.length + loggedCatalogItems.length;

  const handleAskAiMeal = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = aiMealText.trim();
    if (!clean) {
      onOpenCoach(
        dayDiff === 0
          ? 'Hôm nay tao ăn uống gồm: '
          : `Ngày ${formatVNShortDate(nutritionDateISO)} tao ăn uống gồm: `,
        'Dinh Dưỡng'
      );
      return;
    }
    setAiMealText('');
    const dateContext =
      dayDiff === 0 ? 'Hôm nay' : `Ngày ${formatVNShortDate(nutritionDateISO)}`;
    onOpenCoach(
      `__AUTO_SEND__:${dateContext} tao vừa ăn uống gồm: ${clean}. Hãy tự ước lượng calo, đạm, tinh bột, béo và tạo đề xuất cập nhật dinh dưỡng giúp tao.`,
      'Dinh Dưỡng'
    );
  };

  const handleSaveCustom = () => {
    const cleanName = customName.trim() || 'Món ăn ngoài';
    onAddCustomMacro({
      name: cleanName,
      kcal: Math.max(0, Math.round(Number(customKcal) || 0)),
      protein: Math.max(0, Math.round(Number(customProtein) || 0)),
      carb: Math.max(0, Math.round(Number(customCarb) || 0)),
      fat: Math.max(0, Math.round(Number(customFat) || 0)),
    });
    setCustomName('');
    setQuickAddOpen(false);
  };

  return (
    <div className="g8d-view-stack">
      <div className="g8d-date-nav-bar">
        <button
          type="button"
          className="g8d-nav-arrow"
          onClick={() => onChangeDate(addDaysISO(nutritionDateISO, -1))}
          aria-label="Ngày trước"
        >
          <SvgIcon name="chevronLeft" size={18} />
        </button>

        <div className="g8d-date-nav-center">
          <strong>{dateTitle}</strong>
          {dayDiff !== 0 && (
            <button
              type="button"
              className="g8d-link-inline"
              onClick={() => onChangeDate(todayISO)}
            >
              Về hôm nay
            </button>
          )}
        </div>

        <button
          type="button"
          className="g8d-nav-arrow"
          onClick={() => onChangeDate(addDaysISO(nutritionDateISO, 1))}
          disabled={dayDiff >= 0}
          aria-label="Ngày kế"
        >
          <SvgIcon name="chevronRight" size={18} />
        </button>
      </div>

      <div className="g8d-card">
        <div className="g8d-row-between">
          <div>
            <div className="g8d-kicker">MỤC TIÊU NGÀY · {metrics.profile.weightKg}KG</div>
            <div className="g8d-kcal-hero-num">
              <strong>{totals.kcal.toLocaleString('vi-VN')}</strong>
              <span>/ {metrics.targetKcal.toLocaleString('vi-VN')} kcal</span>
            </div>
          </div>
          <span
            className={`g8d-badge ${
              remainingKcal >= 0 ? (kcalPct >= 75 ? 'is-green' : 'is-orange') : 'is-orange'
            }`}
          >
            {remainingKcal >= 0
              ? `Còn ${remainingKcal.toLocaleString('vi-VN')} kcal`
              : `Vượt ${Math.abs(remainingKcal).toLocaleString('vi-VN')} kcal`}
          </span>
        </div>

        <div className="g8d-macro-bars-3" style={{ marginTop: 12 }}>
          <div className="g8d-macro-col">
            <div className="g8d-row-between g8d-tiny-meta">
              <strong>Đạm</strong>
              <span>
                {totals.protein}/{metrics.proteinG}g
              </span>
            </div>
            <div className="g8d-progress-track">
              <div className="g8d-progress-fill is-green" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          <div className="g8d-macro-col">
            <div className="g8d-row-between g8d-tiny-meta">
              <strong>Tinh bột</strong>
              <span>
                {totals.carb}/{metrics.carbG}g
              </span>
            </div>
            <div className="g8d-progress-track">
              <div className="g8d-progress-fill" style={{ width: `${carbPct}%` }} />
            </div>
          </div>

          <div className="g8d-macro-col">
            <div className="g8d-row-between g8d-tiny-meta">
              <strong>Chất béo</strong>
              <span>
                {totals.fat}/{metrics.fatG}g
              </span>
            </div>
            <div className="g8d-progress-track">
              <div className="g8d-progress-fill is-gold" style={{ width: `${fatPct}%` }} />
            </div>
          </div>
        </div>

        <div className="g8d-water-box">
          <div className="g8d-row-between" style={{ flexWrap: 'wrap', gap: 8 }}>
            <span className="g8d-water-label">
              Nước: <strong>{(totals.waterMl / 1000).toFixed(2)}L</strong> / {metrics.waterLiters}L ({waterPct}%)
            </span>
            <div className="g8d-water-btns">
              <button type="button" onClick={() => onAddWater(-250)}>
                −250
              </button>
              <button type="button" className="is-plus" onClick={() => onAddWater(250)}>
                +250ml
              </button>
              <button type="button" className="is-plus" onClick={() => onAddWater(500)}>
                +500ml
              </button>
            </div>
          </div>
          <div className="g8d-progress-track" style={{ marginTop: 8 }}>
            <div className="g8d-progress-fill is-blue" style={{ width: `${waterPct}%` }} />
          </div>
        </div>
      </div>

      <div className="g8d-card">
        <div className="g8d-row-between" style={{ marginBottom: 8 }}>
          <div>
            <div className="g8d-kicker">GHI BỮA ĂN BẰNG AI CHATDVT</div>
            <div className="g8d-card-title">Kể tự nhiên — ChatDVT tự tính Calo & Đạm</div>
          </div>
        </div>

        <form className="g8d-ai-meal-form" onSubmit={handleAskAiMeal}>
          <input
            type="text"
            enterKeyHint="send"
            value={aiMealText}
            onChange={(e) => setAiMealText(e.target.value)}
            placeholder="VD: 1 tô phở bò tái + 2 trứng luộc..."
            className="g8d-search-input"
            style={{ marginBottom: 0, flex: 1 }}
          />
          <button type="submit" className="g8d-btn-primary">
            {aiMealText.trim() ? 'Gửi AI' : 'Mở ChatDVT'}
          </button>
        </form>

        <div className="g8d-row-between" style={{ marginTop: 10 }}>
          <span className="g8d-tiny-meta">Chỉ cần ước lượng 75–80% thực tế cuối ngày.</span>
          <button
            type="button"
            className="g8d-pill-btn g8d-pill-btn-touch"
            onClick={() => setQuickAddOpen(true)}
          >
            + Nhập tay nhanh
          </button>
        </div>
      </div>

      <div className="g8d-card">
        <div className="g8d-row-between" style={{ marginBottom: 8 }}>
          <div>
            <div className="g8d-kicker">NHẬT KÝ ĐÃ ĂN TRONG NGÀY</div>
            <div className="g8d-card-title">
              {totalLoggedRows > 0 ? `${totalLoggedRows} món đã ghi nhận` : 'Chưa có món ăn nào'}
            </div>
          </div>
          {totalLoggedRows > 0 && (
            <button
              type="button"
              className="g8d-pill-btn g8d-pill-btn-touch"
              onClick={() =>
                onOpenCoach(
                  `Kiểm tra lại danh sách ăn uống ngày ${formatVNShortDate(
                    nutritionDateISO
                  )} của tao và chỉnh lại nếu có món trùng hoặc lệch calo`,
                  'Dinh Dưỡng'
                )
              }
            >
              Nhờ AI rà lại
            </button>
          )}
        </div>

        {totalLoggedRows === 0 ? (
          <div className="g8d-empty-box">
            <img
              src={resolveMascotAsset('nutritionVn')}
              alt=""
              width={56}
              height={56}
              className="g8d-empty-mascot"
            />
            <div className="g8d-tiny-meta">
              Không cần dò tìm từng món lẻ — cứ nhắn bữa ăn ở ô trên hoặc kể cho ChatDVT, món đã ăn sẽ tự lưu gọn tại đây.
            </div>
          </div>
        ) : (
          <div className="g8d-logged-meals-stack">
            {loggedCatalogItems.map(({ food, qty, kcal, protein, carb, fat }) => (
              <div key={food.id} className="g8d-logged-meal-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">
                    {food.name} {qty !== 1 ? `(${qty}×)` : ''}
                  </div>
                  <div className="g8d-tiny-meta">
                    <strong>{kcal} kcal</strong> ·{' '}
                    <span style={{ color: '#1E8754', fontWeight: 700 }}>{protein}g Đạm</span> ·{' '}
                    {carb}C · {fat}F
                  </div>
                </div>
                <div className="g8d-food-stepper">
                  <button
                    type="button"
                    onClick={() => onAdjustFoodServing(food.id, -qty)}
                    aria-label={`Xoá ${food.name}`}
                  >
                    <SvgIcon name="trash" size={15} />
                  </button>
                </div>
              </div>
            ))}

            {totals.customList.map((c) => (
              <div key={c.id} className="g8d-logged-meal-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">{c.name}</div>
                  <div className="g8d-tiny-meta">
                    <strong>{c.kcal} kcal</strong> ·{' '}
                    <span style={{ color: '#1E8754', fontWeight: 700 }}>{c.protein}g Đạm</span> ·{' '}
                    {c.carb}C · {c.fat}F
                  </div>
                </div>
                <button
                  type="button"
                  className="g8d-icon-close"
                  onClick={() => onRemoveCustomMacro(c.id)}
                  aria-label="Xóa món"
                >
                  <SvgIcon name="trash" size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="g8d-card g8d-accordion-card">
        <button
          type="button"
          className="g8d-accordion-trigger"
          onClick={() => setMealPlanOpen((v) => !v)}
        >
          <span>Khung giờ 5 bữa gợi ý theo ca tập {metrics.profile.workoutTime}</span>
          <SvgIcon name="chevronDown" size={17} />
        </button>
        {mealPlanOpen && (
          <div className="g8d-accordion-body">
            {metrics.dynamicMealPlan.map((m) => (
              <div key={m.slot} className="g8d-setup-item">
                <strong>
                  {m.time} · {m.slot} (~{m.kcal} kcal, {m.proteinG}g Đạm):
                </strong>{' '}
                {m.suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet
        open={quickAddOpen}
        title="Nhập Tay Nhanh Món Ăn"
        subtitle="Dành cho Whey, trứng hoặc món bạn đã nhớ sẵn số Calo"
        onClose={() => setQuickAddOpen(false)}
      >
        <div className="g8d-stack-sm">
          <div className="g8d-kicker">CHỌN NHANH 1 CHẠM</div>
          <div className="g8d-stack-xs">
            {QUICK_OUTSIDE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="g8d-choice-row"
                onClick={() => {
                  onAddCustomMacro(p);
                  setQuickAddOpen(false);
                }}
              >
                <div>
                  <div className="g8d-choice-title">{p.name}</div>
                  <div className="g8d-tiny-meta">
                    +{p.kcal} kcal · +{p.protein}g Đạm · {p.carb}g C · {p.fat}g F
                  </div>
                </div>
                <SvgIcon name="plus" size={17} />
              </button>
            ))}
          </div>

          <div className="g8d-kicker">HOẶC TỰ NHẬP CALO & ĐẠM ƯỚC LƯỢNG</div>
          <input
            type="text"
            enterKeyHint="done"
            placeholder="Tên món (VD: Bún bò, Cơm gà...)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="g8d-search-input"
          />

          <div className="g8d-grid-2">
            <label className="g8d-field-lbl">
              Calo (kcal)
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                value={customKcal}
                onChange={(e) => setCustomKcal(e.target.value)}
                className="g8d-num-input"
              />
            </label>
            <label className="g8d-field-lbl">
              Đạm / Protein (g)
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
                className="g8d-num-input"
              />
            </label>
            <label className="g8d-field-lbl">
              Tinh bột / Carb (g)
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                value={customCarb}
                onChange={(e) => setCustomCarb(e.target.value)}
                className="g8d-num-input"
              />
            </label>
            <label className="g8d-field-lbl">
              Chất béo / Fat (g)
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                value={customFat}
                onChange={(e) => setCustomFat(e.target.value)}
                className="g8d-num-input"
              />
            </label>
          </div>

          <button type="button" className="g8d-btn-primary g8d-w-full" onClick={handleSaveCustom}>
            Lưu món ăn vào ngày {formatVNShortDate(nutritionDateISO)}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
