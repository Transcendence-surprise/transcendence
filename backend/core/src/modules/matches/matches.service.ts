import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GamePhase } from '@transcendence/db-entities';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchDto } from './dto/match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(@InjectRepository(Game) private gameRepo: Repository<Game>) {}

  private toMatchDto(game: Game): MatchDto {
    return {
      id: game.id,
      type: game.type,
      phase: game.phase,
      hostUserId: game.hostUserId,
      winnerUserId: game.winnerUserId,
      state: game.state,
      endedAt: game.endedAt,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }

  async findAll(): Promise<MatchDto[]> {
    const games = await this.gameRepo.find();
    return games.map((game) => this.toMatchDto(game));
  }

  async findOne(id: string): Promise<MatchDto> {
    const game = await this.gameRepo.findOne({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }
    return this.toMatchDto(game);
  }

  async create(createMatchDto: CreateMatchDto): Promise<MatchDto> {
    const game = this.gameRepo.create({
      phase: createMatchDto.phase ?? GamePhase.LOBBY,
      type: createMatchDto.type,
      hostUserId: createMatchDto.hostUserId,
      state: createMatchDto.state,
      winnerUserId: createMatchDto.winnerUserId ?? null,
      endedAt: createMatchDto.endedAt ? new Date(createMatchDto.endedAt) : null,
    });
    return this.toMatchDto(await this.gameRepo.save(game));
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<MatchDto> {
    const game = await this.gameRepo.findOne({ where: { id } });

    if (!game) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }

    const updates = { ...updateMatchDto } as Partial<Game>;

    if (updateMatchDto.phase !== undefined) {
      updates.phase = updateMatchDto.phase;
    }
    if (updateMatchDto.type !== undefined) {
      updates.type = updateMatchDto.type;
    }
    if (updateMatchDto.hostUserId !== undefined) {
      updates.hostUserId = updateMatchDto.hostUserId;
    }
    if (updateMatchDto.state !== undefined) {
      updates.state = updateMatchDto.state;
    }
    if (updateMatchDto.winnerUserId !== undefined) {
      updates.winnerUserId = updateMatchDto.winnerUserId;
    }
    if (updateMatchDto.endedAt !== undefined) {
      updates.endedAt = updateMatchDto.endedAt ? new Date(updateMatchDto.endedAt) : null;
    }

    Object.assign(game, updates);

    const entity = await this.gameRepo.save(game);
    return this.toMatchDto(entity);
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    const result = await this.gameRepo.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }
    return { deleted: true, id };
  }
}
