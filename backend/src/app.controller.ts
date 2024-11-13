import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('start')
  startGame(@Body() body) {
    // TODO validate body
    const res = this.appService.startGame(body);
    // TODO send game params to other player too
    return res;
  }

}
