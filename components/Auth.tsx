
import React, { useState } from 'react';
import { User } from '../types';
import { getStore, saveUsers } from '../store';
import { Mail, User as UserIcon, Lock, UserPlus, LogIn, ChevronRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  onAdminLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referral, setReferral] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();

    if (isLogin) {
      const user = store.users.find(u => u.username === username && u.passwordHash === password);
      if (user) {
        if (user.isBlocked) {
          alert("Account blocked! Please contact admin.");
          return;
        }
        onLogin(user);
      } else {
        alert("Invalid username or password!");
      }
    } else {
      // Signup logic
      if (!email.includes('@')) {
        alert("Please enter a valid email!");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (store.users.some(u => u.username === username)) {
        alert("Username already exists!");
        return;
      }

      const newUser: User = {
        id: `u_${Date.now()}`,
        username,
        email,
        passwordHash: password,
        balance: referral ? 40 : 0, // Signup bonus if referred
        todayEarnings: 0,
        totalEarnings: 0,
        referralCode: username,
        referredBy: referral || undefined,
        referredUsers: [],
        activePlans: [],
        transactions: referral ? [{
          id: `ref_b_${Date.now()}`,
          type: 'referral',
          amount: 40,
          status: 'completed',
          timestamp: Date.now(),
          details: 'Signup referral bonus'
        }] : []
      };

      // If referred, update referrer
      if (referral) {
        const referrerIndex = store.users.findIndex(u => u.username === referral);
        if (referrerIndex !== -1) {
          store.users[referrerIndex].balance += 20;
          store.users[referrerIndex].referredUsers.push(newUser.id);
          store.users[referrerIndex].transactions.push({
            id: `ref_r_${Date.now()}`,
            type: 'referral',
            amount: 20,
            status: 'completed',
            timestamp: Date.now(),
            details: `Referral bonus from ${username}`
          });
        }
      }

      store.users.push(newUser);
      saveUsers(store.users);
      onLogin(newUser);
      alert("Registration successful!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <LogIn size={40} className="-rotate-12 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">ROBOINVEST <span className="text-emerald-500">PRO</span></h1>
        <p className="text-slate-500 font-medium">Smart AI Investment Platform</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative">
        <div className="flex bg-slate-950 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-xl font-bold transition ${isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-xl font-bold transition ${!isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="Gmail Address" 
                className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-emerald-500 outline-none transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-emerald-500 outline-none transition"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-emerald-500 outline-none transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-emerald-500 outline-none transition"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Referral Username (Optional)" 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-emerald-500 outline-none transition"
                  value={referral}
                  onChange={e => setReferral(e.target.value)}
                />
              </div>
            </>
          )}

          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition shadow-xl mt-4 flex items-center justify-center space-x-2">
            <span>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
            <ChevronRight size={20} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center">
          <button 
            onClick={onAdminLogin}
            className="text-xs text-slate-600 hover:text-red-500 transition-colors uppercase font-bold tracking-widest"
          >
            Admin Entrance
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
