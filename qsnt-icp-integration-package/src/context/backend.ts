import { createContext, useContext, useState } from 'react';

import { makeBackendActor } from '../ui/service/actor-locator';

interface BackendContextType {
  backend: any;
  backendWithAuth: any;
  wallets: any;
  nnsIdentity: any;
  login: () => void;
}

interface BackendProviderProps {
  children: React.ReactNode;
  backend: any;
  backendWithAuth: any;
  wallets: any;
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

const NFID_APPLICATION_NAME = 'QSTN';
const NFID_APPLICATION_LOGO_URL =
  'https%3A%2F%2Fqstnus.com%2F_next%2Fimage?url=%2Fassets%2Fimages%2Flogo.png';

const BackendContext = createContext<BackendContextType | undefined>(
  INITIAL_STATE
);

export function BackendProvider({
  children,
  backend,
  backendWithAuth,
  wallets
}: BackendProviderProps) {
  const [_backend, setBackend] = useState(backend || INITIAL_STATE.backend);
  const [_backendWithAuth, setBackendWithAuth] = useState(
    backendWithAuth || INITIAL_STATE.backendWithAuth
  );
  const [_nnsIdentity, setNnsIdentity] = useState();
  /**
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
        .then((principal) => {
          const newPrincipal = Principal.from(principal).toText();
          newWallets['plug']['principal'] = newPrincipal;
          setWallets({ ...newWallets });
          return newPrincipal;
        })
        .catch((error) => {
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
        .then((principal) => {
          const newPrincipal = Principal.from(principal).toText();
          newWallets['infinity']['principal'] = newPrincipal;
          setWallets({ ...newWallets });
          return newPrincipal;
        })
        .catch((error) => {
          console.error(error);
          return _wallets['infinity']['principal'];
        });
    } else {
      return _wallets['infinity']['principal'];
    }
  };
  const getStoicPrincipal = () => {
    let newWallets = _wallets;
    if (_wallets['stoic']['principal']) {
      return _wallets['stoic']['principal'];
    }
    return handleStoicConnect()
      .then((identity) => {
        const principal = identity.getPrincipal().toText();
        newWallets['stoic']['principal'] = principal;
        setWallets({ ...newWallets });
        return principal;
      })
      .catch((error) => {
        console.error(error);
        return _wallets['stoic']['principal'];
      });
  };
  const login = async (provider) => {
    const environmentName = process.env.NEXT_PUBLIC_ENVIRONMENT;
    let backendWithAuth;

    if (environmentName === 'development') {
      backendWithAuth = makeBackendActor();
    } else {
      backendWithAuth = await authClientLogin(provider);
    }

    setBackendWithAuth(backendWithAuth);
    return backendWithAuth;
  };

  const authClientLogin = async (provider) => {
    const authClient = await AuthClient.create();

    const identityProvider =
      provider === 'nfid'
        ? `https://nfid.one/authenticate/?applicationName=${NFID_APPLICATION_NAME}&applicationLogo=${NFID_APPLICATION_LOGO_URL}#authorize`
        : null;

    return new Promise((resolve, reject) => {
      authClient.login({
        identityProvider,
        derivationOrigin: window.location.origin.includes('qstnus.com')
          ? 'https://kn5ky-6iaaa-aaaai-qbikq-cai.ic0.app'
          : null,
        onSuccess: async () => {
          const identity = authClient.getIdentity();

          if (!identity) {
            return reject(new Error('identity is null'));
          }

          const backend = makeBackendActorWithIdentity(identity);
          setNnsIdentity(identity);

          resolve(backend);
        },
        onError: reject
      });
    });
  };

  let [_wallets, setWallets] = useState(
    wallets ||
      _.merge(INITIAL_STATE.wallets, {
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
      })
  );

  useEffect(() => {
    if (backend) {
      return;
    }

    const _backend = makeBackendActor();
    setBackend(_backend);
  }, []);

  
   *     <BackendContext.Provider 
      value={{
      backend: _backend,
      backendWithAuth: _backendWithAuth,
      wallets: _wallets,
      nnsIdentity: _nnsIdentity,
      login
    }}>
    {children}
    </BackendContext.Provider>
   */

  return null;
}

export function useBackend() {
  const context = useContext(BackendContext);
  return context;
}
