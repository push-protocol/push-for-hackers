import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import fs from 'fs';

import config from '../config';

import logger from './logger';

import mongooseLoader from './mongoose';
import jobsLoader from './jobs';
import webhooksLoader from './webhooks';
import dbLoader from './db';
import dbListenerLoader from './dbListener';
const utils = require('../helpers/utilsHelper');


export default async ({ expressApp }) => {
  logger.info('✌️   Injecting dependencies loaders');

  //require db models from all channel folders
  function loadDBModels(){
    logger.info(`    -- Checking DB Models...`);
    const channelFolderPath = `${__dirname}/../showrunners/`
    const directories = utils.getDirectories(channelFolderPath)
    let channelModels = []

    for (const channel of directories) {
      const absPath = `${channelFolderPath}${channel}/${channel}Model.${config.fileSuffix}`
      const relativePath = `../showrunners/${channel}/${channel}Model.${config.fileSuffix}`

      if (fs.existsSync(absPath)) {
        const object = require(absPath).default
        channelModels.push({
          name: `${channel}Model`,
          model: object
        })
        logger.info(`     ✔️  ${relativePath} Found!`)
      }
      else {
        logger.info(`     ❌  ${relativePath} Not Found... skipped`)
      }
    }
    return channelModels;
  } 
  const models = loadDBModels()

  // It returns the agenda instance because it's needed in the subsequent loaders
  await dependencyInjectorLoader({ models });
  logger.info('✔️   Dependency Injector loaded');

  const mongoConnection = await mongooseLoader();
  logger.info('✔️   Mongoose Loaded and connected!');

  const pool = await dbLoader();
  logger.info('✔️   Database connected!');
  logger.info('✌️   Loading DB Events listener');
  await dbListenerLoader({ pool, logger });
  logger.info('✔️   DB Listener loaded!');

  logger.info('✌️   Loading jobs');
  try{
    await jobsLoader({ logger });
  }catch(err){
    console.log("\n\n\n\n\n\n\n")
    console.log('xandeerr')
    console.log(err)
    console.log("\n\n\n\n\n\n\n")
  }
  logger.info('✔️   Jobs loaded');

  logger.info('✌️   Loading webhooks');
  try{
    await webhooksLoader({ logger, app: expressApp });
  }catch(err){
    logger.error(`❌   Error while loading webhooks: ${err}`);
  }
  logger.info('✔️   Webhooks loaded');


  await expressLoader({ app: expressApp });
  logger.info('✔️   Express loaded');
};
