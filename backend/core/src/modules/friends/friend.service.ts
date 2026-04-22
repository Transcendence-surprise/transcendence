
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


  async sendRequest(currentUserId: number, targetUserId: number) {
    if (currentUserId === targetUserId)
      throw new Error('Cannot friend yourself');

    const [a, b] = [
      Math.min(currentUserId, targetUserId),
      Math.max(currentUserId, targetUserId),
    ];

    const existing = await this.repo.findOne({
      where: { requesterId: a, receiverId: b },
    });

    if (existing) {
      if (existing.status === FriendStatus.ACCEPTED)
        throw new Error('Already friends');

      if (existing.status === FriendStatus.PENDING)
        throw new Error('Request already exists');

      if (existing.status === FriendStatus.REJECTED) {
        existing.status = FriendStatus.PENDING;
        existing.requestedBy = currentUserId;
        return this.repo.save(existing);
      }
    }

    await this.repo.save({
      requesterId: a,
      receiverId: b,
      requestedBy: currentUserId,
      status: FriendStatus.PENDING,
    });
  }

  async rejectRequest(currentUserId: number, otherUserId: number) {
    const [a, b] = [
      Math.min(currentUserId, otherUserId),
      Math.max(currentUserId, otherUserId),
    ];

    const friendship = await this.repo.findOne({
      where: {
        requesterId: a,
        receiverId: b,
        status: FriendStatus.PENDING,
      },
    });

    if (!friendship)
      throw new Error('Request not found');

    if (friendship.receiverId !== currentUserId) {
      throw new Error('Not authorized');
    }

    friendship.status = FriendStatus.REJECTED;
    await this.repo.save(friendship);
  }

  async acceptRequest(currentUserId: number, otherUserId: number) {
    const [a, b] = [
      Math.min(currentUserId, otherUserId),
      Math.max(currentUserId, otherUserId),
    ];

    const friendship = await this.repo.findOne({
      where: {
        requesterId: a,
        receiverId: b,
        status: FriendStatus.PENDING,
      },
    });

    if (!friendship)
      throw new Error('Request not found');

    if (friendship.receiverId !== currentUserId) {
      throw new Error('Not authorized');
    }

    friendship.status = FriendStatus.ACCEPTED;
    await this.repo.save(friendship);
  }

  async removeFriend(userId: number, otherUserId: number) {
    const [a, b] = [
      Math.min(userId, otherUserId),
      Math.max(userId, otherUserId),
    ];

    const friendship = await this.repo.findOne({
      where: { requesterId: a, receiverId: b },
    });

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
    return this.repo.find({
      where: {
        receiverId: userId,
        status: FriendStatus.PENDING,
      },
      relations: ['requester'],
    });
  }
}





// Use in-memory store (Redis or Map)

// Example (simple version):

// const onlineUsers = new Map<number, boolean>();

// // on connect
// onlineUsers.set(userId, true);

// // on disconnect
// onlineUsers.delete(userId);


// Attach status to friends list
// return friends.map(user => ({
//   ...user,
//   isOnline: onlineUsers.has(user.id),
// }));


