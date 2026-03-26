import {
  ParseIntPipe,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Put,
  HttpStatus,
  Res,
  HttpCode,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { UsersService } from './users.service';
import { ImagesService, UploadedFile } from '../images/images.service';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPartialDto } from './dto/update-user-partial.dto';

type MaybeMultipartRequest = FastifyRequest & {
  isMultipart?: () => boolean;
  file?: () => Promise<UploadedFile | undefined>;
};

import {
  UsersControllerDocs,
  FindAllDocs,
  ValidateCredentialsDocs,
  FindOneByIdDocs,
  RemoveByIdDocs,
  CreateDocs,
  GetMeDocs,
  UpdateMeDocs,
  FindOneByEmailDocs,
  UpdateUserDocs,
  UpdateUserPartialDocs,
} from './users.controller.docs';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../decorators/current-user.decorator';


@UsersControllerDocs()
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private imagesService: ImagesService,
  ) {}

  @Get()
  @FindAllDocs()
  getUsers() {
    return this.usersService.findAll();
  }

  @Post('validate-credentials')
  @ValidateCredentialsDocs()
  async validateCredentials(@Body() validateCredDto: ValidateCredDto) {
    return this.usersService.validateCredentials(validateCredDto);
  }

  @Get('by-email/:email')
  @FindOneByEmailDocs()
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Get('me')
  @GetMeDocs()
  async getUserByHisToken(@CurrentUser() user : JwtPayload) {
    if (user.roles?.includes('guest')) {
      return {
        id: user.sub,
        username: user.username,
        email: '',
        roles: ['guest'],
      };
    }

    return this.usersService.findOneById(user.sub as number);
  }

  @Patch('me')
  @UpdateMeDocs()
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    if (user.roles?.includes('guest')) {
      return {
        id: user.sub,
        username: user.username,
        email: '',
        roles: ['guest'],
      };
    }
    return this.usersService.updateMe(user.sub as number, updateMeDto);
  }

  @Post('me/avatar')
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @Req() req: MaybeMultipartRequest,
  ) {
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('Expected multipart/form-data');
    }

    const file = await req.file();
    if (!file || !file.filename) {
      throw new BadRequestException('Missing file in form-data');
    }

    const image = await this.imagesService.createFromUpload(file);
    return this.usersService.updateMe(user.sub as number, { avatarImageId: image.id });
  }

  // Auth-test: allows to find user by id only if this user logged in
  @Get('id/:id')
  @FindOneByIdDocs()
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Put('id/:id')
  @UpdateUserDocs()
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: FastifyReply,
  ) {
    const result = await this.usersService.createOrUpdate(id, updateUserDto);
    const statusCode = result.created ? HttpStatus.CREATED : HttpStatus.OK;
    return res.status(statusCode).send(result.user);
  }

  @Patch('id/:id')
  @UpdateUserPartialDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  updateUserPartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPartialDto: UpdateUserPartialDto,
  ) {
    return this.usersService.updateUserPartial(id, updateUserPartialDto);
  }

  @Delete('id/:id')
  @RemoveByIdDocs()
  removeById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeById(id);
  }

  @Post()
  @CreateDocs()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
