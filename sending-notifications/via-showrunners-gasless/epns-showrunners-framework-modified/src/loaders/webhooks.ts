

import config from '../config';
import { Container } from 'typedi';
import schedule from 'node-schedule';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { Router, Request, Response, NextFunction } from 'express';

import fs from 'fs';
const utils = require('../helpers/utilsHelper');
const webhookHelper = require('../helpers/webhookHelper');
const route = Router();

export default async ({ logger, app }) => {
  // WEBHOOK SERVICE
  logger.info(`    -- Checking and Loading Dynamic Webhooks...`);
  const channelFolderPath = `${__dirname}/../showrunners/`;
  const directories = utils.getDirectories(channelFolderPath);

  for (const channel of directories) {
    const absPath = `${channelFolderPath}${channel}/${channel}AWSSNS.${config.fileSuffix}`;
    const relativePath = `../showrunners/${channel}/${channel}AWSSNS.${config.fileSuffix}`;

    if (fs.existsSync(absPath)) {
      const webhook = await import(absPath);
      webhook.default(app);
      logger.info(`     ✔️  ${relativePath} Loaded!`);
    } else {
      logger.info(`     ❌  ${relativePath} Not Found... skipped`);
    }
  }
};
