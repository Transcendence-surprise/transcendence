import { MultiplayerSettings } from "../../game/models/gameSettings";

type Props = {
  settings: MultiplayerSettings;
  onChange: (newSettings: MultiplayerSettings) => void;
  onCreate: () => void;
  onBack: () => void;
};

export default function MultiplayerSettingsForm({ settings, onChange, onCreate, onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-blue-400 font-mono flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Multiplayer Settings</h2>
      
      {/* Max Players */}
      <label>
        Max Players:
        <select
          className="ml-2 px-2 py-1 bg-gray-800 rounded"
          value={settings.maxPlayers}
          onChange={(e) => onChange({ ...settings, maxPlayers: Number(e.target.value) as 2 | 3 | 4 })}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>

      {/* Allow Spectators */}
      <label>
        Allow Spectators:
        <input
          type="checkbox"
          className="ml-2"
          checked={settings.allowSpectators}
          onChange={(e) => onChange({ ...settings, allowSpectators: e.target.checked })}
        />
      </label>

      {/* Board Size */}
      <label>
        Board Size:
        <select
          className="ml-2 px-2 py-1 bg-gray-800 rounded"
          value={settings.boardSize}
          onChange={(e) => onChange({ ...settings, boardSize: Number(e.target.value) as 6 | 7 | 8 | 9 })}
        >
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
          <option value={9}>9</option>
        </select>
      </label>

      {/* Collectibles */}
      <label>
        Collectibles / Player:
        <input
          type="number"
          min={1}
          max={10}
          className="ml-2 px-2 py-1 bg-gray-800 rounded w-16"
          value={settings.collectiblesPerPlayer}
          onChange={(e) => onChange({ ...settings, collectiblesPerPlayer: Number(e.target.value) })}
        />
      </label>

      <button
        className="px-6 py-3 bg-green-600 rounded-lg shadow-lg hover:bg-green-500 transition-all"
        onClick={onCreate}
      >
        Create Game
      </button>
      <button className="mt-2 text-sm underline text-blue-300" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
