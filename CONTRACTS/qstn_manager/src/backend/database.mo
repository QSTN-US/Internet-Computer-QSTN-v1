import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Types "./types";
import Text "mo:base/Text";
import Prim "mo:prim";

module {
  type NewProfile = Types.NewProfile;
  type NewSurvey = Types.NewSurvey;
  type NewSurveyResult = Types.NewSurveyResult;
  type Profile = Types.Profile;
  type Survey = Types.Survey;
  type SurveyResult = Types.SurveyResult;
  type SurveyId = Types.SurveyId;
  type SurveyResultId = Types.SurveyResultId;
  type SurveyStatus = Types.SurveyStatus;
  type UserId = Types.UserId;
  type Link = Types.Link;

  public class Directory() {

    // The "database" is made up of a few hashmaps
    let userMap = HashMap.HashMap<UserId, Profile>(1, isEqUserId, Principal.hash);
    let surveyMap = HashMap.HashMap<SurveyId, Survey>(1, isEqSurveyId, Text.hash);
    let surveyResultMap = HashMap.HashMap<SurveyResultId, SurveyResult>(1, isEqSurveyResultId, Text.hash);
    let userToSurveysMap = HashMap.HashMap<UserId, [SurveyId]>(1, isEqUserId, Principal.hash);
    let userToSurveyResultsMap = HashMap.HashMap<UserId, [SurveyResultId]>(1, isEqUserId, Principal.hash);
    let surveyVideoMap = HashMap.HashMap<SurveyId, Link>(1, isEqSurveyId, Text.hash);

    // Users

    public func createOne(userId: UserId, profile: NewProfile) {
      userMap.put(userId, makeProfile(userId, profile));
    };

    public func updateOne(userId: UserId, profile: Profile) {
      userMap.put(userId, profile);
    };

    public func getUser(userId: UserId): ?Profile {
      userMap.get(userId)
    };

    public func getMultipleUsers(userIds: [UserId]): [Profile] {
      func getProfile(userId: UserId): Profile {
        switch (userMap.get(userId)) {
          case null {
            {
              bio = "";
              id = userId;
              img = "";
              firstName = "";
              lastName = "";
            };
          };
          case (?profile) { profile };
        };
      };
      Array.map<UserId, Profile>(userIds, getProfile)
    };

    public func findUserBy(term: Text): [Profile] {
      var profiles : Buffer.Buffer<Profile> = Buffer.Buffer<Profile>(1);
      for ((id, profile) in userMap.entries()) {
        let fullName = profile.firstName # " " # profile.lastName;
        if (includesText(fullName, term)) {
          profiles.add(profile);
        };
      };
      profiles.toArray();
    };

    // Surveys 

    public func createSurvey(userId: UserId, newSurvey: NewSurvey): Survey {
      let survey = makeSurvey(userId, newSurvey);
      surveyMap.put(survey.id, survey);

      switch (newSurvey.video) {
        case (null) { };
        case (?video) {
          surveyVideoMap.put(survey.id, video);
        }
      };


      switch (userToSurveysMap.get(userId)) {
        case (null) { userToSurveysMap.put(userId, [survey.id]); };
        case (?surveys) { userToSurveysMap.put(userId, Array.append<SurveyId>(surveys, [survey.id])); };
      };
      survey;
    };


    public func createSurveyResult(userId: UserId, newSurveyResult: NewSurveyResult): SurveyResult {
      let surveyResult = makeSurveyResult(userId, newSurveyResult);
      surveyResultMap.put(surveyResult.id, surveyResult);

      switch (userToSurveyResultsMap.get(userId)) {
        case (null) { userToSurveyResultsMap.put(userId, [surveyResult.id]); };
        case (?surveyResults) { userToSurveyResultsMap.put(userId, Array.append<SurveyResultId>(surveyResults, [surveyResult.id])); };
      };
      surveyResult;
    };

    public func putSurveyVideo(surveyId: SurveyId, video: Text): SurveyId {
         surveyVideoMap.put(surveyId, video);
         surveyId;
    };

    public func deleteSurvey(surveyId: SurveyId) : ?Survey {
      let p = surveyMap.get(surveyId);
      switch (p) {
        case null { };
        case (?survey) {
          switch (userToSurveysMap.get(survey.owner)) {
            case null { };
            case (?surveys) {
              func idsNotEqual (curId: SurveyId) : Bool { isEqSurveyId(curId, surveyId) != true };
              let newSurveys = Array.filter<SurveyId>(surveys, idsNotEqual);
              userToSurveysMap.put(survey.owner, newSurveys);
            };
          };
        };
      };
      surveyMap.remove(surveyId);
    };

    public func getSurvey(surveyId: SurveyId): ?Survey {
      surveyMap.get(surveyId)
    };

    public func getSurveyVideo(surveyId: SurveyId): ?Link {
      surveyVideoMap.get(surveyId);
    };

    public func getSurveyResult(surveyResultId: SurveyResultId): ?SurveyResult {
      surveyResultMap.get(surveyResultId)
    };

    public func getSurveys(userId: UserId): [Survey] {
      switch (userToSurveysMap.get(userId)) {
        case (null) { [] };
        case (?surveys) {
          func getSurvey(surveyId: SurveyId): Survey {
            switch (surveyMap.get(surveyId)) {
              case null {
                {
                  category = "";
                  cover = "";
                  description = "";
                  discordLink = "";
                  goal = 0;
                  id = surveyId;
                  nftVolume = 0;
                  owner = userId;
                  rewards = "";
                  status = null;
                  story = "";
                  tags = [];
                  title = "";
                  twitterLink = "";
                  walletId = "";
                  wetransferLink = "";
                  fundingType = null;
                };
              };
              case (?survey) { survey };
            }
          };
          Array.map<SurveyId, Survey>(surveys, getSurvey)
        };
      };
    };

    public func listSurveys() : [Survey] {
      Iter.toArray(surveyMap.vals())
    };

    public func updateSurvey(survey: Survey) {
      surveyMap.put(survey.id, survey);
    };

    public func listSurveyResults() : [SurveyResult] {
      Iter.toArray(surveyResultMap.vals())
    };

    public func updateSurveyStatus(survey: Survey, status: SurveyStatus) {
      surveyMap.put(survey.id, {
        category = survey.category;
        cover = survey.cover;
        description = survey.description;
        discordLink = survey.discordLink;
        goal = survey.goal;
        id = survey.id;
        nftVolume = survey.nftVolume;
        owner = survey.owner;
        rewards = survey.rewards;
        status = status;
        story = survey.story;
        tags = survey.tags;
        title = survey.title;
        twitterLink = survey.twitterLink;
        walletId = survey.walletId;
        wetransferLink = survey.wetransferLink;
        fundingType = survey.fundingType;
      });
    };

    public func findSurveys(term: Text) : [Survey] {
      var surveys : Buffer.Buffer<Survey> = Buffer.Buffer<Survey>(1);
      for ((id, survey) in surveyMap.entries()) {
        if (includesText(survey.title, term)) {
          surveys.add(survey);
        };
      };
      surveys.toArray();
    };

    // Upgrade helpers

    public func getUserArray() : [(UserId, Profile)] {
      Iter.toArray(userMap.entries())
    };

    public func getSurveyArray() : [(SurveyId, Survey)] {
      Iter.toArray(surveyMap.entries())
    };

    public func getSurveyResultArray() : [(SurveyResultId, SurveyResult)] {
      Iter.toArray(surveyResultMap.entries())
    };

    public func getVideoArray() : [(SurveyId, Link)] {
      Iter.toArray(surveyVideoMap.entries())
    };

    public func getUserToSurveyArray() : [(UserId, [SurveyId])] {
      Iter.toArray(userToSurveysMap.entries())
    };

    public func initializeUserMap(users: [(UserId, Profile)]) {
      for ((userId, profile) in users.vals()) {
        userMap.put(userId, profile);
      };
    };

    public func initializeSurveyMap(surveys: [(SurveyId, Survey)]) {
      for ((surveyId, survey) in surveys.vals()) {
        surveyMap.put(surveyId, survey);
      };
    };

    public func initializeSurveyResultMap(surveyResults: [(SurveyResultId, SurveyResult)]) {
      for ((surveyResultId, surveyResult) in surveyResults.vals()) {
        surveyResultMap.put(surveyResultId, surveyResult);
      };
    };


    public func initializeUserToSurveyMap(userToSurveys: [(UserId, [SurveyId])]) {
      for ((userId, surveys) in userToSurveys.vals()) {
        userToSurveysMap.put(userId, surveys);
      };
    };

    public func initializeVideoSurveyMap(videos: [(SurveyId, Link)]) {
      for ((surveyId, link) in videos.vals()) {
        surveyVideoMap.put(surveyId, link);
      };
    };

    // Helpers

    func makeProfile(userId: UserId, profile: NewProfile): Profile {
      {
        bio = profile.bio;
        firstName = profile.firstName;
        id = userId;
        img = profile.img;
        lastName = profile.lastName;
      }
    };


    public var surveyResultIdGenerator : Nat = 0;
    func makeSurveyResult(userId: UserId, surveyResult: NewSurveyResult): SurveyResult {
      surveyIdGenerator += 1;
      {
        owner = userId;
        id = Nat.toText(surveyResultIdGenerator);
        claimId = surveyResult.claimId;
        surveyId = surveyResult.surveyId;
      }
    };

    public var surveyIdGenerator : Nat = 0;
    public func makeSurvey(userId: UserId, survey: NewSurvey): Survey {
      surveyIdGenerator += 1;
      {
        category = survey.category;
        cover = survey.cover;
        description = survey.description;
        discordLink = survey.discordLink;
        goal = survey.goal;
        id = Nat.toText(surveyIdGenerator);
        nftVolume = survey.nftVolume;
        owner = userId;
        rewards = survey.rewards;
        status = ?#submitted;
        story = survey.story;
        tags = survey.tags; 
        title = survey.title;
        twitterLink = survey.twitterLink;
        walletId = survey.walletId;
        wetransferLink = survey.wetransferLink;
        fundingType = survey.fundingType;
      };
    };

    func includesText(string: Text, term: Text): Bool {
      let stringLowercase = Text.map(string, Prim.charToLower);
      let termLowercase = Text.map(term, Prim.charToLower);

      let stringArray = Iter.toArray<Char>(stringLowercase.chars());
      let termArray = Iter.toArray<Char>(termLowercase.chars());

      var i = 0;
      var j = 0;

      while (i < stringArray.size() and j < termArray.size()) {
        if (stringArray[i] == termArray[j]) {
          i += 1;
          j += 1;
          if (j == termArray.size()) { return true; }
        } else {
          i += 1;
          j := 0;
        }
      };
      false
    };

    public func textToNat(t : Text) : ?Nat {
      var i : Nat = 0;
      while (i <= surveyIdGenerator) {
        if (t == Nat.toText(i)) { return ?i; };
        i += 1;
      };
      return null;
    };

  };

  func isEqUserId(x: UserId, y: UserId): Bool { x == y };
  func isEqSurveyId(x: SurveyId, y: SurveyId): Bool { x == y };
  func isEqSurveyResultId(x: SurveyResultId, y: SurveyResultId): Bool { x == y };
};
