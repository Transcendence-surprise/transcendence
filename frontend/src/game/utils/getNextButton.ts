// src/game/utils/getNextButton.ts
import { Side } from "../models/side";

function makeId(side: Side, index: number): string {
  return `${side}-${index}`;
}

export function getNextButtonId(
  key: string,
  currentDir: string | undefined,
  currentIndex: number,
  boardWidth: number,
  boardHeight: number
): string | null {
  if (!currentDir) {
    if (key === "ArrowUp") return makeId("top", 0);
    if (key === "ArrowDown") return makeId("bottom", 0);
    if (key === "ArrowLeft") return makeId("left", 0);
    if (key === "ArrowRight") return makeId("right", 0);
    return null;
  }

  if (currentDir === "top") {
    if (key === "ArrowLeft") {
      return currentIndex > 0
        ? makeId("top", currentIndex - 1)
        : makeId("left", 0);
    }

    if (key === "ArrowRight") {
      return currentIndex < boardWidth - 1
        ? makeId("top", currentIndex + 1)
        : makeId("right", 0);
    }

    if (key === "ArrowDown") {
      return makeId("bottom", currentIndex);
    }

    if (key === "ArrowUp") {
      return makeId("top", currentIndex);
    }
  }

  if (currentDir === "right") {
    if (key === "ArrowUp") {
      return currentIndex > 0
        ? makeId("right", currentIndex - 1)
        : makeId("top", boardWidth - 1);
    }

    if (key === "ArrowDown") {
      return currentIndex < boardHeight - 1
        ? makeId("right", currentIndex + 1)
        : makeId("bottom", boardWidth - 1);
    }

    if (key === "ArrowLeft") {
      return makeId("left", currentIndex);
    }

    if (key === "ArrowRight") {
      return makeId("right", currentIndex);
    }
  }

  if (currentDir === "bottom") {
    if (key === "ArrowLeft") {
      return currentIndex > 0
        ? makeId("bottom", currentIndex - 1)
        : makeId("left", boardHeight - 1);
    }

    if (key === "ArrowRight") {
      return currentIndex < boardWidth - 1
        ? makeId("bottom", currentIndex + 1)
        : makeId("right", boardHeight - 1);
    }

    if (key === "ArrowUp") {
      return makeId("top", currentIndex);
    }

    if (key === "ArrowDown") {
      return makeId("bottom", currentIndex);
    }
  }

  if (currentDir === "left") {
    if (key === "ArrowUp") {
      return currentIndex > 0
        ? makeId("left", currentIndex - 1)
        : makeId("top", 0);
    }

    if (key === "ArrowDown") {
      return currentIndex < boardHeight - 1
        ? makeId("left", currentIndex + 1)
        : makeId("bottom", 0);
    }

    if (key === "ArrowRight") {
      return makeId("right", currentIndex);
    }

    if (key === "ArrowLeft") {
      return makeId("left", currentIndex);
    }
  }

  return null;
}