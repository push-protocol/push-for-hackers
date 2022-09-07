import { Router } from 'express';
import LoggerInstance from '../loaders/logger';
import config from '../config'

import fs from 'fs';
const utils = require('../helpers/utilsHelper');


//import mailing from './routes/mailing';

// guaranteed to get dependencies
export default () => {
	const app = Router();

	// -- SHOWRUNNERS ROUTES
	LoggerInstance.info(`    -- Checking and Loading Dynamic Routes...`);
	const channelFolderPath = `${__dirname}/../showrunners/`
	const directories = utils.getDirectories(channelFolderPath)

  for (const channel of directories) {
    const absPath = `${channelFolderPath}${channel}/${channel}Routes.${config.fileSuffix}`
    const relativePath = `../showrunners/${channel}/${channel}Routes.${config.fileSuffix}`

    if (fs.existsSync(absPath)) {
      const cronning = require(absPath)
      cronning.default(app);

      LoggerInstance.info(`     ✔️  ${relativePath} Loaded!`)
    }
    else {
      LoggerInstance.info(`     ❌  ${relativePath} Not Found... skipped`)
    }
  }

  //WALLET MONITORING ROUTES
  LoggerInstance.info(`    -- Checking and Loading Wallet Monitoring Routes...`);
  const absPath = `${__dirname}/routes/walletMonitoringRoutes.${config.fileSuffix}`
  const relativePath = `./routes/walletMonitoringRoutes.${config.fileSuffix}`
  const FLAG = Number(config.walletMonitoring);

    if (FLAG === 1) {
      LoggerInstance.info(`     ✔️  Wallet Monitoring is ${FLAG}`)
      try{
        const cronning = require(absPath)
        cronning.default(app);

        LoggerInstance.info(`     ✔️  ${relativePath} Loaded!`)
      }catch(err){
        LoggerInstance.info(`     ❌  Aborting - Wallet Monitoring requires Master Wallet private key. Include 'MASTER_WALLET_PRIVATE_KEY' or change 'WALLET_MONITORING' to 0 in the env file`)
        process.exit(1)
      }
    }
    else if (FLAG === 0){
      LoggerInstance.info(`     ❌  Wallet Monitoring is ${FLAG}... ${relativePath} skipped`)
    }


	// -- HELPERS
	// For mailing route
	//mailing(app);

	// Finally return app
	return app;
}
