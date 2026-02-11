import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from '@transcendence/db-entities';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import * as bcrypt from 'bcrypt';
import { DatabaseError } from 'pg-protocol';
import { UNIQUE_VIOLATION } from 'pg-error-constants';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll() {
    return await this.userRepo.find();
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`User '${username}' not found`);
    return user;
  }

  async findOneById(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User '${id}' not found`);
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user)
      throw new NotFoundException(`User with email '${email}' not found`);
    return user;
  }

  async findByIdentifierWithPassword(identifier: string) {
    return await this.userRepo
      .createQueryBuilder('user')
      .where('user.username = :identifier OR user.email = :identifier', { identifier })
      .addSelect('user.password')
      .getOne();
  }

  async findByIdentifier(identifier: string) {
    return await this.userRepo
      .createQueryBuilder('user')
      .where('user.username = :identifier OR user.email = :identifier', { identifier })
      .getOne();
  }

  async validateCredentials(validateCredDto: ValidateCredDto) {
    const user = await this.findByIdentifierWithPassword(validateCredDto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordCorrect = await bcrypt.compare(
      validateCredDto.password,
      user.password,
    );

    if (!passwordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async removeByUsername(username: string) {
    const res = await this.userRepo.delete({ username });
    if (!res.affected)
      throw new NotFoundException(`User '${username}' not found`);
    return { deleted: true, username };
  }

  async removeById(id: number) {
    const res = await this.userRepo.delete({ id });
    if (!res.affected) throw new NotFoundException(`User '${id}' not found`);
    return { deleted: true, id };
  }

  async create(createUserDto: CreateUserDto) {
    const { email, username } = createUserDto;
    const dbUser = await this.userRepo.findOne({ where: [{ email }, { username }]})
    if (dbUser) {
      throw new ConflictException('Username or email already exists');
    }

    const user = this.userRepo.create(createUserDto);
    if (user.password !== null) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    try {
      const savedUser = await this.userRepo.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
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
