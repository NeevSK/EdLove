export interface EnergyBalanceState {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  dailyQuotaRemaining: number;
  dailyQuotaMax: number;
}

export interface AdRewardEvent {
  transactionId: string;
  provider: 'admob' | 'test' | 'direct';
  rewardAmount: number;
  verified: boolean;
  createdAt: string;
}

export interface RewardedAdHubState {
  isLoaded: boolean;
  isLoading: boolean;
  isWatching: boolean;
  energyBalance: EnergyBalanceState | null;
  error: string | null;
  cooldownSeconds: number;
  showAd: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}
