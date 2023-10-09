import Array        "mo:base/Array";
import Blob         "mo:base/Blob";
import Cycles       "mo:base/ExperimentalCycles";
import Error        "mo:base/Error";
import Nat          "mo:base/Nat";
import Option       "mo:base/Option";
import Principal    "mo:base/Principal";
import Text         "mo:base/Text";
import Time         "mo:base/Time";
import Trie         "mo:base/Trie";

import Account      "./account";
import Escrow       "./escrow";
import Hex          "./hex";
import Types        "./types";
import Utils        "./utils";

actor SurveyManager {

    let admins : [Principal] = [
        Principal.fromText("yvocl-fhqq4-6zk3v-rmwjm-ifoeq-ni6s4-lhoe2-jwvfw-rxlnx-35cr5-xqe"),
        Principal.fromText("sktqp-rjz3k-wxjxx-2iwuj-sbtwk-mrpf4-6jyqu-ao4k6-pd2in-rlxnl-uqe"),
        Principal.fromText("xxphq-k2cxp-bi7np-w4rn4-ngayn-yzyr5-a4uur-yms5o-6j3we-kvdbw-xae")
    ];

    type canister_id = Principal;
    type user_id = Principal;
    type wasm_module = Blob;

    type canister_settings = {
        controllers : ?[Principal];
        compute_allocation : ?Nat;
        memory_allocation : ?Nat;
        freezing_threshold : ?Nat;
    };

    type definite_canister_settings = {
        controllers : ?[Principal];
        compute_allocation : Nat;
        memory_allocation : Nat;
        freezing_threshold : Nat;
    };

    // We want to eventually make all escrow canister "black hole" canisters,
    // which means they have no controllers, and hence their code cannot be
    // altered. Until then, since we have at times had to update an escrow
    // canister's code due to a glitch, we use this function to temporarily take
    // control of the escrow canister.
    // TODO: Remove this function.
    public func takeover (canister : Text) : async definite_canister_settings {
        let ManagementCanister = actor "aaaaa-aa" : actor {
            canister_status : shared { canister_id : canister_id } -> async {
                status : { #running; #stopping; #stopped };
                settings: definite_canister_settings;
                module_hash: ?Blob;
                memory_size: Nat;
                cycles: Nat;
            };
            update_settings : shared {
                canister_id : Principal;
                settings : canister_settings
            } -> async ();
        };
        let canister_id = Principal.fromText(canister);
        let newControllers = [
            Principal.fromText("3fhg4-qiaaa-aaaak-aajiq-cai"),
            Principal.fromText("xohn2-daaaa-aaaak-aadvq-cai"),
            Principal.fromText("sktqp-rjz3k-wxjxx-2iwuj-sbtwk-mrpf4-6jyqu-ao4k6-pd2in-rlxnl-uqe")
        ];
        await ManagementCanister.update_settings({ canister_id = canister_id; settings = {
            controllers = ?newControllers;
            compute_allocation = ?(0 : Nat);
            memory_allocation = ?(0 : Nat);
            freezing_threshold = ?(2_592_000 : Nat);
        }});
        return (await ManagementCanister.canister_status({ canister_id = canister_id })).settings;
    };

    type AccountIdText  = Types.AccountIdText;
    type CanisterId     = Principal;
    type CanisterIdText = Text;
    type NFTInfo        = Types.NFTInfo;
    type SurveyId      = Types.SurveyId;
    type SurveyIdText  = Text;
    type SubaccountBlob = Types.SubaccountBlob;

    stable var escrowCanisters : Trie.Trie<SurveyIdText, CanisterId> = Trie.empty();
    stable var maxOversellPercentage : Nat = 20;

    // Canister management

    public query func getSurveyEscrowCanisterPrincipal(p: SurveyId) : async ?CanisterIdText {
        switch (getSurveyEscrowCanister(p)) {
            case (?canister) ?Principal.toText(canister);
            case (null) null;
        };
    };

    // TODO: Remove self as controller of created escrow canister to turn the canister into true "black hole" canister.
    public shared(msg) func createEscrowCanister (
        p: SurveyId,
        recipientICP: Principal,
        recipientBTC: Text,
        nfts: [NFTInfo],
        endTime : Time.Time,
        maxNFTsPerWallet : Nat,
        network : Types.Network,
        backendPrincipal: Text,
        oversellPercentage: Nat
    ) : async () {
        //assert(isAdmin(msg.caller));
        switch (getSurveyEscrowCanister(p)) {
            case (?canister) { throw Error.reject("Survey already has an escrow canister: " # Principal.toText(canister)); };
            case (null) {
                if (oversellPercentage > maxOversellPercentage) {
                    throw Error.reject("Oversell percentage can't exceed " # Nat.toText(maxOversellPercentage) # "%");
                } else {
                Cycles.add(1000000000000);
                let canister = await Escrow.EscrowCanister(p, recipientICP, recipientBTC, nfts, endTime, maxNFTsPerWallet, network, backendPrincipal, oversellPercentage);
                escrowCanisters := Trie.putFresh<SurveyIdText, CanisterId>(escrowCanisters, surveyIdKey(p), Text.equal, Principal.fromActor(canister));
                };
            };
        };
    };

    public shared({caller}) func setMaxOversellPercentage(percentage: Nat): async () {
        //assert(isAdmin(caller));
        maxOversellPercentage := percentage;
    };

    public query func getMaxOversellPercentage(): async Nat {
        maxOversellPercentage;
    };

    func getSurveyEscrowCanister (p: SurveyId) : ?CanisterId {
        Trie.get<SurveyIdText, CanisterId>(escrowCanisters, surveyIdKey(p), Text.equal);
    };

    public shared(msg) func dissociateEscrowCanister (p: SurveyId) : async () {
        //assert(isAdmin(msg.caller));
        switch (getSurveyEscrowCanister(p)) {
            case (?canister) {
                escrowCanisters := Trie.remove<SurveyIdText, CanisterId>(escrowCanisters, surveyIdKey(p), Text.equal).0;
            };
            case (null) { throw Error.reject("Survey has no escrow canister"); };
        };
    };

    // helpers

    func surveyIdKey (p: SurveyId) : Trie.Key<SurveyIdText> {
        { key = Nat.toText(p); hash = Text.hash(Nat.toText(p)) };
    };

    // cycles management

    //Internal cycle management - good general case
    type RecieveOptions = {
        memo: ?Text;
    };
    public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
    };
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
    };
    public query func availableCycles() : async Nat {
        return Cycles.balance();
    };

    private func isAdmin(p: Principal): Bool {
        func identity(x: Principal): Bool { x == p };
        Option.isSome(Array.find<Principal>(admins,identity));
    };

}
