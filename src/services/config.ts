/* eslint-disable no-process-env, @typescript-eslint/no-var-requires */
const config = {
  contracts: {
    TreeFactory: {
      address: process.env.REACT_NATIVE_CONTRACT_TREE_FACTORY_ADDRESS,
      abi: require('../../contracts/TreeFactory.json').abi,
    },
    Paymaster: {
      address: process.env.REACT_NATIVE_CONTRACT_PAYMASTER_ADDRESS,
      abi: require('../../contracts/WhitelistPaymaster.json').abi,
    },
    Planter: {
      address: process.env.REACT_NATIVE_CONTRACT_PLANTER_ADDRESS,
      abi: require('../../contracts/Planter.json').abi,
    },
    PlanterFund: {
      address: process.env.REACT_NATIVE_CONTRACT_PLANTER_FUND_ADDRESS,
      abi: require('../../contracts/PlanterFund.json').abi,
    },
  },
  networkId: Number(process.env.REACT_NATIVE_WEB3_NETWORK_ID || 3),
  isMainnet: process.env.REACT_NATIVE_IS_MAINNET?.toString() === 'true',
  storageKeys: {
    privateKey: '__TREEJER_PRIVATE_KEY',
    magicToken: '__TREEJER_MAGIC_TOKEN',
    magicWalletAddress: '__TREEJER_MAGIC_WALLET_ADDRESS',
    user: '__TREEJER_CURRENT_USER',
    onBoarding: '__TREEJER_ONBOARDING',
    locale: '__TREEJER_LOCALE',
    userId: '__TREEJER_USER_ID',
    offlineTrees: '__TREEJER_OFFLINE_TREES',
    offlineUpdatedTrees: '__TREEJER_OFFLINE_UPDATED_TREES',
    accessToken: '__TREEJER_ACCESS_TOKEN',
    useGSN: '__TREEJER_USE_GSN',
  },
  web3Url: process.env.REACT_NATIVE_WEB3_PROVIDER,
  treejerApiUrl: process.env.REACT_NATIVE_TREEJER_API_URL.replace(/\/$/, ''),
  publicKeyRecoveryMessage: process.env.REACT_NATIVE_PUBLIC_KEY_RECOVERY_MESSAGE,
  treejerClientSecret: process.env.REACT_NATIVE_TREEJER_CLIENT_SECRET,
  treejerClientId: process.env.REACT_NATIVE_TREEJER_CLIENT_ID,
  googleMapsApiKey: process.env.REACT_NATIVE_GOOGLE_MAPS_API_KEY,
  thegraphUrl: process.env.REACT_NATIVE_THE_GRAPH_URL?.replace(/\/$/, ''),
  ipfsPostURL: process.env.REACT_NATIVE_IPFS_POST_URL,
  ipfsGetURL: process.env.REACT_NATIVE_IPFS_GET_URL,
  mapboxToken: process.env.REACT_NATIVE_MAPBOX,
  defaultLocale: 'en',
  rangerUrl: process.env.REACT_NATIVE_RANGER_URL,
  preferredRelays: process.env.REACT_NATIVE_WEB3_PREFERREDRELAYS,
  relayLookupWindowBlocks: process.env.REACT_NATIVE_WEB3_RELAY_LOOKUP_WINDOW_BLOCKS,
  relayRegistrationLookupBlocks: process.env.REACT_NATIVE_WEB3_RELAY_REGISTRATION_LOOKUP_BLOCKS,
  pastEventsQueryMaxPageSize: process.env.REACT_NATIVE_WEB3_PAST_EVENTS_QUERY_MAX_PAGE_SIZE,
  learnMoreLink: process.env.REACT_NATIVE_LEARN_MORE_URL,
  avatarBaseUrl: process.env.REACT_NATIVE_AVATAR_BASE_URL,
  magicApiKey: process.env.REACT_NATIVE_MAGIC_API_KEY,
  magicNetwork: process.env.REACT_NATIVE_MAGIC_NETWORK,
  chainId: process.env.REACT_NATIVE_CHAIN_ID,
};

export default config;
