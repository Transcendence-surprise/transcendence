// src/modules/badges/badge.seed.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '@transcendence/db-entities';


@Injectable()
export class BadgeBootstrapService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepo: Repository<Badge>,
  ) {}

  async onModuleInit() {
    await this.seedBadges();
  }

  private async seedBadges() {
  const badges = [
    {
      key: 'first-login',
      name: 'First login',
      conditionType: 'login',
      conditionValue: 1,
      imageUrl: '/assets/badges/badge_first_login.svg',
      description: 'Log in for the first time',
    },
    {
      key: 'first-game',
      name: 'First game',
      conditionType: 'games',
      conditionValue: 1,
      imageUrl: '/assets/badges/badge_first_game.svg',
      description: 'Play your first multiplayer game',
    },
    {
      key: 'first-friend',
      name: 'First friend',
      conditionType: 'friends',
      conditionValue: 1,
      imageUrl: '/assets/badges/badge_first_friend.svg',
      description: 'Add your first friend',
    },
    {
      key: 'games-20',
      name: '20 games played',
      conditionType: 'games',
      conditionValue: 20,
      imageUrl: '/assets/badges/badge_20_games.svg',
      description: 'Play 20 multiplayer games',
    },
    {
      key: 'games-50',
      name: '50 games played',
      conditionType: 'games',
      conditionValue: 50,
      imageUrl: '/assets/badges/badge_50_games.svg',
      description: 'Play 50 multiplayer games',
    },
  ];

    for (const badge of badges) {
      const exists = await this.badgeRepo.findOne({
        where: { key: badge.key },
      });

      if (!exists) {
        await this.badgeRepo.save(badge);
      }
    }
  }
}