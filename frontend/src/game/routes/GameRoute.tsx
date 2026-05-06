// src/routes/GameRoute.tsx
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import GameContainer from "../containers/GameContainer";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (!id) return(
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400">
        Game ID is required
      </h2>
    </div>
  );
  if (!user) return(
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400">
        Please log in to view the game
      </h2>
    </div>
  );

  return <GameContainer gameId={id} user={user} />;
}
