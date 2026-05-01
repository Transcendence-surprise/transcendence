import type { TypedSocket } from '../models/models';

export function bindPresenceEvents(server: any, client: TypedSocket) {
  client.on('presence:subscribe', async (data: { userIds?: number[] }) => {
    const userIds = normalize(data.userIds);

    for (const id of userIds) {
      await client.join(`presence:user:${id}`);
    }
  });

  function normalize(input?: number[]) {
    return Array.from(
      new Set(
        (input ?? [])
          .map(Number)
          .filter((n) => Number.isInteger(n) && n > 0),
      ),
    );
  }
}
