export const idlFactory = ({ IDL }) => {
  const SurveyId = IDL.Text;
  const Link = IDL.Text;
  const NewProfile = IDL.Record({
    'bio' : IDL.Text,
    'img' : Link,
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  const SurveyFundingType = IDL.Opt(
    IDL.Variant({ 'btc' : IDL.Null, 'icp' : IDL.Null, 'usd' : IDL.Null })
  );
  const NewSurvey = IDL.Record({
    'title' : IDL.Text,
    'wetransferLink' : Link,
    'video' : IDL.Opt(IDL.Text),
    'goal' : IDL.Float64,
    'twitterLink' : Link,
    'cover' : Link,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'discordLink' : Link,
    'story' : IDL.Text,
    'rewards' : IDL.Text,
    'category' : IDL.Text,
    'fundingType' : IDL.Opt(SurveyFundingType),
    'nftVolume' : IDL.Nat,
    'walletId' : IDL.Text,
  });
  const SurveyId__1 = IDL.Text;
  const SurveyStatus__1 = IDL.Opt(
    IDL.Variant({
      'fully_funded' : IDL.Null,
      'submitted' : IDL.Null,
      'whitelist' : IDL.Null,
      'live' : IDL.Null,
      'approved' : IDL.Null,
    })
  );
  const UserId = IDL.Principal;
  const Survey = IDL.Record({
    'id' : SurveyId__1,
    'status' : SurveyStatus__1,
    'title' : IDL.Text,
    'wetransferLink' : Link,
    'owner' : UserId,
    'goal' : IDL.Float64,
    'twitterLink' : Link,
    'cover' : Link,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'discordLink' : Link,
    'story' : IDL.Text,
    'rewards' : IDL.Text,
    'category' : IDL.Text,
    'fundingType' : IDL.Opt(SurveyFundingType),
    'nftVolume' : IDL.Nat,
    'walletId' : IDL.Text,
  });
  const NewSurveyResult = IDL.Record({
    'owner' : UserId,
    'claimId' : IDL.Text,
    'surveyId' : SurveyId__1,
  });
  const SurveyResultId = IDL.Text;
  const SurveyResult = IDL.Record({
    'id' : SurveyResultId,
    'owner' : UserId,
    'claimId' : IDL.Text,
    'surveyId' : SurveyId__1,
  });
  const Date = IDL.Text;
  const MarketplaceLink = IDL.Variant({
    'ccc' : Link,
    'other' : Link,
    'entrepot' : Link,
  });
  const MarketplaceLinks = IDL.Vec(MarketplaceLink);
  const Profile = IDL.Record({
    'id' : UserId,
    'bio' : IDL.Text,
    'img' : Link,
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  const GUID = IDL.Text;
  const NFTInfo = IDL.Record({ 'index' : IDL.Nat, 'canisterId' : IDL.Text });
  const UserId__1 = IDL.Principal;
  const SurveyState = IDL.Variant({
    'closed' : IDL.Null,
    'whitelist' : IDL.Vec(IDL.Principal),
    'nosurvey' : IDL.Null,
    'live' : IDL.Null,
  });
  const Link__1 = IDL.Text;
  const Profile__1 = IDL.Record({
    'id' : UserId,
    'bio' : IDL.Text,
    'img' : Link,
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  const Survey__1 = IDL.Record({
    'id' : SurveyId__1,
    'status' : SurveyStatus__1,
    'title' : IDL.Text,
    'wetransferLink' : Link,
    'owner' : UserId,
    'goal' : IDL.Float64,
    'twitterLink' : Link,
    'cover' : Link,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'discordLink' : Link,
    'story' : IDL.Text,
    'rewards' : IDL.Text,
    'category' : IDL.Text,
    'fundingType' : IDL.Opt(SurveyFundingType),
    'nftVolume' : IDL.Nat,
    'walletId' : IDL.Text,
  });
  const SurveyWithOwner = IDL.Record({
    'owner' : Profile__1,
    'survey' : Survey__1,
  });
  const SurveyStatus = IDL.Opt(
    IDL.Variant({
      'fully_funded' : IDL.Null,
      'submitted' : IDL.Null,
      'whitelist' : IDL.Null,
      'live' : IDL.Null,
      'approved' : IDL.Null,
    })
  );
  return IDL.Service({
    'addWhitelist' : IDL.Func([SurveyId, IDL.Vec(IDL.Principal)], [], []),
    'adminCreateProfile' : IDL.Func([IDL.Principal, NewProfile], [], []),
    'adminCreateSurvey' : IDL.Func([IDL.Principal, NewSurvey], [Survey], []),
    'approveSurvey' : IDL.Func([SurveyId], [], []),
    'archiveSurvey' : IDL.Func([SurveyId], [], []),
    'closeSurvey' : IDL.Func([SurveyId], [], []),
    'createFirstSurvey' : IDL.Func([NewProfile, NewSurvey], [Survey], []),
    'createProfile' : IDL.Func([NewProfile], [], []),
    'createSurvey' : IDL.Func([NewSurvey], [Survey], []),
    'createSurveyResult' : IDL.Func([NewSurveyResult], [SurveyResult], []),
    'deleteSurvey' : IDL.Func([SurveyId], [IDL.Opt(Survey)], []),
    'getLaunchDate' : IDL.Func([SurveyId], [IDL.Opt(Date)], ['query']),
    'getMarketplaceLinks' : IDL.Func([SurveyId], [MarketplaceLinks], ['query']),
    'getMyProfile' : IDL.Func([], [Profile], ['query']),
    'getMySurveys' : IDL.Func([], [IDL.Vec(Survey)], ['query']),
    'getNFTInfo' : IDL.Func([GUID], [IDL.Opt(NFTInfo)], ['query']),
    'getOwnId' : IDL.Func([], [UserId__1], ['query']),
    'getOwnIdText' : IDL.Func([], [IDL.Text], ['query']),
    'getProfile' : IDL.Func([UserId__1], [Profile], ['query']),
    'getSurvey' : IDL.Func([SurveyId], [Survey], ['query']),
    'getSurveyState' : IDL.Func([SurveyId], [SurveyState], ['query']),
    'getSurveyVideo' : IDL.Func([SurveyId], [IDL.Opt(Link__1)], ['query']),
    'getSurveyWithOwner' : IDL.Func([SurveyId], [SurveyWithOwner], ['query']),
    'getSurveyWithOwnerAndMarketplace' : IDL.Func(
        [SurveyId],
        [
          IDL.Record({
            'owner' : Profile,
            'survey' : Survey,
            'marketplaceLinks' : MarketplaceLinks,
          }),
        ],
        ['query'],
      ),
    'getSurveys' : IDL.Func([UserId__1], [IDL.Vec(Survey)], ['query']),
    'getWhitelist' : IDL.Func([SurveyId], [IDL.Vec(IDL.Principal)], ['query']),
    'greet' : IDL.Func([], [IDL.Text], []),
    'healthcheck' : IDL.Func([], [IDL.Bool], []),
    'isAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listSurveys' : IDL.Func(
        [IDL.Vec(SurveyStatus), IDL.Text, IDL.Vec(IDL.Text)],
        [IDL.Vec(SurveyWithOwner)],
        ['query'],
      ),
    'makeSurveyLive' : IDL.Func([SurveyId], [], []),
    'openSurveyToWhiteList' : IDL.Func([SurveyId], [], []),
    'putLaunchDate' : IDL.Func([SurveyId, Date], [], []),
    'putNFTGUIDs' : IDL.Func([IDL.Vec(IDL.Tuple(GUID, NFTInfo))], [], []),
    'resetWhitelist' : IDL.Func([SurveyId], [], []),
    'searchProfiles' : IDL.Func([IDL.Text], [IDL.Vec(Profile)], ['query']),
    'setMarketplaceLinks' : IDL.Func([SurveyId, MarketplaceLinks], [], []),
    'setSurveyFullyFunded' : IDL.Func([SurveyId], [], []),
    'unapproveSurvey' : IDL.Func([SurveyId], [], []),
    'updateProfile' : IDL.Func([Profile], [], []),
    'updateSurvey' : IDL.Func([Survey], [], []),
    'updateSurveyStatus' : IDL.Func([SurveyId, SurveyStatus], [], []),
    'updateSurveyVideo' : IDL.Func([SurveyId, IDL.Text], [SurveyId], []),
  });
};
export const init = ({ IDL }) => { return []; };
