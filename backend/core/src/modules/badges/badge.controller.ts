import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeControllerDocs } from './badge.controller.docs';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../decorators/current-user.decorator';

interface BadgeUnlockDto {
  userId: number;
  key: string;
}

interface BadgeIncrementDto {
  userId: number;
  type: string;
  value: number;
}

@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  @BadgeControllerDocs.getAllBadges()
  async getBadges() {
    return this.badgeService.getBadges();
  }

  @Get('user-badges')
  @BadgeControllerDocs.getUserBadges()
  async getUserBadges(@CurrentUser() user: JwtPayload) {
    return this.badgeService.getUserBadges(Number(user.sub));
  }

  @Post('internal/unlock')
  async unlockByKey(@Body() dto: BadgeUnlockDto) {
    const userId = Number(dto?.userId);
    if (!Number.isInteger(userId) || userId <= 0 || typeof dto?.key !== 'string' || !dto.key.trim()) {
      throw new BadRequestException('Invalid unlock payload');
    }

    await this.badgeService.unlockByKey(userId, dto.key.trim());
    return { ok: true };
  }

  @Post('internal/increment')
  async increment(@Body() dto: BadgeIncrementDto) {
    const userId = Number(dto?.userId);
    const value = Number(dto?.value);
    const type = typeof dto?.type === 'string' ? dto.type.trim() : '';

    if (!Number.isInteger(userId) || userId <= 0 || !type || !Number.isFinite(value) || value <= 0) {
      throw new BadRequestException('Invalid increment payload');
    }

    await this.badgeService.increment(userId, type, value);
    return { ok: true };
  }
}
