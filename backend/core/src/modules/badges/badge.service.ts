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

    let userBadge = await this.userBadgeRepo.findOne({
      where: { userId, badgeId: badge.id },
    });

    if (!userBadge) {
      userBadge = this.userBadgeRepo.create({
        userId,
        badgeId: badge.id,
        progress: badge.conditionValue,
        completed: true,
        unlockedAt: new Date(),
      });
    } else if (!userBadge.completed) {
      userBadge.progress = badge.conditionValue;
      userBadge.completed = true;
      userBadge.unlockedAt = new Date();
    }

    await this.userBadgeRepo.save(userBadge);
  }

  async increment(userId: number, type: string, value: number) {
    const badges = await this.badgeRepo.find({
      where: { conditionType: type },
    });

    for (const badge of badges) {
      let userBadge = await this.userBadgeRepo.findOne({
        where: { userId, badgeId: badge.id },
      });

      if (!userBadge) {
        userBadge = this.userBadgeRepo.create({
          userId,
          badgeId: badge.id,
          progress: 0,
          completed: false,
        });
      }

      if (userBadge.completed) continue;

      userBadge.progress += value;

      if (userBadge.progress >= badge.conditionValue) {
        userBadge.progress = badge.conditionValue;
        userBadge.completed = true;
        userBadge.unlockedAt = new Date();

        // 🔥 later: emit WS event
      }

      await this.userBadgeRepo.save(userBadge);
    }
  }

  async getUserBadges(userId: number) {
    const userBadges = await this.userBadgeRepo.find({
      where: { userId },
      relations: ['badge'],
    });

    return userBadges
      .filter((ub) => ub.badge)
      .map((ub) => ({
        key: ub.badge.key,
        name: ub.badge.name,
        imageUrl: ub.badge.imageUrl,
        description: ub.badge.description,
        progress: ub.progress,
        target: ub.badge.conditionValue,
        completed: ub.completed,
        unlockedAt: ub.unlockedAt,
      }));
  }

  async getBadges() {
    return this.badgeRepo.find({
      order: { id: 'ASC' },
    });
  }
}