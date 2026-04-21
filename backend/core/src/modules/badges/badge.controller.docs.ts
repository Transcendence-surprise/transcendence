// src/modules/badges/badge.controller.docs.ts

import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BadgeDto } from './dto/badge.dto';
import { UserBadgeDto } from './dto/badge.dto';

export const BadgeControllerDocs = {
  getAllBadges() {
    return applyDecorators(
      ApiTags('Badges'),
      ApiOperation({ summary: 'Get all badges' }),
      ApiResponse({
        status: 200,
        type: BadgeDto,
        isArray: true,
      }),
    );
  },

  getUserBadges() {
    return applyDecorators(
      ApiTags('Badges'),
      ApiOperation({ summary: 'Get user unlocked badges' }),
      ApiResponse({
        status: 200,
        type: UserBadgeDto,
        isArray: true,
      }),
    );
  },
};