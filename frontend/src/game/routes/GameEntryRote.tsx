//user selects single/multiplayer
import { useNavigate } from "react-router-dom";
import GameModePicker from "../../components/game/GameModePicker";

export default function GameEntryRoute() {
  const navigate = useNavigate();

  return (
    <GameModePicker
      onSelectSingle={() => navigate("/single/setup")}
      onSelectMulti={() => navigate("/multiplayer/setup")}
    />
  );
}
