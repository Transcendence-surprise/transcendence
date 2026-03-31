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
      .addSelect('COALESCE(u.rank_number, 0)', 'rankNumber')
      .addSelect('COALESCE(u.win_streak, 0)', 'winStreak')
      .addSelect('COALESCE(u.total_games, 0)', 'totalGames')
      .addSelect('COALESCE(u.total_wins, 0)', 'totalWins')
      .addSelect('COALESCE(i.url, NULL)', 'avatarUrl')
      .addSelect('COUNT(*)', 'wins')
      .from('games', 'g')
      .leftJoin('users', 'u', 'u.id = g.winner_user_id')
      .leftJoin('images', 'i', 'i.id = u.avatar_image_id')
      .where('g.phase = :phase', { phase: 'END' })
      .andWhere('g.type = :type', { type: 'MULTI' })
      .andWhere('g.winner_user_id IS NOT NULL')
      .groupBy('g.winner_user_id')
      .addGroupBy('u.username')
      .addGroupBy('u.rank_number')
      .addGroupBy('u.win_streak')
      .addGroupBy('u.total_games')
      .addGroupBy('u.total_wins')
      .addGroupBy('i.url')
      .orderBy('wins', 'DESC')
      .addOrderBy('g.winner_user_id', 'ASC')
      .limit(limit);

    type RawLeaderboardRow = {
      userId: number;
      username: string;
      rankNumber: number;
      winStreak: number;
      totalGames: number;
      totalWins: number;
      avatarUrl: string | null;
      wins: number;
    };

    const rows: RawLeaderboardRow[] = await qb.getRawMany();

    return rows.map((row) => ({
      userId: Number(row.userId),
      username: row.username,
      rankNumber: Number(row.rankNumber),
      winStreak: Number(row.winStreak),
      totalGames: Number(row.totalGames),
      totalWins: Number(row.totalWins),
      avatarUrl: row.avatarUrl,
      wins: Number(row.wins),
    }));
  }
}
