import { Service, Inject } from 'typedi';
import config, { defaultSdkSettings, settings } from '../../config';
import { EPNSChannel } from '../../helpers/epnschannel';
import { Logger } from 'winston';
import { request, gql } from 'graphql-request';
import ensSettings from './ensSettings.json';
const NETWORK_TO_MONITOR = config.web3MainnetNetwork;
const TRIGGER_THRESHOLD_SECS = 60 * 60 * 24 * 7; // 7 Days

interface Registration {
  id: string;
  domain: {
    id: string;
    name: string;
    owner: {
      id: string;
    };
  };
  registrationDate: BigInt;
  expiryDate: number;
  cost: BigInt;
  registrant: {
    id: string;
  };
  labelName: String;
}
@Service()
export default class EnsExpirationChannel extends EPNSChannel {
  constructor(@Inject('logger') public logger: Logger) {
    super(logger, {
      sdkSettings: {
        epnsCoreSettings: defaultSdkSettings.epnsCoreSettings,
        epnsCommunicatorSettings: defaultSdkSettings.epnsCommunicatorSettings,
        networkSettings: defaultSdkSettings.networkSettings,
      },
      networkToMonitor: NETWORK_TO_MONITOR,
      dirname: __dirname,
      name: 'ENS',
      url: 'https://ens.domains/',
      useOffChain: true,
      address: '0x983110309620D911731Ac0932219af06091b6744',
    });
  }

  async checkDomainExpiryTask(simulate) {
    this.logInfo(`checkDomainExpiryTask`);
    const sdk = await this.getSdk();
    const users = simulate?.logicOverride?.mode ? [simulate?.logicOverride?.user] : await sdk.getSubscribedUsers();

    for (let user of users) {
      user = user.toLowerCase();
      const regs = await this.getUserRegistredDomains(user);

      for (const reg of regs) {
        await this.processRegistration(reg, simulate);
      }
    }
  }

  async getUserRegistredDomains(user: string): Promise<Registration[]> {
    this.logInfo(`get user registred domains for ${user}`);
    const query = gql`{
      registrations(where:{registrant:"${user}"}){
        id
       labelName
        expiryDate
        registrant{
          id
        }
        domain {
          id
          name
          owner {
            id
          }
        }
      }
    }`;

    let res = await request(ensSettings.ensEndpoint, query);
    let registrations = res?.registrations;

    return registrations;
  }

  async processRegistration(reg: Registration, simulate) {
    this.logInfo(`processRegistration`);
    const secDiff = reg.expiryDate - Math.floor(Date.now() / 1000);
    const expiresInDays = Math.floor(secDiff / (60 * 60 * 24));
    this.logInfo(`Domain Expires in ${expiresInDays}`);

    if (secDiff < TRIGGER_THRESHOLD_SECS && secDiff >= 0) {
      this.logInfo(`secDiff < TRIGGER_THRESHOLD_SECS sendingNotif for ${reg.domain.name}`);


      const message = `Your ENS Domain ${reg.domain.name} is set to expire ${
        expiresInDays > 0 ? `in ${expiresInDays} day(s)` : `today`
      }.`;

      const payloadMsg = `Your ENS Domain [b:${reg.domain.name}] is set to [d:expire]  ${
        expiresInDays > 0 ? `in ${expiresInDays} day(s)` : `today`
      }.`;
      const title = 'ENS Domain Expiry Alert!!';
      const cta = `https://app.ens.domains/name/${reg.domain.name}/details`;
      await this.sendNotification({
        recipient: reg.registrant.id,
        image: null,
        message: message,
        payloadMsg: payloadMsg,
        title: title,
        payloadTitle: title,
        notificationType: 3,
        simulate: simulate,
        cta: cta,
      });

      if (reg.registrant.id.toLowerCase() != reg.domain.owner.id.toLowerCase()) {
        this.logInfo(`Owner and registrant different sending notif to owner`);
        await this.sendNotification({
          recipient: reg.domain.owner.id,
          image: null,
          message: message,
          payloadMsg: payloadMsg,
          title: title,
          payloadTitle: title,
          notificationType: 3,
          simulate: simulate,
          cta: cta,
        });
      }
    } else {
      this.logInfo(`Expiry not near aborting...`);
    }
  }
}
