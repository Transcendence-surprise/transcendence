// src/modules/badges/badge.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '@transcendence/db-entities';
import { UserBadge } from '@transcendence/db-entities';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepo: Repository<Badge>,

    @InjectRepository(UserBadge)
    private userBadgeRepo: Repository<UserBadge>,
  ) {}

  async unlockByKey(userId: number, key: string) {
    const badge = await this.badgeRepo.findOne({ where: { key } });
    if (!badge) return;

    const exists = await this.userBadgeRepo.findOne({
      where: { userId, badgeId: badge.id },
    });

    if (!exists) {
      await this.userBadgeRepo.save({
        userId,
        badgeId: badge.id,
      });
    }
  }

  async getUserBadges(userId: number) {
    const userBadges = await this.userBadgeRepo.find({
      where: { userId },
      relations: ['badge'],
      order: { unlockedAt: 'ASC' },
    });

    return userBadges
      .filter((ub) => ub.badge)
      .map((ub) => ({
        key: ub.badge.key,
        name: ub.badge.name,
        imageUrl: ub.badge.imageUrl,
        description: ub.badge.description,
        unlockedAt: ub.unlockedAt,
      }));
  }

  async getBadges() {
    return this.badgeRepo.find({
      order: { id: 'ASC' },
    });
  }
}