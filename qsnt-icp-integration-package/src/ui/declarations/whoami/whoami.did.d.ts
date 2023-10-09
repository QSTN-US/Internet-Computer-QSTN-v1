import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface _SERVICE {
  whoami: ActorMethod<[], Principal>;
}
