import React, { useMemo, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { SvgIcon } from '../components/Icons';
import { VN_FOOD_CATEGORIES, VN_FOODS } from '../data/foods';
import { addDaysISO, diffDaysISO, formatVNShortDate, normalizeVNSearch } from '../domain/dateUtils';
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
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [onlyLogged, setOnlyLogged] = useState<boolean>(false);
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
  const waterPct = Math.min(100, Math.round((totals.waterMl / Math.max(1, metrics.waterMl)) * 100));

  const filteredFoods = useMemo(() => {
    const q = normalizeVNSearch(search);
    return VN_FOODS.filter((f) => {
      if (onlyLogged && !(totals.servingsMap[f.id] > 0)) return false;
      if (category !== 'all' && f.category !== category) return false;
      if (!q) return true;
      return (
        normalizeVNSearch(f.name).includes(q) ||
        normalizeVNSearch(f.portion).includes(q) ||
        normalizeVNSearch(f.mealTag).includes(q)
      );
    });
  }, [category, onlyLogged, search, totals.servingsMap]);

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
            <div className="g8d-kicker">ƯỚC LƯỢNG 75–80% · {metrics.profile.weightKg}KG</div>
            <div className="g8d-kcal-hero-num">
              <strong>{totals.kcal.toLocaleString('vi-VN')}</strong>
              <span>/ {metrics.targetKcal.toLocaleString('vi-VN')} kcal</span>
            </div>
          </div>
          <span className={`g8d-badge ${kcalPct >= 80 ? 'is-green' : 'is-orange'}`}>
            {kcalPct}% mục tiêu
          </span>
        </div>

        <div className="g8d-nutri-cta-row">
          <button
            type="button"
            className="g8d-btn-primary"
            onClick={() => onOpenCoach('Hôm nay tao ăn uống gồm: ', 'Dinh Dưỡng')}
          >
            Kể cho ChatDVT
          </button>
          <button
            type="button"
            className="g8d-btn-outline"
            onClick={() => setQuickAddOpen(true)}
          >
            + Nhập tay nhanh
          </button>
        </div>

        <div className="g8d-tiny-meta" style={{ marginTop: 8 }}>
          Tối nằm nghỉ chỉ cần kể lại cho ChatDVT ước lượng khoảng 75–80% là đủ giữ nhịp giảm mỡ.
        </div>

        <div className="g8d-macro-bars" style={{ marginTop: 12 }}>
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
              <strong>Carb · Béo</strong>
              <span>
                {totals.carb}/{metrics.carbG}C · {totals.fat}/{metrics.fatG}F
              </span>
            </div>
            <div className="g8d-progress-track">
              <div
                className="g8d-progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((totals.carb / Math.max(1, metrics.carbG)) * 100)
                  )}%`,
                }}
              />
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

        {totals.customList.length > 0 && (
          <div className="g8d-custom-macro-list">
            <div className="g8d-kicker" style={{ marginBottom: 4 }}>
              MÓN ĐÃ THÊM HÔM NAY
            </div>
            {totals.customList.map((c) => (
              <div key={c.id} className="g8d-custom-macro-item">
                <span>
                  <strong>{c.name}</strong> · {c.kcal} kcal · {c.protein}g Đạm
                </span>
                <button
                  type="button"
                  className="g8d-icon-close"
                  onClick={() => onRemoveCustomMacro(c.id)}
                  aria-label="Xóa món"
                >
                  <SvgIcon name="x" size={14} />
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
          <span>Khung giờ 5 bữa tham khảo theo ca tập {metrics.profile.workoutTime}</span>
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

      <div className="g8d-card">
        <div className="g8d-row-between" style={{ marginBottom: 10 }}>
          <div className="g8d-kicker">THỰC ĐƠN MÓN VIỆT (NHÂN KHẨU PHẦN)</div>
          <button
            type="button"
            className={`g8d-pill-btn g8d-pill-btn-touch ${onlyLogged ? 'is-synced' : ''}`}
            onClick={() => setOnlyLogged((v) => !v)}
          >
            {onlyLogged ? `Đã chọn (${totals.itemCount})` : 'Lọc món đã ăn'}
          </button>
        </div>

        <input
          type="search"
          enterKeyHint="search"
          placeholder="Tìm phở bò, ức gà, trứng, whey, cơm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="g8d-search-input"
        />

        <div className="g8d-cat-strip">
          {VN_FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={category === cat.id ? 'is-active' : ''}
              onClick={() => setCategory(cat.id)}
            >
              {cat.shortLabel}
            </button>
          ))}
        </div>

        <div className="g8d-food-list">
          {filteredFoods.map((food) => {
            const qty = totals.servingsMap[food.id] || 0;
            return (
              <div key={food.id} className={`g8d-food-row ${qty > 0 ? 'is-logged' : ''}`}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="g8d-choice-title">{food.name}</div>
                  <div className="g8d-tiny-meta">
                    {food.portion} · <strong>{food.kcal} kcal</strong> ·{' '}
                    <span style={{ color: '#1E8754', fontWeight: 700 }}>{food.protein}g Đạm</span> ·{' '}
                    {food.carb}g C · {food.fat}g F
                  </div>
                </div>

                <div className="g8d-food-stepper">
                  {qty > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onAdjustFoodServing(food.id, -0.5)}
                        aria-label="Giảm khẩu phần"
                      >
                        −
                      </button>
                      <span className="g8d-food-qty">{qty}×</span>
                      <button
                        type="button"
                        onClick={() => onAdjustFoodServing(food.id, 0.5)}
                        aria-label="Tăng khẩu phần"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="g8d-food-add-btn"
                      onClick={() => onAdjustFoodServing(food.id, 1)}
                    >
                      + Cộng
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomSheet
        open={quickAddOpen}
        title="Cộng Nhanh Món Ăn Ngoài"
        subtitle="Chọn món ăn sẵn hoặc nhập khoảng ước lượng tương đối"
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
