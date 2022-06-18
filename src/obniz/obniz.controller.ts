import { Controller, Get, Post } from '@nestjs/common';
import { ObnizService } from './obniz.service';

@Controller('obniz')
export class ObnizController {
  constructor(private readonly obnizService: ObnizService) {}

  @Post('send.test-message')
  sendTestMessage() {
    try {
      this.obnizService.sendTestMessage();
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

  @Get('status')
  getStatus() {
    try {
      return {
        ok: true,
        status: this.obnizService.status,
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

  @Post('start')
  startObniz() {
    try {
      this.obnizService.start();
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

  @Post('stop')
  async stopObniz() {
    try {
      await this.obnizService.stop();
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

  @Get('temperature')
  async getTemperature() {
    try {
      const currentTemp = await this.obnizService.getTemperature();

      return {
        ok: true,
        temperature: currentTemp.toFixed(1),
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

  @Get('temperature/monitor.status')
  async getIsTempMonitoring() {
    try {
      return {
        ok: true,
        status: this.obnizService.currentMonitoringStatus,
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

  @Post('temperature/monitor.start')
  async startTempMonitoring() {
    try {
      this.obnizService.startTempMonitoring();
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

  @Post('temperature/monitor.stop')
  async stopTempMonitoring() {
    try {
      this.obnizService.stopTempMonitoring();
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

  @Get('pir/monitor.status')
  getIsPirMonitoring() {
    try {
      return {
        ok: true,
        status: this.obnizService.currentMonitoringStatus,
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

  @Post('pir/monitor.stop')
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

  @Post('pir/monitor.start')
  enablePir() {
    try {
      this.obnizService.enablePir();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: {
          message: error.message,
        },
      };
    }
  }
}
