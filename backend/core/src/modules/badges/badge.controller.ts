import { Controller, Get, Param, UnauthorizedException } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeControllerDocs } from './badge.controller.docs';
import { CurrentUser } from './dto/playerContext.dto';
import type { PlayerContext } from './dto/playerContext.dto';

@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  @BadgeControllerDocs.getAllBadges()
  async getBadges() {
    return this.badgeService.getBadges();
  }

  @Get('unlocked')
  @BadgeControllerDocs.getUserBadges()
  async getUserBadges(@CurrentUser() user: PlayerContext) {
    return this.badgeService.getUserBadges(Number(user.id));
  }
}
