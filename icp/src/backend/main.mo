import Array            "mo:base/Array";
import Debug            "mo:base/Debug";
import Database         "./database";
import Error            "mo:base/Error";
import Iter             "mo:base/Iter";
import Nat              "mo:base/Nat";
import Principal        "mo:base/Principal";
import Text             "mo:base/Text";
import Trie             "mo:base/Trie";

import Types            "./types";
import Utils            "./utils";

import SurveyManager    "canister:survey_manager";

actor CrowdFundNFT {

    // Types

    type NewProfile = Types.NewProfile;
    type NewSurvey = Types.NewSurvey;
    type Profile = Types.Profile;
    type Survey = Types.Survey;
    type SurveyId = Types.SurveyId;
    type SurveyStatus = Types.SurveyStatus;
    type SurveyWithOwner = Types.SurveyWithOwner;
    type UserId = Types.UserId;
    type Link = Types.Link;

    // Escrow Manager Types

    type EMSurveyId = Nat;
    type EMCanisterId = Principal;

    // Stable vars used for upgrading 

    stable var users         : [(UserId, Profile)]               = [];
    stable var surveys      : [(SurveyId, Survey)]            = [];
    stable var userSurveys  : [(UserId, [SurveyId])]           = [];
    stable var nextSurvey   : Nat                               = 0;
    stable var surveyVideos : [(SurveyId, Link)]               = [];

    // Main database

    var db: Database.Directory = Database.Directory();

    // Upgrade functions

    system func preupgrade() {
        users           := db.getUserArray();
        surveys        := db.getSurveyArray();
        userSurveys    := db.getUserToSurveyArray();
        nextSurvey     := db.surveyIdGenerator;
        surveyVideos   := db.getVideoArray();
    };

    system func postupgrade() {
        db.initializeUserMap(users);
        db.initializeSurveyMap(surveys);
        db.initializeUserToSurveyMap(userSurveys);
        db.initializeVideoSurveyMap(surveyVideos);
        db.surveyIdGenerator := nextSurvey;
        Debug.print(Nat.toText(nextSurvey));
        users := [];
        surveys := [];
        userSurveys := [];
    };

    // NFT Page GUID to NFT data

    type GUID = Text;
    type NFTInfo = { canisterId: Text; index: Nat };
    stable var nftGUIDs : Trie.Trie<GUID, NFTInfo> = Trie.empty();
    func eqGUID (a: GUID, b: GUID) : Bool { a == b };
    func getGUIDkey (guid: GUID) : Trie.Key<GUID> {
        { key = guid; hash = Text.hash(guid); };
    };
    public shared(msg) func putNFTGUIDs(guidsAndInfo : [(GUID, NFTInfo)]) : async () {
        //assert(Utils.isAdmin(msg.caller));
        for (gi in Iter.fromArray(guidsAndInfo)) {
            nftGUIDs := Trie.put<GUID, NFTInfo>(nftGUIDs, getGUIDkey(gi.0), eqGUID, gi.1).0;
        };
    };
    public query func getNFTInfo(guid: GUID) : async ?NFTInfo {
        Trie.get<GUID, NFTInfo>(nftGUIDs, getGUIDkey(guid), eqGUID);
    };

    // Launch dates

    type Date = Text;
    stable var launchDates : Trie.Trie<SurveyId, Date> = Trie.empty();
    func eqDate (a: Date, b: Date) : Bool { a == b };
    func getSurveyIdkey (pid: SurveyId) : Trie.Key<SurveyId> {
        { key = pid; hash = Text.hash(pid); };
    };
    public shared(msg) func putLaunchDate(pid: SurveyId, date: Date) : async () {
        //assert(Utils.isAdmin(msg.caller));
        launchDates := Trie.put<SurveyId, Date>(launchDates, getSurveyIdkey(pid), eqDate, date).0;
    };
    public query func getLaunchDate(pid: SurveyId) : async ?Date {
        Trie.get<SurveyId, Date>(launchDates, getSurveyIdkey(pid), eqDate);
    };

    // Healthcheck

    public func healthcheck(): async Bool { true };

    // Testing

    public shared(msg) func greet(): async Text {
        "Hello " # Principal.toText(msg.caller) # "!";
        // "Hello " # Utils.getProfile(db, msg.caller).firstName # "!"
    };

    // Profiles

    public shared query(msg) func getMyProfile(): async Profile {
        Utils.getProfile(db, msg.caller)
    };

    public shared(msg) func createProfile(profile: NewProfile): async () {
        db.createOne(msg.caller, profile);
    };

    public shared(msg) func adminCreateProfile(principal: Principal, profile: NewProfile): async () {
        //assert(Utils.isAdmin(msg.caller));
        db.createOne(principal, profile);
    };

    public shared(msg) func updateProfile(profile: Profile): async () {
        if(Utils.hasAccess(msg.caller, profile)) {
            db.updateOne(profile.id, profile);
        };
    };

    public query func getProfile(userId: UserId): async Profile {
        Utils.getProfile(db, userId)
    };

    public query func searchProfiles(term: Text): async [Profile] {
        db.findUserBy(term)
    };

    // Surveys

    public shared query(msg) func getMySurveys() : async [Survey] {
        db.getSurveys(msg.caller)
    };

    public shared(msg) func createFirstSurvey(profile: NewProfile, survey: NewSurvey): async Survey {
        db.createOne(msg.caller, profile);
        db.createSurvey(msg.caller, survey);
    };

    public shared(msg) func createSurvey(survey: NewSurvey): async Survey {
        db.createSurvey(msg.caller, survey)
    };

    public shared(msg) func adminCreateSurvey(principal: Principal, survey: NewSurvey): async Survey {
        //assert(Utils.isAdmin(msg.caller));
        db.createSurvey(principal, survey)
    };

    public shared(msg) func updateSurvey(survey: Survey): async () {
        assert Utils.isAdmin(msg.caller) or (survey.status == ?#submitted and Utils.hasSurveyAccess(msg.caller, survey));
        db.updateSurvey(survey);
    };

    public shared(msg) func updateSurveyVideo(surveyId: SurveyId, video: Text): async SurveyId {
        //assert(Utils.isAdmin(msg.caller));
        db.putSurveyVideo(surveyId, video);
    };

    public shared(msg) func deleteSurvey(surveyId: SurveyId): async ?Survey {
        assert(Utils.hasSurveyAccess(msg.caller, await getSurvey(surveyId)));
        db.deleteSurvey(surveyId);
    };

    public query func getSurvey(surveyId: SurveyId): async Survey {
        Utils.getSurvey(db, surveyId)
    };

    public query func getSurveyVideo(surveyId: SurveyId): async ?Link {
        db.getSurveyVideo(surveyId);
    };

    public query func getSurveyWithOwner(surveyId: SurveyId): async SurveyWithOwner {
        Utils.getSurveyWithOwner(db, Utils.getSurvey(db, surveyId))
    };

    public query func getSurveyWithOwnerAndMarketplace(surveyId: SurveyId): async {
        survey: Survey; owner: Profile; marketplaceLinks: MarketplaceLinks;
    } {
        let pAndO = Utils.getSurveyWithOwner(db, Utils.getSurvey(db, surveyId));
        switch(_getMarketplaceLinks(surveyId)) {
            case (?links) { { survey = pAndO.survey; owner = pAndO.owner; marketplaceLinks = links; } };
            case (null) { { survey = pAndO.survey; owner = pAndO.owner; marketplaceLinks = []; }; };
        };
    };

    public query func getSurveys(userId: UserId): async [Survey] {
        db.getSurveys(userId)
    };

    public query func listSurveys(statuses: [SurveyStatus], term: Text, categories: [Text]): async [SurveyWithOwner] {
        func getSurveyWithOwner(p: Survey) : SurveyWithOwner { 
            Utils.getSurveyWithOwner(db, p);
        };

        let surveys = if (term == "") { db.listSurveys() } else { db.findSurveys(term) };
        let surveysWithOwners = Array.map(surveys, getSurveyWithOwner);
        
        Array.filter(surveysWithOwners, func (p: SurveyWithOwner) : Bool {
            if (statuses.size() > 0 and Array.find(statuses, func (s: SurveyStatus) : Bool { s == p.survey.status }) == null) { return false };
            if (categories.size() > 0 and Array.find(categories, func (cat: Text) : Bool { cat == p.survey.category }) == null) { return false };
            return true
        })
    };

    // Survey statuses

    public shared(msg) func updateSurveyStatus(pid: SurveyId, status: SurveyStatus): async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                db.updateSurveyStatus(p, status);
            };
            case null { throw Error.reject("No survey with this id.") };
        };
    };

    public shared(msg) func approveSurvey(pid: SurveyId): async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                assert(p.status == ?#submitted);
                db.updateSurveyStatus(p, ?#approved);
            };
            case null { throw Error.reject("No survey with this id.") };
        };
    };

    public shared(msg) func unapproveSurvey(pid: SurveyId): async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                assert(p.status == ?#approved);
                db.updateSurveyStatus(p, ?#submitted);
            };
            case null { throw Error.reject("No survey with this id.") };
        }; 
    };

    public shared(msg) func closeSurvey(pid: SurveyId) : async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                assert(p.status == ?#whitelist or p.status == ?#live);
                db.updateSurveyStatus(p, ?#approved);
            };
            case null { throw Error.reject("No survey with this id.") };
        }; 
    };

    public shared(msg) func openSurveyToWhiteList(pid: SurveyId) : async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                assert(p.status == ?#approved);
                switch (db.textToNat(pid)) {
                    case (?natId) { 
                        switch (await SurveyManager.getSurveyEscrowCanisterPrincipal(natId)) {
                            case null { throw Error.reject("The survey does not have an escrow canister.") };
                            case _ { db.updateSurveyStatus(p, ?#whitelist) };
                        };
                    };
                    case null { throw Error.reject("Survey id is not valid.") };
                };
            };
            case null { throw Error.reject("No survey with this id.") };
        }; 
    };

    public shared(msg) func makeSurveyLive(pid: SurveyId): async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                assert(p.status == ?#approved or p.status == ?#whitelist);
                switch (db.textToNat(pid)) {
                    case (?natId) { 
                        switch (await SurveyManager.getSurveyEscrowCanisterPrincipal(natId)) {
                            case null { throw Error.reject("The survey does not have an escrow canister.") };
                            case _ { db.updateSurveyStatus(p, ?#live) };
                        };
                    };
                    case null { throw Error.reject("Survey id is not valid.") };
                };
            };
            case null { throw Error.reject("No survey with this id.") };
        };
    };
    
    public shared(msg) func setSurveyFullyFunded(pid: SurveyId): async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                assert(p.status == ?#whitelist or p.status == ?#live);
                db.updateSurveyStatus(p, ?#fully_funded);
            };
            case null { throw Error.reject("No survey with this id.") };
        };
    };

    public shared(msg) func archiveSurvey(pid: SurveyId): async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (db.getSurvey(pid)) {
            case (?p) { 
                assert(p.status == ?#whitelist or p.status == ?#live);
                db.updateSurveyStatus(p, null);
            };
            case null { throw Error.reject("No survey with this id.") };
        };
    };

    // Survey whitelists

    stable var whitelists   : Trie.Trie<SurveyId, [Principal]> = Trie.empty();

    public query func getWhitelist(pid: SurveyId): async [Principal] {
        _getWhitelist(pid);
    };
    public shared(msg) func addWhitelist(pid: SurveyId, principals: [Principal]): async () {
        //assert(Utils.isAdmin(msg.caller));
        switch (Trie.get<SurveyId, [Principal]>(whitelists, surveyIdKey(pid), Text.equal)) {
            case (?ps) {
                let newPs = Array.append<Principal>(ps, principals);
                whitelists := Trie.put<SurveyId, [Principal]>(whitelists, surveyIdKey(pid), pidsAreEqual, newPs).0;
            };
            case null {
                whitelists := Trie.put<SurveyId, [Principal]>(whitelists, surveyIdKey(pid), pidsAreEqual, principals).0;
            };
        };
    };
    public shared(msg) func resetWhitelist(pid: SurveyId): async () {
        //assert(Utils.isAdmin(msg.caller));
        whitelists := Trie.put<SurveyId, [Principal]>(whitelists, surveyIdKey(pid), pidsAreEqual, []).0;
    };

    type SurveyState = {
        #whitelist: [Principal];
        #live;
        #closed;
        #nosurvey;
    };
    public query func getSurveyState(pid: SurveyId) : async SurveyState {
        switch (db.getSurvey(pid)) {
            case (?p) {
                switch (p.status) {
                    case (?#whitelist) {
                        let whitelist = _getWhitelist(pid);
                        #whitelist(whitelist);
                    };
                    case (?#live) {
                        #live;
                    };
                    case _ {
                        #closed;
                    };
                };
            };
            case null { #nosurvey };
        };
    };

    func _getWhitelist(pid: SurveyId) : [Principal] {
        switch (Trie.get<SurveyId, [Principal]>(whitelists, surveyIdKey(pid), Text.equal)) {
            case (?principals) { principals;};
            case null { return []; };
        };
    };

    func pidsAreEqual(p1: SurveyId, p2: SurveyId) : Bool { p1 == p2 };
    func surveyIdKey (p: SurveyId) : Trie.Key<SurveyId> {
        { key = p; hash = Text.hash(p) };
    };


    // Marketplace data

    type MarketplaceLinks = Types.MarketplaceLinks;
    stable var marketplaceLinks : Trie.Trie<SurveyId, MarketplaceLinks> = Trie.empty();

    public query func getMarketplaceLinks(pid: SurveyId): async MarketplaceLinks {
        switch (_getMarketplaceLinks(pid)) {
            case (?links) { links; };
            case null { []; };
        };
    };

    public shared(msg) func setMarketplaceLinks(pid: SurveyId, links: MarketplaceLinks): async () {
        //assert(Utils.isAdmin(msg.caller));
        marketplaceLinks := Trie.put<SurveyId, MarketplaceLinks>(marketplaceLinks, surveyIdKey(pid), Text.equal, links).0;
    };

    func _getMarketplaceLinks(pid: SurveyId): ?MarketplaceLinks {
        Trie.get<SurveyId, MarketplaceLinks>(marketplaceLinks, surveyIdKey(pid), Text.equal);
    };

    // User Auth

    public shared query(msg) func getOwnId(): async UserId { msg.caller };

    public shared query(msg) func getOwnIdText(): async Text { Principal.toText(msg.caller) };

    public shared query(msg) func isAdmin(): async Bool {
        Utils.isAdmin(msg.caller)
    };

};
