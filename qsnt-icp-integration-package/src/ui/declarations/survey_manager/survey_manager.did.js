export const idlFactory = ({ IDL }) => {
  const SurveyId = IDL.Nat
  const NFTInfo = IDL.Record({ number: IDL.Nat, priceE8S: IDL.Nat })
  const Time = IDL.Int
  const Network = IDL.Variant({ Mainnet: IDL.Null, Regtest: IDL.Null, Testnet: IDL.Null})
  const CanisterIdText = IDL.Text
  const definite_canister_settings = IDL.Record({
    freezing_threshold: IDL.Nat,
    controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
    memory_allocation: IDL.Nat,
    compute_allocation: IDL.Nat,
  })
  return IDL.Service({
    acceptCycles: IDL.Func([], [], []),
    availableCycles: IDL.Func([], [IDL.Nat], ['query']),
    createEscrowCanister: IDL.Func(
      [SurveyId, IDL.Principal, IDL.Text, IDL.Vec(NFTInfo), Time, IDL.Nat, Network, IDL.Text, IDL.Nat],
      [],
      [],
    ),
    dissociateEscrowCanister: IDL.Func([SurveyId], [], []),
    getMaxOversellPercentage: IDL.Func([], [IDL.Nat], ['query']),
    getSurveyEscrowCanisterPrincipal: IDL.Func(
      [SurveyId],
      [IDL.Opt(CanisterIdText)],
      ['query'],
    ),
    setMaxOversellPercentage: IDL.Func([IDL.Nat], [], []),
    takeover: IDL.Func([IDL.Text], [definite_canister_settings], []),
    wallet_receive: IDL.Func([], [], []),
  })
}
export const init = ({ IDL }) => {
  return []
}