// src/modules/presence/presence.module.ts

import { Module } from "@nestjs/common/decorators/modules/module.decorator";
import { PresenceController } from "./presence.controller";
import { PresenceService } from "./presence.service";

@Module({
  providers: [PresenceService],
  controllers: [PresenceController],
  exports: [PresenceService],
})
export class PresenceModule {}