import s01Map from "../levels/01.map";
import { Puzzle01Meta } from "../levels/01.meta";
import { createSingleplayerLevel } from "../factories/singleLevel.factory";
import { createGameState } from "../factories/gameState.factory";

const level = createSingleplayerLevel(s01Map, Puzzle01Meta);
const gameState = createGameState(level);

console.log("LEVEL:");
console.log(JSON.stringify(level, null, 2));

console.log("\nGAME STATE:");
console.log(JSON.stringify(gameState, null, 2));
