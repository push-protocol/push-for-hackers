import fs from 'fs';
import cryptoHelper from '../helpers/cryptoHelper';
import LoggerInstance from '../loaders/logger';
const utils = require('../helpers/utilsHelper');

// Loads wallets using the private keys present in each folder
// Scans for channelNameKeys.json file in the channel directory 
// Loads the private key and add the keys to channlKeys
const channelWallets = function loadShowrunnersWallets() {
  LoggerInstance.info(`    -- Checking and Loading Dynamic Channel Keys...`);
  const channelFolderPath = `${__dirname}/../showrunners/`;
  const directories = utils.getDirectories(channelFolderPath);

  let channelKeys = {};
  let keys = {};

  if (directories.length == 0) {
    LoggerInstance.info(
      `     ❌  showrunners doesn't have any channel folder in src/showrunners! Check docs.epns.io to see how to setup showrunners properly!`,
    );
    process.exit(1);
  }

  for (const channel of directories) {
    const absPath = `${channelFolderPath}${channel}/${channel}Keys.json`;
    const relativePath = `../showrunners/${channel}/${channel}Keys.json`;

    if (fs.existsSync(absPath)) {
      const object = require(absPath);
      let count = 1;

      channelKeys[`${channel}`] = {};

      for (const [key, value] of Object.entries(object)) {
        // check and decide old standard or not
        const isOldStandard = (typeof value === 'string' || value instanceof String) ? true : false;
        const pkey = isOldStandard ? value : value.PK;

        const result = cryptoHelper.checkPrivateKeyValidity(pkey);

        if (result) {
          channelKeys[`${channel}`][`wallet${count}`] = value;
          count++;
        } else {
          LoggerInstance.info(`         ⚠️  ${key} -> ${value} is invalid private key, skipped`);
        }
      }

      if (Object.keys(channelKeys[`${channel}`]).length) {
        LoggerInstance.info(`     ✔️  ${channel} Loaded ${Object.keys(channelKeys[`${channel}`]).length} Wallet(s)!`);
      } else {
        LoggerInstance.info(
          `     ❌  ${channel} has no wallets attached to them... aborting! Check ${channel}Keys.json!!!`,
        );
        process.exit(1);
      }
    } else {
      LoggerInstance.info(
        `     ❌  ${channel}Keys.json does not exists. aborting! Create ${channel}Keys.json and add one wallet to it!!!`,
      );
      process.exit(1);
    }
  }

  return channelKeys;
};

export default channelWallets;
