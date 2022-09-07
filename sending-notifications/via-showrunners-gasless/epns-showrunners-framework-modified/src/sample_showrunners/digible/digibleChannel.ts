import { Inject, Service } from 'typedi';
import config, { defaultSdkSettings } from '../../config';
import axios from 'axios';
import { Logger } from 'winston';
import { EPNSChannel, ISendNotificationParams } from '../../helpers/epnschannel';
import { ethers } from 'ethers';
import digiTradeABI from './digiTradeAbi.json';
import digiTrackABI from './digiTrackabi.json';
import digibleSettings from './digibleSettings.json';
import { digibleModel } from './digibleModel';
import ERC20ABI from './ERC20.json';

@Service()
export default class DigibleChannel extends EPNSChannel {
  constructor(@Inject('logger') public logger: Logger, @Inject('cached') private cached) {
    super(logger, {
      sdkSettings: {
        epnsCoreSettings: defaultSdkSettings.epnsCoreSettings,
        epnsCommunicatorSettings: defaultSdkSettings.epnsCommunicatorSettings,
        networkSettings: defaultSdkSettings.networkSettings,
      },
      networkToMonitor: config.web3PolygonMainnetRPC,
      dirname: __dirname,
      name: 'Digible',
      url: 'https://www.digible.io/',
      useOffChain: true,
    });
  }

  //Extracting the Data from the Model.ts file.
  async getLatestBlocksFromDB() {
    this.logInfo('Getting latest Block from db');
    const data = await digibleModel.findOne({ _id: 'digible_latest_block' });
    this.logInfo(`Data is ${data}`);
    return data;
  }

  //Get the Block Number previously saved for each of the events.
  async getBlockNumbers(simulate, contract: ethers.Contract) {
    this.logInfo(`Getting Block Numbers`);

    const blockDB = await this.getLatestBlocksFromDB();

    let fromBlockDigiTrack = simulate?.logicOverride?.mode
      ? simulate?.logicOverride?.fromBlock
      : blockDB.latestBlockForDigiTrackEvent ?? (await contract.provider.getBlockNumber());

    let fromBlockOfferRecieved = simulate?.logicOverride?.mode
      ? simulate?.logicOverride?.fromBlock
      : blockDB.latestBlockForOfferRecieved ?? (await contract.provider.getBlockNumber());

    let fromBlockOfferAccepted = simulate?.logicOverride?.mode
      ? simulate?.logicOverride?.fromBlock
      : blockDB.latestBlockForOfferAccepted ?? (await contract.provider.getBlockNumber());

    let fromBlockOfferCancelled = simulate?.logicOverride?.mode
      ? simulate?.logicOverride?.fromBlock
      : blockDB.latestBlockForOfferCancelled ?? (await contract.provider.getBlockNumber());

    let toBlock = simulate?.logicOverride?.mode
      ? simulate?.logicOverride?.toBlock
      : await contract.provider.getBlockNumber();

    const contractNumber = await contract.provider.getBlockNumber();

    this.logInfo('blockDB data from database', blockDB?.latestBlockForDigiTrackEvent);

    //Declaring or somewhat re-saving the imported Block Numbers
    const result = {
      fromBlockDigiTrack,
      fromBlockOfferRecieved,
      fromBlockOfferAccepted,
      fromBlockOfferCancelled,
      toBlock: toBlock,
    };
    return result;
  }

  // Use Case 2.1 (To alert user when the status of phygital is changed.)
  async getDigiTrackEvents(simulate) {
    try {
      this.logInfo('Fetching Bridging events - Digible Track');
      const sdk = await this.getSdk();
      const digibleContract = await sdk.getContract(
        digibleSettings.digiTrackContractAddressMainnet,
        JSON.stringify(digiTrackABI),
      );
      const filter = digibleContract.contract.filters.StatusUpdated();
      const blockNumbers = await this.getBlockNumbers(simulate, digibleContract.contract);
      if (blockNumbers.toBlock > blockNumbers.fromBlockDigiTrack) {
        const events = await digibleContract.contract.queryFilter(
          filter,
          blockNumbers.fromBlockDigiTrack,
          blockNumbers.toBlock,
        );
        for (const e of events) {
          try {
            const contract = await sdk.getContract(e.args.nftAddress, JSON.stringify(ERC20ABI));
            const name = await contract.contract.name();
            const newStatus = e.args[2];
            const tokenId = e.args[1];
            const title = `DigiTrack-Phygital Status Updated !!`;
            const payloadMsg = `DigiSafe status for ${name} has been updated to ${newStatus}`;
            const payloadTitle = `DigiTrack-Phygital Status Updated !!`;
            const message = `DigiSafe status for ${name} has been updated to ${newStatus}.`;
            const notificationType = 3;
            await this.sendNotification({
              recipient: e.args[3],
              title,
              message,
              payloadMsg,
              payloadTitle,
              cta: `https://www.digible.io/`,
              notificationType,
              simulate,
              image: null,
            });
          } catch (e) {
            this.logError(e);
          }
        }

        await digibleModel.findByIdAndUpdate(
          { _id: 'digible_latest_block' },
          { latestBlockForDigiTrackEvent: blockNumbers.toBlock },
          { upsert: true },
        );
      } else {
        this.logError('From block is greater than to block');
      }
    } catch (error) {
      this.logError(error);
    }
  }

  //Use Case 4.1 (To alert user that they received an offer on their NFT)
  async getofferRecieved(simulate) {
    try {
      this.logInfo('Fetching events - Offer Recieved');
      const sdk = await this.getSdk();
      const digibleContract = await sdk.getContract(
        digibleSettings.digiTradeContractAddressMainnet,
        JSON.stringify(digiTradeABI),
      );
      const filter = digibleContract.contract.filters.NewOffer();
      const blockNumbers = await this.getBlockNumbers(simulate, digibleContract.contract);
      if (blockNumbers.toBlock > blockNumbers.fromBlockOfferRecieved) {
        const events = await digibleContract.contract.queryFilter(
          filter,
          blockNumbers.fromBlockOfferRecieved,
          blockNumbers.toBlock,
        );
        for (const e of events) {
          try {
            const sendasset = await sdk.getContract(e.args[2][2], JSON.stringify(ERC20ABI));
            const sendassetname = await sendasset.contract.name();

            const contract = await sdk.getContract(e.args[2][0], JSON.stringify(ERC20ABI));
            const name = await contract.contract.name();

            const offerAmount = e.args[4];
            const offerId = e.args[0];
            const title = ` DigiTrade- Trade Offer Recieved!!`;
            const payloadMsg = `Heating up! You have received an offer on ${sendassetname} for ${offerAmount} ${name}.`;
            const payloadTitle = `DigiTrade-Trade offer recieved.`;
            const message = `Heating up! You have received an offer on ${sendassetname} for ${offerAmount} ${name}.`;
            const notificationType = 3;
            await this.sendNotification({
              recipient: e.args[1],
              title,
              message,
              payloadMsg,
              cta: `https://www.digible.io/`,
              payloadTitle,
              notificationType,
              simulate,
              image: null,
            });
          } catch (e) {
            this.logError(e);
          }
        }

        await digibleModel.findByIdAndUpdate(
          { _id: 'digible_latest_block' },
          { latestBlockForOfferRecieved: blockNumbers.toBlock },
          { upsert: true },
        );
      } else {
        this.logError('From block is greater than to block');
      }
    } catch (error) {
      this.logError(error);
    }
  }

  //Use Case 4.2 (To  alert user if their offer has been accepted)
  async getofferAccepted(simulate) {
    try {
      this.logInfo('Fetching events - Offer Accepted');
      const sdk = await this.getSdk();
      const digibleContract = await sdk.getContract(
        digibleSettings.digiTradeContractAddressMainnet,
        JSON.stringify(digiTradeABI),
      );
      const filter = digibleContract.contract.filters.TradeDone();
      const blockNumbers = await this.getBlockNumbers(simulate, digibleContract.contract);
      if (blockNumbers.toBlock > blockNumbers.fromBlockOfferAccepted) {
        const events = await digibleContract.contract.queryFilter(
          filter,
          blockNumbers.fromBlockOfferAccepted,
          blockNumbers.toBlock,
        );
        for (const e of events) {
          try {
            const sendasset = await sdk.getContract(e.args[2][2], JSON.stringify(ERC20ABI));
            const sendassetname = await sendasset.contract.name();

            const contract = await sdk.getContract(e.args[2][0], JSON.stringify(ERC20ABI));
            const name = await contract.contract.name();

            const offerAmount = e.args[4];
            const offerId = e.args[0];
            const title = ` DigiTrade-Trade Offer Accepted!!`;
            const payloadMsg = `Congratulations! Your offer for ${sendassetname} for ${offerAmount} ${name} has been accepted!`;
            const payloadTitle = ` DigiTrade-Trade offer accepted.`;
            const message = `Congratulations! Your offer for ${sendassetname} for ${offerAmount} ${name} has been accepted!`;
            const notificationType = 3;
            await this.sendNotification({
              recipient: e.args[1],
              title,
              message,
              payloadMsg,
              cta: `https://www.digible.io/`,
              payloadTitle,
              notificationType,
              simulate,
              image: null,
            });
          } catch (e) {
            this.logError(e);
          }
        }

        await digibleModel.findByIdAndUpdate(
          { _id: 'digible_latest_block' },
          { latestBlockForOfferAccepted: blockNumbers.toBlock },
          { upsert: true },
        );
      } else {
        this.logError('From block is greater than to block');
      }
    } catch (error) {
      this.logError(error);
    }
  }

  // Use Case 4.3 (To  alert user if their offer has been cancelled)
  async getofferCancelled(simulate) {
    try {
      this.logInfo('Fetching events - Offer Cancelled');
      const sdk = await this.getSdk();
      const digibleContract = await sdk.getContract(
        digibleSettings.digiTradeContractAddressMainnet,
        JSON.stringify(digiTradeABI),
      );
      const filter = digibleContract.contract.filters.CxlOffer();
      const blockNumbers = await this.getBlockNumbers(simulate, digibleContract.contract);
      if (blockNumbers.toBlock > blockNumbers.fromBlockOfferCancelled) {
        const events = await digibleContract.contract.queryFilter(
          filter,
          blockNumbers.fromBlockOfferCancelled,
          blockNumbers.toBlock,
        );
        for (const e of events) {
          try {
            const sendasset = await sdk.getContract(e.args[2][2], JSON.stringify(ERC20ABI));
            const sendassetname = await sendasset.contract.name();

            const contract = await sdk.getContract(e.args[2][0], JSON.stringify(ERC20ABI));
            const name = await contract.contract.name();

            const offerAmount = e.args[4];
            const offerId = e.args[0];
            const title = `DigiTrade-Trade Offer Cancelled !`;
            const payloadMsg = `Your offer for ${sendassetname} for ${offerAmount} ${name} has been canceled.`;
            const payloadTitle = `DigiTrade-Trade offer cancelled !`;
            const message = `Your offer for ${sendassetname} for ${offerAmount} ${name} has been canceled.`;
            const notificationType = 3;
            await this.sendNotification({
              recipient: e.args[1],
              title,
              message,
              payloadMsg,
              payloadTitle,
              cta: `https://www.digible.io/`,
              notificationType,
              simulate,
              image: null,
            });
          } catch (e) {
            this.logError(e);
          }
        }

        await digibleModel.findByIdAndUpdate(
          { _id: 'digible_latest_block' },
          { latestBlockForOfferCancelled: blockNumbers.toBlock },
          { upsert: true },
        );
      } else {
        this.logError('From block is greater than to block');
      }
    } catch (error) {
      this.logError(error);
    }
  }
}
