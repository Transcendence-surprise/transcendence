//user selects single/multiplayer

import { useNavigate } from "react-router-dom";
import GameModePicker from "../../components/game/GameModePicker";
import { createFakeUsers } from "../utils/fakeUser";

export default function GameEntryRoute() {
  const navigate = useNavigate();

  const handleSelectSingle = () => {
    createFakeUsers(); // create temp users
    navigate("/single/setup");
  };

  const handleSelectMulti = () => {
    createFakeUsers(); // create temp users
    navigate("/multiplayer/setup");
  };

  return (
    <GameModePicker
      onSelectSingle={handleSelectSingle}
      onSelectMulti={handleSelectMulti}
    />
  );
}
