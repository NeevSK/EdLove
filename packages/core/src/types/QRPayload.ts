/**
 * Canonical QR Payload Types  Gurudevi Ecosystem
 *
 * All QR codes encode: gurudevi://qr?v=1&action=<action>&...params
 * Moved to @repo/core to satisfy L0-no-upward architectural rule.
 */

export const QR_VERSION = 1 as const;

export type QRAction =
  | 'join_school'
  | 'join_class'
  | 'join_group'
  | 'claim_invite'
  | 'user_invite'
  | 'thuthimal_gift'
  | 'share_resource';

/** Unified discriminated union for all QR payloads in the Gurudevi ecosystem */
export type QRPayload =
  | JoinSchoolPayload
  | JoinClassPayload
  | JoinGroupPayload
  | ClaimInvitePayload
  | UserInvitePayload
  | ThuthimalGiftPayload
  | ShareResourcePayload;

/** Scanning joins the school AND its auto-created community group */
export interface JoinSchoolPayload {
  v: typeof QR_VERSION;
  action: 'join_school';
  school_id: string;
  group_id: string;
  handle?: string;
}

/** Teacher or student joins a specific classroom */
export interface JoinClassPayload {
  v: typeof QR_VERSION;
  action: 'join_class';
  classroom_id: string;
  handle?: string;
}

/** Join a community group directly */
export interface JoinGroupPayload {
  v: typeof QR_VERSION;
  action: 'join_group';
  group_id: string;
  handle?: string;
}

/** Claim a capacity-specific school invite code */
export interface ClaimInvitePayload {
  v: typeof QR_VERSION;
  action: 'claim_invite';
  invite_code: string;
  school_id: string;
  capacity: string;
}

/** Personal referral QR shown on user identity card back */
export interface UserInvitePayload {
  v: typeof QR_VERSION;
  action: 'user_invite';
  inviter_id: string;
  inviter_capacity: string;
  username?: string;
}

/** One-time Thuthimal gift subscription */
export interface ThuthimalGiftPayload {
  v: typeof QR_VERSION;
  action: 'thuthimal_gift';
  gift_token: string;
  gifter_name: string;
}

/** Share a resource (PDF, Video, etc.) via QR */
export interface ShareResourcePayload {
  v: typeof QR_VERSION;
  action: 'share_resource';
  resource_id: string;
  resource_type: string;
  title: string;
  url?: string;
}
