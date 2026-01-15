type Props = {
  onCreate: () => void;
  onJoin: () => void;
  onBack: () => void;
};

export default function MultiplayerOption({ onCreate, onJoin, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Multiplayer Options</h2>
      
      <button
        className="px-6 py-3 bg-green-600 rounded-lg shadow-lg hover:bg-green-500 transition-all"
        onClick={onCreate}
      >
        Create Game
      </button>

      <button
        className="px-6 py-3 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 transition-all"
        onClick={onJoin}
      >
        Join Game
      </button>

      <button
        className="mt-4 text-sm underline text-gray-400"
        onClick={onBack}
      >
        Back
      </button>
    </div>
  );
}
