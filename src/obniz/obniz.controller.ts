import { Controller, Get, Post } from '@nestjs/common';
import { ObnizService } from './obniz.service';

@Controller('obniz')
export class ObnizController {
  constructor(private readonly obnizService: ObnizService) {}

  @Get('/status')
  getStatus() {
    return {
      ok: true,
      status: this.obnizService.status,
    };
  }

  @Get('temperature')
  async getTemperature() {
    const currentTemp = await this.obnizService.getTemperature();

    return {
      ok: true,
      temperature: currentTemp.toFixed(1),
    };
  }

  @Post('buzz')
  async buzz() {
    try {
      this.obnizService.buzz();
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message: error.message,
        },
      };
    }
  }

  @Post('pir.disable')
  disablePir() {
    try {
      this.obnizService.disablePir();
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          message: error.message,
        },
      };
    }
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
