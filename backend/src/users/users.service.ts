import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

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
    return this.repo.save(user);
  }
}
