export type DashboardRole = 'customer' | 'provider';

export type DashboardDetail =
  | { kind: 'message'; id: string }
  | { kind: 'request'; id: string }
  | { kind: 'lead'; id: string }
  | { kind: 'escrow'; id: string }
  | { kind: 'payout'; id: string }
  | { kind: 'balance' };
