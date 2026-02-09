import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return status ok', () => {
      const result = controller.health();

      expect(result).toEqual({ status: 'ok' });
    });

    it('should always return an object with status property', () => {
      const result = controller.health();

      expect(result).toHaveProperty('status');
      expect(typeof result.status).toBe('string');
    });
  });
});
