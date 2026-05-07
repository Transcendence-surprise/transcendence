import { BadRequestException, Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { UseGuards } from '@nestjs/common';
import { InternalGuard } from '../../common/guards/internal.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('internal')
@ApiExcludeController()
@UseGuards(InternalGuard)
export class InternalEventsController {
  constructor(
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Post('events')
  handleEvent(
    @Body() event: unknown,
    @Headers('x-internal-key') key: string,
  ) {
    const expected = process.env.INTERNAL_SERVICE_KEY;

    console.log('Received internal event:', event);
    if (!key || key !== expected) {
      throw new UnauthorizedException('Invalid internal key');
    }

    const parsedEvent = parseInternalEvent(event);
    if (!parsedEvent) {
      throw new BadRequestException('Invalid internal event payload');
    }

    switch (parsedEvent.type) {
      case 'GAME_UPDATED':
        this.realtimeGateway.emitter.emitGameUpdated(parsedEvent.gameId);
        break;

    //   case 'GAME_ENDED':
    //     this.emitter.emitGameEnded(event.gameId);
    //     break;
    }

    return { ok: true };
  }
}

type InternalEvent = {
  type: 'GAME_UPDATED';
  gameId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseInternalEvent(value: unknown): InternalEvent | null {
  if (!isRecord(value)) return null;
  if (value.type !== 'GAME_UPDATED') return null;
  if (typeof value.gameId !== 'string') return null;
  return { type: value.type, gameId: value.gameId };
}
