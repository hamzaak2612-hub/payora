
export type PlanType = {
  id: string;
  name: string;
  price: number;
  dailyEarning: number;
  totalEarning: number;
  durationDays: number;
  imageUrl: string;
};

export type ActivePlan = {
  id: string;
  planId: string;
  purchaseDate: number;
  lastCollectionDate: number;
  expiryDate: number;
};

export type TransactionType = 'deposit' | 'withdraw' | 'earning' | 'bonus' | 'referral' | 'purchase';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  timestamp: number;
  details?: string;
  screenshot?: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  balance: number;
  todayEarnings: number;
  totalEarnings: number;
  referralCode: string;
  referredBy?: string;
  referredUsers: string[];
  activePlans: ActivePlan[];
  transactions: Transaction[];
  lastBonusClaim?: number;
  isBlocked?: boolean;
};

export type SystemSettings = {
  minWithdraw: number;
  dailyBonus: number;
  bonusEnabled: boolean;
  referralBonusReferrer: number;
  referralBonusNewUser: number;
};
