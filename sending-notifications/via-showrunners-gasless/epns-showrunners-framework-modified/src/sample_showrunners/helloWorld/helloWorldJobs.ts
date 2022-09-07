// Do Scheduling
// https://github.com/node-schedule/node-schedule
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
// Execute a cron job every 5 Minutes = */5 * * * *
// Starts from seconds = * * * * * *

import config from '../../config';
import logger from '../../loaders/logger';

import { Container } from 'typedi';
import schedule from 'node-schedule';
import HelloWorldChannel from './helloWorldChannel';

export default () => {
  const startTime = new Date(new Date().setHours(0, 0, 0, 0));

  const fiveMinuteRule = new schedule.RecurrenceRule();

  fiveMinuteRule.minute = 5;

  const channel = Container.get(HelloWorldChannel);
  channel.logInfo(` 🛵 Scheduling Showrunner - ${channel.cSettings.name} Channel`);

  schedule.scheduleJob({ start: startTime, rule: fiveMinuteRule }, async function () {
    const taskName = `${channel.cSettings.name} event checks and helloWorld`;

    try {
      await channel.helloWorld(false);

      channel.logInfo(`🐣 Cron Task Completed -- ${taskName}`);
    } catch (err) {
      channel.logInfo(`❌ Cron Task Failed -- ${taskName}`);
      channel.logError(`Error Object: %o`);
      channel.logError(err);
    }
  });
};
