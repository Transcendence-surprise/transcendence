// src/components/game/GameModePicker.tsx
type Props = {
  onSelectSingle: () => void;
  onSelectMulti: () => void;
  onBack?: () => void; // optional
};

export default function GameModePicker({ onSelectSingle, onSelectMulti, onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-blue-400 font-mono flex flex-col items-center justify-center space-y-6">
      <h2 className="text-3xl font-bold drop-shadow-lg">Choose Game Mode</h2>

      <div className="flex flex-col space-y-4">
        <button
          className="px-6 py-3 bg-blue-900 rounded-lg shadow-lg hover:bg-blue-800 transition-all"
          onClick={onSelectSingle}
        >
          Single Player
        </button>

        <button
          className="px-6 py-3 bg-purple-900 rounded-lg shadow-lg hover:bg-purple-800 transition-all"
          onClick={onSelectMulti}
        >
          Multiplayer
        </button>
      </div>

      {onBack && (
        <button className="mt-6 text-sm underline text-blue-300" onClick={onBack}>
          Back
        </button>
      )}
    </div>
  );
}
