import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameSetupPage from "./GameSetup";
import { GameSettings } from "../models/gameSettings";
import { createGame } from "../../api/game";
import { generateTempUserId } from "../utils/randomUser";

export default function GameSetupRoute() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    navigate("/"); // back to home
  };

  const handleCreate = async (settings: GameSettings) => {
    try {
      setError(null); // reset previous errors
      const hostId = generateTempUserId(); // temp ID for now
      const game = await createGame(hostId, settings);
      console.log("Game created:", game);
      navigate(`/game/${game.gameId}`);
    } catch (err: any) {
      console.error("Failed to create game:", err);
      setError(err.message || "Unknown error occurred");
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-600 text-white p-2 mb-4 rounded">
          Error: {error}
        </div>
      )}
      <GameSetupPage onBack={handleBack} onCreate={handleCreate} />
    </div>
  );
}
