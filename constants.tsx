
import { PlanType, SystemSettings } from './types';

export const INITIAL_PLANS: PlanType[] = [
  {
    id: 'plan_1',
    name: 'Alpha Robot V1',
    price: 470,
    dailyEarning: 50,
    totalEarning: 2500,
    durationDays: 50,
    imageUrl: 'https://picsum.photos/seed/robot1/400/300'
  },
  {
    id: 'plan_2',
    name: 'Beta Sentinel V2',
    price: 900,
    dailyEarning: 100,
    totalEarning: 5000,
    durationDays: 50,
    imageUrl: 'https://picsum.photos/seed/robot2/400/300'
  },
  {
    id: 'plan_3',
    name: 'Delta Prime V3',
    price: 1800,
    dailyEarning: 200,
    totalEarning: 10000,
    durationDays: 50,
    imageUrl: 'https://picsum.photos/seed/robot3/400/300'
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  minWithdraw: 350,
  dailyBonus: 10,
  bonusEnabled: true,
  referralBonusReferrer: 20,
  referralBonusNewUser: 40
};

export const ADMIN_CREDENTIALS = {
  username: 'Hamzaxlegend',
  password: 'Hamzaxlegend19024'
};
