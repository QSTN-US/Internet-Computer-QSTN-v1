import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type CanisterIdText = string;
export interface NFTInfo {
  number: bigint;
  priceE8S: bigint;
}
export type Network = { Mainnet: null } | { Regtest: null } | { Testnet: null };
export type SurveyId = bigint;
export type Time = bigint;
export interface definite_canister_settings {
  freezing_threshold: bigint;
  controllers: [] | [Array<Principal>];
  memory_allocation: bigint;
  compute_allocation: bigint;
}
export interface _SERVICE {
  acceptCycles: ActorMethod<[], undefined>;
  availableCycles: ActorMethod<[], bigint>;
  createEscrowCanister: ActorMethod<
    [
      SurveyId,
      Principal,
      string,
      Array<NFTInfo>,
      Time,
      bigint,
      Network,
      string,
      bigint
    ],
    undefined
  >;
  dissociateEscrowCanister: ActorMethod<[SurveyId], undefined>;
  getMaxOversellPercentage: ActorMethod<[], bigint>;
  getSurveyEscrowCanisterPrincipal: ActorMethod<
    [SurveyId],
    [] | [CanisterIdText]
  >;
  setMaxOversellPercentage: ActorMethod<[bigint], undefined>;
  takeover: ActorMethod<[string], definite_canister_settings>;
  wallet_receive: ActorMethod<[], undefined>;
}
