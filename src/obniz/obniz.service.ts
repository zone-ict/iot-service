import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Obniz from 'obniz';
import Keyestudio_Buzzer from 'obniz/dist/src/parts/Keyestudio/Keyestudio_Buzzer';
import Keyestudio_PIR from 'obniz/dist/src/parts/Keyestudio/Keyestudio_PIR';
import Keyestudio_TemperatureSensor from 'obniz/dist/src/parts/Keyestudio/Keyestudio_TemperatureSensor';

@Injectable()
export class ObnizService {
  obniz?: Obniz;
  tempSensor?: Keyestudio_TemperatureSensor;
  pirSensor?: Keyestudio_PIR;
  buzzer?: Keyestudio_Buzzer;

  constructor(private configService: ConfigService) {}

  start() {
    if (this.obniz) return;

    this.obniz = new Obniz(this.configService.get('OBNIZ_ID'));

    this.obniz.onopen = async () => {
      console.log('obniz is ready');
    };

    this.obniz.onconnect = async () => {
      // Init Temp Sensor
      this.tempSensor = this.obniz.wired('Keyestudio_TemperatureSensor', {
        signal: 0,
        vcc: 1,
        gnd: 2,
      });

      // Init Buzzer
      this.buzzer = this.obniz.wired('Keyestudio_Buzzer', {
        signal: 6,
        vcc: 5,
        gnd: 4,
      });

      // Init PIR Sensor
      this.pirSensor = this.obniz.wired('Keyestudio_PIR', {
        signal: 9,
        vcc: 10,
        gnd: 11,
      });

      this.obniz.onclose = () => {
        console.log('obniz is closed');
      };
    };
  }

  get status(): string {
    if (!this.obniz) {
      return 'closed';
    }

    return this.obniz.connectionState;
  }

  async getTemperature(): Promise<number> {
    if (!this.tempSensor) {
      return 0;
    }

    const currentTemp = await this.tempSensor.getWait();

    return currentTemp;
  }

  async buzz() {
    if (!this.buzzer) {
      return;
    }

    this.buzzer.play(100);
    await this.obniz.wait(1000);
    this.buzzer.stop();
  }

  get pirStatus(): 'enabled' | 'disabled' {
    if (!this.pirSensor) {
      return 'disabled';
    }

    return this.pirSensor.onchange ? 'enabled' : 'disabled';
  }

  disablePir() {
    if (!this.pirSensor || !this.obniz) {
      return;
    }

    this.obniz.display.clear();
    this.pirSensor.onchange = undefined;
  }

  enablePir() {
    if (!this.pirSensor || !this.obniz) {
      return;
    }

    this.pirSensor.onchange = (value) => {
      if (value) {
        console.log('Movement detected');
        this.obniz.display.clear();
        this.obniz.display.print('Something is moving!');
        // TODO: Add API call to line to send a message
      } else {
        console.log('no movement detected');
        this.obniz.display.clear();
        this.obniz.display.print('No movement detected!');
        // TODO: Add API call to line to send a message
      }
    };
  }
}
