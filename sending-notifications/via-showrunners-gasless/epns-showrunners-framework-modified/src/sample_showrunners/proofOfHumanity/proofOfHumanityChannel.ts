import { Inject, Service } from 'typedi';
import config, { defaultSdkSettings } from '../../config';

import { request, gql } from 'graphql-request';
import proofOfHumanitySettings from './proofOfHumanitySettings.json';
import proofOfHumanityABI from './proofOfHumanity.json';

import { Contract } from '@ethersproject/contracts';
import { BaseProvider } from '@ethersproject/providers';
import { SubmissionModel } from './proofOfHumanityModel';
import { EPNSChannel } from '../../helpers/epnschannel';
import { Logger } from 'winston';
import { IPOHSchema, POHModel } from './pohCacheModel';
import { ethers } from 'ethers';

interface Challenge {
  reason: string;
  id: string;
  creationTime: string;
  challenger: string;
  requestor: string;
}

interface POHContractState {
  submissionDuration: number;
}

interface Evidence {
  id: string;
  creationTime: string;
  URI: string;
  sender: string;
  request: Request;
}

interface Request {
  submission: Submission;
  id: string;
  type: string;
  requestor: string;
  arbitrator: string;
}

export interface Submission {
  id: string;
  submissionTime: number;
  creationTime: number;
  name: string;
  registered: boolean;
  status: string;
}

enum UseCase {
  RemovalRequest,
}

@Service()
export default class ProofOfHumanityChannel extends EPNSChannel {
  GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet';

  newChallengesQuery(savedCreationTime) {
    return gql`
      {
        challenges(where: { creationTime_gte: ${savedCreationTime} }) {
          reason
          id
          creationTime
          requester
          challenger
        }
      }
    `;
  }

  getEvidenceQuery(savedEvidenceTimestamp) {
    return gql`
      {
        evidences(where: { creationTime_gte: ${savedEvidenceTimestamp}}) {
          creationTime
          request {
            id
            submission {
              id
              name
              submissionTime
            }
            requester
            type
            arbitrator
          }
          id
          URI
          sender
        }
      }
    `;
  }

  getSubmissionQuery(id: string) {
    return gql`
    {
      submission(id:${id}){
        creationTime
        id
        status
        registered
        submissionTime
        name
      }
    }
  `;
  }

  get contractQuery() {
    return gql`
      {
        contracts {
          submissionDuration
        }
      }
    `;
  }

  profileQueryById(id: string) {
    return gql`{
      submission(id:"${id}"){
          id
          submissionTime
          creationTime
          status
          registered
          name
        }
    }`;
  }

  constructor(@Inject('logger') public logger: Logger, @Inject('cached') public cached) {
    super(logger, {
      sdkSettings: {
        epnsCoreSettings: defaultSdkSettings.epnsCoreSettings,
        epnsCommunicatorSettings: defaultSdkSettings.epnsCommunicatorSettings,
        networkSettings: defaultSdkSettings.networkSettings,
      },
      networkToMonitor: config.web3MainnetNetwork,
      dirname: __dirname,
      name: 'Proof Of Humanity',
      url: 'https://www.proofofhumanity.id/',
      useOffChain: true,
    });
  }

  public async checkChallenges(simulate) {
    try {
      let challenges: Challenge[];
      if (simulate?.logicOverride?.mode) {
        this.logInfo('Running in simulation mode');
        challenges = simulate.challenges;
      } else {
        const doc = await this.getPOHDataFromDB();
        if (!doc?.savedChallengeTimestamp) this.logInfo(`Created timestamp doesnt exist on db using timestamp.now`);
        challenges = await this.fetchRecentChallenges(doc?.savedChallengeTimestamp ?? this.timestamp);
      }

      if (!challenges || challenges.length == 0) {
        console.log('No challenges in this time period');
        return;
      }

      const sdk = await this.getSdk();
      this.logInfo('Fetching subscribed users');
      const users = await sdk.getSubscribedUsers();
      this.logInfo('Finished fetching subscribed users');

      this.logInfo('Sending out notifications');

      for (const e of challenges) {
        try {
          if (users.includes(e.requestor) || simulate?.logicOverride) {
            const message = `Your profile has been challenged`;

            const payloadMsg = `Your profile has been challenged\n\nChallenger : [s:${e.challenger}]\nReason : [d:${
              e?.reason ?? 'Not mentioned'
            }]`;

            await this.sendNotification({
              recipient: e.requestor,
              title: 'New Challenge',
              payloadTitle: 'New Challenge',
              message: message,
              payloadMsg: payloadMsg,
              cta: `https://app.proofofhumanity.id/profile/${e.requestor}`,
              image: '',
              notificationType: 3,
              simulate: simulate,
            });
          }
        } catch (error) {
          this.logger.error(error);
        }
      }
      await this.setPOHDataInDB({ savedChallengeTimestamp: this.timestamp });
    } catch (error) {
      this.logError(error);
    }
  }

  public async removalRequestTask(simulate) {
    try {
      const logger = this.logger;
      logger.info('Removal Request Task');

      let sdk = await this.getSdk();
      let poh = await sdk.getContract(
        proofOfHumanitySettings.proofOfHumanityDeployedContract,
        JSON.stringify(proofOfHumanityABI),
      );
      let blockNos = await this.getBlockNumbers(simulate, poh.contract, UseCase.RemovalRequest);

      let removalRequests;
      if (simulate?.logicOverride && simulate?.removalRequests) {
        this.logInfo('Running in simulation mode');
        removalRequests = simulate.removalRequests;
      } else {
        removalRequests = await this.fetchRecentRemovalRequests(poh, blockNos.fromBlock, blockNos.toBlock);
      }

      const users = await sdk.getSubscribedUsers();

      for (const e of removalRequests.log) {
        try {
          if (users.includes(e.args[1]) || simulate?.logicOverride) {
            const title = 'Removal Request';
            const msg = `A [d:removal request] has been submitted by [d:${e.args[0]}] for your profile`;
            await this.sendNotification({
              recipient: e.args[1],
              notificationType: 3,
              title: title,
              message: msg,
              payloadTitle: title,
              payloadMsg: msg,
              cta: `https://app.proofofhumanity.id/profile/${e.args[1]}`,
              image: null,
              simulate: simulate,
            });
          }
        } catch (error) {
          this.logger.error(error);
        }
      }

      await this.setPOHDataInDB({ removalRequestBlockNo: blockNos.toBlock });

      logger.info('Finished sending notifications');
    } catch (error) {
      this.logger.error(error);
    }
  }

  // Checks for profile Expiration and Sends notification to users
  // Whose Profile is about to be expired
  async checkForExpiration(simulate) {
    try {
      const sdk = await this.getSdk();
      this.logInfo('getting submission duration');
      let submissionDuration = (await this.fetchContractDetails()).submissionDuration;
      this.logInfo(`submission duration : ${submissionDuration}`);

      this.logInfo('getting subscribed users');
      let users = simulate?.logicOverride ? simulate?.users : await sdk.getSubscribedUsers();

      this.logInfo('sending out notifications');

      for (const u of users) {
        try {
          let profile: Submission = simulate?.logicOverride
            ? simulate?.submissions[0]
            : await this.fetchProfileDataById(u);

          if (profile) {
            let timeNow = Date.now() / 1000;
            let expireStamp: number = ((profile.submissionTime as number) + submissionDuration) as number;
            console.log(typeof profile.submissionTime, typeof submissionDuration);
            let expiresInSeconds = expireStamp - timeNow;
            let expiresInHours = simulate.logicOverride ? simulate.expiresInHours : (expiresInSeconds / 3600).toFixed();

            this.logInfo(
              `profile.submissionTime = ${profile.submissionTime} submissionDuration=${submissionDuration} timeNow = ${timeNow} expireStamp = ${expireStamp} expiresInSeconds =${expiresInSeconds}`,
            );
            if (simulate?.logicOverride || (profile && expiresInSeconds > 0 && expiresInSeconds < 2 * 86400)) {
              const title = 'Profile Expiry';
              const msg = `Your profile is about to expire in ${expiresInHours} hours`;
              const payloadMsg = `Your profile is about to [d:expire] in [d:${expiresInHours}] hours`;

              this.sendNotification({
                recipient: u,
                title: title,
                payloadMsg: payloadMsg,
                payloadTitle: title,
                message: msg,
                image: null,
                cta: 'https://proofofhumanity.id',
                simulate: simulate,
                notificationType: 3,
              });
            }
          }
        } catch (error) {
          this.logError(error);
        }
      }

      this.logInfo('Expiration task completed');
      return { success: true };
    } catch (error) {
      this.logError(error);
    }
  }

  // Check if profiles are accepted
  //
  async checkForAcceptedProfiles(simulate) {
    try {
      const sdk = await this.getSdk();
      this.logInfo('getting submission duration');
      let submissionDuration = (await this.fetchContractDetails()).submissionDuration;
      this.logInfo(`submission duration : ${submissionDuration}`);

      this.logInfo('getting subscribed users');
      if (simulate?.logicOverride) this.logInfo(`Running in simulation mode forceSend:${simulate?.forceSend}`);
      let users = simulate?.logicOverride ? simulate?.users : await sdk.getSubscribedUsers();

      this.logInfo('sending out notifications');

      for (const u of users) {
        try {
          let profile = simulate?.logicOverride ? simulate?.submissions[0] : await this.fetchProfileDataById(u);
          this.logInfo(profile);

          if (profile) {
            // Fetching profile data of user from DB
            this.logInfo('Fetching Profile Data Of User From DB');
            let profileFromDb = await SubmissionModel.findOneAndUpdate({ _id: u }, profile, { upsert: true });
            this.log(profileFromDb ?? 'Profile Not In DB');
            const userRegisteredAndInsideSubmissionPeriod =
              Date.now() / 1000 - profile.submissionTime < submissionDuration && profile.registered;
            const stateChanged: boolean = profileFromDb && !profileFromDb.registered;
            this.logInfo(
              `userRegisteredAndInsideSubmissionPeriod : ${userRegisteredAndInsideSubmissionPeriod} stateChanged: ${stateChanged}`,
            );
            if (simulate?.forceSend || (userRegisteredAndInsideSubmissionPeriod && !stateChanged)) {
              this.logInfo('Sending Notification');
              const title = 'Profile Accepted';
              const payloadMsg = 'Your profile has been [d:accepted]';
              const msg = 'Your profile has been accepted';

              await this.sendNotification({
                recipient: u,
                notificationType: 3,
                title: title,
                payloadTitle: title,
                message: msg,
                payloadMsg: payloadMsg,
                image: null,
                simulate: simulate,
              });
            }
          } else {
            this.logInfo('User dont have a profile Aborting..');
          }
        } catch (error) {
          this.logger.error(error);
          return error;
        }
      }

      this.logInfo('Profile acceptance task completed');
      return { success: true };
    } catch (error) {
      this.logError(error);
    }
  }

  // Checks for profile Expiration and Sends notification to users
  // Whose Profile is about to be expired
  async checkRecentEvidences(simulate) {
    this.logInfo('Check recent evidences');
    try {
      const doc = await this.getPOHDataFromDB();
      if (!doc?.savedEvidenceTimestamp) this.logInfo(`Evidence timestamp doesnt exist on db using timestamp.now`);
      let evidences: Evidence[] = simulate?.logicOverride
        ? simulate?.evidences
        : await this.fetchEvidences(doc?.savedEvidenceTimestamp ?? this.timestamp);
      for (const e of evidences) {
        let title = 'New Evidence Submitted';
        let msg = `New evidence has been submitted for a challenge your are involved`;
        const payloadMsg = `New evidence has been submitted for a challenge your are involved\n\nRequest ID : [d:${e.id}]`;
        this.logInfo('Sending notification to evidence provider');

        // Notificatin to the evidence sender
        await this.sendNotification({
          recipient: e.sender,
          title: title,
          message: msg,
          payloadTitle: title,
          payloadMsg: payloadMsg,
          notificationType: 3,
          cta: 'https://proofofhumanity.id',
          image: null,
          simulate: simulate,
        });

        this.logInfo('Sending notification to requestor');

        // Notificatin to the requestor
        await this.sendNotification({
          recipient: e.request.requestor,
          title: title,
          message: msg,
          payloadTitle: title,
          payloadMsg: payloadMsg,
          notificationType: 3,
          cta: 'https://proofofhumanity.id',
          image: null,
          simulate: simulate,
        });

        this.logInfo('Sending notification to submission owner');
        // Notificatin to the submission owner
        await this.sendNotification({
          recipient: e.request.submission.id,
          title: title,
          message: msg,
          payloadTitle: title,
          payloadMsg: payloadMsg,
          notificationType: 3,
          cta: 'https://proofofhumanity.id',
          image: null,
          simulate: simulate,
        });
      }
    } catch (error) {
      this.logError(error);
      return { success: false };
    }

    await this.setPOHDataInDB({ savedEvidenceTimestamp: this.timestamp });

    return { success: true };
  }

  //
  //
  // Helpers
  //
  //
  async getBlockNumbers(simulate, contract: ethers.Contract, option: UseCase) {
    this.logInfo(`Getting Block Numbers option: ${option}`);
    const pohData = await this.getPOHDataFromDB();
    let blockFromDB;
    this.logInfo(`Got option : ${option}`);
    // const blockFromDB = option == 1 ? pohData?.poolProgramAddeddBlockNo : pohData?.newTokenListingBlockNo;
    switch (option) {
      case UseCase.RemovalRequest:
        this.logInfo(`Removal Request mode for block No`);
        blockFromDB = pohData?.removalRequestBlockNo;
        break;

      default:
        blockFromDB = pohData?.removalRequestBlockNo;
        break;
    }

    let fromBlock = simulate?.logicOverride?.mode ? simulate?.logicOverride?.fromBlock : blockFromDB ?? 'latest';

    let toBlock = simulate?.logicOverride?.mode
      ? simulate?.logicOverride?.toBlock
      : await contract.provider.getBlockNumber();

    const result = {
      fromBlock: fromBlock,
      toBlock: toBlock,
    };
    this.log(result);
    return result;
  }

  // Get POH Data From DB
  async getPOHDataFromDB() {
    this.logInfo(`Getting POH Data from DB..`);
    const doc = await POHModel.findOne({ _id: 'POH_DATA' });
    this.logInfo(`POH Data obtained`);
    this.log(doc);
    return doc;
  }
  // Set POH Data in DB
  async setPOHDataInDB(pohData: IPOHSchema) {
    this.logInfo(`Setting POH Data In DB`);
    this.log(pohData);
    await POHModel.findOneAndUpdate({ _id: 'POH_DATA' }, pohData, { upsert: true });
  }

  //
  //
  // FETCH TASKS
  //
  //

  // Fetches the recent challenge in the nearest time frame from POH subgraph
  //
  async fetchRecentChallenges(savedCreationTimestamp): Promise<Challenge[]> {
    this.logInfo(`Fetching Recent Challenges`);
    let result = await request(this.GRAPH_URL, this.newChallengesQuery(savedCreationTimestamp));
    return result.challenges;
  }

  // Fetch contract state from subgraph
  async fetchContractDetails(): Promise<POHContractState> {
    this.logInfo(`Fetching Contract State`);
    let result = await request(this.GRAPH_URL, this.contractQuery);
    this.logInfo(`Contract state fetched 
`);

    this.logInfo(result);
    let final = result['contracts'][0];
    final.submissionDuration = parseInt(final.submissionDuration);
    return final;
  }

  // Get data of a submission
  async fetchProfileDataById(id: string): Promise<Submission> {
    this.logInfo(`Fetching Profile Data for user ${id}`);
    let result;
    try {
      result = await request(this.GRAPH_URL, this.profileQueryById(id));
      this.logInfo(result?.submission ?? 'The user dont have a profile');
    } catch (error) {
      this.logger.error(error);
    }

    return result?.submission;
  }

  // Fetch recent removal requests in a givern time period
  async fetchRecentRemovalRequests(
    poh: {
      provider: BaseProvider;
      contract: Contract;
      signingContract: Contract;
    },
    fromBlock,
    toBlock,
  ) {
    const filter = poh.contract.filters.RemoveSubmission();
    try {
      this.logInfo(`Fetching Recent Removal Requests fromBlock : ${fromBlock} toBlock: ${toBlock}`);
      const events = await poh.contract.queryFilter(filter, fromBlock, toBlock);
      this.logInfo('Events Fetched Successfully');
      return {
        change: true,
        log: events,
        blockChecker: fromBlock,
        lastBlock: toBlock,
        eventCount: events,
      };
    } catch (err) {
      this.logger.error(err);
      return {
        success: false,
        err: 'Unable to obtain query filter, error : %o' + err,
      };
    }
  }

  // Fetch Evidence from subgraph
  //
  async fetchEvidences(savedEvidenceTimestamp): Promise<Evidence[]> {
    this.logInfo('Fetching evidences from subgraph');
    let result;
    try {
      result = await request(this.GRAPH_URL, this.getEvidenceQuery(savedEvidenceTimestamp));
    } catch (error) {
      this.logger.error(error);
      console.log(error);
    }

    return result?.evidences;
  }

  // Fetch Evidence from subgraph
  //
  async fetchSubmission(id: string): Promise<Evidence[]> {
    this.logInfo('Fetching evidences from subgraph');
    let result;
    try {
      result = await request(this.GRAPH_URL, this.getSubmissionQuery(id));
    } catch (error) {
      this.logger.error(error);
      throw error;
    }

    return result.evidences;
  }
}
