// create or join multiplayer game

import { useNavigate } from "react-router-dom";
import MultiplayerOption from "../../components/game/JoinOrCreate";

export default function MultiplayerSetupRoute() {
  const navigate = useNavigate();

  return (
    <MultiplayerOption
      onCreate={() => navigate("/multiplayer/create")}
      onJoin={() => navigate("/multiplayer/join")}
      onBack={() => navigate("/game")}
    />
  );
}
