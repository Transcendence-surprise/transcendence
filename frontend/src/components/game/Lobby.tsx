// // src/game/components/Lobby.tsx
// import { GameState } from "../../models/gameState";

// export type LobbyProps = {
//   game: GameState;
//   currentUserId: string;
//   onStart: () => void;
// };

// export default function Lobby({
//   game,
//   currentUserId,
//   onStart,
// }: LobbyProps) {
//   const isHost = game.hostId === currentUserId;

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-4">
//       <h2 className="text-2xl font-bold">Game Lobby</h2>

//       <p>
//         <strong>Game ID:</strong> {game.gameId}
//       </p>

//       <p>
//         <strong>Host:</strong> {game.hostId}
//       </p>

//       <div>
//         <h3 className="font-semibold mb-1">Players</h3>
//         <ul>
//           {game.players.map((p) => (
//             <li key={p.id}>{p.id}</li>
//           ))}
//         </ul>
//       </div>

//       {isHost && (
//         <button
//           className="px-6 py-3 bg-green-600 rounded hover:bg-green-500"
//           onClick={onStart}
//         >
//           Start Game
//         </button>
//       )}

//       {!isHost && <p>Waiting for host to start the game…</p>}
//     </div>
//   );
// }
