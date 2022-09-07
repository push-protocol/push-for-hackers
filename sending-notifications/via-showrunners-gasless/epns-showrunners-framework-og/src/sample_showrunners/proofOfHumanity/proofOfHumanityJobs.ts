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
import ProofOfHumanityChannel from './proofOfHumanityChannel';



export default () => {
    const startTime = new Date(new Date().setHours(0, 0, 0, 0));

    const threeHourRule = new schedule.RecurrenceRule();
    threeHourRule.hour = new schedule.Range(0, 23, 3);
    threeHourRule.minute = 0;
    threeHourRule.second = 0;

    const sixHourRule = new schedule.RecurrenceRule();
    sixHourRule.hour = new schedule.Range(0, 23, 6);
    sixHourRule.minute = 0;
    sixHourRule.second = 0;


       
        logger.info('-- 🛵 Scheduling Showrunner - Proof Of Humanity Channel [on 3hr ]');
        schedule.scheduleJob({ start: startTime, rule: sixHourRule }, async function () {
            const poh: ProofOfHumanityChannel = Container.get(ProofOfHumanityChannel);
            const taskName = 'Proof of humanity Challenges Event Task checkChallenges()';
            try {
                await poh.checkChallenges(false);
                
                logger.info(`🐣 Cron Task Completed -- ${taskName}`);
            }
            catch (err) {
                logger.error(`❌ Cron Task Failed -- ${taskName}`);
                logger.error(`Error Object: %o`, err);
            }
        })


           
        logger.info('-- 🛵 Scheduling Showrunner - Proof Of Humanity Channel [on 3hr ]');
        schedule.scheduleJob({ start: startTime, rule: sixHourRule }, async function () {
            const poh: ProofOfHumanityChannel = Container.get(ProofOfHumanityChannel);
            const taskName = 'Proof of humanity Challenges for expiration checkForExpiration()';
            try {
               
                await poh.checkForExpiration(false);
              
                logger.info(`🐣 Cron Task Completed -- ${taskName}`);
            }
            catch (err) {
                logger.error(`❌ Cron Task Failed -- ${taskName}`);
                logger.error(`Error Object: %o`, err);
            }
        })




           
        logger.info('-- 🛵 Scheduling Showrunner - Proof Of Humanity Channel [on 3hr ]');
        schedule.scheduleJob({ start: startTime, rule: sixHourRule }, async function () {
            const poh: ProofOfHumanityChannel = Container.get(ProofOfHumanityChannel);
            const taskName = 'Proof of humanity Check recent evidences checkRecentEvidences()';
            try {
             
                await poh.checkRecentEvidences(false);
              
                logger.info(`🐣 Cron Task Completed -- ${taskName}`);
            }
            catch (err) {
                logger.error(`❌ Cron Task Failed -- ${taskName}`);
                logger.error(`Error Object: %o`, err);
            }
        })



           
        logger.info('-- 🛵 Scheduling Showrunner - Proof Of Humanity Channel [on 3hr ]');
        schedule.scheduleJob({ start: startTime, rule: sixHourRule }, async function () {
            const poh: ProofOfHumanityChannel = Container.get(ProofOfHumanityChannel);
            const taskName = 'Proof of humanity Removal Request Task removalRequestTask()';
            try {
             
                await poh.removalRequestTask(false);
                logger.info(`🐣 Cron Task Completed -- ${taskName}`);
            }
            catch (err) {
                logger.error(`❌ Cron Task Failed -- ${taskName}`);
                logger.error(`Error Object: %o`, err);
            }
        })


}