//user selects single/multiplayer

import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import GameModePicker from "../../components/game/GameModePicker";
import GuestOrAuthModal from "../../components/auth/GuestOrAuthModal";
import { useAuth } from '../../hooks/useAuth';

export default function GameEntryRoute() {
  const navigate = useNavigate();
  const { user, continueAsGuest } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'single'|'multi'|null>(null);

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

  const handleGuest = (nickname: string) => {
    // create guest user in context
    continueAsGuest(nickname);
    setShowModal(false);
    handleContinue();
  };

  return (
    <>
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
    </>
  );
}
