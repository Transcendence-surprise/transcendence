import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchDto } from './dto/match.dto';
import {
  MatchesControllerDocs,
  FindAllMatchesDocs,
  FindMatchByIdDocs,
  CreateMatchDocs,
  UpdateMatchDocs,
  PartialUpdateMatchDocs,
  DeleteMatchDocs,
  LatestMatchesDocs,
} from './matches.controller.docs';
import { CurrentUser } from './dto/playerContext.dto';
import type { PlayerContext } from './dto/playerContext.dto';
import type { LatestGames } from './types/latest-games';

@MatchesControllerDocs()
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @FindAllMatchesDocs()
  async findAll(): Promise<MatchDto[]> {
    return this.matchesService.findAll();
  }

  @Get('latest')
  @LatestMatchesDocs()
  async getUserLatestGames(@CurrentUser() user: PlayerContext): Promise<LatestGames[] > {
    return this.matchesService.getUserLatestGames(Number(user.id));
  }

  @Get(':id')
  @FindMatchByIdDocs()
  async findOne(@Param('id') id: string): Promise<MatchDto> {
    return this.matchesService.findOne(id);
  }

  @Post()
  @CreateMatchDocs()
  async create(@Body() createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return this.matchesService.create(createMatchDto);
  }

  @Put(':id')
  @UpdateMatchDocs()
  async update(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchDto> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Patch(':id')
  @PartialUpdateMatchDocs()
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchDto> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete(':id')
  @DeleteMatchDocs()
  async remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }
}
