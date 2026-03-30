import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchDto } from './dto/match.dto';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOkResponse({ type: MatchDto, isArray: true })
  async findAll(): Promise<MatchDto[]> {
    return this.matchesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: MatchDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MatchDto> {
    return this.matchesService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: MatchDto })
  async create(@Body() createMatchDto: CreateMatchDto): Promise<MatchDto> {
    return this.matchesService.create(createMatchDto);
  }

  @Put(':id')
  @ApiOkResponse({ type: MatchDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchDto> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: MatchDto })
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchDto> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Match deleted' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.remove(id);
  }
}
