import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeControllerDocs } from './badge.controller.docs';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../decorators/current-user.decorator';
import { InternalGuard } from '../../guards/internal.guard';
import { ApiExcludeEndpoint } from '@nestjs/swagger';


interface BadgeUnlockDto {
  userId: number;
  key: string;
}

interface BadgeIncrementDto {
  userIds: number[];
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
  @ApiExcludeEndpoint()
  async unlockByKey(@Body() dto: BadgeUnlockDto) {
    const userId = Number(dto?.userId);
    if (!Number.isInteger(userId) || userId <= 0 || typeof dto?.key !== 'string' || !dto.key.trim()) {
      throw new BadRequestException('Invalid unlock payload');
    }

    await this.badgeService.unlockByKey(userId, dto.key.trim());
    return { ok: true };
  }

  @Post('internal/increment')
  @ApiExcludeEndpoint()
  @UseGuards(InternalGuard)
  async increment(@Body() dto: BadgeIncrementDto) {
    const userIds = Array.isArray(dto?.userIds) ? dto.userIds : [];
    const value = Number(dto?.value);
    const type = typeof dto?.type === 'string' ? dto.type.trim() : '';
    console.log('Controller: Received increment request with payload:', { userIds, type, value });
    if (
      !userIds.length ||
      userIds.some(id => !Number.isInteger(id) || id <= 0) ||
      !type ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      throw new BadRequestException('Invalid increment payload');
    }

    await this.badgeService.increment(userIds, type, value);
      return { ok: true };
  }
}
