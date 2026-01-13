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

  async getUserByusername(username: string) {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`User '${username}' not found`);
    return user;
  }

  async deleteUserByusername(username: string) {
    const res = await this.repo.delete({ username });
    if (!res.affected) throw new NotFoundException(`User '${username}' not found`);
    return { deleted: true, username };
  }
}