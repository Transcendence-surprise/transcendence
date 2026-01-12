import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  getAllUsers() {
    return this.repo.find();
  }

  async getUserByLogin(login: string) {
    const user = await this.repo.findOne({ where: { login } });
    if (!user) throw new NotFoundException(`User '${login}' not found`);
    return user;
  }

  async deleteUserByLogin(login: string) {
    const res = await this.repo.delete({ login });
    if (!res.affected) throw new NotFoundException(`User '${login}' not found`);
    return { deleted: true, login };
  }
}