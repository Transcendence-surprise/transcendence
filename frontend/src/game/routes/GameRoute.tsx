// src/routes/GameRoute.tsx
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import GameContainer from "../containers/GameContainer";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (!id) return <div>Game ID is required</div>;
  if (!user) return <div>Please log in to view the game</div>;

  return <GameContainer gameId={id} user={user} />;
}