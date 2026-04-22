
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendStatus } from '@transcendence/db-entities';
import { Friendship } from '@transcendence/db-entities';


@Injectable()
export class FriendService {
  constructor(

    @InjectRepository(Friendship)
    private repo: Repository<Friendship>,
  ) {}

  private async findPair(userAId: number, userBId: number) {
    return this.repo.findOne({
      where: [
        { requesterId: userAId, receiverId: userBId },
        { requesterId: userBId, receiverId: userAId },
      ],
    });
  }


  async sendRequest(currentUserId: number, targetUserId: number) {
    if (currentUserId === targetUserId)
      throw new Error('Cannot friend yourself');

    const existing = await this.findPair(currentUserId, targetUserId);

    if (existing) {
      if (existing.status === FriendStatus.ACCEPTED)
        throw new Error('Already friends');

      if (existing.status === FriendStatus.PENDING) {
        if (existing.requestedBy === currentUserId) {
          // normalize legacy rows created with sorted requester/receiver ids
          if (
            existing.requesterId !== currentUserId ||
            existing.receiverId !== targetUserId
          ) {
            existing.requesterId = currentUserId;
            existing.receiverId = targetUserId;
            await this.repo.save(existing);
          }
          throw new Error('Request already exists');
        }

        throw new Error('This user already sent you a request');
      }

      if (existing.status === FriendStatus.REJECTED) {
        existing.status = FriendStatus.PENDING;
        existing.requestedBy = currentUserId;
        existing.requesterId = currentUserId;
        existing.receiverId = targetUserId;
        return this.repo.save(existing);
      }
    }

    await this.repo.save({
      requesterId: currentUserId,
      receiverId: targetUserId,
      requestedBy: currentUserId,
      status: FriendStatus.PENDING,
    });
  }

  async rejectRequest(currentUserId: number, otherUserId: number) {
    const friendship = await this.repo.findOne({
      where: [
        {
          requesterId: otherUserId,
          receiverId: currentUserId,
          requestedBy: otherUserId,
          status: FriendStatus.PENDING,
        },
        {
          requesterId: currentUserId,
          receiverId: otherUserId,
          requestedBy: otherUserId,
          status: FriendStatus.PENDING,
        },
      ],
    });

    if (!friendship)
      throw new Error('Request not found');

    if (friendship.requestedBy !== otherUserId) {
      throw new Error('Not authorized');
    }

    friendship.status = FriendStatus.REJECTED;
    await this.repo.save(friendship);
  }

  async acceptRequest(currentUserId: number, otherUserId: number) {
    const friendship = await this.repo.findOne({
      where: [
        {
          requesterId: otherUserId,
          receiverId: currentUserId,
          requestedBy: otherUserId,
          status: FriendStatus.PENDING,
        },
        {
          requesterId: currentUserId,
          receiverId: otherUserId,
          requestedBy: otherUserId,
          status: FriendStatus.PENDING,
        },
      ],
    });

    if (!friendship)
      throw new Error('Request not found');

    if (friendship.requestedBy !== otherUserId) {
      throw new Error('Not authorized');
    }

    friendship.status = FriendStatus.ACCEPTED;
    await this.repo.save(friendship);
  }

  async removeFriend(userId: number, otherUserId: number) {
    const friendship = await this.findPair(userId, otherUserId);

    if (!friendship)
      throw new Error('Friendship not found');

    if (
      friendship.requesterId !== userId &&
      friendship.receiverId !== userId
    ) {
      throw new Error('Not authorized');
    }

    await this.repo.remove(friendship);
  }

  async getFriends(userId: number) {
    const friendships = await this.repo.find({
      where: [
        { requesterId: userId, status: FriendStatus.ACCEPTED },
        { receiverId: userId, status: FriendStatus.ACCEPTED },
      ],
      relations: ['requester', 'receiver'],
    });

    return friendships.map(f =>
      f.requester.id === userId ? f.receiver : f.requester
    );
  }

  async getPendingRequests(userId: number) {
    const pending = await this.repo.find({
      where: [
        {
          receiverId: userId,
          status: FriendStatus.PENDING,
        },
        {
          requesterId: userId,
          status: FriendStatus.PENDING,
        },
      ],
      relations: ['requester', 'receiver', 'requestedByUser'],
    });

    // Keep only incoming requests and expose actual sender in `requester`
    return pending
      .filter((friendship) => friendship.requestedBy !== userId)
      .map((friendship) => {
        const sender = friendship.requestedBy === friendship.requesterId
          ? friendship.requester
          : friendship.receiver;

        return {
          ...friendship,
          requester: sender,
        };
      });
  }
}