
import React, { useState, useEffect } from 'react';
import { User, PlanType, SystemSettings, ActivePlan } from '../types';
import { getStore, saveUsers } from '../store';
import { Gift, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface EarningProps {
  user: User;
  plans: PlanType[];
  settings: SystemSettings;
  onUpdate: () => void;
}

const Earning: React.FC<EarningProps> = ({ user, plans, settings, onUpdate }) => {
  const [progress, setProgress] = useState(0);
  const [canClaimBonus, setCanClaimBonus] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const now = Date.now();
      
      // Bonus check
      if (settings.bonusEnabled) {
        if (!user.lastBonusClaim || (now - user.lastBonusClaim) >= 24 * 60 * 60 * 1000) {
          setCanClaimBonus(true);
        } else {
          setCanClaimBonus(false);
        }
      }

      // Earning logic simulation
      if (user.activePlans.length > 0) {
        // Use the newest plan for the display progress
        const newestPlan = user.activePlans[user.activePlans.length - 1];
        const elapsed = now - newestPlan.lastCollectionDate;
        const fullDay = 24 * 60 * 60 * 1000;
        const percent = Math.min(100, (elapsed / fullDay) * 100);
        setProgress(percent);

        // Auto-claim logic
        if (percent >= 100) {
          autoCollectEarnings();
        }
      } else {
        setProgress(0);
      }
    };

    const interval = setInterval(updateProgress, 5000);
    updateProgress();
    return () => clearInterval(interval);
  }, [user, settings]);

  const autoCollectEarnings = () => {
    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === user.id);
    if (userIndex === -1) return;

    let totalEarned = 0;
    const now = Date.now();
    const fullDay = 24 * 60 * 60 * 1000;

    const updatedActivePlans = store.users[userIndex].activePlans.map(ap => {
      const planDef = plans.find(p => p.id === ap.planId);
      if (planDef && now - ap.lastCollectionDate >= fullDay) {
        const cycles = Math.floor((now - ap.lastCollectionDate) / fullDay);
        totalEarned += planDef.dailyEarning * cycles;
        return { ...ap, lastCollectionDate: ap.lastCollectionDate + (cycles * fullDay) };
      }
      return ap;
    }).filter(ap => now < ap.expiryDate);

    if (totalEarned > 0) {
      store.users[userIndex].balance += totalEarned;
      store.users[userIndex].todayEarnings += totalEarned;
      store.users[userIndex].totalEarnings += totalEarned;
      store.users[userIndex].activePlans = updatedActivePlans;
      store.users[userIndex].transactions.push({
        id: `earn_${now}`,
        type: 'earning',
        amount: totalEarned,
        status: 'completed',
        timestamp: now,
        details: 'Automated AI trading yield'
      });
      saveUsers(store.users);
      onUpdate();
    }
  };

  const handleClaimBonus = () => {
    if (!canClaimBonus) return;
    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === user.id);
    if (userIndex === -1) return;
    const now = Date.now();
    store.users[userIndex].balance += settings.dailyBonus;
    store.users[userIndex].todayEarnings += settings.dailyBonus;
    store.users[userIndex].lastBonusClaim = now;
    store.users[userIndex].transactions.push({
      id: `bonus_${now}`,
      type: 'bonus',
      amount: settings.dailyBonus,
      status: 'completed',
      timestamp: now,
      details: 'Daily login bonus claim'
    });
    saveUsers(store.users);
    setCanClaimBonus(false);
    onUpdate();
  };

  const activePlanDetails = user.activePlans.map(ap => ({
    ...ap,
    details: plans.find(p => p.id === ap.planId)
  }));

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center">
            <Clock className="text-blue-400 mr-2" size={24} />
            Profit Engine
          </h3>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold animate-pulse">
            LIVE MINING
          </span>
        </div>

        {user.activePlans.length > 0 ? (
          <div className="space-y-4">
            <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Syncing Data: {Math.round(progress)}%</span>
              <span className="flex items-center"><TrendingUp size={12} className="mr-1 text-emerald-400" /> Active Nodes: {user.activePlans.length}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 space-y-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
            <AlertCircle size={40} className="mx-auto text-slate-600" />
            <div className="space-y-1">
              <p className="font-bold text-slate-400">Engine Standby</p>
              <p className="text-xs text-slate-500 px-4">Purchase an AI Robot from the Home screen to begin automated daily earnings.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl transition-colors duration-500 ${canClaimBonus ? 'bg-blue-600/20 text-blue-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
            <Gift size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Daily Check-in</h4>
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Next reset: 24 Hours</p>
          </div>
        </div>
        <button 
          onClick={handleClaimBonus}
          className={`px-8 py-2.5 rounded-xl font-black text-xs transition-all duration-500 shadow-lg ${
            canClaimBonus 
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 scale-105 active:scale-95' 
            : 'bg-emerald-600/40 text-emerald-400 cursor-default opacity-80'
          }`}
        >
          {canClaimBonus ? 'CLAIM RS 10' : 'CLAIMED'}
        </button>
      </div>

      <div className="space-y-4 pb-4">
        <h3 className="text-lg font-bold px-1 text-slate-300">Active Deployment</h3>
        {activePlanDetails.length > 0 ? (
          activePlanDetails.map((item, idx) => (
            <div key={item.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center space-x-4 shadow-lg">
              <div className="w-14 h-14 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700 shadow-inner">
                <img src={item.details?.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-white truncate">{item.details?.name}</p>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 rounded-md">+Rs {item.details?.dailyEarning}</span>
                </div>
                <div className="flex items-center text-[10px] text-slate-500 mt-2 space-x-3 uppercase tracking-widest font-bold">
                  <span>Exp: {new Date(item.expiryDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-blue-400">50D Term</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-600 py-8 italic text-sm">Your investment portfolio is currently empty.</p>
        )}
      </div>
    </div>
  );
};

export default Earning;
