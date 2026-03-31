import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getAllTimeLeaderboard(limit = 10): Promise<LeaderboardEntryDto[]> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('g.winner_user_id', 'userId')
      .addSelect("COALESCE(u.username, 'unknown')", 'username')
      .addSelect('COUNT(*)', 'wins')
      .from('games', 'g')
      .leftJoin('users', 'u', 'u.id = g.winner_user_id')
      .where('g.phase = :phase', { phase: 'END' })
      .andWhere('g.type = :type', { type: 'MULTI' })
      .andWhere('g.winner_user_id IS NOT NULL')
      .groupBy('g.winner_user_id')
      .addGroupBy('u.username')
      .orderBy('wins', 'DESC')
      .addOrderBy('g.winner_user_id', 'ASC')
      .limit(limit);

    const rows: Array<{ userId: number; username: string; wins: number }> = await qb.getRawMany();

    return rows.map((row) => ({
      userId: Number(row.userId),
      username: row.username,
      wins: Number(row.wins),
    }));
  }
}
