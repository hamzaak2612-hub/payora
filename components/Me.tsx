
import React, { useState } from 'react';
import { User, SystemSettings } from '../types';
import { getStore, saveUsers } from '../store';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Users, ChevronRight, Copy, CheckCircle2, ImageIcon, Upload } from 'lucide-react';

interface MeProps {
  user: User;
  settings: SystemSettings;
  onUpdate: () => void;
}

const Me: React.FC<MeProps> = ({ user, settings, onUpdate }) => {
  const [view, setView] = useState<'PROFILE' | 'DEPOSIT' | 'WITHDRAW' | 'REFERRAL'>('PROFILE');
  const [copied, setCopied] = useState(false);

  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawName, setWithdrawName] = useState('');
  const [withdrawNumber, setWithdrawNumber] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'JazzCash' | 'EasyPaisa'>('JazzCash');

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large! Max 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!screenshotBase64) {
      alert("Please upload a deposit screenshot.");
      return;
    }
    
    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === user.id);
    if (userIndex === -1) return;
    
    const now = Date.now();
    const tx = {
      id: `dep_${now}`,
      type: 'deposit' as const,
      amount: Number(depositAmount),
      status: 'pending' as const,
      timestamp: now,
      details: 'Manual Deposit Request via JazzCash',
      screenshot: screenshotBase64
    };

    const updatedUsers = [...store.users];
    updatedUsers[userIndex].transactions = [...(updatedUsers[userIndex].transactions || []), tx];
    saveUsers(updatedUsers);
    onUpdate();
    alert("Upload successful. Amount will be added within 24 hours.");
    setDepositAmount('');
    setScreenshotBase64(null);
    setView('PROFILE');
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < settings.minWithdraw) {
      alert(`Minimum withdrawal is Rs ${settings.minWithdraw}`);
      return;
    }
    if (amt > user.balance) {
      alert("Cannot exceed current balance!");
      return;
    }

    const store = getStore();
    const userIndex = store.users.findIndex(u => u.id === user.id);
    if (userIndex === -1) return;
    
    const now = Date.now();
    const tx = {
      id: `wth_${now}`,
      type: 'withdraw' as const,
      amount: amt,
      status: 'pending' as const,
      timestamp: now,
      details: `Withdrawal to ${withdrawMethod} (${withdrawName}: ${withdrawNumber})`
    };

    const updatedUsers = [...store.users];
    updatedUsers[userIndex].balance -= amt;
    updatedUsers[userIndex].transactions = [...(updatedUsers[userIndex].transactions || []), tx];
    saveUsers(updatedUsers);
    onUpdate();
    alert("Withdrawal request submitted! Processing takes 12-24 hours.");
    setView('PROFILE');
  };

  if (view === 'REFERRAL') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setView('PROFILE')} className="text-emerald-400 flex items-center font-bold">
          <ChevronRight className="rotate-180 mr-1" /> Back
        </button>
        <div className="bg-slate-800 p-6 rounded-[2rem] shadow-2xl border border-slate-700 space-y-6">
          <div className="text-center py-4">
             <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Users size={32} className="text-blue-400" />
             </div>
             <h3 className="text-2xl font-black text-white">Refer & Grow</h3>
             <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Earn Rs {settings.referralBonusReferrer} per referral</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-inner">
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Your Unique Referral Code</p>
             <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-lg font-mono font-bold text-white uppercase tracking-tighter">{user.referralCode}</span>
                <button 
                  onClick={handleCopy}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  <span className="text-xs font-bold">{copied ? 'COPIED' : 'COPY'}</span>
                </button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 text-center">
                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Total Refers</p>
                <p className="text-2xl font-black text-white">{user.referredUsers?.length || 0}</p>
             </div>
             <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 text-center">
                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Bonus Earned</p>
                <p className="text-2xl font-black text-emerald-400">Rs {(user.referredUsers?.length || 0) * settings.referralBonusReferrer}</p>
             </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Recently Joined</h4>
             <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scroll">
                {(user.referredUsers || []).length > 0 ? user.referredUsers.map((refId, idx) => (
                   <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">User_{refId.slice(-6)}</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                   </div>
                )) : <p className="text-center text-slate-600 text-xs py-4 italic">No referrals yet. Share your code to start earning!</p>}
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'DEPOSIT') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setView('PROFILE')} className="text-emerald-400 flex items-center font-bold">
          <ChevronRight className="rotate-180 mr-1" /> Back
        </button>
        <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl space-y-6 border border-slate-700">
          <div className="flex flex-col items-center">
            <div className="bg-white p-2 rounded-xl mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Jazz_logo.png" className="h-10" alt="JazzCash" />
            </div>
            <h3 className="text-xl font-bold text-center text-white">Deposit via JazzCash</h3>
          </div>
          
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-3 shadow-inner">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Admin Account Info</p>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Number</span>
              <span className="text-lg font-mono font-bold text-white selection:bg-emerald-500">03006742763</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-2">
              <span className="text-slate-400 text-sm">Name</span>
              <span className="text-sm font-black text-emerald-400">Abdulsalam</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount to Deposit (Rs)</label>
              <input 
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-white"
                placeholder="Ex: 1000"
              />
            </div>
            
            <div className={`bg-slate-900 border-2 border-dashed rounded-2xl p-6 text-center group transition-all ${screenshotBase64 ? 'border-emerald-500/50' : 'border-slate-700 hover:border-emerald-500/50'}`}>
              <input 
                type="file" 
                className="hidden" 
                id="screenshot-upload" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="screenshot-upload" className="cursor-pointer block">
                {screenshotBase64 ? (
                  <div className="space-y-2">
                    <img src={screenshotBase64} className="h-20 mx-auto rounded-lg" alt="Preview" />
                    <p className="text-xs text-emerald-400 font-bold">Screenshot selected!</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-slate-600 mb-2" size={24} />
                    <p className="text-sm text-slate-300 font-bold mb-1">Upload deposit screenshot</p>
                    <p className="text-[10px] text-slate-500">Tap here to select your receipt</p>
                  </>
                )}
              </label>
            </div>
            
            <p className="text-[10px] text-emerald-500/80 text-center font-medium italic">
              "Upload deposit screenshot. Amount will be added within 24 hours."
            </p>
            
            <button 
              onClick={handleDeposit}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              CONFIRM DEPOSIT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'WITHDRAW') {
    const isValid = Number(withdrawAmount) >= settings.minWithdraw && Number(withdrawAmount) <= user.balance && withdrawName && withdrawNumber;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setView('PROFILE')} className="text-emerald-400 flex items-center font-bold">
          <ChevronRight className="rotate-180 mr-1" /> Back
        </button>
        <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl space-y-6 border border-slate-700">
          <h3 className="text-xl font-bold flex items-center text-white">
            <ArrowUpCircle className="text-red-400 mr-2" /> Request Withdrawal
          </h3>
          
          <div className="bg-slate-900/50 p-4 rounded-2xl flex justify-between items-center border border-slate-700">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Current Balance</p>
              <p className="text-2xl font-black text-white">Rs {user.balance}</p>
            </div>
            <Wallet className="text-emerald-500/20" size={40} />
          </div>

          <div className="space-y-4">
            <div className="flex p-1 bg-slate-950 rounded-2xl">
              <button 
                onClick={() => setWithdrawMethod('JazzCash')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${withdrawMethod === 'JazzCash' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
              >
                JazzCash
              </button>
              <button 
                onClick={() => setWithdrawMethod('EasyPaisa')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${withdrawMethod === 'EasyPaisa' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
              >
                EasyPaisa
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Holder Name</label>
              <input 
                type="text"
                value={withdrawName}
                onChange={(e) => setWithdrawName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:border-emerald-500 outline-none text-white"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Number</label>
              <input 
                type="text"
                value={withdrawNumber}
                onChange={(e) => setWithdrawNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:border-emerald-500 outline-none font-mono text-white"
                placeholder="03xxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount (Min Rs {settings.minWithdraw})</label>
              <input 
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:border-emerald-500 outline-none font-bold text-white"
                placeholder="0"
              />
            </div>

            <button 
              disabled={!isValid}
              onClick={handleWithdraw}
              className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${
                isValid 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              CONFIRM WITHDRAW
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile view (default)
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl rotate-3 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-emerald-500/20">
            <span className="-rotate-3 uppercase">{user.username.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">{user.username}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">
              Verified User
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-slate-700 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Wallet Balance</p>
          <h3 className="text-5xl font-black text-white flex items-start">
            <span className="text-lg text-emerald-500 mr-2 mt-2">Rs</span>
            {user.balance}
          </h3>
          
          <div className="grid grid-cols-2 gap-6 w-full mt-10 pt-8 border-t border-slate-700/50">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Today</p>
              <p className="text-xl font-bold text-emerald-400">+{user.todayEarnings}</p>
            </div>
            <div className="text-center border-l border-slate-700/50">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Total</p>
              <p className="text-xl font-bold text-blue-400">{user.totalEarnings}</p>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setView('DEPOSIT')}
          className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col items-center hover:bg-slate-700 transition-all active:scale-95 shadow-xl shadow-black/20"
        >
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-3">
            <ArrowDownCircle size={28} />
          </div>
          <span className="font-black text-sm uppercase tracking-wider text-slate-200">Deposit</span>
        </button>
        <button 
          onClick={() => setView('WITHDRAW')}
          className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col items-center hover:bg-slate-700 transition-all active:scale-95 shadow-xl shadow-black/20"
        >
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mb-3">
            <ArrowUpCircle size={28} />
          </div>
          <span className="font-black text-sm uppercase tracking-wider text-slate-200">Withdraw</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 divide-y divide-slate-700 overflow-hidden shadow-xl">
        <button 
          onClick={() => setView('REFERRAL')}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center space-x-4 text-left">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <span className="font-black text-xs uppercase block text-white">Referral Program</span>
              <span className="text-[10px] text-slate-500">Invite friends & earn rewards</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-600" />
        </button>
        
        {/* Recent Transactions List */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction History</h4>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{(user.transactions || []).length} Records</span>
          </div>
          <div className="space-y-4">
            {(user.transactions || []).slice(-5).reverse().map((tx, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center space-x-3 text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${['withdraw', 'purchase'].includes(tx.type) ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {['withdraw', 'purchase'].includes(tx.type) ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white capitalize">{tx.type}</p>
                    <p className="text-[9px] text-slate-600 font-medium">{new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${['withdraw', 'purchase'].includes(tx.type) ? 'text-red-400' : 'text-emerald-400'}`}>
                    {['withdraw', 'purchase'].includes(tx.type) ? '-' : '+'} Rs {tx.amount}
                  </p>
                  <p className={`text-[8px] font-black uppercase tracking-tighter ${tx.status === 'pending' ? 'text-yellow-500' : 'text-slate-600'}`}>{tx.status}</p>
                </div>
              </div>
            ))}
            {(user.transactions || []).length === 0 && <p className="text-center text-slate-600 italic text-xs py-4">No recent activities</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Me;
