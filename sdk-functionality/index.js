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

// dummy group data 
const _chatId = '4d7d37f7c339e39abc67877811ad35e949b26a0a531cf0d87d6a8745c3f50755';
const _groupName = 'Test Group';
const _groupDescription = 'This a dunny group description';
const _members = ['0x4dAD499341C09FCF8169ACAa98295Ba259035a10' ,'0x6f60552343f01cbfeaacDA00F6b66099b19F691D'];
const _updatedMembers = _members.push('0x9E8aBc931C2E340d7a1B4b28d528e2fE333432d1');

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

  // IMPORTANT: VARIOUS OTHER NOTIFICATIONS FORMAT SUPPORTED
  // EXAMPLES HERE: https://github.com/ethereum-push-notification-service/push-sdk/blob/main/packages/restapi/README.md
  console.log(chalk.bgGreen.bold("PushAPI.payloads.sendNotification() [Direct Payload, Single Recipient]"));
  await PushAPI_payloads_sendNotification__direct_payload_single_recipient();

  console.log(chalk.bgGreen.bold("PushAPI.payloads.sendNotification() [Direct Payload, Batch of Recipients (Subset)]"));
  await PushAPI_payloads_sendNotification__direct_payload_group_of_recipient_subset();

  console.log(chalk.bgGreen.bold("PushAPI.payloads.sendNotification() [Direct Payload, All Recipients (Broadcast)]"));
  await PushAPI_payloads_sendNotification__direct_payload_all_recipients_brodcast();

  console.log(chalk.bgGreen.bold("PushAPI.channels._getSubscribers()"));
  await PushAPI_channels_getSubscribers();

  console.log(chalk.bgGreen.bold("PushSDKSocket()"));
  await PushSDKSocket();
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
async function PushAPI_payloads_sendNotification__direct_payload_single_recipient(silent) {
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
  if (!silent) {
    console.log(apiResponse);
  }
}

// // Push Notification - Direct payload for group of recipients(subset)
// // // PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_group_of_recipient_subset(silent) {
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
  if (!silent) {
    console.log(apiResponse);
  }
}

// // Push Notification - Direct payload for all recipients(broadcast)
// // // PushAPI.payloads.sendNotification
async function PushAPI_payloads_sendNotification__direct_payload_all_recipients_brodcast(silent) {
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
  if (!silent) {
    console.log(apiResponse);
  }
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
async function PushSDKSocket() {
  const pushSDKSocket = createSocketConnection({
    user: `eip155:5:${walletAddress}`, // CAIP, see below
    env: _env,
    socketOptions: { autoConnect: false }
  });

  pushSDKSocket.connect();

  pushSDKSocket.on(EVENTS.CONNECT, async () => {
    console.log(chalk.gray("Socket Connected - will disconnect after 4 seconds"));
    
    // send a notification to see the result 
    await PushAPI_payloads_sendNotification__direct_payload_single_recipient(true);
  });
  
  pushSDKSocket.on(EVENTS.DISCONNECT, () => {
    console.log(chalk.gray("Socket Disconnected"));
  });
  
  pushSDKSocket.on(EVENTS.USER_FEEDS, (feedItem) => {
    // feedItem is the notification data when that notification was received
    console.log(chalk.gray("Incoming Feed from Socket"));
    console.log(feedItem);

    // disconnect socket after this, not to be done in real implementations
    pushSDKSocket.disconnect();
  });

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  await delay(4000);
}


// Push Chat - Run Chat Use cases
async function runChatUseCases() {
  console.log(chalk.bgGreen.bold("PushAPI_user_create"));
  const user = await PushAPI_user_create();
  await PushAPI_user_get();
  const encryptedPGPPvtKey = user.encryptedPrivateKey;
  const rawPGPKey = await PushAPI_chat_decryptPGPKey(encryptedPGPPvtKey);
  await PushAPI_chat_send(rawPGPKey);
  await PushAPI_chat_requests(rawPGPKey);
  await PushAPI_chat_chats(rawPGPKey);
  await PushAPI_chat_approve(rawPGPKey);
  await PushAPI_chat_conversationHash();
  await PushAPI_chat_history(rawPGPKey);
  await PushAPI_chat_createGroup(rawPGPKey);
  await PushAPI_chat_updateGroup(rawPGPKey);
  await PushAPI_chat_getGroup();
  await PushAPI_chat_getGroupByName();
}

// Push Chat - Create User
async function PushAPI_user_create() {
  const user = await PushAPI.user.create({
    signer: _signer,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_user_create | Response - 200 OK"));
  console.log(user);
  return user;
}

// Push Chat - Get User
async function PushAPI_user_get() {
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_user_get | Response - 200 OK"));
  console.log(user);
}

// Push Chat - Decrypt PGP Key
async function PushAPI_chat_decryptPGPKey(pgpPvtKey) {
  const pgpKey = await PushAPI.chat.decryptPGPKey({
    encryptedMessage: pgpPvtKey,
    signer: _signer
  });

  console.log(chalk.gray("PushAPI_chat_decryptPGPKey | Response - 200 OK"));
  console.log(pgpKey);
  return pgpKey;
}

// Push Chat - Send Message
async function PushAPI_chat_send(pgpKey) {
  const response = await PushAPI.chat.send({
    messageContent,
    messageType: 'Text', // can be "Text" | "Image" | "File" | "GIF" 
    receiverAddress: walletAddressAlt2,
    signer: _signer,
    pgpPrivateKey: pgpKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_send | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Decrypt PGP Key
async function PushAPI_chat_decryptPGPKey(pgpPvtKey) {
  const pgpKey = await PushAPI.chat.decryptPGPKey({
    encryptedMessage: pgpPvtKey,
    signer: _signer
  });

  console.log(chalk.gray("PushAPI_chat_decryptPGPKey | Response - 200 OK"));
  console.log(pgpKey);
  return pgpKey;
}

// Push Chat - Get Requests
async function PushAPI_chat_requests(pgpPvtKey) {
  const response = await PushAPI.chat.requests({
    account: walletAddress,
    pgpPrivateKey: pgpPvtKey,
    toDecrypt: true,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_requests | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Get Chats
async function PushAPI_chat_chats(pgpPvtKey) {
  const response = await PushAPI.chat.chats({
    account: walletAddress,
    pgpPrivateKey: pgpPvtKey,
    toDecrypt: true,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_chats | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Approve
async function PushAPI_chat_approve(pgpPvtKey) {
  const response = await PushAPI.chat.approve({
    status: 'Approved',
    signer: _signer,
    senderAddress: walletAddressAlt2, // request sender address
    env: _env,
    pgpPrivateKey: pgpPvtKey,
  });

  console.log(chalk.gray("PushAPI_chat_approve | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Conversation Hash
async function PushAPI_chat_conversationHash() {
  const response = await PushAPI.chat.conversationHash({
    account: walletAddress,
    conversationId: walletAddressAlt2, // 2nd address
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_conversationHash | Response - 200 OK"));
  console.log(response);
  return response;
}

// Push Chat - History
async function PushAPI_chat_history(pgpPvtKey) {
  const response = await PushAPI.chat.history({
    threadhash: '', // get conversation hash from conversationHash function and send the response threadhash here
    account: walletAddress,
    pgpPrivateKey: pgpPvtKey,
    limit: 5,
    toDecrypt: true,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_history | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Create Group
async function PushAPI_chat_createGroup(pgpPvtKey) {
  const response = await PushAPI.chat.createGroup({
        groupName:_groupName,
        groupDescription:_groupDescription,
        members: _members,
        admins: [],
        isPublic: true,
        account: walletAddress,
        env: _env,
        pgpPrivateKey: pgpPvtKey,
      });


  console.log(chalk.gray("PushAPI_chat_createGroup | Response - 200 OK"));
  console.log(response);
}


// Push Chat - Update Group
async function PushAPI_chat_updateGroup(pgpPvtKey) {
  const response = await PushAPI.chat.updateGroup({
        groupName:_groupName,
        groupDescription:_groupDescription,
        members: _updatedMembers,
        admins: [],
        isPublic: true,
        account: walletAddress,
        env: _env,
        pgpPrivateKey: pgpPvtKey,
      });


  console.log(chalk.gray("PushAPI_chat_updateGroup | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Get Group
async function PushAPI_chat_getGroup() {
  const response = await PushAPI.chat.getGroup({
        chatId: _chatId,
        env: _env,
      });


  console.log(chalk.gray("PushAPI_chat_getGroup | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Get Group By Name
async function PushAPI_chat_getGroupByName() {
  const response = await PushAPI.chat.getGroupByName({
        groupName: _groupName,
        env: _env,
      });


  console.log(chalk.gray("PushAPI_chat_getGroupByName | Response - 200 OK"));
  console.log(response);
}
// Master control
// -----
// console.log(chalk.bgYellow("All features of Push Notifications"));
// await runNotificaitonsUseCases();

// console.log(chalk.bgYellow("\nAll features of Push Chat"));
await runChatUseCases();

console.log(chalk.bgBlue.white.bold("SDK FUNCTIONALITIES END"));
console.log("\n");