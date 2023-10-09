import Array "mo:base/Array";
import Database "./database";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Types "./types";

module {
  type NewProfile = Types.NewProfile;
  type Profile = Types.Profile;
  type Survey = Types.Survey;
  type SurveyId = Types.SurveyId;
  type SurveyWithOwner = Types.SurveyWithOwner;
  type UserId = Types.UserId;

  // Profiles

  public func getProfile(db: Database.Directory, userId: UserId): Profile {
    let existing = db.getUser(userId);
    switch (existing) {
      case (?existing) { existing };
      case (null) {
        {
          bio = "";
          firstName = "";
          id = userId;
          img = "";
          lastName = "";
        }
      };
    };
  };

  // Surveys

  public func getSurvey(db: Database.Directory, surveyId: SurveyId): Survey {
    let existing = db.getSurvey(surveyId);
    switch (existing) {
      case (?existing) { existing };
      case (null) {
        {
          category = "";
          cover = "";
          description = "";
          discordLink = "";
          goal = 0;
          id = "";
          nftVolume = 0;
          owner = Principal.fromText("");
          rewards = "";
          status= null;
          story = "";
          tags = [];
          title = "";
          twitterLink = "";
          walletId = "";
          wetransferLink = "";
          fundingType = null;
        }
      };
    };
  };

  public func getSurveyWithOwner(db: Database.Directory, p: Survey): SurveyWithOwner {
    {
      survey = p;
      owner = getProfile(db, p.owner);
    }
  };

  // Connections

  public func includes(x: UserId, xs: [UserId]): Bool {
    func isX(y: UserId): Bool { x == y };
    switch (Array.find<UserId>(xs, isX)) {
      case (null) { false };
      case (_) { true };
    };
  };

  // Authorization

  let adminIds: [Text] = [
    "rwvfd-5wxx6-yeevy-xe4wu-rnywu-nrkxe-vxnup-yg3uz-5rgmo-hvtbd-sqe", // Max's local cnft-admin
    "wumae-66jd7-ml547-4s7j2-hvkod-oocmx-sj3tc-6fjhr-cbgvu-thpm3-kae", // Luke's local default
    "krpk7-5knvf-l2jy3-mfzbr-6arys-xhrc5-5k76j-hfszl-mlm37-pqsd2-eqe",  // Artur's local default
    "st2gz-phs6f-4w7d2-b625f-rh5vn-lumml-wxbhq-lcxnw-ob7yh-fhhwp-zqe", // Max's internet identity
    "h4evs-iliqn-ihwf5-4q6lk-dw6ry-hm6go-cazig-qa5t3-ikolx-fbr32-gae", // CrowdfundNFT's internet identity
    "is7gy-jgfpp-4fnpe-da4au-xbb5e-iflz6-kuqge-wef4p-fpeo4-gftlc-mae", // Mazen's Identity
    "alp6s-qiomp-fcbti-7rjdk-igzef-gicc5-gxhve-xqbul-ciwh5-v7zqf-iae" // Mazen's internet identity
  ];

  public func isAdmin(userId: UserId): Bool {
    func identity(x: Text): Bool { x == Principal.toText(userId) };
    Option.isSome(Array.find<Text>(adminIds,identity))
  };

  public func hasAccess(userId: UserId, profile: Profile): Bool {
    userId == profile.id or isAdmin(userId)
  };

  public func hasSurveyAccess(userId: UserId, survey: Survey): Bool {
    userId == survey.owner or isAdmin(userId)
  };
};
