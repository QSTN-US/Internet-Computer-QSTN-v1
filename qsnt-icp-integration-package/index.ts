//export { BackendProvider, useBackend } from './src/context/backend'
//export { selectWalletModalPromise } from './src/components/select-wallet-modal';
export { createActor } from './src/helpers/createActor';
export { imgFileToInt8Array } from './src/helpers/imageHelper';
export {
  handleInfinityConnect,
  handlePlugConnect,
  handleStoicConnect
} from './src/helpers/wallets';
export { createActor as createActorWhoami } from './src/ui/declarations/whoami';
export {
  getImageURL,
  makeBackendActor,
  makeBackendActorWithIdentity,
  makeEscrowActor
} from './src/ui/service/actor-locator';
//export PromptLoginModal from './src/components/prompt-login-modal'
