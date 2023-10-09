import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Date = string;
export type GUID = string;
export type Link = string;
export type Link__1 = string;
export type MarketplaceLink = { 'ccc' : Link } |
  { 'other' : Link } |
  { 'entrepot' : Link };
export type MarketplaceLinks = Array<MarketplaceLink>;
export interface NFTInfo { 'index' : bigint, 'canisterId' : string }
export interface NewProfile {
  'bio' : string,
  'img' : Link,
  'lastName' : string,
  'firstName' : string,
}
export interface NewSurvey {
  'title' : string,
  'wetransferLink' : Link,
  'video' : [] | [string],
  'goal' : number,
  'twitterLink' : Link,
  'cover' : Link,
  'tags' : Array<string>,
  'description' : string,
  'discordLink' : Link,
  'story' : string,
  'rewards' : string,
  'category' : string,
  'fundingType' : [] | [SurveyFundingType],
  'nftVolume' : bigint,
  'walletId' : string,
}
export interface NewSurveyResult {
  'owner' : UserId,
  'claimId' : string,
  'surveyId' : SurveyId__1,
}
export interface Profile {
  'id' : UserId,
  'bio' : string,
  'img' : Link,
  'lastName' : string,
  'firstName' : string,
}
export interface Profile__1 {
  'id' : UserId,
  'bio' : string,
  'img' : Link,
  'lastName' : string,
  'firstName' : string,
}
export interface Survey {
  'id' : SurveyId__1,
  'status' : SurveyStatus__1,
  'title' : string,
  'wetransferLink' : Link,
  'owner' : UserId,
  'goal' : number,
  'twitterLink' : Link,
  'cover' : Link,
  'tags' : Array<string>,
  'description' : string,
  'discordLink' : Link,
  'story' : string,
  'rewards' : string,
  'category' : string,
  'fundingType' : [] | [SurveyFundingType],
  'nftVolume' : bigint,
  'walletId' : string,
}
export type SurveyFundingType = [] | [
  { 'btc' : null } |
    { 'icp' : null } |
    { 'usd' : null }
];
export type SurveyId = string;
export type SurveyId__1 = string;
export interface SurveyResult {
  'id' : SurveyResultId,
  'owner' : UserId,
  'claimId' : string,
  'surveyId' : SurveyId__1,
}
export type SurveyResultId = string;
export type SurveyState = { 'closed' : null } |
  { 'whitelist' : Array<Principal> } |
  { 'nosurvey' : null } |
  { 'live' : null };
export type SurveyStatus = [] | [
  { 'fully_funded' : null } |
    { 'submitted' : null } |
    { 'whitelist' : null } |
    { 'live' : null } |
    { 'approved' : null }
];
export type SurveyStatus__1 = [] | [
  { 'fully_funded' : null } |
    { 'submitted' : null } |
    { 'whitelist' : null } |
    { 'live' : null } |
    { 'approved' : null }
];
export interface SurveyWithOwner { 'owner' : Profile__1, 'survey' : Survey__1 }
export interface Survey__1 {
  'id' : SurveyId__1,
  'status' : SurveyStatus__1,
  'title' : string,
  'wetransferLink' : Link,
  'owner' : UserId,
  'goal' : number,
  'twitterLink' : Link,
  'cover' : Link,
  'tags' : Array<string>,
  'description' : string,
  'discordLink' : Link,
  'story' : string,
  'rewards' : string,
  'category' : string,
  'fundingType' : [] | [SurveyFundingType],
  'nftVolume' : bigint,
  'walletId' : string,
}
export type UserId = Principal;
export type UserId__1 = Principal;
export interface _SERVICE {
  'addWhitelist' : ActorMethod<[SurveyId, Array<Principal>], undefined>,
  'adminCreateProfile' : ActorMethod<[Principal, NewProfile], undefined>,
  'adminCreateSurvey' : ActorMethod<[Principal, NewSurvey], Survey>,
  'approveSurvey' : ActorMethod<[SurveyId], undefined>,
  'archiveSurvey' : ActorMethod<[SurveyId], undefined>,
  'closeSurvey' : ActorMethod<[SurveyId], undefined>,
  'createFirstSurvey' : ActorMethod<[NewProfile, NewSurvey], Survey>,
  'createProfile' : ActorMethod<[NewProfile], undefined>,
  'createSurvey' : ActorMethod<[NewSurvey], Survey>,
  'createSurveyResult' : ActorMethod<[NewSurveyResult], SurveyResult>,
  'deleteSurvey' : ActorMethod<[SurveyId], [] | [Survey]>,
  'getLaunchDate' : ActorMethod<[SurveyId], [] | [Date]>,
  'getMarketplaceLinks' : ActorMethod<[SurveyId], MarketplaceLinks>,
  'getMyProfile' : ActorMethod<[], Profile>,
  'getMySurveys' : ActorMethod<[], Array<Survey>>,
  'getNFTInfo' : ActorMethod<[GUID], [] | [NFTInfo]>,
  'getOwnId' : ActorMethod<[], UserId__1>,
  'getOwnIdText' : ActorMethod<[], string>,
  'getProfile' : ActorMethod<[UserId__1], Profile>,
  'getSurvey' : ActorMethod<[SurveyId], Survey>,
  'getSurveyState' : ActorMethod<[SurveyId], SurveyState>,
  'getSurveyVideo' : ActorMethod<[SurveyId], [] | [Link__1]>,
  'getSurveyWithOwner' : ActorMethod<[SurveyId], SurveyWithOwner>,
  'getSurveyWithOwnerAndMarketplace' : ActorMethod<
    [SurveyId],
    {
      'owner' : Profile,
      'survey' : Survey,
      'marketplaceLinks' : MarketplaceLinks,
    }
  >,
  'getSurveys' : ActorMethod<[UserId__1], Array<Survey>>,
  'getWhitelist' : ActorMethod<[SurveyId], Array<Principal>>,
  'greet' : ActorMethod<[], string>,
  'healthcheck' : ActorMethod<[], boolean>,
  'isAdmin' : ActorMethod<[], boolean>,
  'listSurveys' : ActorMethod<
    [Array<SurveyStatus>, string, Array<string>],
    Array<SurveyWithOwner>
  >,
  'makeSurveyLive' : ActorMethod<[SurveyId], undefined>,
  'openSurveyToWhiteList' : ActorMethod<[SurveyId], undefined>,
  'putLaunchDate' : ActorMethod<[SurveyId, Date], undefined>,
  'putNFTGUIDs' : ActorMethod<[Array<[GUID, NFTInfo]>], undefined>,
  'resetWhitelist' : ActorMethod<[SurveyId], undefined>,
  'searchProfiles' : ActorMethod<[string], Array<Profile>>,
  'setMarketplaceLinks' : ActorMethod<[SurveyId, MarketplaceLinks], undefined>,
  'setSurveyFullyFunded' : ActorMethod<[SurveyId], undefined>,
  'unapproveSurvey' : ActorMethod<[SurveyId], undefined>,
  'updateProfile' : ActorMethod<[Profile], undefined>,
  'updateSurvey' : ActorMethod<[Survey], undefined>,
  'updateSurveyStatus' : ActorMethod<[SurveyId, SurveyStatus], undefined>,
  'updateSurveyVideo' : ActorMethod<[SurveyId, string], SurveyId>,
}
