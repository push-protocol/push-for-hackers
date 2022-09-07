import { Service, Inject, Container } from 'typedi';
import config from '../config';

import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import EmailService from './emailService';
import { BigNumber, ethers, logger, Wallet } from 'ethers';

const NETWORK_TO_MONITOR = config.web3RopstenNetwork;
const ETHER_TRANSFER_AMOUNT = String(config.etherTransferAmount);
const ETH_THRESHOLD = Number(config.ethThreshold);
const ETH_MAIN_THRESHOLD = Number(config.ethMainThreshold);
const provider = ethers.getDefaultProvider(NETWORK_TO_MONITOR, {
      etherscan: (config.etherscanAPI ? config.etherscanAPI : null),
      infura: (config.infuraAPI ? {projectId: config.infuraAPI.projectID, projectSecret: config.infuraAPI.projectSecret} : null),
      alchemy: (config.alchemyAPI ? config.alchemyAPI : null),
});

let WALLETS = {};

Object.entries(config.showrunnerWallets).forEach(([key, value]) => {
  Object.entries(value).forEach(([keyShowrunner, valueShowrunner]) => {
    WALLETS[`${key}_${keyShowrunner}`] = { wallet: new Wallet(valueShowrunner, provider) }
  })
});

const MAIN = new Wallet(config.masterWallet, provider)

@Service()
export default class WalletTrackerChannel {
  constructor(
    @Inject('logger') private logger,
    @Inject('cached') private cached,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {
  }

  public async processWallets(simulate) {
    const cache = this.cached;
    const logger = this.logger;
    const TransferPromise = []

    for (const [name, value] of Object.entries(WALLETS)) {
      logger.info(`checking balance for ${name} wallet..`);
      const balance = ethers.utils.formatEther(await provider.getBalance(value.wallet.address))
      logger.info(`balance for ${name} wallet is ${balance.toString()}: threshold is ${ETH_THRESHOLD}..`);
      if (Number(balance.toString()) < ETH_THRESHOLD) {
        TransferPromise.push(this.transfertoWallet(simulate, name, value.wallet))
      }
    }
    logger.info(`done with all wallets..`);
    return Promise.all(TransferPromise);
  }

  public async transfertoWallet(simulate, name, wallet): Promise<ethers.providers.TransactionReceipt> {
    const logger = this.logger;
    logger.info(`transferring from main wallet to ${name} wallet..`);
    if (simulate) {
      logger.info(`
        {
          to: ${wallet.address},
          value: ${ethers.utils.parseEther(ETHER_TRANSFER_AMOUNT)}
        };
      `);
    } else {
      let tx = {
        to: wallet.address,
        value: ethers.utils.parseEther(ETHER_TRANSFER_AMOUNT)
      };
      const transaction = await MAIN.sendTransaction(tx);
      return transaction.wait();
    }
  }

  public async processMainWallet(simulate) {
    const cache = this.cached;
    const logger = this.logger;
    logger.info(`checking balance for main ETH wallet..`);
    const balance = ethers.utils.formatEther(await provider.getBalance(MAIN.address))
    let result = null;
    if (Number(balance.toString()) < ETH_MAIN_THRESHOLD) {
      const email = Container.get(EmailService);
      logger.info(`You've got mail: Main ETH Wallet: ${MAIN.address} balance is below threshold at ${balance}`);
      if(simulate) return result
      result = await email.sendMailSES(config.supportMailAddress, "Wallet Monitoring Bot", "Wallet Expiry", "Low Wallet Balance", `Main ETH Wallet: ${MAIN.address} balance is below threshold at ${balance}`);
    }
    return result
  }
}
