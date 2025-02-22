import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import Web3, {magic} from 'services/Magic';
import {Account} from 'web3-core';
import {Contract} from 'web3-eth-contract';
import {Alert} from 'react-native';
import {getTreejerApiAccessToken, getTreejerPrivateKeyApiAccessToken} from 'utilities/helpers/getTreejerApiAccessToken';
import config from './config';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNetInfoConnected from 'utilities/hooks/useNetInfo';

const initialValue = {
  web3: {} as Web3,
  walletWeb3: {} as Web3,
  unlocked: false,
  storePrivateKey: (async () => {}) as (privateKey: string, password?: string) => Promise<void>,
  accessToken: '',
  treeFactory: {} as Contract,
  planter: {} as Contract,
  planterFund: {} as Contract,
  resetWeb3Data() {},
  waiting: false,
  userId: '',
  user: null,
  magicToken: '',
  storeMagicToken: (token: string) => {},
  wallet: null,
  loading: true,
};

export const Web3Context = React.createContext(initialValue);

interface Props {
  children: React.ReactNode;
  privateKey?: string;
  persistedMagicToken?: string;
  persistedWallet?: string;
  persistedAccessToken?: string;
  persistedUserId?: string;
}

function Web3Provider(props: Props) {
  const {
    children,
    privateKey,
    persistedMagicToken,
    persistedWallet = null,
    persistedAccessToken = '',
    persistedUserId = '',
  } = props;
  const web3 = useMemo(() => new Web3(magic.rpcProvider), []);
  const [loading, setLoading] = useState<boolean>(true);

  const [walletWeb3, setWalletWeb3] = useState<Web3>();
  const [wallet, setWallet] = useState<null | string>(persistedWallet);
  const [magicToken, setMagicToken] = useState<string>(persistedMagicToken);
  const [waiting, setWaiting] = useState<boolean>(true);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>(persistedAccessToken);
  const [userId, setUserId] = useState<string>(persistedUserId);

  const treeFactory = useContract(web3, config.contracts.TreeFactory);
  const planter = useContract(web3, config.contracts.Planter);
  const planterFund = useContract(web3, config.contracts.PlanterFund);
  const {t} = useTranslation();

  const isConnected = useNetInfoConnected();

  const previousWeb3 = useRef<Web3 | null>(null);

  const addToWallet = useCallback(
    (privateKey: string) => {
      web3.eth.accounts.wallet.add(privateKey);
    },
    [web3],
  );

  const updateAccessTokenWithPrivateKey = useCallback(
    async (privateKey: string) => {
      try {
        const credentials = await getTreejerPrivateKeyApiAccessToken(privateKey, web3);
        setAccessToken(credentials.loginToken);
        await AsyncStorage.setItem(config.storageKeys.accessToken, credentials.loginToken);
        setUserId(credentials.userId);
        setUnlocked(true);
        setWalletWeb3(web3);
      } catch (e) {
        const {error: {message = t('loginFailed.message')} = {}} = e;
        Alert.alert(t('loginFailed.title'), message);
        console.log(e, 'e inside updateAccessToken');
      }

      setWaiting(false);
    },
    [t, web3],
  );

  const updateAccessToken = useCallback(async () => {
    try {
      console.log('[[[[try]]]]');
      const credentials = await getTreejerApiAccessToken(web3);
      setAccessToken(credentials.loginToken);
      if (credentials.loginToken) {
        await AsyncStorage.setItem(config.storageKeys.accessToken, credentials.loginToken);
      } else {
        await AsyncStorage.removeItem(config.storageKeys.accessToken);
      }

      setUserId(credentials.userId);
      if (credentials.userId) {
        await AsyncStorage.setItem(config.storageKeys.userId, credentials.userId);
      } else {
        await AsyncStorage.removeItem(config.storageKeys.userId);
      }
      setUnlocked(true);
      setWalletWeb3(web3);
      let web3Accounts = [credentials.wallet];
      await web3.eth.getAccounts(async (e, accounts) => {
        if (e) {
          console.log(e, 'e is here getAccounts eth');
          setWaiting(false);
          setLoading(false);
          web3Accounts = accounts;
          return;
        }
        const account = web3Accounts[0];
        if (account) {
          await AsyncStorage.setItem(config.storageKeys.magicWalletAddress, account);
          setWallet(account);
          setWaiting(false);
          setLoading(false);
        }
      });
    } catch (e) {
      console.log('[[[[catch]]]]');
      let {error: {message = t('loginFailed.message')} = {}} = e;
      if (e.message) {
        message = e.message;
      }
      setWaiting(false);
      setLoading(false);
      Alert.alert(t('loginFailed.title'), message);
    }
  }, [t, web3]);

  const storeMagicToken = useCallback(
    async (token: string) => {
      setMagicToken(token);
      // addToWallet(token);

      await AsyncStorage.setItem(config.storageKeys.magicToken, token);
      if (isConnected) {
        await updateAccessToken();
      } else {
        setWaiting(false);
        setLoading(false);
        setUnlocked(true);
      }
    },
    [updateAccessToken],
  );

  const resetWeb3Data = useCallback(async () => {
    await setUnlocked(false);
    await setAccessToken('');
    await setWallet(null);
  }, []);

  const storePrivateKey = useCallback(
    async (privateKey: string) => {
      addToWallet(privateKey);

      await AsyncStorage.setItem(config.storageKeys.privateKey, privateKey);
      await updateAccessTokenWithPrivateKey(privateKey);
    },
    [updateAccessTokenWithPrivateKey, addToWallet],
  );

  useEffect(() => {
    (async function () {
      try {
        const magicWalletAddress = await AsyncStorage.getItem(config.storageKeys.magicWalletAddress);
        if (magicWalletAddress) {
          setWallet(magicWalletAddress);
        }
      } catch (e) {
        console.log(e, 'e');
      }
      console.log(persistedMagicToken, 'persistedMagicToken');
      if (persistedMagicToken) {
        await storeMagicToken(persistedMagicToken);
      } else {
        setWaiting(false);
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (privateKey) {
  //     updateAccessTokenWithPrivateKey(privateKey);
  //   } else {
  //     setWaiting(false);
  //   }
  // }, [privateKey, updateAccessTokenWithPrivateKey]);

  // Because adding an account to wallet does not trigger a re-render, this needs to be done here instead of useEffect
  if (privateKey && previousWeb3.current !== web3) {
    previousWeb3.current = web3;
    addToWallet(privateKey);
  }

  const value = useMemo(
    () => ({
      web3,
      storePrivateKey,
      unlocked,
      accessToken,
      walletWeb3,
      treeFactory,
      waiting,
      resetWeb3Data,
      userId,
      planter,
      planterFund,
      magicToken,
      storeMagicToken,
      wallet,
      loading,
    }),
    [
      web3,
      storePrivateKey,
      unlocked,
      accessToken,
      walletWeb3,
      treeFactory,
      waiting,
      resetWeb3Data,
      userId,
      planter,
      planterFund,
      magicToken,
      storeMagicToken,
      wallet,
      loading,
    ],
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

const useContract = (web3: Web3, {abi, address}: {abi: any; address: string}) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => new web3.eth.Contract(abi, address), [web3, address]);

export default memo(Web3Provider);

export const useWeb3 = () => useContext(Web3Context).web3;
export const useWalletWeb3 = () => useContext(Web3Context).web3;
export const useTreeFactory = () => useContext(Web3Context).treeFactory;
export const usePlanter = () => useContext(Web3Context).planter;
export const usePlanterFund = () => useContext(Web3Context).planterFund;
export const useResetWeb3Data = () => {
  const resetWeb3Data = useContext(Web3Context).resetWeb3Data;
  return {resetWeb3Data};
};
export const useWalletAccount = (): string | null => {
  return useContext(Web3Context).wallet;
};
export const useWalletAccountTorus = (): Account | null => {
  const web3 = useWeb3();
  return web3.eth.accounts.wallet.length ? web3.eth.accounts.wallet[0] : null;
};
export const useAccessToken = () => useContext(Web3Context).accessToken;
export const useUserId = () => useContext(Web3Context).userId;

export const usePrivateKeyStorage = () => {
  const {storePrivateKey, unlocked, storeMagicToken} = useContext(Web3Context);

  return {
    storePrivateKey,
    unlocked,
    storeMagicToken,
  };
};

export const usePersistedWallet = () => {
  const [privateKey, setPrivateKey] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(config.storageKeys.privateKey)
      .then(key => {
        if (key) {
          setPrivateKey(key);
        }

        setLoaded(true);
      })
      .catch(() => {
        console.warn('Failed to get fetch stored private key');
      });
  }, []);

  return [loaded, privateKey] as const;
};

export const usePersistedMagic = () => {
  const [magicToken, setMagicToken] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(config.storageKeys.magicToken)
      .then(key => {
        if (key) {
          setMagicToken(key);
        }

        setLoaded(true);
      })
      .catch(() => {
        console.warn('Failed to get fetch stored magic token');
      });
  }, []);

  return [loaded, magicToken] as const;
};
