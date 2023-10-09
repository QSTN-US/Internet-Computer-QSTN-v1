import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";

module {
  public type UserId = Principal;
  public type SurveyId = Text;

  // general types
  public type Image = [Int8];
  public type Link = Text;
  public type SurveyStatus = ?{ 
    #submitted;
    #approved; // approved submissions can be shown on frontend
    #whitelist;
    #live;
    #fully_funded;
  };

  public type SurveyFundingType = ?{
    #icp;
    #btc;
    #usd;
  };

  public type NewProfile = {
    bio: Text;
    firstName: Text;
    img: Link;
    lastName: Text;
  };

  public type Profile = {
    bio: Text;
    firstName: Text;
    id: UserId;
    img: Link;
    lastName: Text;
  };

  public type NewSurvey = {
    category: Text;
    cover: Link;
    description: Text;
    discordLink: Link;
    goal: Float;
    nftVolume: Nat;
    rewards: Text;
    story: Text;
    tags: [Text]; 
    title: Text;
    twitterLink: Link;
    walletId: Text;
    wetransferLink: Link;
    video: ?Text;
    fundingType: ?SurveyFundingType
  };

  public type Survey = {
    category: Text;
    cover: Link;
    description: Text;
    discordLink: Link;
    goal: Float;
    id: SurveyId;
    nftVolume: Nat;
    owner: UserId;
    rewards: Text;
    status: SurveyStatus;
    story: Text;
    tags: [Text];
    title: Text;
    twitterLink: Link;
    walletId: Text;
    wetransferLink: Link;
    fundingType: ?SurveyFundingType;
  };

  public type SurveyWithOwner = {
    survey: Survey;
    owner: Profile;
  };

  // Marketplace stuff
  public type MarketplaceLink = {
    #entrepot: Link;
    #ccc: Link;
    #other: Link;
  };

  public type MarketplaceLinks = [MarketplaceLink];
};
