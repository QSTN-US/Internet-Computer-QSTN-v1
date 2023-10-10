import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import {
  ICP_IDENTITY_CONTRACT_ID,
  ICP_WHOAMI_CONTRACT_ID
} from '@qstn/data/constants';
import {
  createActorWhoami as createActor,
  handleInfinityConnect,
  handlePlugConnect,
  makeBackendActor,
  makeBackendActorWithIdentity
} from '@qstn/icp';
import { useAppPersistStore } from '@store/app';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUpdateEffect } from 'usehooks-ts';

interface IcpWalletProviderProps {
  children: React.ReactNode;
}

interface IcpWalletContextType {
  connected?: boolean;
  icpAddress?: string | null | undefined;
  backend: any;
  backendWithAuth: any;
  wallets: any;
  nnsIdentity?: any;
  login: () => any;
  connect?: () => Promise<string | void>;
  logout: () => void;
  disconnect?: () => void;
  balance?: any;
  isAuthenticated: any;
  authClient: any;
  identity: any;
  principal: any;
  whoamiActor: any;
}

const INITIAL_STATE = {
  backend: makeBackendActor(),
  backendWithAuth: null,
  isLoading: true,
  wallets: {
    plug: {
      principal: null
    },
    infinity: {
      principal: null
    },
    stoic: {
      principal: null
    }
  },
  setBackend: () => {},
  nnsIdentity: null
};

const canisterId = ICP_WHOAMI_CONTRACT_ID;
const IcpWalletContext = createContext<IcpWalletContextType | undefined>(
  undefined
);

const defaultOptions = {
  /**
   *  @type {import("@dfinity/auth-client").AuthClientCreateOptions}
   */
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
      disableIdle: true
    }
  },
  /**
   * @type {import("@dfinity/auth-client").AuthClientLoginOptions}
   */
  loginOptions: {
    identityProvider:
      process.env.DFX_NETWORK === 'ic'
        ? 'https://identity.ic0.app/#authorize'
        : `http://127.0.0.1:8000?canisterId=${ICP_IDENTITY_CONTRACT_ID}#authorize`
  }
};

/**
 *
 * @param options - Options for the AuthClient
 * @param {AuthClientCreateOptions} options.createOptions - Options for the AuthClient.create() method
 * @param {AuthClientLoginOptions} options.loginOptions - Options for the AuthClient.login() method
 * @returns
 */
export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<any>(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [whoamiActor, setWhoamiActor] = useState<any>(null);

  const [connected, setConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<any>();
  const [walletAddress, setWalletAddress] = useState<string | null>();
  const [userPublicKey, setUserPublicKey] = useState<any>();
  const [_wallets, setWallets] = useState<any>(INITIAL_STATE.wallets);
  const [_backend, setBackend] = useState<any>(INITIAL_STATE.backend);
  const [_backendWithAuth, setBackendWithAuth] = useState<any>(
    INITIAL_STATE.backendWithAuth
  );

  const setIcpAccounts = useAppPersistStore((state) => state.setIcpAccounts);
  const icpAccounts = useAppPersistStore((state) => state.icpAccounts);

  const getPlugPrincipal = async () => {
    let newWallets = _wallets;
    if (_wallets['plug']['principal']) {
      return _wallets['plug']['principal'];
    }
    if (!window?.ic?.plug) {
      return alert('Plug is not installed in your browser');
    }
    if (
      await handlePlugConnect()
        .then(() => true)
        .catch(() => false)
    ) {
      return window.ic.plug
        .createAgent()
        .then(() => {
          return window.ic.plug.agent.getPrincipal();
        })
        .then((principal: any) => {
          const newPrincipal = Principal.from(principal).toText();
          newWallets['plug']['principal'] = newPrincipal;
          setWallets({ ...newWallets });
          return newPrincipal;
        })
        .catch((error: any) => {
          console.error(error);
          return _wallets['plug']['principal'];
        });
    } else {
      return _wallets['plug']['principal'];
    }
  };
  const getInfinityPrincipal = async () => {
    let newWallets = _wallets;
    if (_wallets['infinity']['principal']) {
      return _wallets['infinity']['principal'];
    }
    if (!window?.ic?.infinityWallet) {
      return alert('Infinity is not installed in your browser');
    }
    if (
      await handleInfinityConnect()
        .then(() => true)
        .catch(() => false)
    ) {
      return window.ic.infinityWallet
        .getPrincipal()
        .then((principal: any) => {
          const newPrincipal = Principal.from(principal).toText();
          newWallets['infinity']['principal'] = newPrincipal;
          setWallets({ ...newWallets });
          return newPrincipal;
        })
        .catch((error: any) => {
          console.error(error);
          return _wallets['infinity']['principal'];
        });
    } else {
      return _wallets['infinity']['principal'];
    }
  };
  const getStoicPrincipal = () => {
    /*let newWallets = _wallets;
    if (_wallets['stoic']['principal']) {
      return _wallets['stoic']['principal'];
    }
    return handleStoicConnect()
      .then((identity: any) => {
        const principal = identity.getPrincipal().toText();
        newWallets['stoic']['principal'] = principal;
        setWallets({ ...newWallets });
        return principal;
      })
      .catch((error: any) => {
        console.error(error);
        return _wallets['stoic']['principal'];
      });*/
  };

  const availableWallets = Object.assign(INITIAL_STATE.wallets, {
    plug: {
      getPrincipal: () => {
        return getPlugPrincipal();
      }
    },
    infinity: {
      getPrincipal: () => {
        return getInfinityPrincipal();
      }
    },
    stoic: {
      getPrincipal: () => getStoicPrincipal()
    }
  });

  async function updateClient(client: any) {
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);

    let backendWithAuth;
    //if (environmentName === 'development') {
    backendWithAuth = makeBackendActor();
    //} else {
    //backendWithAuth = await authClientLogin(provider);
    //}

    setBackendWithAuth(backendWithAuth);

    const identity = client.getIdentity();
    setIdentity(identity);

    if (!identity) {
      console.log('identity is null');
      return false;
    }

    const principal = identity.getPrincipal();
    setPrincipal(principal);

    setAuthClient(client);

    const actor = createActor(canisterId, {
      agentOptions: {
        host: 'http://127.0.0.1:8000',
        identity
      }
    });

    setWhoamiActor(actor);
  }

  const login = () => {
    authClient !== null &&
      authClient?.login({
        ...options.loginOptions,
        onSuccess: () => {
          const address = walletAddress;
          setIcpAccounts(address);
          updateClient(authClient);
          const identity = authClient.getIdentity();
          setIdentity(identity);
          const backend = makeBackendActorWithIdentity(identity);
          //setNnsIdentity(identity);
        }
      });
  };

  async function logout() {
    setIcpAccounts(null);
    setWalletAddress(null);
    setUserPublicKey(null);
    setBalance(null);
    setConnected(false);
    await authClient?.logout();
    await updateClient(authClient);
  }

  const getBalance = async () => {
    if (icpAccounts !== null) {
      const result = await window.ic?.infinityWallet.getUserAssets();
      console.log(result);
      setBalance(result);
    }
  };

  useEffect(() => {
    setWallets(availableWallets);
    if (availableWallets.infinity.principal !== null) {
      setWalletAddress(availableWallets.infinity.principal);
      setConnected(true);
    }

    //if (icpAccounts === null) {
    // Initialize AuthClient
    AuthClient.create(options.createOptions).then(async (client) => {
      updateClient(client);
    });
    //}
  }, []);

  useUpdateEffect(() => {
    getBalance();
  }, [connected]);

  return {
    isAuthenticated,
    wallets: _wallets,
    backend: _backend,
    backendWithAuth: _backendWithAuth,
    login,
    logout,
    icpAddress: walletAddress,
    authClient,
    identity,
    principal,
    whoamiActor,
    balance
  };
};

/**
 * @type {React.FC}
 */
const IcpWalletProvider = ({ children }: IcpWalletProviderProps) => {
  const auth = useAuthClient();

  return (
    <IcpWalletContext.Provider value={auth}>
      {children}
    </IcpWalletContext.Provider>
  );
};

export const useIcpNetwork = () => {
  const context = useContext(IcpWalletContext);

  if (!context) {
    throw new Error('Component rendered outside the provider tree');
  }

  return context;
};

export default IcpWalletProvider;
