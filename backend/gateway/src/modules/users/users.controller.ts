import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { UsersHttpService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';
import { Roles } from '../../common/decorator/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersClient: UsersHttpService) {}

  @Get()
  async findAll(@Res() res: FastifyReply) {
    const result = await this.usersClient.findAll();
    return res.status(result.statusCode).send(result.data);
  }

  @Get('by-email/:email')
  async findOneByEmail(@Param('email') email: string, @Res() res: FastifyReply) {
    const result = await this.usersClient.findOneByEmail(email);
    return res.status(result.statusCode).send(result.data);
  }

  @Get('me')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  async getUserByHisToken(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const result = await this.usersClient.findUserByHisToken(req);
    return res.status(result.statusCode).send(result.data);
  }

  @Patch('me')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  async updateMe(@Body() body: unknown, @Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const result = await this.usersClient.updateMe(body, req);
    return res.status(result.statusCode).send(result.data);
  }

  @Post('me/avatar')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  async uploadAvatar(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const result = await this.usersClient.uploadAvatar(req);
    return res.status(result.statusCode).send(result.data);
  }

  @Get('id/:id')
  @Auth(AuthType.JWT)
  @Roles(['user'])
  @UseGuards(AuthGuard, RolesGuard)
  async findOneById(@Param('id') id: string, @Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const result = await this.usersClient.findOneById(Number(id), req);
    return res.status(result.statusCode).send(result.data);
  }

  @Put('id/:id')
  @Auth(AuthType.JWT_OR_API_KEY)
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const result = await this.usersClient.updateUser(Number(id), body, req);
    return res.status(result.statusCode).send(result.data);
  }

  @Patch('id/:id')
  @Auth(AuthType.JWT_OR_API_KEY)
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async updateUserPartial(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const result = await this.usersClient.updateUserPartial(Number(id), body, req);
    return res.status(result.statusCode).send(result.data);
  }

  @Delete('id/:id')
  @Auth(AuthType.JWT_OR_API_KEY)
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async removeById(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.usersClient.removeById(Number(id));
    return res.status(result.statusCode).send(result.data);
  }

  @Post()
  @Auth(AuthType.JWT_OR_API_KEY)
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async create(@Body() body: unknown, @Res() res: FastifyReply) {
    const result = await this.usersClient.create(body);
    return res.status(result.statusCode).send(result.data);
  }
}
