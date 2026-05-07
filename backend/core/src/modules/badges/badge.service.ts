// src/modules/badges/badge.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';
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
    if (!badge) {
      console.warn(`Badge with key "${key}" not found`);
      return;
    }

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

  async increment(userIds: number[], type: string, value: number) {
    const badges = await this.badgeRepo.find({
      where: { conditionType: type },
    });

    if (!badges.length) return;
    const badgeIds = badges.map(b => b.id);

    const userBadges = await this.userBadgeRepo.find({
      where: {
        userId: In(userIds),
        badgeId: In(badgeIds),
      },
    });

    const userBadgeMap = new Map(
      userBadges.map(ub => [`${ub.userId}-${ub.badgeId}`, ub]),
    );

    const toSave: any[] = [];

    for (const userId of userIds) {
      for (const badge of badges) {
        const key = `${userId}-${badge.id}`;
        let userBadge = userBadgeMap.get(key);

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
        }

        toSave.push(userBadge);
      }
    }
    if (toSave.length) {
      await this.userBadgeRepo.save(toSave);
    }
  }

  async getUserBadges(userId: number) {
    const allBadges = await this.badgeRepo.find({
      order: { id: 'ASC' },
    });
    const userBadges = await this.userBadgeRepo.find({
      where: { userId },
    });

    const map = new Map(
      userBadges.map(ub => [ub.badgeId, ub]),
    );

    return allBadges.map((badge) => {
      const ub = map.get(badge.id);

      return {
        key: badge.key,
        name: badge.name,
        imageUrl: badge.imageUrl,
        description: badge.description,

        progress: ub?.progress ?? 0,
        target: badge.conditionValue,

        completed: ub?.completed ?? false,
        unlockedAt: ub?.unlockedAt ?? null,
      };
    });
  }

  async getBadges() {
    return this.badgeRepo.find({
      order: { id: 'ASC' },
    });
  }
}
