
import React, { useState, useEffect } from 'react';
import { User, PlanType } from '../types';
import { getStore, saveUsers } from '../store';
import { getMarketInsight } from '../services/gemini';
import { CreditCard, ShieldCheck, Zap, Users } from 'lucide-react';

interface HomeProps {
  user: User;
  plans: PlanType[];
  onUpdate: () => void;
}

const Home: React.FC<HomeProps> = ({ user, plans, onUpdate }) => {
  const [insight, setInsight] = useState("AI nodes syncing with market data...");
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  useEffect(() => {
    getMarketInsight().then(setInsight);
  }, []);

  const handleBuy = () => {
    if (!selectedPlan) return;

    if (user.balance < selectedPlan.price) {
      alert("Insufficient balance! Please deposit funds first.");
      setSelectedPlan(null);
      return;
    }

    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      alert("User session error. Please log in again.");
      return;
    }

    const now = Date.now();
    const newActivePlan = {
      id: `ap_${now}`,
      planId: selectedPlan.id,
      purchaseDate: now,
      lastCollectionDate: now,
      expiryDate: now + (selectedPlan.durationDays * 24 * 60 * 60 * 1000)
    };

    // Update the master store
    const updatedUsers = [...store.users];
    const targetUser = { ...updatedUsers[userIndex] };
    
    targetUser.balance -= selectedPlan.price;
    targetUser.activePlans = [...(targetUser.activePlans || []), newActivePlan];
    targetUser.transactions = [
      ...(targetUser.transactions || []),
      {
        id: `tx_${now}`,
        type: 'purchase',
        amount: selectedPlan.price,
        status: 'completed',
        timestamp: now,
        details: `Purchased ${selectedPlan.name}`
      }
    ];

    updatedUsers[userIndex] = targetUser;
    saveUsers(updatedUsers);
    
    // Explicitly notify parent to refresh currentUser state
    onUpdate();
    setSelectedPlan(null);
    alert("Plan activated successfully! You can track your earnings in the Earning tab.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm opacity-80">Welcome back,</p>
              <h2 className="text-2xl font-bold text-white">Hi, {user.username}</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/20 flex flex-col items-center">
               <span className="text-[10px] font-bold text-white uppercase mb-1">ID</span>
               <span className="text-xs font-black text-white">{user.username.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="mt-4 bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest flex items-center">
              <Zap size={12} className="mr-1" /> AI Market Insight
            </p>
            <p className="text-sm italic text-white/90 mt-1">"{insight}"</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-semibold flex items-center text-slate-200">
          <ShieldCheck className="text-emerald-400 mr-2" size={20} />
          Active Nodes
        </h3>
        <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold uppercase tracking-wider border border-slate-700">
          Duration: 50 Days
        </span>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl transform transition hover:scale-[1.01]"
          >
            <div className="relative h-48 overflow-hidden group">
              <img 
                src={plan.imageUrl || `https://picsum.photos/seed/${plan.id}/400/300`} 
                alt={plan.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                <div className="flex items-center space-x-2">
                   <span className="text-emerald-400 font-black text-lg">Rs {plan.price}</span>
                   <span className="text-[10px] text-slate-500 line-through">Rs {plan.price * 1.5}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Daily Yield</p>
                  <p className="text-lg font-bold text-emerald-400">Rs {plan.dailyEarning}</p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Goal</p>
                  <p className="text-lg font-bold text-blue-400">Rs {plan.totalEarning}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPlan(plan)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 active:scale-95"
              >
                <CreditCard size={18} />
                <span>START MINING</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/10">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white">Activate Bot?</h3>
              <p className="text-slate-400 text-sm px-4">This will deduct funds and start your 50-day earning cycle.</p>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-4 space-y-3 border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Bot Node</span>
                <span className="font-bold text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Fee</span>
                <span className="font-black text-emerald-400">Rs {selectedPlan.price}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-3">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Available</span>
                <span className="font-bold text-white">Rs {user.balance}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold transition text-slate-300 active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleBuy}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black transition shadow-xl shadow-emerald-500/20 text-white active:scale-95"
              >
                Confirm Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
