// src/hooks/useKeyboardNavigation.tsx
import { useState } from "react";
import { getNextButtonId } from "../game/utils/getNextButton";

export function useKeyboardNavigation(boardWidth: number, boardHeight: number) {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, buttonRefs: React.RefObject<Record<string, HTMLButtonElement | null>>) => {
    const nextButton = getNextButtonId(e.key, selectedButton?.split("-")[0], Number(selectedButton?.split("-")[1] || 0), boardWidth, boardHeight);
    if (nextButton && nextButton !== selectedButton) {
      setSelectedButton(nextButton);
      requestAnimationFrame(() => {
        buttonRefs.current[nextButton]?.focus();
      });
    }
    return selectedButton;
  };

  return { selectedButton, setSelectedButton, handleKeyDown };
}