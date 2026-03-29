import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LeaderboardEntryDto } from './leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getDailyLeaderboard(limit = 10): Promise<LeaderboardEntryDto[]> {
    const query = `
      SELECT
        g.winner_user_id AS "userId",
        COALESCE(u.username, 'unknown') AS "username",
        COUNT(*) AS "wins"
      FROM games g
      LEFT JOIN users u ON u.id = g.winner_user_id
      WHERE g.phase = 'END'
        AND g.type = 'MULTI'
        AND g.winner_user_id IS NOT NULL
        AND g.ended_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
        AND g.ended_at < date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day'
      GROUP BY g.winner_user_id, u.username
      ORDER BY "wins" DESC, g.winner_user_id ASC
      LIMIT $1
    `;

    const rows: Array<{ userId: number; username: string; wins: number }> =
      await this.dataSource.query(query, [limit]);

    return rows.map((row) => ({
      userId: Number(row.userId),
      username: row.username,
      wins: Number(row.wins),
    }));
  }
}
