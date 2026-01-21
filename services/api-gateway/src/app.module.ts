import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
