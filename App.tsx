
import React, { useState, useEffect, useCallback } from 'react';
import { User, PlanType, SystemSettings } from './types';
import { getStore, saveUsers, isAdminLoggedIn } from './store';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Home from './components/Home';
import Earning from './components/Earning';
import Me from './components/Me';
import Admin from './components/Admin';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'EARNING' | 'ME'>('HOME');
  const [showAdmin, setShowAdmin] = useState(false);
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [globalSettings, setGlobalSettings] = useState<SystemSettings>(getStore().settings);
  const [globalPlans, setGlobalPlans] = useState<PlanType[]>(getStore().plans);

  useEffect(() => {
    const store = getStore();
    setGlobalUsers(store.users);
    setGlobalSettings(store.settings);
    setGlobalPlans(store.plans);
    
    const savedUser = localStorage.getItem('ri_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as User;
      const actual = store.users.find(u => u.id === parsed.id);
      if (actual && !actual.isBlocked) {
        setCurrentUser(actual);
      }
    }

    if (isAdminLoggedIn()) {
      setShowAdmin(true);
    }
  }, []);

  const refreshUserData = useCallback(() => {
    const store = getStore();
    setGlobalUsers(store.users);
    if (currentUser) {
      const updated = store.users.find(u => u.id === currentUser.id);
      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem('ri_current_user', JSON.stringify(updated));
      }
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ri_current_user');
  };

  if (showAdmin) {
    return <Admin onExit={() => setShowAdmin(false)} />;
  }

  if (!currentUser) {
    return (
      <Auth 
        onLogin={(user) => {
          setCurrentUser(user);
          localStorage.setItem('ri_current_user', JSON.stringify(user));
        }} 
        onAdminLogin={() => setShowAdmin(true)}
      />
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {activeTab === 'HOME' && (
        <Home 
          user={currentUser} 
          plans={globalPlans} 
          onUpdate={refreshUserData} 
        />
      )}
      {activeTab === 'EARNING' && (
        <Earning 
          user={currentUser} 
          plans={globalPlans} 
          settings={globalSettings} 
          onUpdate={refreshUserData} 
        />
      )}
      {activeTab === 'ME' && (
        <Me 
          user={currentUser} 
          settings={globalSettings} 
          onUpdate={refreshUserData} 
        />
      )}
    </Layout>
  );
};

export default App;
