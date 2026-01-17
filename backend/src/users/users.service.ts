import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { DatabaseError } from 'pg-protocol';
import { UNIQUE_VIOLATION } from 'pg-error-constants';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll() {
    return this.repo.find();
  }

  async findOneByUsername(username: string) {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`User '${username}' not found`);
    return user;
  }

  async findOneById(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User '${id}' not found`);
    return user;
  }

  async findByUsernameWithPassword(username: string) {
    return this.repo.findOne({
      where: { username },
      select: ['id', 'email', 'username', 'password'],
    });
  }

  // try find by email or username
  async findByIdentifier(identifier: string) {
    return this.repo.findOne({
      where: [
        { username: identifier }, //
        { email: identifier },
      ],
      select: ['id', 'email', 'username', 'password'],
    });
  }

  async removeByUsername(username: string) {
    const res = await this.repo.delete({ username });
    if (!res.affected)
      throw new NotFoundException(`User '${username}' not found`);
    return { deleted: true, username };
  }

  async removeById(id: number) {
    const res = await this.repo.delete({ id });
    if (!res.affected) throw new NotFoundException(`User '${id}' not found`);
    return { deleted: true, id };
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.repo.create(createUserDto);
    user.password = await bcrypt.hash(user.password, 10);
    try {
      return await this.repo.save(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  private isUniqueConstraintError(error: unknown): error is QueryFailedError {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const dbError = error.driverError as DatabaseError;
    return dbError?.code === UNIQUE_VIOLATION;
  }
}
