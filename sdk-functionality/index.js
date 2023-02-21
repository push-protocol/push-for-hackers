// import chalk
import chalk from 'chalk';

// import dotenv
import * as dotenv from 'dotenv';
dotenv.config();

// initialize sdk
import * as PushAPI from "@pushprotocol/restapi";
import {
  createSocketConnection,
  EVENTS
} from '@pushprotocol/socket';
import { ethers } from "ethers";

// testing SDK Functionalities
console.log("\n");
console.log(chalk.bgBlue.white.bold("SDK FUNCTIONALITIES"));

// setting wallet params
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
const channelAddress = "0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924"; // can be your wallet address as well if you own a channel

// can be 'staging', 'prod' or 'dev' | Other values might result in incorrect responses
// if taking these values for prod, ensure you change CAIP-10 format from eip155:5:0xAddress (GOERLI) to eip155:1:0xAddress (MAINNET) address in parameters passed
// ensure provider matches the network id as well
const _env = 'staging'; 

// initialize signer for whatever function it's needed for
const provider = ethers.getDefaultProvider(5);

const Pkey = `0x${walletPrivateKey}`;
const _signer = new ethers.Wallet(Pkey, provider);
const walletAddress = _signer.address;

// generate some dummy wallets as well
const walletAddressAlt2 = "0xCdBE6D076e05c5875D90fa35cc85694E1EAFBBd1";

// test dotenv and wallet
console.log(chalk.gray("Testing ENV file, should display wallet private key - " + process.env.WALLET_PRIVATE_KEY));
console.log(chalk.gray("Testing Wallet addres from private key - " + walletAddress));

// Push Notification - Run Notifications Use cases
async function runNotificaitonsUseCases() {
  console.log(chalk.bgGreen.bold("PushAPI.user.getFeeds"));
  await PushAPI_user_getFeeds();

  console.log(chalk.bgGreen.bold("PushAPI.user.getFeeds [Spam]"));
  await PushAPI_user_getFeeds__spam();

  console.log(chalk.bgGreen.bold("PushAPI.user.getSubscriptions"));
  await PushAPI_user_getSubscriptions();

  console.log(chalk.bgGreen.bold("PushAPI.channels.getChannel()"));
  await PushAPI_channels_getChannel();

  console.log(chalk.bgGreen.bold("PushAPI.channels.search()"));
  await PushAPI_channels_search();

  console.log(chalk.bgGreen.bold("PushAPI.channels.subscribe()"));
  await PushAPI_channels_subscribe();

  console.log(chalk.bgGreen.bold("PushAPI.channels.unsubscribe()"));
  await PushAPI_channels_unsubscribe();

  console.log(chalk.bgGreen.bold("PushAPI.payloads.sendNotification() [Direct Payload, Single Recipient]"));
  await PushAPI_payloads_sendNotification__direct_payload_single_recipient();

  console.log(chalk.bgGreen.bold("PushAPI.payloads.sendNotification() [Direct Payload, Batch of Recipients (Subset)]"));
  await PushAPI_payloads_sendNotification__direct_payload_group_of_recipient_subset();

  console.log(chalk.bgGreen.bold("PushAPI.payloads.sendNotification() [Direct Payload, All Recipients (Broadcast)]"));
  await PushAPI_payloads_sendNotification__direct_payload_all_recipients_brodcast();

  // IMPORTANT: VARIOUS OTHER NOTIFICATIONS FORMAT SUPPORTED
  // EXAMPLES HERE: https://github.com/ethereum-push-notification-service/push-sdk/blob/main/packages/restapi/README.md

  console.log(chalk.bgGreen.bold("PushAPI.channels._getSubscribers()"));
  await PushAPI_channels_getSubscribers();
}

// Push Notification - PushAPI.user.getFeeds
async function PushAPI_user_getFeeds() {
  const notifications = await PushAPI.user.getFeeds({
    user: `eip155:5:${walletAddress}`, // user address in CAIP
    env: _env
  });

  console.log(chalk.gray("PushAPI.user.getFeeds | Response - 200 OK"));
  console.log(notifications);
}

// Push Notification - PushAPI.user.getFeeds - Spam
async function PushAPI_user_getFeeds__spam() {
  const notifications = await PushAPI.user.getFeeds({
    user: `eip155:5:${walletAddress}`, // user address in CAIP
    spam: true,
    env: _env
  });

  console.log(chalk.gray("PushAPI.user.getFeeds [Spam] | Response - 200 OK"));
  console.log(notifications);
}

// Push Notification - PushAPI.user.getSubscriptions
async function PushAPI_user_getSubscriptions() {
  const subscriptions = await PushAPI.user.getSubscriptions({
    user: `eip155:5:${walletAddress}`, // user address in CAIP
    env: _env
  });

  console.log(chalk.gray("PushAPI.user.getSubscriptions | Response - 200 OK"));
  console.log(subscriptions);
}

// Push Notification - PushAPI.channels.getChannel
async function PushAPI_channels_getChannel() {
  const channelData = await PushAPI.channels.getChannel({
    channel: `eip155:5:${walletAddress}`, // user address in CAIP
    env: _env
  });

  console.log(chalk.gray("PushAPI.channels.getChannel | Response - 200 OK"));
  console.log(channelData);
}

// Push Notification - PushAPI.channels.search
async function PushAPI_channels_search() {
  const channelsData = await PushAPI.channels.search({
    query: 'push', // a search query
    page: 1, // page index
    limit: 20, // no of items per page
    env: _env
  });

  console.log(chalk.gray("PushAPI.channels.search | Response - 200 OK"));
  console.log(channelsData);
}

// Push Notification - PushAPI.channels.subscribe
async function PushAPI_channels_subscribe() {
  const response = await PushAPI.channels.subscribe({
    signer: _signer,
    channelAddress: `eip155:5:${channelAddress}`, // channel address in CAIP
    userAddress: `eip155:5:${walletAddress}`, // user address in CAIP
    onSuccess: () => {
     console.log('opt in success');
    },
    onError: () => {
      console.error('opt in error');
    },
    env: _env
  });

  console.log(chalk.gray("PushAPI.channels.subscribe | Response - 200 OK"));
  console.log(response);
}

// Push Notification - PushAPI.channels.unsubscribe
async function PushAPI_channels_unsubscribe() {
  const response = await PushAPI.channels.unsubscribe({
    signer: _signer,
    channelAddress: `eip155:5:${channelAddress}`, // channel address in CAIP
    userAddress: `eip155:5:${walletAddress}`, // user address in CAIP
    onSuccess: () => {
     console.log('opt out success');
    },
    onError: () => {
      console.error('opt out error');
    },
    env: _env
  });

  console.log(chalk.gray("PushAPI.channels.unsubscribe | Response - 200 OK"));
  console.log(response);
}

// Push Notification - Send Notifications
// // Direct payload for single recipient(target)
// // // PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_single_recipient() {
  const apiResponse = await PushAPI.payloads.sendNotification({
    signer: _signer, // Need to resolve to channel address
    type: 3, // target
    identityType: 2, // direct payload
    notification: {
      title: `[SDK-TEST] notification TITLE:`,
      body: `[sdk-test] notification BODY`
    },
    payload: {
      title: `[sdk-test] payload title`,
      body: `sample msg body`,
      cta: '',
      img: ''
    },
    recipients: `eip155:5:${walletAddress}`, // recipient address
    channel: `eip155:5:${walletAddress}`, // your channel address
    env: _env
  });

  console.log(chalk.gray("PushAPI.payloads.sendNotification | Response - 204 OK"));
  console.log(apiResponse);
}

// // Push Notification - Direct payload for group of recipients(subset)
// // // PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_group_of_recipient_subset() {
  const apiResponse = await PushAPI.payloads.sendNotification({
    signer: _signer, // Need to resolve to channel address
    type: 4, // subset
    identityType: 2, // direct payload
    notification: {
      title: `[SDK-TEST] notification TITLE:`,
      body: `[sdk-test] notification BODY`
    },
    payload: {
      title: `[sdk-test] payload title`,
      body: `sample msg body`,
      cta: '',
      img: ''
    },
    recipients: [`eip155:5:${walletAddress}`, `eip155:5:${walletAddressAlt2}`], // recipient addresses
    channel: `eip155:5:${walletAddress}`, // your channel address
    env: _env
  });

  console.log(chalk.gray("PushAPI.payloads.sendNotification | Response - 204 OK"));
  console.log(apiResponse);
}

// // Push Notification - Direct payload for all recipients(broadcast)
// // // PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_all_recipients_brodcast() {
  const apiResponse = await PushAPI.payloads.sendNotification({
    signer: _signer, // Needs to resolve to channel address
    type: 1, // broadcast
    identityType: 2, // direct payload
    notification: {
      title: `[SDK-TEST] notification TITLE:`,
      body: `[sdk-test] notification BODY`
    },
    payload: {
      title: `[sdk-test] payload title`,
      body: `sample msg body`,
      cta: '',
      img: ''
    },
    channel: `eip155:5:${walletAddress}`, // your channel address
    env: _env
  });

  console.log(chalk.gray("PushAPI.payloads.sendNotification | Response - 204 OK"));
  console.log(apiResponse);
}

// Push Notification - Get Subscribers list from channels (DEPRECATED)
async function PushAPI_channels_getSubscribers() {
  const subscribers = await PushAPI.channels._getSubscribers({
    channel: `eip155:5:${channelAddress}`, // channel address in CAIP
    env: _env
  });

  console.log(chalk.gray("PushAPI.channels._getSubscribers | Response - 200 OK"));
  console.log(subscribers);
}

// Push Notification - Socket Connection
function PushSDKSocket_listen() {
  const pushSDKSocket = createSocketConnection({
    user: `eip155:5:${walletAddress}`, // CAIP, see below
    env: _env,
    socketOptions: { autoConnect: false }
  });

  pushSDKSocket.connect();

  pushSDKSocket.on(EVENTS.CONNECT, () => {
    console.log(chalk.gray("Socket Connected"));
  });
  
  pushSDKSocket.on(EVENTS.DISCONNECT, () => {
    console.log(chalk.gray("Socket Disconnected"));
  });
  
  pushSDKSocket.on(EVENTS.USER_FEEDS, (feedItem) => {
    // feedItem is the notification data when that notification was received
    console.log(chalk.gray(feedItem));
  });
}


// Push Chat - Run Chat Use cases
async function runChatUseCases() {
  console.log(chalk.bgGreen.bold("PushAPI_user_create"));
  await PushAPI_user_create();
}

// Push Chat - Create User
async function PushAPI_user_create() {
  const user = await PushAPI.user.create({
    account: walletAddress,
    env: 'staging',
  });

  console.log(chalk.gray("PushAPI_user_create | Response - 200 OK"));
  console.log(user);
}

// Master control
// -----
// console.log(chalk.bgYellow("All features of Push Notifications"));
// await runNotificaitonsUseCases();

// console.log(chalk.bgYellow("\nAll features of Push Chat"));
// await runChatUseCases();
await PushSDKSocket_listen();

console.log(chalk.bgBlue.white.bold("SDK FUNCTIONALITIES END"));
console.log("\n");