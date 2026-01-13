import { useNavigate } from "react-router-dom";
import GameSetupPage from "./GameSetup";
import { GameSettings } from "../models/gameSettings";
import { createGame } from "../../api/game";
import { generateTempUserId } from "../utils/randomUser";

export default function GameSetupRoute() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/"); // back to home
  };

  const handleCreate = async (settings: GameSettings) => {
    try {
      const hostId = generateTempUserId();; // or get from user/session
      const game = await createGame(hostId, settings);
      console.log("Game created:", game);
      // navigate to Game screen
      navigate(`/game/${game.id}`);
    } catch (err) {
      console.error("Failed to create game:", err);
    }
  };

  return (
    <GameSetupPage
      onBack={handleBack}
      onCreate={handleCreate}
    />
  );
}
