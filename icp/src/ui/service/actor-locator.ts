// import {idlFactory as backendIdl} from 'ui/declarations/backend/backend.did.js'
import {
  canisterId as backendCanisterId,
  createActor as createBackendActor
} from '../declarations/backend';
import {
  canisterId as imagesCanisterId,
  createActor as createImagesActor
} from '../declarations/images';
import {
  canisterId as escrowCanisterId,
  createActor as createEscrowActor
} from '../declarations/survey_manager';

export const makeActorWithPrincipal = (
  canisterId: any,
  createActor: any,
  identity?: any
) => {
  const options = {
    agentOptions: {
      host: 'http://127.0.0.1:8000', //process.env.NEXT_PUBLIC_IC_HOST,
      identity: identity ?? undefined
    }
  };
  return createActor(canisterId, options);
};

export const makeBackendActorWithIdentity = (identity: any) =>
  makeActorWithPrincipal(backendCanisterId, createBackendActor, identity);

export const makeBackendActor = () =>
  makeActorWithPrincipal(backendCanisterId, createBackendActor);

export const makeImagesActor = () =>
  makeActorWithPrincipal(imagesCanisterId, createImagesActor);

export const makeEscrowActor = () =>
  makeActorWithPrincipal(escrowCanisterId, createEscrowActor);

export const getImageURL = (imageId: any) =>
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'
    ? 'http://127.0.0.1:8000/?canisterId=' + imagesCanisterId + '&id=' + imageId
    : 'https://' + imagesCanisterId + '.raw.ic0.app/id=' + imageId;
