import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CANU3HVHBFRT2CSZ73ZVDYKYNZMRP6J65KGO4QOTVA45AKORFA46UQ3V",
  }
} as const


export interface Stats {
  cancelled: u64;
  executed: u64;
  expired: u64;
  pending: u64;
  total_proposals: u64;
  /**
 * Total number of individual signatures cast across all proposals.
 */
total_signatures: u64;
}

export type DataKey = {tag: "Board", values: void} | {tag: "Admin", values: void} | {tag: "Proposal", values: readonly [u64]} | {tag: "Count", values: void};


export interface Proposal {
  /**
 * Timestamp when the proposal was cancelled, if applicable.
 */
cancelled_at: Option<u64>;
  created_at: u64;
  /**
 * Human-readable description of the proposal's intent (max 256 chars).
 */
description: string;
  executed_at: Option<u64>;
  expires_at: u64;
  payload: ProposalPayload;
  proposal_id: u64;
  proposal_type: ProposalType;
  proposer: string;
  signatures: Array<string>;
  status: ProposalStatus;
}


export interface BoardConfig {
  created_at: u64;
  members: Array<string>;
  threshold: u32;
}

export type ProposalType = {tag: "ResolveIssue", values: void} | {tag: "TransferFunds", values: void} | {tag: "AddMember", values: void} | {tag: "RemoveMember", values: void} | {tag: "UpdateThreshold", values: void};

export type ProposalStatus = {tag: "Pending", values: void} | {tag: "Executed", values: void} | {tag: "Expired", values: void} | {tag: "Cancelled", values: void};

export type ProposalPayload = {tag: "ResolveIssue", values: readonly [ResolveIssuePayload]} | {tag: "TransferFunds", values: readonly [TransferFundsPayload]} | {tag: "AddMember", values: readonly [AddMemberPayload]} | {tag: "RemoveMember", values: readonly [RemoveMemberPayload]} | {tag: "UpdateThreshold", values: readonly [UpdateThresholdPayload]};


export interface AddMemberPayload {
  new_member: string;
}


/**
 * Payload for a generic treasury withdrawal to an external address.
 */
export interface WithdrawalPayload {
  amount: i128;
  asset: string;
  recipient: string;
}


export interface RemoveMemberPayload {
  member: string;
}


export interface ResolveIssuePayload {
  amount: i128;
  asset: string;
  contributor: string;
  issue_number: u64;
}


export interface TransferFundsPayload {
  amount: i128;
  asset: string;
  memo: string;
  recipient: string;
}


export interface UpdateThresholdPayload {
  new_threshold: u32;
}

export interface Client {
  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: ({from, amount, asset}: {from: string, amount: i128, asset: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the admin address that was set during initialization.
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_board transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_board: (options?: MethodOptions) => Promise<AssembledTransaction<BoardConfig>>

  /**
   * Construct and simulate a get_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_stats: (options?: MethodOptions) => Promise<AssembledTransaction<Stats>>

  /**
   * Construct and simulate a is_member transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_member: ({addr}: {addr: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a has_signed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns `true` if `addr` has already signed the given proposal.
   */
  has_signed: ({proposal_id, addr}: {proposal_id: u64, addr: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, members, threshold}: {admin: string, members: Array<string>, threshold: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proposal: ({proposal_id}: {proposal_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Proposal>>

  /**
   * Construct and simulate a has_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns `true` if a proposal with the given ID exists in storage.
   */
  has_proposal: ({proposal_id}: {proposal_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the current signing threshold without fetching the full board config.
   */
  get_threshold: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a sign_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  sign_proposal: ({signer, proposal_id}: {signer: string, proposal_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a is_initialized transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns `true` if the board has been initialized and an admin is set.
   */
  is_initialized: (options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a cancel_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_proposal: ({proposal_id, canceller}: {proposal_id: u64, canceller: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_proposal: ({proposer, proposal_type, payload, description, ttl_seconds}: {proposer: string, proposal_type: ProposalType, payload: ProposalPayload, description: string, ttl_seconds: Option<u64>}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a expire_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  expire_proposal: ({proposal_id}: {proposal_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a execute_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  execute_proposal: ({proposal_id}: {proposal_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_member_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the total number of current board members.
   */
  get_member_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_proposal_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proposal_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_pending_proposals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Convenience shortcut — returns all proposals with `Pending` status.
   */
  get_pending_proposals: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Proposal>>>

  /**
   * Construct and simulate a get_proposals_by_member transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proposals_by_member: ({member}: {member: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Proposal>>>

  /**
   * Construct and simulate a get_proposals_by_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proposals_by_status: ({status}: {status: ProposalStatus}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Proposal>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAA",
        "AAAAAAAAAD1SZXR1cm5zIHRoZSBhZG1pbiBhZGRyZXNzIHRoYXQgd2FzIHNldCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uAAAAAAAACWdldF9hZG1pbgAAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAAAAAAAAJZ2V0X2JvYXJkAAAAAAAAAAAAAAEAAAfQAAAAC0JvYXJkQ29uZmlnAA==",
        "AAAAAAAAAAAAAAAJZ2V0X3N0YXRzAAAAAAAAAAAAAAEAAAfQAAAABVN0YXRzAAAA",
        "AAAAAAAAAAAAAAAJaXNfbWVtYmVyAAAAAAAAAQAAAAAAAAAEYWRkcgAAABMAAAABAAAAAQ==",
        "AAAAAAAAAD9SZXR1cm5zIGB0cnVlYCBpZiBgYWRkcmAgaGFzIGFscmVhZHkgc2lnbmVkIHRoZSBnaXZlbiBwcm9wb3NhbC4AAAAACmhhc19zaWduZWQAAAAAAAIAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAYAAAAAAAAABGFkZHIAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAdtZW1iZXJzAAAAA+oAAAATAAAAAAAAAAl0aHJlc2hvbGQAAAAAAAAEAAAAAA==",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb3Bvc2FsAAAAAQAAAAAAAAALcHJvcG9zYWxfaWQAAAAABgAAAAEAAAfQAAAACFByb3Bvc2Fs",
        "AAAAAAAAAEFSZXR1cm5zIGB0cnVlYCBpZiBhIHByb3Bvc2FsIHdpdGggdGhlIGdpdmVuIElEIGV4aXN0cyBpbiBzdG9yYWdlLgAAAAAAAAxoYXNfcHJvcG9zYWwAAAABAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAGAAAAAQAAAAE=",
        "AAAAAAAAAE1SZXR1cm5zIHRoZSBjdXJyZW50IHNpZ25pbmcgdGhyZXNob2xkIHdpdGhvdXQgZmV0Y2hpbmcgdGhlIGZ1bGwgYm9hcmQgY29uZmlnLgAAAAAAAA1nZXRfdGhyZXNob2xkAAAAAAAAAAAAAAEAAAAE",
        "AAAAAAAAAAAAAAANc2lnbl9wcm9wb3NhbAAAAAAAAAIAAAAAAAAABnNpZ25lcgAAAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABgAAAAA=",
        "AAAAAAAAAEVSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYm9hcmQgaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYW5kIGFuIGFkbWluIGlzIHNldC4AAAAAAAAOaXNfaW5pdGlhbGl6ZWQAAAAAAAAAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAPY2FuY2VsX3Byb3Bvc2FsAAAAAAIAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAYAAAAAAAAACWNhbmNlbGxlcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAPY3JlYXRlX3Byb3Bvc2FsAAAAAAUAAAAAAAAACHByb3Bvc2VyAAAAEwAAAAAAAAANcHJvcG9zYWxfdHlwZQAAAAAAB9AAAAAMUHJvcG9zYWxUeXBlAAAAAAAAAAdwYXlsb2FkAAAAB9AAAAAPUHJvcG9zYWxQYXlsb2FkAAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAALdHRsX3NlY29uZHMAAAAD6AAAAAYAAAABAAAABg==",
        "AAAAAAAAAAAAAAAPZXhwaXJlX3Byb3Bvc2FsAAAAAAEAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAYAAAAA",
        "AAAAAAAAAAAAAAAQZXhlY3V0ZV9wcm9wb3NhbAAAAAEAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAYAAAAA",
        "AAAAAAAAADJSZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgY3VycmVudCBib2FyZCBtZW1iZXJzLgAAAAAAEGdldF9tZW1iZXJfY291bnQAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAASZ2V0X3Byb3Bvc2FsX2NvdW50AAAAAAAAAAAAAQAAAAY=",
        "AAAAAAAAAEVDb252ZW5pZW5jZSBzaG9ydGN1dCDigJQgcmV0dXJucyBhbGwgcHJvcG9zYWxzIHdpdGggYFBlbmRpbmdgIHN0YXR1cy4AAAAAAAAVZ2V0X3BlbmRpbmdfcHJvcG9zYWxzAAAAAAAAAAAAAAEAAAPqAAAH0AAAAAhQcm9wb3NhbA==",
        "AAAAAAAAAAAAAAAXZ2V0X3Byb3Bvc2Fsc19ieV9tZW1iZXIAAAAAAQAAAAAAAAAGbWVtYmVyAAAAAAATAAAAAQAAA+oAAAfQAAAACFByb3Bvc2Fs",
        "AAAAAAAAAAAAAAAXZ2V0X3Byb3Bvc2Fsc19ieV9zdGF0dXMAAAAAAQAAAAAAAAAGc3RhdHVzAAAAAAfQAAAADlByb3Bvc2FsU3RhdHVzAAAAAAABAAAD6gAAB9AAAAAIUHJvcG9zYWw=",
        "AAAAAQAAAAAAAAAAAAAABVN0YXRzAAAAAAAABgAAAAAAAAAJY2FuY2VsbGVkAAAAAAAABgAAAAAAAAAIZXhlY3V0ZWQAAAAGAAAAAAAAAAdleHBpcmVkAAAAAAYAAAAAAAAAB3BlbmRpbmcAAAAABgAAAAAAAAAPdG90YWxfcHJvcG9zYWxzAAAAAAYAAABAVG90YWwgbnVtYmVyIG9mIGluZGl2aWR1YWwgc2lnbmF0dXJlcyBjYXN0IGFjcm9zcyBhbGwgcHJvcG9zYWxzLgAAABB0b3RhbF9zaWduYXR1cmVzAAAABg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABUJvYXJkAAAAAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAABAAAAAAAAAAhQcm9wb3NhbAAAAAEAAAAGAAAAAAAAAAAAAAAFQ291bnQAAAA=",
        "AAAAAQAAAAAAAAAAAAAACFByb3Bvc2FsAAAACwAAADlUaW1lc3RhbXAgd2hlbiB0aGUgcHJvcG9zYWwgd2FzIGNhbmNlbGxlZCwgaWYgYXBwbGljYWJsZS4AAAAAAAAMY2FuY2VsbGVkX2F0AAAD6AAAAAYAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAABESHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb24gb2YgdGhlIHByb3Bvc2FsJ3MgaW50ZW50IChtYXggMjU2IGNoYXJzKS4AAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAALZXhlY3V0ZWRfYXQAAAAD6AAAAAYAAAAAAAAACmV4cGlyZXNfYXQAAAAAAAYAAAAAAAAAB3BheWxvYWQAAAAH0AAAAA9Qcm9wb3NhbFBheWxvYWQAAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAGAAAAAAAAAA1wcm9wb3NhbF90eXBlAAAAAAAH0AAAAAxQcm9wb3NhbFR5cGUAAAAAAAAACHByb3Bvc2VyAAAAEwAAAAAAAAAKc2lnbmF0dXJlcwAAAAAD6gAAABMAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA5Qcm9wb3NhbFN0YXR1cwAA",
        "AAAAAQAAAAAAAAAAAAAAC0JvYXJkQ29uZmlnAAAAAAMAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAAB21lbWJlcnMAAAAD6gAAABMAAAAAAAAACXRocmVzaG9sZAAAAAAAAAQ=",
        "AAAAAgAAAAAAAAAAAAAADFByb3Bvc2FsVHlwZQAAAAUAAAAAAAAAAAAAAAxSZXNvbHZlSXNzdWUAAAAAAAAAAAAAAA1UcmFuc2ZlckZ1bmRzAAAAAAAAAAAAAAAAAAAJQWRkTWVtYmVyAAAAAAAAAAAAAAAAAAAMUmVtb3ZlTWVtYmVyAAAAAAAAAAAAAAAPVXBkYXRlVGhyZXNob2xkAA==",
        "AAAAAgAAAAAAAAAAAAAADlByb3Bvc2FsU3RhdHVzAAAAAAAEAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAhFeGVjdXRlZAAAAAAAAAAAAAAAB0V4cGlyZWQAAAAAAAAAAAAAAAAJQ2FuY2VsbGVkAAAA",
        "AAAAAgAAAAAAAAAAAAAAD1Byb3Bvc2FsUGF5bG9hZAAAAAAFAAAAAQAAAAAAAAAMUmVzb2x2ZUlzc3VlAAAAAQAAB9AAAAATUmVzb2x2ZUlzc3VlUGF5bG9hZAAAAAABAAAAAAAAAA1UcmFuc2ZlckZ1bmRzAAAAAAAAAQAAB9AAAAAUVHJhbnNmZXJGdW5kc1BheWxvYWQAAAABAAAAAAAAAAlBZGRNZW1iZXIAAAAAAAABAAAH0AAAABBBZGRNZW1iZXJQYXlsb2FkAAAAAQAAAAAAAAAMUmVtb3ZlTWVtYmVyAAAAAQAAB9AAAAATUmVtb3ZlTWVtYmVyUGF5bG9hZAAAAAABAAAAAAAAAA9VcGRhdGVUaHJlc2hvbGQAAAAAAQAAB9AAAAAWVXBkYXRlVGhyZXNob2xkUGF5bG9hZAAA",
        "AAAAAQAAAAAAAAAAAAAAEEFkZE1lbWJlclBheWxvYWQAAAABAAAAAAAAAApuZXdfbWVtYmVyAAAAAAAT",
        "AAAAAQAAAEFQYXlsb2FkIGZvciBhIGdlbmVyaWMgdHJlYXN1cnkgd2l0aGRyYXdhbCB0byBhbiBleHRlcm5hbCBhZGRyZXNzLgAAAAAAAAAAAAARV2l0aGRyYXdhbFBheWxvYWQAAAAAAAADAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAE1JlbW92ZU1lbWJlclBheWxvYWQAAAAAAQAAAAAAAAAGbWVtYmVyAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAAE1Jlc29sdmVJc3N1ZVBheWxvYWQAAAAABAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAAC2NvbnRyaWJ1dG9yAAAAABMAAAAAAAAADGlzc3VlX251bWJlcgAAAAY=",
        "AAAAAQAAAAAAAAAAAAAAFFRyYW5zZmVyRnVuZHNQYXlsb2FkAAAABAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAABG1lbW8AAAAQAAAAAAAAAAlyZWNpcGllbnQAAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAAFlVwZGF0ZVRocmVzaG9sZFBheWxvYWQAAAAAAAEAAAAAAAAADW5ld190aHJlc2hvbGQAAAAAAAAE" ]),
      options
    )
  }
  public readonly fromJSON = {
    deposit: this.txFromJSON<null>,
        get_admin: this.txFromJSON<string>,
        get_board: this.txFromJSON<BoardConfig>,
        get_stats: this.txFromJSON<Stats>,
        is_member: this.txFromJSON<boolean>,
        has_signed: this.txFromJSON<boolean>,
        initialize: this.txFromJSON<null>,
        get_proposal: this.txFromJSON<Proposal>,
        has_proposal: this.txFromJSON<boolean>,
        get_threshold: this.txFromJSON<u32>,
        sign_proposal: this.txFromJSON<null>,
        is_initialized: this.txFromJSON<boolean>,
        cancel_proposal: this.txFromJSON<null>,
        create_proposal: this.txFromJSON<u64>,
        expire_proposal: this.txFromJSON<null>,
        execute_proposal: this.txFromJSON<null>,
        get_member_count: this.txFromJSON<u32>,
        get_proposal_count: this.txFromJSON<u64>,
        get_pending_proposals: this.txFromJSON<Array<Proposal>>,
        get_proposals_by_member: this.txFromJSON<Array<Proposal>>,
        get_proposals_by_status: this.txFromJSON<Array<Proposal>>
  }
}