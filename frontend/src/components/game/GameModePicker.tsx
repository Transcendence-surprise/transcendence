// src/components/game/GameModePicker.tsx
import GameModeCard from '../UI/GameModeCard';

type Props = {
  onSelectSingle: () => void;
  onSelectMulti: () => void;
  onBack?: () => void; // optional
};

export default function GameModePicker({ onSelectSingle, onSelectMulti, onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-[#00eaff] font-mono flex flex-col items-center justify-center space-y-8">
      <h2 className="text-4xl font-bold drop-shadow-lg">Choose Game Mode</h2>

      <div className="flex gap-8  justify-center flex-wrap">
        <GameModeCard
          icon="/assets/solo.svg"
          title="Single Player"
          description="Classic solo mode"
          onClick={onSelectSingle}
        />

        <GameModeCard
          icon="/assets/multiplayer.svg"
          title="Multiplayer"
          description="Challenge friends"
          onClick={onSelectMulti}
        />
      </div>
    </div>
  );
}
