import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Obniz from 'obniz';
import Keyestudio_Buzzer from 'obniz/dist/src/parts/Keyestudio/Keyestudio_Buzzer';
import Keyestudio_PIR from 'obniz/dist/src/parts/Keyestudio/Keyestudio_PIR';
import Keyestudio_TemperatureSensor from 'obniz/dist/src/parts/Keyestudio/Keyestudio_TemperatureSensor';
import * as request from 'request';

const LINE_NOTIFY_URL = 'https://notify-api.line.me/api/notify';
const LINE_NOTIFY_TOKEN = 'NmUkAICo4h1OSEJ9V1oWZ913J2Hu3uFCCRBn2J0ruNH';

const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
};

const generateOptionsWithMessage = (message: string) => ({
  url: LINE_NOTIFY_URL,
  method: 'POST',
  headers: HEADERS,
  json: true,
  form: {
    message,
  },
});

@Injectable()
export class ObnizService {
  obniz?: Obniz;
  tempSensor?: Keyestudio_TemperatureSensor;
  pirSensor?: Keyestudio_PIR;
  buzzer?: Keyestudio_Buzzer;

  isTempMonitoring = false;
  tempMonitor?: NodeJS.Timer;
  minTempThreshold = 10;
  maxTempThreshold = 25;

  isPIRMonitoring = false;

  constructor(private configService: ConfigService) {}

  sendTestMessage() {
    request(LINE_NOTIFY_URL, generateOptionsWithMessage('Test Message'));
  }

  start() {
    if (this.obniz) {
      throw new Error('Obniz already running!');
    }

    try {
      this.obniz = new Obniz(this.configService.get('OBNIZ_ID'));
    } catch (error) {
      console.log('Error: ', error);
      throw error;
    }

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

  async stop() {
    if (!this.obniz) {
      throw new Error('Obniz already stopped!');
    }

    await this.obniz.closeWait();

    this.obniz = undefined;
    this.tempMonitor = undefined;
    this.pirSensor = undefined;
    this.buzzer = undefined;
  }

  get status(): string {
    if (!this.obniz) {
      return 'closed';
    }

    return this.obniz.connectionState;
  }

  get currentMonitoringStatus() {
    return this.isTempMonitoring ? 'enabled' : 'disabled';
  }

  get currentPirMonitoringStatus() {
    return this.isPIRMonitoring ? 'enabled' : 'disabled';
  }

  async getTemperature(): Promise<number> {
    if (!this.tempSensor) {
      throw new Error('Temperature sensor is not connected!');
    }

    const currentTemp = await this.tempSensor.getWait();

    return currentTemp;
  }

  startTempMonitoring() {
    if (this.isTempMonitoring || this.tempMonitor) {
      console.log('Temperature monitoring already started!');
      throw new Error('Temperature monitoring already started!');
    }

    if (!this.obniz) {
      console.log('obniz is not ready!');
      throw new Error('Obniz is not connected!');
    }

    console.log('Starting temperature monitoring...');

    try {
      this.isTempMonitoring = true;

      this.tempMonitor = setInterval(async () => {
        const currentTemp = await this.getTemperature();

        if (currentTemp < this.minTempThreshold) {
          const message = `Temperature is too low! Current temperature is ${currentTemp.toFixed(
            2,
          )} C. It should be at least ${this.minTempThreshold} C.`;
          console.log(message);
          this.obniz.display.clear();
          this.obniz.display.print(message);

          request(LINE_NOTIFY_URL, generateOptionsWithMessage(message));

          return;
        }

        if (currentTemp > this.maxTempThreshold) {
          const message = `Temperature is too high! Current temperature is ${currentTemp.toFixed(
            2,
          )} C. It should be at most ${this.maxTempThreshold} C.`;
          console.log(message);
          this.obniz.display.clear();
          this.obniz.display.print(message);

          request(LINE_NOTIFY_URL, generateOptionsWithMessage(message));

          return;
        }

        const message = 'Temperature is OK!';

        console.log(message);
        this.obniz.display.clear();
        this.obniz.display.print(message);

        // request(LINE_NOTIFY_URL, generateOptionsWithMessage(message));

        return;
      }, 10000);

      request(
        LINE_NOTIFY_URL,
        generateOptionsWithMessage('Temperature monitoring started!'),
      );

      console.log('Temperature monitoring started!');

      true;
    } catch (error) {
      this.isTempMonitoring = false;
      this.tempMonitor = undefined;
      console.log('Error: ', error);
      throw error;
    }
  }

  stopTempMonitoring() {
    if (!this.tempMonitor) {
      console.log('Temperature monitoring is not running.');
      throw new Error('Temperature monitoring is not running.');
    }

    console.log('stopping tempereature monitoring...');

    this.isTempMonitoring = false;
    clearInterval(this.tempMonitor);
    this.tempMonitor = undefined;

    console.log('Temperature monitoring stopped!');
    request(
      LINE_NOTIFY_URL,
      generateOptionsWithMessage('Temperature monitoring stopped!'),
    );
  }

  async buzz() {
    if (!this.buzzer) {
      throw new Error('Buzzer is not connected!');
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
    this.isPIRMonitoring = false;
  }

  enablePir() {
    if (!this.pirSensor || !this.obniz) {
      console.log('PIR sensor is not ready!');
      throw new Error('PIR sensor is not connected!');
    }

    if (this.pirSensor.onchange) {
      console.log('PIR sensor is already enabled!');
      throw new Error('PIR sensor is already enabled!');
    }

    console.log('Enabling PIR sensor...');

    this.pirSensor.onchange = (value) => {
      if (value) {
        const message = 'Movement Detected!';
        console.log(message);
        this.obniz.display.clear();
        this.obniz.display.print(message);
        request(LINE_NOTIFY_URL, generateOptionsWithMessage(message));
        this.buzz();
      } else {
        console.log('No movement detected');
        this.obniz.display.clear();
        this.obniz.display.print('No movement detected!');
        // TODO: Add API call to line to send a message
      }
    };

    this.isPIRMonitoring = true;

    console.log('PIR sensor enabled!');
  }
}
