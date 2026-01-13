import { GameSettings } from "../../game/models/gameSettings";

type Props = {
  onSelectMode: (settings: GameSettings) => void;
  onBack: () => void;
};

export default function GameModePicker({ onSelectMode, onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-blue-400 font-mono flex flex-col items-center justify-center space-y-6">
      <h2 className="text-2xl font-bold drop-shadow-lg">Choose Game Mode</h2>
      <div className="flex space-x-4">
        <button
          className="px-6 py-3 bg-blue-900 rounded-lg shadow-lg hover:bg-blue-800 transition-all"
          onClick={() => onSelectMode({ mode: "SINGLE" })}
        >
          Single Player
        </button>
        <button
          className="px-6 py-3 bg-blue-900 rounded-lg shadow-lg hover:bg-blue-800 transition-all"
          onClick={() =>
            onSelectMode({
              mode: "MULTI",
              maxPlayers: 3,
              allowSpectators: true,
              boardSize: 7,
              collectiblesPerPlayer: 5,
            })
          }
        >
          Multiplayer
        </button>
      </div>
      <button className="mt-4 text-sm underline text-blue-300" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
