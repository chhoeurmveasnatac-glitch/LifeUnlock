
import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Wallet, 
  ArrowLeftRight, 
  Settings, 
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  Home,
  Car,
  Utensils,
  Plane
} from 'lucide-react';

export const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Rent/Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Education',
  'Healthcare',
  'Travel',
  'Others'
];

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: 'dashboard' },
  { label: 'Goals', icon: <Target size={20} />, path: 'goals' },
  { label: 'Buckets', icon: <Wallet size={20} />, path: 'buckets' },
  { label: 'Transactions', icon: <ArrowLeftRight size={20} />, path: 'transactions' },
  { label: 'Rules & AI', icon: <TrendingUp size={20} />, path: 'rules' },
  { label: 'Pricing', icon: <ShieldCheck size={20} />, path: 'pricing' },
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  'education': <GraduationCap size={24} />,
  'emergency': <ShieldCheck size={24} />,
  'home': <Home size={24} />,
  'car': <Car size={24} />,
  'food': <Utensils size={24} />,
  'travel': <Plane size={24} />
};
