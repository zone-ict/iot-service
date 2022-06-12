import { Controller, Get, Post } from '@nestjs/common';
import { ObnizService } from './obniz.service';

@Controller('obniz')
export class ObnizController {
  constructor(private readonly obnizService: ObnizService) {}

  @Get()
  getStatus() {
    return {
      ok: true,
      status: this.obnizService.obniz.connectionState,
    };
  }

  @Get('temperature')
  async getTemperature() {
    const currentTemp = await this.obnizService.tempSensor.getWait();

    return {
      ok: true,
      temprature: currentTemp.toFixed(1),
    };
  }

  @Post('buzz')
  async buzzBuzzer() {
    this.obnizService.buzzer.play(100);
    await this.obnizService.obniz.wait(1000);
    this.obnizService.buzzer.stop();
    return {
      ok: true,
    };
  }

  @Post('pir.disable')
  dsiablePir() {
    this.obnizService.obniz.display.clear();
    this.obnizService.pirSensor.onchange = undefined;
    return {
      ok: true,
    };
  }

  @Post('pir.enable')
  enablePir() {
    this.obnizService.pirSensor.onchange = (value) => {
      if (value) {
        console.log('Movement detected');
        this.obnizService.obniz.display.clear();
        this.obnizService.obniz.display.print('Something is moving!');
      } else {
        console.log('no movement detected');
        this.obnizService.obniz.display.clear();
        this.obnizService.obniz.display.print('No movement detected!');
      }
    };
    return { ok: true };
  }
}
