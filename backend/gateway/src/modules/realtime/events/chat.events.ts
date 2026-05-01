import { Server } from 'socket.io';
import type { TypedSocket } from '../models/models';

export function bindChatEvents(server: Server, client: TypedSocket) {

  client.on('chat:subscribe', async () => {
    if (!client.user) return client.disconnect(true);
    await client.join('chat:global');
  });

  client.on('chat:unsubscribe', async () => {
    await client.leave('chat:global');
  });

  // optional (same logic)
  client.on('chat:send', (message) => {
    server.to('chat:global').emit('chat:newMessage', message);
  });
}
