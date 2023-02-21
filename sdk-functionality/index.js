// import chalk
import chalk from 'chalk';

// import dotenv
import * as dotenv from 'dotenv';
dotenv.config();

// initialize sdk
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from "ethers";

// testing SDK Functionalities
console.log("\n");
console.log(chalk.bgBlue.white.bold("SDK FUNCTIONALITIES"));

// setting wallet params
const walletAddress = "0xD8634C39BBFd4033c0d3289C4515275102423681";
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
const channelAddress = "0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924"; // can be your wallet address as well if you own a channel
const _env = 'staging'; // can be 'staging', 'prod' or 'dev' | Other values might result in incorrect responses

// initialize signer for whatever function it's needed for
const provider = ethers.getDefaultProvider();

const Pkey = `0x${walletPrivateKey}`;
var wallet = new ethers.Wallet(Pkey, provider);
const _signer = new ethers.Wallet(Pkey);

// test dotenv and wallet
console.log(chalk.gray("Testing ENV file, should display wallet private key - " + process.env.WALLET_PRIVATE_KEY));
console.log(chalk.gray("Testing Wallet addres from private key - " + wallet.address));

// Run Notifications Use cases
async function runNotificaitonsUseCases() {
  // console.log(chalk.bgGreen.bold("PushAPI.user.getFeeds"));
  // await PushAPI_user_getFeeds();

  // console.log(chalk.bgGreen.bold("PushAPI.user.getFeeds [Spam]"));
  // await PushAPI_user_getFeeds__spam();

  // console.log(chalk.bgGreen.bold("PushAPI.user.getSubscriptions"));
  // await PushAPI_user_getSubscriptions();

  // console.log(chalk.bgGreen.bold("PushAPI.channels.getChannel()"));
  // await PushAPI_channels_getChannel();

  // console.log(chalk.bgGreen.bold("PushAPI.channels.search()"));
  // await PushAPI_channels_search();

  // console.log(chalk.bgGreen.bold("PushAPI.channels.subscribe()"));
  // await PushAPI_channels_subscribe();

  // console.log(chalk.bgGreen.bold("PushAPI.channels.unsubscribe()"));
  // await PushAPI_channels_unsubscribe();

  console.log(chalk.bgGreen.bold("PushAPI.payloads.sendNotification()"));
  await PushAPI_payloads_sendNotification__direct_payload_single_recipient();
}

// PushAPI.user.getFeeds
async function PushAPI_user_getFeeds() {
  const notifications = await PushAPI.user.getFeeds({
    user: `eip155:5:${walletAddress}`, // user address in CAIP
    env: _env
  });

  console.log(chalk.gray("PushAPI.user.getFeeds | Response - 200 OK"));
  console.log(notifications);
}

// PushAPI.user.getFeeds - Spam
async function PushAPI_user_getFeeds__spam() {
  const notifications = await PushAPI.user.getFeeds({
    user: `eip155:5:${walletAddress}`, // user address in CAIP
    spam: true,
    env: _env
  });

  console.log(chalk.gray("PushAPI.user.getFeeds [Spam] | Response - 200 OK"));
  console.log(notifications);
}

// PushAPI.user.getSubscriptions
async function PushAPI_user_getSubscriptions() {
  const subscriptions = await PushAPI.user.getSubscriptions({
    user: `eip155:5:${walletAddress}`, // user address in CAIP
    env: _env
  });

  console.log(chalk.gray("PushAPI.user.getSubscriptions | Response - 200 OK"));
  console.log(subscriptions);
}

// PushAPI.channels.getChannel
async function PushAPI_channels_getChannel() {
  const channelData = await PushAPI.channels.getChannel({
    channel: `eip155:5:${walletAddress}`, // user address in CAIP
    env: _env
  });

  console.log(chalk.gray("PushAPI.channels.getChannel | Response - 200 OK"));
  console.log(channelData);
}

// PushAPI.channels.search
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

// PushAPI.channels.subscribe
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

// PushAPI.channels.unsubscribe
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

// Send Notifications
// // Direct payload for single recipient(target)
// // // PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_single_recipient() {
  const apiResponse = await PushAPI.payloads.sendNotification({
    _signer, // Needs to resolve to channel address
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


// Master control
console.log(chalk.bgYellow("All features of Push Notifications"));
await runNotificaitonsUseCases();

console.log(chalk.bgBlue.white.bold("SDK FUNCTIONALITIES END"));
console.log("\n");