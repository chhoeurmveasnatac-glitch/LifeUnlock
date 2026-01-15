
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Bucket {
  id: string;
  name: string;
  targetPercentage?: number;
  fixedAmount?: number;
  currentBalance: number;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  bucketId: string;
  date: string;
  note: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  bucketId: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpending: number;
}

export interface Rule {
  id: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  targetBucketId: string;
}

export type SubscriptionTier = 'STARTER' | 'PRO' | 'LIFETIME';

export interface Plan {
  id: SubscriptionTier;
  nameKey: string;
  priceKey: string;
  rawPrice: number;
  features: string[];
  color: string;
  iconKey: string;
  isPopular?: boolean;
}

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  subscription: SubscriptionTier;
  payday: number;
}
