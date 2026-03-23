//user selects single/multiplayer

import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import GameModePicker from "../../components/game/GameModePicker";
import GuestOrAuthModal from "../../components/auth/GuestOrAuthModal";
import { useAuth } from '../../hooks/useAuth';
import { checkPlayerAvailability, getGameState } from '../../api/game';
import { MultiGame } from '../../game/models/multiGames';

export default function GameEntryRoute() {
  const navigate = useNavigate();
  const { user, continueAsGuest } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'single'|'multi'|null>(null);
  const [activeGameIds, setActiveGameIds] = useState<string[]>([]);
  const [loadingGame, setLoadingGame] = useState(false);

  // Check for active games on mount or when user changes
  useEffect(() => {
    const checkActive = async () => {
      if (!user) {
        console.log("No user, skipping active game check");
        setActiveGameIds([]);
        return;
      }
      try {
        console.log("Checking for active games...");
        
        // Use checkPlayerAvailability which searches through ALL games for this player
        const availability = await checkPlayerAvailability();
        console.log("checkPlayerAvailability result:", availability);
        
        // Note: Backend returns ok:false when player HAS a game (backwards logic)
        // gameId will be present if player is in a game
        if (availability.gameId) {
          console.log("Found active game:", availability.gameId);
          setActiveGameIds([availability.gameId]);
        } else {
          console.log("No active game found");
          setActiveGameIds([]);
        }
      } catch (error) {
        console.error("Error checking active games:", error);
        setActiveGameIds([]);
      }
    };

    checkActive();
  }, [user]);

  const openModal = (mode: 'single'|'multi') => {

    // If user already logged in
    if (user) {
      handleContinue(mode);
      return;
    }

    setSelectedMode(mode);
    setShowModal(true);
  };

  const handleContinue = (mode?: 'single'|'multi') => {
    const m = mode || selectedMode;
    if (m === 'single') navigate("/single/setup");
    if (m === 'multi') navigate("/multiplayer/setup");
  };

  const handleGuest = async (nickname: string) => {
    try {
      await continueAsGuest(nickname);
      setShowModal(false);
      handleContinue();
    } catch (err: any) {
      alert(err.message || "Failed to continue as guest");
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#ffffff] font-mono flex flex-col items-center justify-center">
      {/* Debug Info */}
      <div className="text-xs text-gray-500 mb-4">
        User: {user?.username || "not logged in"} | Active Games: {activeGameIds.length}
      </div>

      {/* Active Games Section */}
      {activeGameIds.length > 0 && (
        <div className="w-full max-w-md px-4 mb-8">
          <h3 className="text-sm font-semibold text-green-400 mb-3">Active Games</h3>
          <div className="space-y-2">
            {activeGameIds.map((gameId) => (
              <div key={gameId} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-green-400 font-semibold text-sm">Game in Progress</p>
                      <p className="text-xs text-gray-400">ID: {gameId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLoadingGame(true);
                      navigate(`/game/${gameId}`);
                    }}
                    disabled={loadingGame}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded text-sm transition-colors font-semibold whitespace-nowrap"
                  >
                    {loadingGame ? "Loading..." : "Resume"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <GameModePicker
        onSelectSingle={() => openModal('single')}
        onSelectMulti={() => openModal('multi')}
      />

      {showModal && (
        <GuestOrAuthModal 
          onClose={() => setShowModal(false)}
          onContinueAsGuest={handleGuest}
        />
      )}
    </div>
  );
}
