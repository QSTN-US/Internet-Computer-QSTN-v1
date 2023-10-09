import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Asset { 'name' : string, 'payload' : File }
export interface File {
  'data' : Array<Uint8Array | number[]>,
  'ctype' : string,
}
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [HttpStreamingStrategy],
  'status_code' : number,
}
export interface HttpStreamingCallbackResponse {
  'token' : [] | [HttpStreamingCallbackToken],
  'body' : Uint8Array | number[],
}
export interface HttpStreamingCallbackToken {
  'key' : string,
  'sha256' : [] | [Uint8Array | number[]],
  'index' : bigint,
  'content_encoding' : string,
}
export type HttpStreamingStrategy = {
    'Callback' : {
      'token' : HttpStreamingCallbackToken,
      'callback' : [Principal, string],
    }
  };
export interface _SERVICE {
  'addAsset' : ActorMethod<[Asset], bigint>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'http_request_streaming_callback' : ActorMethod<
    [HttpStreamingCallbackToken],
    HttpStreamingCallbackResponse
  >,
  'streamAsset' : ActorMethod<[bigint, Uint8Array | number[]], undefined>,
}
