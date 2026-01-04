
import { User, Transaction, SystemSettings, PlanType } from './types';
import { INITIAL_PLANS, DEFAULT_SETTINGS } from './constants';

const STORAGE_KEYS = {
  USERS: 'ri_users',
  SETTINGS: 'ri_settings',
  PLANS: 'ri_plans',
  ADMIN_SESSION: 'ri_admin_session'
};

export const getStore = () => {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const plansJson = localStorage.getItem(STORAGE_KEYS.PLANS);

  return {
    users: usersJson ? JSON.parse(usersJson) as User[] : [],
    settings: settingsJson ? JSON.parse(settingsJson) as SystemSettings : DEFAULT_SETTINGS,
    plans: plansJson ? JSON.parse(plansJson) as PlanType[] : INITIAL_PLANS
  };
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const saveSettings = (settings: SystemSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const savePlans = (plans: PlanType[]) => {
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
};

export const isAdminLoggedIn = () => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
};

export const setAdminLogin = (val: boolean) => {
  if (val) localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
  else localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
};
