import { startGame } from "../../api/game";

type LobbyProps = {
  game: any;
  currentUserId: string; // your temp ID or real user ID
  onGameStarted: (updatedGame: any) => void; // callback to update state
};

export default function Lobby({ game, currentUserId, onGameStarted }: LobbyProps) {
  const isHost = game.hostId === currentUserId;

  const handleStart = async () => {
    try {
      const updatedGame = await startGame(game.id, currentUserId);
      onGameStarted(updatedGame); // update game state in parent
    } catch (err: any) {
      console.error("Failed to start game:", err);
      alert(err.message || "Error starting game");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Lobby for Game {game.id}</h2>
      <p>Waiting for other players...</p>
      <p>Host: {game.hostId}</p>
      {/* Players list */}
      <div>
        <p>Players joined ({game.players.length}):</p>
        <ul>
          {game.players.map((p: any) => (
            <li
              key={p.id}
              className={p.id === currentUserId ? "text-green-400 font-bold" : ""}
            >
              {p.id} {p.id === game.hostId && "(host)"}
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <button
          className="px-6 py-3 bg-green-600 rounded-lg shadow-lg hover:bg-green-500 transition-all"
          onClick={handleStart}
        >
          Start Game
        </button>
      )}
    </div>
  );
}
