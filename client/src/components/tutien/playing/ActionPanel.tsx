import { useTuTienGame } from '../GameContext';
import type { ActionChoice } from '../types';

export default function ActionPanel() {
  const { currentChoices, addLog, setChoices, updateStats, stats } = useTuTienGame();

  const handleChoice = (choice: ActionChoice) => {
    // 1. Hiển thị lựa chọn của người chơi
    addLog({
      id: Date.now().toString(),
      text: `> Ngươi quyết định: ${choice.label}`,
      type: 'NARRATIVE'
    });

    // Xóa lựa chọn hiện tại chờ AI phản hồi
    setChoices([]);

    // 2. Giả lập phản hồi từ Hệ Thống / Môi trường (Sẽ thay bằng gọi AI thật sau này)
    setTimeout(() => {
      let nextLogs = '';
      let type: 'NARRATIVE' | 'SYSTEM_REWARD' | 'SYSTEM_PUNISH' | 'COMBAT' = 'NARRATIVE';
      let nextChoices: ActionChoice[] = [];

      // Hardcode mock một số lựa chọn ban đầu cho có tính tương tác trải nghiệm
      if (choice.id === 'c1' || choice.label.includes('Quan sát')) {
         nextLogs = 'Xung quanh linh khí mỏng manh. Phía trước có một con Huyết Bức (Dơi hút máu) đang rình rập. Nếu không cẩn thận, có thể mất nửa cái mạng.';
         type = 'COMBAT';
         nextChoices = [
           { id: 'fight1', label: 'Tế xuất pháp bảo liều mạng' },
           { id: 'run1', label: 'Bỏ chạy thục mạng' }
         ];
      } else if (choice.id === 'c2' || choice.label.includes('Ngồi thiền')) {
         nextLogs = 'Ngươi nhắm mắt vận công. Linh khí thiên địa chầm chậm dung nhập vào kinh mạch. Linh lực tăng lên!';
         type = 'SYSTEM_REWARD';
         updateStats({ qi: Math.min(stats.qi + 10, stats.maxQi) });
         nextChoices = [
           { id: 'c1', label: 'Mở mắt quan sát' },
           { id: 'c2', label: 'Tiếp tục thiền' }
         ];
      } else if (choice.id === 'fight1') {
         nextLogs = 'Ngươi gầm lên một tiếng, lao vào chém giết. Huyết Bức bị tiêu diệt nhưng ngươi cũng trúng độc!';
         type = 'SYSTEM_PUNISH';
         updateStats({ health: stats.health - 20, wealth: stats.wealth + 5 });
         nextChoices = [
           { id: 'heal1', label: 'Vận công bức độc' }
         ];
      } else if (choice.id === 'run1') {
         nextLogs = 'Tu tiên vốn là nghịch thiên, sao có thể lùi bước hèn nhát? Đạo tâm của ngươi bị rung chuyển!';
         type = 'SYSTEM_PUNISH';
         updateStats({ daoHeart: stats.daoHeart - 10 });
         nextChoices = [
           { id: 'c2', label: 'Ngồi thiền củng cố đạo tâm' }
         ];
      } else {
         nextLogs = 'Tiếng vọng từ Hỗn Độn báo rằng: Hệ thống AI Thiên Đạo đang được nâng cấp...';
         type = 'SYSTEM_REWARD';
         nextChoices = [
           { id: 'c1', label: 'Quay lại' }
         ];
      }

      addLog({
        id: (Date.now() + 1).toString(),
        text: nextLogs,
        type: type
      });
      setChoices(nextChoices);

      // Check dead
      if (stats.health <= 0 || stats.daoHeart <= 0) {
        addLog({
          id: (Date.now() + 2).toString(),
          text: 'Sinh cơ dứt đoạn, Nguyên Thần tan biến... Thân Tử Đạo Tiêu!',
          type: 'SYSTEM_PUNISH'
        });
        setChoices([]);
      }

    }, 1500);
  };

  return (
    <div className="tutien-panel" style={{ marginTop: 0 }}>
      {currentChoices.length > 0 ? (
        <div className="tutien-action-grid">
          {currentChoices.map(c => (
            <button key={c.id} className="tutien-btn" onClick={() => handleChoice(c)}>
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--tu-tien-text-muted)', fontStyle: 'italic', padding: '10px' }}>
          Đang chờ Thiên Đạo suy tính...
        </div>
      )}
    </div>
  );
}
