export const idlFactory = ({ IDL }) => {
  const InternetIdentityInit = IDL.Record({
    'archive_module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'assigned_user_number_range' : IDL.Opt(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    'canister_creation_cycles_cost' : IDL.Opt(IDL.Nat64),
    'layout_migration_batch_size' : IDL.Opt(IDL.Nat32),
  });
  const UserNumber = IDL.Nat64;
  const DeviceProtection = IDL.Variant({
    'unprotected' : IDL.Null,
    'protected' : IDL.Null,
  });
  const PublicKey = IDL.Vec(IDL.Nat8);
  const DeviceKey = PublicKey;
  const KeyType = IDL.Variant({
    'platform' : IDL.Null,
    'seed_phrase' : IDL.Null,
    'cross_platform' : IDL.Null,
    'unknown' : IDL.Null,
  });
  const Purpose = IDL.Variant({
    'authentication' : IDL.Null,
    'recovery' : IDL.Null,
  });
  const CredentialId = IDL.Vec(IDL.Nat8);
  const DeviceData = IDL.Record({
    'alias' : IDL.Text,
    'protection' : DeviceProtection,
    'pubkey' : DeviceKey,
    'key_type' : KeyType,
    'purpose' : Purpose,
    'credential_id' : IDL.Opt(CredentialId),
  });
  const Timestamp = IDL.Nat64;
  const AddTentativeDeviceResponse = IDL.Variant({
    'device_registration_mode_off' : IDL.Null,
    'another_device_tentatively_added' : IDL.Null,
    'added_tentatively' : IDL.Record({
      'verification_code' : IDL.Text,
      'device_registration_timeout' : Timestamp,
    }),
  });
  const ChallengeKey = IDL.Text;
  const Challenge = IDL.Record({
    'png_base64' : IDL.Text,
    'challenge_key' : ChallengeKey,
  });
  const DeployArchiveResult = IDL.Variant({
    'creation_in_progress' : IDL.Null,
    'success' : IDL.Principal,
    'failed' : IDL.Text,
  });
  const DeviceRegistrationInfo = IDL.Record({
    'tentative_device' : IDL.Opt(DeviceData),
    'expiration' : Timestamp,
  });
  const IdentityAnchorInfo = IDL.Record({
    'devices' : IDL.Vec(DeviceData),
    'device_registration' : IDL.Opt(DeviceRegistrationInfo),
  });
  const FrontendHostname = IDL.Text;
  const SessionKey = PublicKey;
  const Delegation = IDL.Record({
    'pubkey' : PublicKey,
    'targets' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'expiration' : Timestamp,
  });
  const SignedDelegation = IDL.Record({
    'signature' : IDL.Vec(IDL.Nat8),
    'delegation' : Delegation,
  });
  const GetDelegationResponse = IDL.Variant({
    'no_such_delegation' : IDL.Null,
    'signed_delegation' : SignedDelegation,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const Token = IDL.Record({});
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(Token),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : Token,
      'callback' : IDL.Func(
          [Token],
          [StreamingCallbackHttpResponse],
          ['query'],
        ),
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const UserKey = PublicKey;
  const ChallengeResult = IDL.Record({
    'key' : ChallengeKey,
    'chars' : IDL.Text,
  });
  const RegisterResponse = IDL.Variant({
    'bad_challenge' : IDL.Null,
    'canister_full' : IDL.Null,
    'registered' : IDL.Record({ 'user_number' : UserNumber }),
  });
  const LayoutMigrationState = IDL.Variant({
    'started' : IDL.Record({
      'batch_size' : IDL.Nat64,
      'anchors_left' : IDL.Nat64,
    }),
    'finished' : IDL.Null,
    'not_started' : IDL.Null,
  });
  const ArchiveInfo = IDL.Record({
    'expected_wasm_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'archive_canister' : IDL.Opt(IDL.Principal),
  });
  const InternetIdentityStats = IDL.Record({
    'storage_layout_version' : IDL.Nat8,
    'users_registered' : IDL.Nat64,
    'layout_migration_state' : IDL.Opt(LayoutMigrationState),
    'assigned_user_number_range' : IDL.Tuple(IDL.Nat64, IDL.Nat64),
    'archive_info' : ArchiveInfo,
    'canister_creation_cycles_cost' : IDL.Nat64,
  });
  const VerifyTentativeDeviceResponse = IDL.Variant({
    'device_registration_mode_off' : IDL.Null,
    'verified' : IDL.Null,
    'wrong_code' : IDL.Record({ 'retries_left' : IDL.Nat8 }),
    'no_device_to_verify' : IDL.Null,
  });
  return IDL.Service({
    'add' : IDL.Func([UserNumber, DeviceData], [], []),
    'add_tentative_device' : IDL.Func(
        [UserNumber, DeviceData],
        [AddTentativeDeviceResponse],
        [],
      ),
    'create_challenge' : IDL.Func([], [Challenge], []),
    'deploy_archive' : IDL.Func([IDL.Vec(IDL.Nat8)], [DeployArchiveResult], []),
    'enter_device_registration_mode' : IDL.Func([UserNumber], [Timestamp], []),
    'exit_device_registration_mode' : IDL.Func([UserNumber], [], []),
    'get_anchor_info' : IDL.Func([UserNumber], [IdentityAnchorInfo], []),
    'get_delegation' : IDL.Func(
        [UserNumber, FrontendHostname, SessionKey, Timestamp],
        [GetDelegationResponse],
        ['query'],
      ),
    'get_principal' : IDL.Func(
        [UserNumber, FrontendHostname],
        [IDL.Principal],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'init_salt' : IDL.Func([], [], []),
    'lookup' : IDL.Func([UserNumber], [IDL.Vec(DeviceData)], ['query']),
    'prepare_delegation' : IDL.Func(
        [UserNumber, FrontendHostname, SessionKey, IDL.Opt(IDL.Nat64)],
        [UserKey, Timestamp],
        [],
      ),
    'register' : IDL.Func(
        [DeviceData, ChallengeResult],
        [RegisterResponse],
        [],
      ),
    'remove' : IDL.Func([UserNumber, DeviceKey], [], []),
    'stats' : IDL.Func([], [InternetIdentityStats], ['query']),
    'update' : IDL.Func([UserNumber, DeviceKey, DeviceData], [], []),
    'verify_tentative_device' : IDL.Func(
        [UserNumber, IDL.Text],
        [VerifyTentativeDeviceResponse],
        [],
      ),
  });
};
export const init = ({ IDL }) => {
  const InternetIdentityInit = IDL.Record({
    'archive_module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'assigned_user_number_range' : IDL.Opt(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
    'canister_creation_cycles_cost' : IDL.Opt(IDL.Nat64),
    'layout_migration_batch_size' : IDL.Opt(IDL.Nat32),
  });
  return [IDL.Opt(InternetIdentityInit)];
};
