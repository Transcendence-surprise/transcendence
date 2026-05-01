import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';
import { RawLeaderboardRow } from './types/leaderboardRow';

@Injectable()
export class LeaderboardService {
  constructor(private readonly dataSource: DataSource) {}

async getAllTimeLeaderboard(limit = 100): Promise<LeaderboardEntryDto[]> {
  const qb = this.dataSource
    .createQueryBuilder()

    // base user id
    .select('gp.registered_user_id', 'userId')

    // user info
    .addSelect('u.username', 'username')
    .addSelect('u.win_streak', 'winStreak')
    .addSelect('u.avatar_image_id', 'avatarImageId')

    // wins (IMPORTANT: from games)
    .addSelect(`
      COUNT(g.id) FILTER (
        WHERE g.winner_user_id = gp.user_id
      )
    `, 'wins')

    // total games played
    .addSelect('COUNT(gp.game_id)', 'totalGames')

    // rank (same logic as getUserRanking)
    .addSelect(`
      RANK() OVER (
        ORDER BY COUNT(g.id) FILTER (
          WHERE g.winner_user_id = gp.user_id
        ) DESC
      )
    `, 'rank')

    // FROM players (not games!)
    .from('game_players', 'gp')

    .innerJoin('games', 'g', 'g.id = gp.game_id')
    .leftJoin('users', 'u', 'u.id = gp.registered_user_id')

    .where('g.phase = :phase', { phase: 'END' })
    .andWhere('g.type = :type', { type: 'MULTI' })
    .andWhere('gp.registered_user_id IS NOT NULL')

    .groupBy('gp.registered_user_id')
    .addGroupBy('u.username')
    .addGroupBy('u.win_streak')
    .addGroupBy('u.avatar_image_id')

    .orderBy('wins', 'DESC')
    .limit(limit);

    const rows: RawLeaderboardRow[] = await qb.getRawMany();

    return rows.map((row) => ({
      userId: Number(row.userId),
      username: row.username ?? null,
      winStreak: row.winStreak != null ? Number(row.winStreak) : 0,
      wins: Number(row.wins),
      totalGames: Number(row.totalGames),
      rank: Number(row.rank),
      avatarUrl: row.avatarImageId
        ? `/api/images/${Number(row.avatarImageId)}/content`
        : null,
    } as LeaderboardEntryDto));
  }

  async getUserRanking(userId: number): Promise<number | null> {
    const result: Array<{ userId: string | number; rank: string | number }> = await this.dataSource.query(
      `
      SELECT rank FROM (
        SELECT
          g.winner_user_id AS "userId",
          RANK() OVER (ORDER BY COUNT(*) DESC) AS rank
        FROM games g
        WHERE g.phase = 'END'
          AND g.type = 'MULTI'
          AND g.winner_user_id IS NOT NULL
        GROUP BY g.winner_user_id
      ) ranked
      WHERE "userId" = $1
    `,
      [userId],
    );

    if (result.length === 0) return null;

    return Number(result[0].rank);
  }
}
