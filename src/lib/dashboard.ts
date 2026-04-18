export type DashboardRole = 'customer' | 'provider';

export type DashboardDetail =
  | { kind: 'message'; id: string }
  | { kind: 'request'; id: number }
  | { kind: 'lead'; id: number }
  | { kind: 'escrow'; id: number }
  | { kind: 'payout'; id: number }
  | { kind: 'balance' };
