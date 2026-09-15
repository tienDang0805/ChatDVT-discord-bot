import { useState } from 'react';
import { useTuTienGame } from '../GameContext';
import type { ActionChoice } from '../types';

const TIME_UNIT_MAP: Record<string, number> = {
  hour: 0,
  day: 0,
  month: 1 / 12,
  year: 1,
};

export default function ActionPanel() {
  const {
    currentChoices, addLog, setChoices, updateStats, stats,
    profile, equipment, quests, npcs, logs, worldConfig,
    addEquipment, updateQuest, addNPC, advanceTime,
    isLoading, setIsLoading, setScreen, addSummary,
    currentLocation, setCurrentLocation, addLocation, turnCount, summaries,
  } = useTuTienGame();

  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  const generateSummary = async () => {
    try {
      const recentLogs = logs.slice(-20).map(l => l.text).join('\n');
      const res = await fetch('/api/tutien-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile, stats, equipment: equipment.slice(-5),
          quests: quests.filter(q => q.status === 'ACTIVE'),
          npcs: npcs.slice(-5), worldConfig,
          history: [recentLogs], action: '[HỆ THỐNG] Tổng hợp 10 lượt gần nhất thành 1 đoạn tóm tắt ngắn 100 chữ',
          summaries, currentLocation, turnCount,
        }),
      });
      const data = await res.json();
      if (data.narrative) addSummary(data.narrative);
    } catch {
      return;
    }
  };

  const handleChoice = async (choice: ActionChoice) => {
    addLog({ id: Date.now().toString(), text: `▶ ${choice.label}`, type: 'NARRATIVE' });
    setChoices([]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/tutien-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile, stats, equipment: equipment.slice(-5),
          quests: quests.filter(q => q.status === 'ACTIVE'),
          npcs: npcs.slice(-8), worldConfig,
          history: storyHistory.slice(-10), action: choice.label,
          summaries: summaries.slice(-3), currentLocation, turnCount,
        }),
      });

      const data = await res.json();
      setStoryHistory(prev => [...prev.slice(-9), choice.label, data.narrative]);

      addLog({ id: (Date.now() + 1).toString(), text: data.narrative, type: data.type || 'NARRATIVE' });

      if (data.statChanges && typeof data.statChanges === 'object') {
        const changes: Record<string, number> = {};
        for (const [key, val] of Object.entries(data.statChanges)) {
          if (typeof val === 'number' && val !== 0) {
            changes[key] = ((stats as any)[key] || 0) + val;
          }
        }
        if (Object.keys(changes).length > 0) updateStats(changes);
      }

      if (data.realmBreakthrough) {
        updateStats({ realm: data.realmBreakthrough });
        addLog({ id: (Date.now() + 2).toString(), text: `⚡ ĐỘT PHÁ! ${data.realmBreakthrough}! Thọ mệnh gia tăng!`, type: 'REALM_UP' });
      }

      if (data.newItems && Array.isArray(data.newItems)) {
        for (const item of data.newItems) {
          const itemType = item.type || 'MATERIAL';
          addEquipment({
            id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: item.name, type: itemType,
            grade: item.grade || 'PHÀM', effect: item.effect || '',
            statBonus: item.statBonus || undefined,
          });
          addLog({ id: (Date.now() + 3).toString(), text: `📦 Nhận được: [${item.grade || 'PHÀM'}] ${item.name} — ${item.effect || ''}`, type: 'ITEM_GAIN' });
        }
      }

      if (data.newQuest) {
        updateQuest({ id: `quest_${Date.now()}`, name: data.newQuest.name, description: data.newQuest.description, status: 'ACTIVE', reward: data.newQuest.reward });
        addLog({ id: (Date.now() + 4).toString(), text: `📜 Nhiệm vụ mới: ${data.newQuest.name}`, type: 'SYSTEM_REWARD' });
      }

      if (data.newNpcs && Array.isArray(data.newNpcs)) {
        for (const npc of data.newNpcs) {
          addNPC({ id: `npc_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`, name: npc.name, relation: npc.relation || 'NEUTRAL', realm: npc.realm, description: npc.description, sect: npc.sect });
        }
      }

      if (data.newLocation) {
        setCurrentLocation(data.newLocation);
        addLocation(data.newLocation);
        addLog({ id: (Date.now() + 5).toString(), text: `🗺️ Di chuyển đến: ${data.newLocation}`, type: 'NARRATIVE' });
      }

      const timeElapsed = data.timeElapsed || 0;
      const timeUnit = data.timeUnit || 'day';
      const yearsToAge = timeElapsed * (TIME_UNIT_MAP[timeUnit] ?? 0);
      if (yearsToAge > 0) advanceTime(yearsToAge);

      if (stats.health + (data.statChanges?.health || 0) <= 0 || stats.daoHeart + (data.statChanges?.daoHeart || 0) <= 0) {
        addLog({ id: (Date.now() + 9).toString(), text: stats.health <= 0 ? 'Khí huyết đoạn tuyệt... Thân Tử Đạo Tiêu!' : 'Đạo tâm sụp đổ, tẩu hỏa nhập ma!', type: 'SYSTEM_PUNISH' });
        setChoices([]);
        setTimeout(() => setScreen('DEATH'), 2000);
        return;
      }

      const aiChoices = (data.choices || []).map((c: any, i: number) => ({
        id: `ai_${Date.now()}_${i}`, label: c.label || c,
      }));
      setChoices(aiChoices.length > 0 ? aiChoices : [
        { id: 'f1', label: 'Tiếp tục hành trình' },
        { id: 'f2', label: 'Ngồi thiền dưỡng khí' },
      ]);

      if ((turnCount + 1) % 10 === 0) generateSummary();

    } catch (err) {
      console.error('[TuTien] API Error:', err);
      addLog({ id: (Date.now() + 99).toString(), text: 'Thiên Đạo dao động... hãy thử lại.', type: 'SYSTEM_PUNISH' });
      setChoices([{ id: 'r1', label: 'Chờ thiên cơ' }, { id: 'r2', label: 'Ngồi thiền' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInput.trim();
    if (!val || isLoading) return;
    setCustomInput('');
    handleChoice({ id: `custom_${Date.now()}`, label: val });
  };

  return (
    <div className="rpg-action-deck">
      {isLoading ? (
        <div className="tutien-loading">
          <div className="tutien-loading-dot" />
          <span>Thiên Đạo suy tính nhân quả...</span>
        </div>
      ) : currentChoices.length > 0 ? (
        <div className="rpg-action-content">
          <div className="rpg-choices-row">
            {currentChoices.map((c, idx) => (
              <button key={c.id} className="rpg-choice-pill" onClick={() => handleChoice(c)}>
                <span className="rpg-choice-num">{idx + 1}</span>
                <span className="rpg-choice-text">{c.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomSubmit} className="rpg-custom-form">
            <input
              className="rpg-custom-input"
              placeholder="Tùy biến hành động: Nhập bất kỳ hành vi nào bạn muốn..."
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
            />
            <button
              type="submit"
              className="rpg-custom-btn"
              disabled={!customInput.trim()}
              title="Thực hiện hành động tự do"
            >
              ✦
            </button>
          </form>
        </div>
      ) : (
        <div className="rpg-action-waiting">
          Chờ mệnh vận xoay vần...
        </div>
      )}
    </div>
  );
}
