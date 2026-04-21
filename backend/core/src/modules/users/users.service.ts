import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@transcendence/db-entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPartialDto } from './dto/update-user-partial.dto';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import * as bcrypt from 'bcrypt';
import { BadgeService } from '../badges/badge.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private badgeService: BadgeService,
  ) {}

  private mapUser(user: User): Omit<User, 'password' | 'avatarImage'> & {
    avatarImageId: number | null;
    avatarUrl: string | null;
  } {
    const { password: _password, avatarImage: _avatarImage, ...rest } = user;
    return {
      ...rest,
      avatarImageId: user.avatarImageId ?? null,
      avatarUrl: user.avatarImage?.url ?? null,
    };
  }

  async findAll() {
    const users = await this.userRepo.find({ relations: ['avatarImage'] });
    return users.map((user: User) => this.mapUser(user));
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepo.findOne({ where: { username }, relations: ['avatarImage'] });
    if (!user) throw new NotFoundException(`User '${username}' not found`);
    return this.mapUser(user);
  }

  async findOneById(id: number) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['avatarImage'] });
    if (!user) throw new NotFoundException(`User '${id}' not found`);
    return this.mapUser(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['avatarImage'] });
    if (!user)
      throw new NotFoundException(`User with email '${email}' not found`);
    return this.mapUser(user);
  }

  async findByIdentifierWithPassword(identifier: string) {
    return await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatarImage', 'avatarImage')
      .where('user.username = :identifier OR user.email = :identifier', { identifier })
      .addSelect('user.password')
      .getOne();
  }

  async findByIdentifier(identifier: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.avatarImage', 'avatarImage')
      .where('user.username = :identifier OR user.email = :identifier', { identifier })
      .getOne();

    if (!user) return null;
    return this.mapUser(user);
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

    const safeUser = this.mapUser(user);
    return safeUser;
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

    if (createUserDto.password) {
      user.password = await bcrypt.hash(createUserDto.password, 10);
    } else {
      user.password = null;
    }

    const savedUser = await this.userRepo.save(user);

    await this.badgeService.unlockByKey(savedUser.id, 'first-login');
    console.log(`Unlocked 'first-login' badge for user ${savedUser.id}`);
    return this.mapUser(savedUser);
  }

  async updateMe(userId: number, updateMeDto: UpdateMeDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateMeDto.twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = updateMeDto.twoFactorEnabled;
    }

    if (updateMeDto.avatarImageId !== undefined) {
      user.avatarImageId = updateMeDto.avatarImageId;
    }

    await this.userRepo.save(user);

    const updatedUserWithRelation = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['avatarImage'],
    });

    if (!updatedUserWithRelation) {
      throw new NotFoundException(`User with ID ${userId} not found after update`);
    }

    return this.mapUser(updatedUserWithRelation);
  }

  async createOrUpdate(id: number, updateUserDto: UpdateUserDto) {
    let user = await this.userRepo.findOne({ where: { id } });
    let created = false;

    if (!user) {
      const existingUser = await this.userRepo.findOne({
        where: [
          { username: updateUserDto.username },
          { email: updateUserDto.email },
        ],
      });

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }

      user = this.userRepo.create({ id, ...updateUserDto });
      created = true;
    } else {
      const existingUser = await this.userRepo.findOne({
        where: [
          { username: updateUserDto.username },
          { email: updateUserDto.email },
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username or email already exists');
      }

      Object.assign(user, updateUserDto);
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const savedUser = await this.userRepo.save(user);
    return { user: this.mapUser(savedUser), created };
  }

  async updateUserPartial(id: number, updateUserPartialDto: UpdateUserPartialDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserPartialDto.username || updateUserPartialDto.email) {
      const existingUser = await this.userRepo.findOne({
        where: [
          { username: updateUserPartialDto.username },
          { email: updateUserPartialDto.email },
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username or email already exists');
      }
    }

    const { password, ...rest } = updateUserPartialDto;

    Object.assign(user, rest);

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await this.userRepo.save(user);
  }
}
