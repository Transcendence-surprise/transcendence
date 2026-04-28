import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { UseGuards } from '@nestjs/common';
import { InternalGuard } from '../../common/guards/internal.guard';

@Controller('internal')
@UseGuards(InternalGuard)
export class InternalEventsController {
  constructor(
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Post('events')
  handleEvent(
    @Body() event: any,
    @Headers('x-internal-key') key: string,
  ) {
    const expected = process.env.INTERNAL_SERVICE_KEY;

    console.log('Received internal event:', event);
    if (!key || key !== expected) {
      throw new UnauthorizedException('Invalid internal key');
    }

    switch (event.type) {
      case 'GAME_UPDATED':
        this.realtimeGateway.emitter.emitGameUpdated(event.gameId);
        break;

    //   case 'GAME_ENDED':
    //     this.emitter.emitGameEnded(event.gameId);
    //     break;
    }

    return { ok: true };
  }
}