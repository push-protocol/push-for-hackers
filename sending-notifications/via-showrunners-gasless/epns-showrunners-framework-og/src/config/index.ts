import dotenv from 'dotenv';
import loadShowrunnersWallets from './channelsConfig';
import staticConfig from './staticConfig.json';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let config = {
  /**
   * Showrunners Environment
   */
  showrunnersEnv: process.env.SHOWRUNNERS_ENV,
  /**
   * Load Wallets of Showrunners
   */
  showrunnerWallets: loadShowrunnersWallets(),
  masterWallet: staticConfig.MASTER_WALLET_PRIVATE_KEY,
  walletMonitoring: staticConfig.WALLET_MONITORING,
  fileSuffix: process.env.NODE_ENV === 'production' ? 'js' : 'ts', // use the right file suffix in a development or production environment

  // Static Config BEGIN

  /**
   * Your favorite port
   */
  environment: staticConfig.NODE_ENV,

  /**
   * Your favorite port
   */
  port: parseInt(staticConfig.PORT || '3000', 10),

  /**
   * Your favorite port
   */
  runningOnMachine: staticConfig.RUNNING_ON_MACHINE,

  /**
   * Used by winston logger
   */
  logs: {
    level: staticConfig.LOG_LEVEL || 'silly',
  },

  /**
   * Trusted URLs, used as middleware for some and for future
   */
  trusterURLs: JSON.parse(JSON.stringify(staticConfig.TRUSTED_URLS)),

  /**
   * The database config
   */
  dbhost: staticConfig.DB_HOST,
  dbname: staticConfig.DB_NAME,
  dbuser: staticConfig.DB_USER,
  dbpass: staticConfig.DB_PASS,
  mongodb: staticConfig.MONGO_URI,
  redisURL: staticConfig.REDIS_URL,

  /**
   * File system config
   */
  fsServerURL: staticConfig.NODE_ENV == 'development' ? staticConfig.FS_SERVER_DEV : staticConfig.FS_SERVER_PROD,
  staticServePath: staticConfig.SERVE_STATIC_FILES,
  staticCachePath: __dirname + '/../../' + staticConfig.SERVE_STATIC_FILES + '/' + staticConfig.SERVE_CACHE_FILES + '/',
  staticAppPath: __dirname + '/../../',

  /**
   * Server related config
   */
  maxDefaultAttempts: staticConfig.DEFAULT_MAX_ATTEMPTS,

  /**
   * IPFS related
   */
  ipfsMaxAttempts: staticConfig.IPFS_MAX_ATTEMPTS,
  ipfsGateway: staticConfig.IPFS_GATEWAY,
  ipfsLocal: staticConfig.IPFS_LOCAL_ENDPOINT,
  ipfsInfura: staticConfig.IPFS_INFURA_ENDPOINT,

  /**
   * ETH threshold
   */
  ethThreshold: staticConfig.SHOWRUNNER_WALLET_ETH_THRESHOLD,
  ethMainThreshold: staticConfig.MASTER_WALLET_ETH_THRESHOLD,
  etherTransferAmount: staticConfig.ETHER_TRANSFER_AMOUNT,

  // Static Config END

  /**
   * Web3 Related
   */
  etherscanAPI: process.env.ETHERSCAN_API,

  infuraAPI: {
    projectID: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  },

  alchemyAPI: process.env.ALCHEMY_API,

  web3MainnetProvider: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  web3MainnetNetwork: staticConfig.MAINNET_WEB3_NETWORK,
  web3MainnetSocket: staticConfig.MAINNET_WEB3_SOCKET,

  web3RopstenProvider: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  web3RopstenNetwork: staticConfig.ROPSTEN_WEB3_NETWORK,
  web3RopstenSocket: staticConfig.ROPSTEN_WEB3_SOCKET,

  web3KovanProvider: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  web3KovanNetwork: staticConfig.KOVAN_WEB3_NETWORK,
  web3KovanSocket: staticConfig.KOVAN_WEB3_SOCKET,

  web3PolygonMainnetProvider: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  web3PolygonMainnetRPC: staticConfig.POLYGON_MAINNET_RPC,

  web3PolygonMumbaiProvider: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  web3PolygonMumbaiRPC: staticConfig.POLYGON_MUMBAI_RPC,

  web3GnosisRPC: staticConfig.GNOSIS_MAINNET_RPC,
  /**
   * EPNS Related
   */
  deployedContract: staticConfig.EPNS_DEPLOYED_CONTRACT,
  deployedKovanCoreContract: staticConfig.EPNS_CORE_KOVAN_DEPLOYED_CONTRACT,
  deployedMainnetCoreContract: staticConfig.EPNS_CORE_MAINNET_DEPLOYED_CONTRACT,
  deployedContractABI: require('./epns_contract.json'),
  deployedPolygonCommunicatorContract: staticConfig.EPNS_POLYGON_DEPLOYED_COMMUNICATOR_CONTRACT,
  deployedRopstenCommunicatorContract: staticConfig.EPNS_ROPSTEN_DEPLOYED_COMMUNICATOR_CONTRACT,
  deployedMainnetCommunicatorContract: staticConfig.EPNS_MAINNET_DEPLOYED_COMMUNICATOR_CONTRACT,
  deployedKovanCommunicatorContract: staticConfig.EPNS_KOVAN_DEPLOYED_COMMUNICATOR_CONTRACT,
  deployedContractCommunicatorABI: require('./epns_contract_communicator.json'),

  /**
   * API configs
   */
  api: {
    prefix: '/apis',
  },

  /**
   * Deprecated, these features are not needed anymore
   */

  /**
   * mail config
   */
  supportMailAddress: staticConfig.SUPPORT_MAIL_ADDRESS,
  supportMailName: staticConfig.SUPPORT_MAIL_NAME,
  sourceMailAddress: staticConfig.SOURCE_MAIL_ADDRESS,
  sourceMailName: staticConfig.SOURCE_MAIL_NAME,

  /**
   * AWS Config
   */
  accessKeyId: staticConfig.ACCESS_KEY_ID,
  secretAccessKey: staticConfig.SECRET_ACCESS_KEY,
};

export default config;
