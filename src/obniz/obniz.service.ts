import { Injectable } from '@nestjs/common';
import * as Obniz from 'obniz';
import Keyestudio_Buzzer from 'obniz/dist/src/parts/Keyestudio/Keyestudio_Buzzer';
import Keyestudio_PIR from 'obniz/dist/src/parts/Keyestudio/Keyestudio_PIR';
import Keyestudio_TemperatureSensor from 'obniz/dist/src/parts/Keyestudio/Keyestudio_TemperatureSensor';

@Injectable()
export class ObnizService {
  obniz: Obniz;
  tempSensor: Keyestudio_TemperatureSensor;
  pirSensor: Keyestudio_PIR;
  buzzer: Keyestudio_Buzzer;

  constructor() {
    this.obniz = new Obniz('5822-0652');

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

      this.pirSensor.onchange = (value) => {
        if (value) {
          console.log('Movement detected');
          this.obniz.display.clear();
          this.obniz.display.print('Something is moving!');
        } else {
          console.log('no movement detected');
          this.obniz.display.clear();
          this.obniz.display.print('No movement detected!');
        }
      };

      this.obniz.onclose = () => {
        console.log('obniz is closed');
      };
    };
  }
}
