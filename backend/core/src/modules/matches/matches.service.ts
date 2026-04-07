import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GamePhase } from '@transcendence/db-entities';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(@InjectRepository(Game) private gameRepo: Repository<Game>) {}

  async findAll(): Promise<Game[]> {
    return this.gameRepo.find();
  }

  async findOne(id: number): Promise<Game> {
    const game = await this.gameRepo.findOne({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }
    return game;
  }

  async create(createMatchDto: CreateMatchDto): Promise<Game> {
    const game = this.gameRepo.create({
      ...createMatchDto,
      phase: createMatchDto.phase ?? GamePhase.LOBBY,
      startedAt: createMatchDto.startedAt ? new Date(createMatchDto.startedAt) : null,
      endedAt: createMatchDto.endedAt ? new Date(createMatchDto.endedAt) : null,
    });
    return this.gameRepo.save(game);
  }

  async update(id: number, updateMatchDto: UpdateMatchDto): Promise<Game> {
    const game = await this.findOne(id);

    const updates = { ...updateMatchDto } as Partial<Game>;

    if (updateMatchDto.startedAt !== undefined) {
      updates.startedAt = updateMatchDto.startedAt ? new Date(updateMatchDto.startedAt) : null;
    }
    if (updateMatchDto.endedAt !== undefined) {
      updates.endedAt = updateMatchDto.endedAt ? new Date(updateMatchDto.endedAt) : null;
    }

    Object.assign(game, updates);

    return this.gameRepo.save(game);
  }

  async remove(id: number): Promise<{ deleted: boolean; id: number }> {
    const result = await this.gameRepo.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }
    return { deleted: true, id };
  }
}
