import { GameSettings } from './game-settings.dto';

export class CreateGameDto {
  hostId: string;
  settings: GameSettings;
}
