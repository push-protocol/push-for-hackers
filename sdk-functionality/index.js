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
const walletPrivateKeySecondAccount = process.env.WALLET_PRIVATE_KEY2;
const channelAddress = "0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924"; // can be your wallet address as well if you own a channel

// can be 'staging', 'prod' or 'dev' | Other values might result in incorrect responses
// if taking these values for prod, ensure you change CAIP-10 format from eip155:5:0xAddress (GOERLI) to eip155:1:0xAddress (MAINNET) address in parameters passed
// ensure provider matches the network id as well
const _env = 'dev';

// initialize signer for whatever function it's needed for
const provider = ethers.getDefaultProvider(5);

const Pkey = `0x${walletPrivateKey}`;
const _signer = new ethers.Wallet(Pkey, provider);
const walletAddress = _signer.address;

const PkeySecondAccount = `0x${walletPrivateKeySecondAccount}`;
const _signerSecondAccount = new ethers.Wallet(PkeySecondAccount, provider);
const walletAddressSecondAccount = _signerSecondAccount.address;

// generate some dummy wallets as well
const walletAddressAlt2 = "0x0F1AAC847B5720DDf01BFa07B7a8Ee641690816d";
const walletAddressAlt3 = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

// dummy group data 
const _chatId = '4d7d37f7c339e39abc67877811ad35e949b26a0a531cf0d87d6a8745c3f50755';
const _groupName = 'Test Group';
const _groupDescription = 'This a dunny group description';
const _members = ['0x4dAD499341C09FCF8169ACAa98295Ba259035a10', '0x6f60552343f01cbfeaacDA00F6b66099b19F691D'];
const _updatedMembers = _members.push('0x9E8aBc931C2E340d7a1B4b28d528e2fE333432d1');
const _groupImage = 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fd%2Fd0%2FEth-diamond-rainbow.png&imgrefurl=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FEthereum&tbnid=S9BLdj9exV77pM&vet=12ahUKEwjVqKrBsK39AhU8IbcAHf9gDK8QMygAegUIARDeAQ..i&docid=CJMg0dCzhmN_kM&w=1920&h=3201&q=eth&ved=2ahUKEwjVqKrBsK39AhU8IbcAHf9gDK8QMygAegUIARDeAQ';

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

  console.log(chalk.bgGreen.bold("Push Notification - PushSDKSocket()"));
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
  // console.log(chalk.bgGreen.bold("PushAPI.user.create"));
  // try {
  //   // incase the user is already created
  //   await PushAPI_user_create();
  // } catch (e) {
  //   console.log(chalk.gray("Skipping as the user might be already created"));
  // }

  // console.log(chalk.bgGreen.bold("PushAPI.user.get"));
  // await PushAPI_user_get();

  // console.log(chalk.bgGreen.bold("PushAPI_chat_decryptPGPKey"));
  // await PushAPI_chat_decryptPGPKey();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.chats"));
  // await PushAPI_chat_chats();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.requests"));
  // await PushAPI_chat_requests();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.conversationHash"));
  // await PushAPI_chat_conversationHash();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.latest"));
  // await PushAPI_chat_latest();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.send"));
  // await PushAPI_chat_send();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.approve"));
  // try {
  //   // incase the user is already approved
  //   await PushAPI_chat_approve();
  // } catch (e) {
  //   console.log(chalk.gray("Skipping as the user might already be approved"));
  // }
  
  // console.log(chalk.bgGreen.bold("PushAPI.chat.createGroup"));
  // try {
  //   // incase the group is already created
  //   await PushAPI_chat_createGroup();
  // } catch (e) {
  //   console.log(chalk.gray("Skipping as the group might already be created"));
  // }

  // console.log(chalk.bgGreen.bold("PushAPI.chat.updateGroup"));
  // await PushAPI_chat_updateGroup();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.getGroupByName"));
  // await PushAPI_chat_getGroupByName();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.getGroup"));
  // await PushAPI_chat_getGroup();

  // console.log(chalk.bgGreen.bold("PushAPI.chat.decryptConversation"));
  // await PushAPI_chat_decryptConversation();

  console.log(chalk.bgGreen.bold("Push Chat - PushSDKSocket()"));
  await PushChatSDKSocket();
}

// Push Chat - PushAPI.user.create
async function PushAPI_user_create() {
  const user = await PushAPI.user.create({
    signer: _signer,
    env: _env
  });

  console.log(chalk.gray("PushAPI_user_create | Response - 200 OK"));
  console.log(user);

  return user;
}

// Push Chat - PushAPI.user.get
async function PushAPI_user_get(silent) {
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env
  });

  console.log(chalk.gray("PushAPI_user_get | Response - 200 OK"));

  if (!silent) {
    console.log(user);
  }
}

// Push Chat - PushAPI.chat.decryptPGPKey
async function PushAPI_chat_decryptPGPKey() {
  // get user and derive encrypted PGP key
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // decrypt the PGP Key
  const pgpKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  console.log(chalk.gray("PushAPI_chat_decryptPGPKey | Response - 200 OK"));
  console.log(pgpKey);
}

// Push Chat - PushAPI.chat.chats
async function PushAPI_chat_chats() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Actual api
  const response = await PushAPI.chat.chats({
    account: `eip155:${walletAddress}`,
    toDecrypt: true,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_chats | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.requests
async function PushAPI_chat_requests() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Actual api
  const response = await PushAPI.chat.requests({
    account: `eip155:${walletAddress}`,
    toDecrypt: true,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_requests | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.conversationHash
async function PushAPI_chat_conversationHash() {
  // conversation hash are also called link inside chat messages
  const conversationHash = await PushAPI.chat.conversationHash({
    account: `eip155:${walletAddress}`,
    conversationId: `eip155:${walletAddressAlt2}`, // 2nd address
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_conversationHash | Response - 200 OK"));
  console.log(conversationHash);
}

// Push Chat - PushAPI.chat.latest
async function PushAPI_chat_latest() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Fetch conversation hash
  // conversation hash are also called link inside chat messages
  const conversationHash = await PushAPI.chat.conversationHash({
    account: `eip155:${walletAddress}`,
    conversationId: `eip155:${walletAddressAlt2}`, // 2nd address
    env: _env,
  });

  // Actual API
  const response = await PushAPI.chat.latest({
    threadhash: conversationHash.threadHash, // get conversation hash from conversationHash function and send the response threadhash here
    account: `eip155:${walletAddress}`,
    toDecrypt: true,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_latest | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.history
async function PushAPI_chat_history() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Fetch conversation hash
  // conversation hash are also called link inside chat messages
  const conversationHash = await PushAPI.chat.conversationHash({
    account: `eip155:${walletAddress}`,
    conversationId: `eip155:${walletAddressAlt2}`, // 2nd address
    env: _env,
  });

  // Actual API
  const response = await PushAPI.chat.history({
    threadhash: conversationHash.threadHash, // get conversation hash from conversationHash function and send the response threadhash here
    account: `eip155:${walletAddress}`,
    limit: 5,
    toDecrypt: true,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_history | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.send
// // Will send a message to the user or chat request in case user hasn't approved them
async function PushAPI_chat_send() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Actual api
  const response = await PushAPI.chat.send({
    messageContent: "Gm gm! It's me... Mario",
    messageType: 'Text', // can be "Text" | "Image" | "File" | "GIF" 
    receiverAddress: walletAddressSecondAccount,
    signer: _signer,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_send | Response - 200 OK"));
  console.log(response);
}

// Push Chat - Approve
async function PushAPI_chat_approve() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddressSecondAccount}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signerSecondAccount
  });

  // Actual api
  const approve = await PushAPI.chat.approve({
    status: 'Approved',
    senderAddress: walletAddress, // receiver's address or chatId of a group
    signer: _signerSecondAccount,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env
  });

  console.log(chalk.gray("PushAPI_chat_approve | Response - 200 OK"));
  console.log(approve);
}

// Push Chat - PushAPI.chat.createGroup
async function PushAPI_chat_createGroup() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Actual API
  // Convert image to base 64 and pass
  const response = await PushAPI.chat.createGroup({
    groupName: 'Push Group Chat 3',
    groupDescription: 'This is the oficial group for Push Protocol',
    members: [`eip155:${walletAddressAlt2}`, `eip155:${walletAddressAlt3}`],
    groupImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==',
    admins: [], // takes _signer as admin automatically, add more if you want to
    isPublic: true,
    signer: _signer,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_createGroup | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.updateGroup
async function PushAPI_chat_updateGroup() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Actual API
  // Convert image to base 64 and pass
  // This is an idempotent operation, meaning it requires all group info to be passed no matter if only few things change
  // Why so? To ensure that verificationProof always is able to replicate the current group info (trustless since signature is stored with the info)
  const response = await PushAPI.chat.updateGroup({
    chatId: '870cbb20f0b116d5e461a154dc723dc1485976e97f61a673259698aa7f48371c',
    groupName: 'Push Group Chat v2',
    groupDescription: 'This is the edited oficial group for Push Protocol',
    members: [`eip155:${walletAddressAlt2}`, `eip155:${walletAddressAlt3}`],
    groupImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==',
    admins: [`eip155:${walletAddress}`], // takes _signer as admin automatically, add more if you want to
    isPublic: true,
    signer: _signer,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_updateGroup | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.getGroupByName
async function PushAPI_chat_getGroupByName() {
  const response = await PushAPI.chat.getGroupByName({
    groupName: "Push Group Chat 3",
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_getGroupByName | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.getGroup
async function PushAPI_chat_getGroup() {
  const response = await PushAPI.chat.getGroup({
    chatId: '870cbb20f0b116d5e461a154dc723dc1485976e97f61a673259698aa7f48371c',
    env: _env,
  });

  console.log(chalk.gray("PushAPI_chat_getGroup | Response - 200 OK"));
  console.log(response);
}

// Push Chat - PushAPI.chat.decryptConversation
async function PushAPI_chat_decryptConversation() {
  // Fetch user
  const user = await PushAPI.user.get({
    account: `eip155:${walletAddress}`,
    env: _env,
  });

  // Decrypt PGP Key
  const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: _signer
  });

  // Fetch conversation hash
  // conversation hash are also called link inside chat messages
  const conversationHash = await PushAPI.chat.conversationHash({
    account: `eip155:${walletAddress}`,
    conversationId: `eip155:${walletAddressAlt2}`, // 2nd address
    env: _env,
  });

  // Chat History
  const encryptedChats = await PushAPI.chat.history({
    threadhash: conversationHash.threadHash, // get conversation hash from conversationHash function and send the response threadhash here
    account: `eip155:${walletAddress}`,
    limit: 5,
    toDecrypt: false,
    pgpPrivateKey: pgpDecrpyptedPvtKey,
    env: _env,
  });
  
  // Decrypted Chat
  const decryptedChat = await PushAPI.chat.decryptConversation({
    messages: encryptedChats, // array of message object fetched from chat.history method
    connectedUser, // user meta data object fetched from chat.get method
    pgpPrivateKey:decryptedPvtKey, //decrypted private key
    env:'staging',
  });
}

// Push Chat - Socket Connection
async function PushChatSDKSocket() {
  const pushSDKSocket = createSocketConnection({
    user: `eip155:5:${walletAddress}`, // CAIP, see below
    env: _env,
    socketType: 'chat',
    socketOptions: { autoConnect: true, reconnectionAttempts: 3 }
  });

  pushSDKSocket.connect();

  pushSDKSocket.on(EVENTS.CONNECT, async () => {
    console.log(chalk.gray("Socket Connected - will disconnect after 4 seconds"));

    // send a chat from other wallet to this one to see the result 
    // Fetch user
    const user = await PushAPI.user.get({
      account: `eip155:${walletAddressSecondAccount}`,
      env: _env,
    });

    // Decrypt PGP Key
    const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
      encryptedPGPPrivateKey: user.encryptedPrivateKey,
      signer: _signerSecondAccount
    });

    // Actual api
    const response = await PushAPI.chat.send({
      messageContent: "Gm gm! It's me... Mario",
      messageType: 'Text', // can be "Text" | "Image" | "File" | "GIF" 
      receiverAddress: `eip155:${walletAddress}`,
      signer: _signerSecondAccount,
      pgpPrivateKey: pgpDecrpyptedPvtKey,
      env: _env,
    });
  });

  pushSDKSocket.on(EVENTS.DISCONNECT, () => {
    console.log(chalk.gray("Socket Disconnected"));
  });

  pushSDKSocket.on(EVENTS.CHAT_RECEIVED_MESSAGE, (message) => {
    // feedItem is the notification data when that notification was received
    console.log(chalk.gray("Incoming Push Chat message from Socket"));
    console.log(message);

    // disconnect socket after this, not to be done in real implementations
    pushSDKSocket.disconnect();
  });

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  await delay(4000);
}

// Master control
// -----
// console.log(chalk.bgYellow("All features of Push Notifications"));
// await runNotificaitonsUseCases();

// console.log(chalk.bgYellow("\nAll features of Push Chat"));
await runChatUseCases();

console.log(chalk.bgBlue.white.bold("SDK FUNCTIONALITIES END"));
console.log("\n");