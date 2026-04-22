import CharacterSheet from './CharacterSheet';
import StoryTerminal from './StoryTerminal';
import ActionPanel from './ActionPanel';

export default function GameInterface() {
  return (
    <div className="tutien-game-layout">
      {/* Cột trái: Khung thông tin nhân vật */}
      <div style={{ overflow: 'hidden' }}>
        <CharacterSheet />
      </div>

      {/* Cột phải: Khu vực Cốt truyện & Tương tác */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <StoryTerminal />
        <ActionPanel />
      </div>
    </div>
  );
}
