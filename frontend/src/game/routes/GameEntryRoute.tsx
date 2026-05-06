//user selects single/multiplayer

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameModePicker from "../../components/game/GameModePicker";
import GuestOrAuthModal from "../../components/auth/GuestOrAuthModal";
import { useAuth } from "../../hooks/useAuth";
import ActiveGamesSection from "../../components/game/ActiveGamesSection";

export default function GameEntryRoute() {
  const navigate = useNavigate();
  const { user, continueAsGuest } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"single" | "multi" | null>(
    null,
  );

  const openModal = (mode: "single" | "multi") => {
    // If user already logged in
    if (user) {
      handleContinue(mode);
      return;
    }

    setSelectedMode(mode);
    setShowModal(true);
  };

  const handleContinue = (mode?: "single" | "multi") => {
    const m = mode || selectedMode;
    if (m === "single") navigate("/single/setup");
    if (m === "multi") navigate("/multiplayer/setup");
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
    <div className="w-full h-full min-h-0 bg-bg-dark text-white font-sans flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        <ActiveGamesSection user={user ? { id: user.id } : null} />

        <GameModePicker
          onSelectSingle={() => openModal("single")}
          onSelectMulti={() => openModal("multi")}
        />
      </div>

      {showModal && (
        <GuestOrAuthModal
          onClose={() => setShowModal(false)}
          onContinueAsGuest={handleGuest}
        />
      )}
    </div>
  );
}