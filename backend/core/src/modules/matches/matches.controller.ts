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
} from './matches.controller.docs';

@MatchesControllerDocs()
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @FindAllMatchesDocs()
  async findAll(): Promise<MatchDto[]> {
    return this.matchesService.findAll();
  }

  @Get(':id')
  @FindMatchByIdDocs()
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MatchDto> {
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
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchDto> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Patch(':id')
  @PartialUpdateMatchDocs()
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<MatchDto> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete(':id')
  @DeleteMatchDocs()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.remove(id);
  }
}
