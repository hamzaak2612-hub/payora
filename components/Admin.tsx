
import React, { useState, useEffect, useCallback } from 'react';
import { getStore, saveUsers, saveSettings, savePlans, setAdminLogin } from '../store';
import { User, Transaction, SystemSettings, PlanType } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';
import { 
  LayoutDashboard, Users, FileText, Settings, X, Search, Check, 
  Trash2, ShieldAlert, DollarSign, Plus, Edit2, Save, Pause, Play, Trash, ArrowUpCircle, Eye, ImageIcon
} from 'lucide-react';

interface AdminProps {
  onExit: () => void;
}

const Admin: React.FC<AdminProps> = ({ onExit }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'USERS' | 'DEPOSITS' | 'WITHDRAWS' | 'PLANS' | 'SETTINGS'>('DASHBOARD');

  // State for data
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(getStore().settings);
  const [plans, setPlans] = useState<PlanType[]>(getStore().plans);
  const [search, setSearch] = useState('');
  
  // Modals/Editing states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const store = getStore();
    setUsers(store.users || []);
    setSettings(store.settings);
    setPlans(store.plans || []);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ri_admin_session') === 'true') {
      setIsLogged(true);
      loadData();
    }
  }, [loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === ADMIN_CREDENTIALS.username && adminPass === ADMIN_CREDENTIALS.password) {
      setIsLogged(true);
      setAdminLogin(true);
      loadData();
    } else {
      alert("Invalid admin credentials!");
    }
  };

  const handleLogout = () => {
    setIsLogged(false);
    setAdminLogin(false);
    onExit();
  };

  const refresh = () => {
    loadData();
  };

  const approveTx = (userId: string, txId: string) => {
    const store = getStore();
    const uIdx = store.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return;
    const txIdx = store.users[uIdx].transactions.findIndex(t => t.id === txId);
    if (txIdx === -1) return;
    
    const tx = store.users[uIdx].transactions[txIdx];
    if (tx.status !== 'pending') return;

    if (tx.type === 'deposit') {
      store.users[uIdx].balance += tx.amount;
    }
    store.users[uIdx].transactions[txIdx].status = 'approved';
    saveUsers(store.users);
    refresh();
  };

  const rejectTx = (userId: string, txId: string) => {
    const store = getStore();
    const uIdx = store.users.findIndex(u => u.id === userId);
    if (uIdx === -1) return;
    const txIdx = store.users[uIdx].transactions.findIndex(t => t.id === txId);
    if (txIdx === -1) return;
    
    const tx = store.users[uIdx].transactions[txIdx];
    if (tx.status !== 'pending') return;

    if (tx.type === 'withdraw') {
      store.users[uIdx].balance += tx.amount; // Refund balance if rejected
    }
    store.users[uIdx].transactions[txIdx].status = 'rejected';
    saveUsers(store.users);
    refresh();
  };

  const updateUserInfo = () => {
    if (!editingUser) return;
    const store = getStore();
    const uIdx = store.users.findIndex(u => u.id === editingUser.id);
    if (uIdx !== -1) {
      store.users[uIdx] = { ...editingUser };
      saveUsers(store.users);
      refresh();
      setEditingUser(null);
    }
  };

  const toggleBlockUser = (userId: string) => {
    const store = getStore();
    const uIdx = store.users.findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      store.users[uIdx].isBlocked = !store.users[uIdx].isBlocked;
      saveUsers(store.users);
      refresh();
    }
  };

  const deleteUser = (userId: string) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    const store = getStore();
    const filtered = store.users.filter(u => u.id !== userId);
    saveUsers(filtered);
    refresh();
  };

  const savePlanEdit = () => {
    if (!editingPlan) return;
    const store = getStore();
    const pIdx = store.plans.findIndex(p => p.id === editingPlan.id);
    if (pIdx !== -1) {
      store.plans[pIdx] = editingPlan;
    } else {
      store.plans.push(editingPlan);
    }
    savePlans(store.plans);
    refresh();
    setEditingPlan(null);
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-sans">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] w-full max-sm:px-6 max-w-sm space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-3xl font-black text-white">Admin Core</h2>
            <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Authentication Required</p>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:border-red-500 outline-none font-bold text-white transition-all"
              value={adminUser}
              onChange={e => setAdminUser(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:border-red-500 outline-none font-bold text-white transition-all"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-red-600/20 active:scale-95">
            ACCESS PANEL
          </button>
          <button type="button" onClick={onExit} className="w-full text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">Back to Site</button>
        </form>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );
  
  const pendingDeposits = users.flatMap(u => 
    u.transactions
      .filter(t => t.type === 'deposit' && t.status === 'pending')
      .map(t => ({...t, userId: u.id, username: u.username}))
  );
  
  const pendingWithdraws = users.flatMap(u => 
    u.transactions
      .filter(t => t.type === 'withdraw' && t.status === 'pending')
      .map(t => ({...t, userId: u.id, username: u.username}))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col h-auto md:h-screen sticky top-0 z-50">
        <div className="mb-10 px-2 flex justify-between items-center md:block">
          <div>
            <h1 className="text-xl font-black text-red-500 tracking-tighter uppercase italic">Hamzaxlegend</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Master Dashboard</p>
          </div>
          <button onClick={handleLogout} className="md:hidden text-slate-400"><X /></button>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveView('DASHBOARD')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold text-sm transition ${activeView === 'DASHBOARD' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button onClick={() => setActiveView('USERS')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold text-sm transition ${activeView === 'USERS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Users size={18} />
            <span>Users</span>
          </button>
          <button onClick={() => setActiveView('DEPOSITS')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold text-sm transition ${activeView === 'DEPOSITS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <DollarSign size={18} />
            <span className="flex-1 text-left">Deposits</span>
            {pendingDeposits.length > 0 && <span className="bg-white text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black">{pendingDeposits.length}</span>}
          </button>
          <button onClick={() => setActiveView('WITHDRAWS')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold text-sm transition ${activeView === 'WITHDRAWS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <FileText size={18} />
            <span className="flex-1 text-left">Withdraws</span>
            {pendingWithdraws.length > 0 && <span className="bg-white text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black">{pendingWithdraws.length}</span>}
          </button>
          <button onClick={() => setActiveView('PLANS')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold text-sm transition ${activeView === 'PLANS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Plus size={18} />
            <span>Plan Hub</span>
          </button>
          <button onClick={() => setActiveView('SETTINGS')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold text-sm transition ${activeView === 'SETTINGS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Settings size={18} />
            <span>System</span>
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-6 p-4 flex items-center space-x-4 text-slate-500 hover:text-white font-bold text-sm transition border-t border-slate-800 pt-6">
          <X size={18} />
          <span>Lock System</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        {activeView === 'DASHBOARD' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black text-white tracking-tighter">Command Center</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Real-time platform analytics</p>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: users.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Running Nodes', value: users.reduce((acc, u) => acc + (u.activePlans?.length || 0), 0), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Platform Balances', value: `Rs ${users.reduce((acc, u) => acc + (u.balance || 0), 0)}`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Approved Deposits', value: `Rs ${users.reduce((acc, u) => acc + (u.transactions || []).filter(t => t.type === 'deposit' && t.status === 'approved').reduce((a, t) => a + t.amount, 0), 0)}`, color: 'text-red-400', bg: 'bg-red-500/10' }
              ].map((s, i) => (
                <div key={i} className={`p-8 rounded-[2rem] border border-slate-800 ${s.bg}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-2xl font-black mt-2 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                  <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Active Plan Distribution</h3>
                  <div className="space-y-4">
                    {plans.length > 0 ? plans.map(p => {
                      const count = users.reduce((acc, u) => acc + (u.activePlans || []).filter(ap => ap.planId === p.id).length, 0);
                      return (
                        <div key={p.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                          <span className="text-sm font-bold text-slate-300">{p.name}</span>
                          <span className="text-sm font-black text-emerald-400">{count} Active</span>
                        </div>
                      );
                    }) : <p className="text-slate-500 text-center py-4">No plans configured.</p>}
                  </div>
               </div>
               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                  <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Latest System Activity</h3>
                  <div className="space-y-4">
                    {users.flatMap(u => (u.transactions || [])).sort((a,b) => b.timestamp - a.timestamp).slice(0, 5).map(tx => (
                      <div key={tx.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div>
                          <p className="text-xs font-black text-white uppercase">{tx.type}</p>
                          <p className="text-[9px] text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`text-sm font-black ${['deposit', 'earning', 'bonus', 'referral'].includes(tx.type) ? 'text-emerald-400' : 'text-red-400'}`}>Rs {tx.amount}</span>
                      </div>
                    ))}
                    {users.length === 0 && <p className="text-slate-500 text-center py-4">No activity yet.</p>}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeView === 'USERS' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <h2 className="text-3xl font-black text-white tracking-tighter">User Directory</h2>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter users..."
                  className="w-full bg-slate-900 border border-slate-800 pl-12 pr-4 py-3 rounded-2xl focus:border-red-500 outline-none text-sm font-bold text-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="p-6">Profile</th>
                      <th className="p-6">Wallet</th>
                      <th className="p-6">Growth</th>
                      <th className="p-6">Activity</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-6">
                          <p className="font-black text-white">{u.username}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{u.email}</p>
                        </td>
                        <td className="p-6">
                          <p className="font-black text-emerald-400">Rs {u.balance}</p>
                        </td>
                        <td className="p-6">
                          <p className="font-black text-blue-400">Rs {u.totalEarnings}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-tighter ${u.isBlocked ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {u.isBlocked ? 'BLACKLISTED' : 'OPERATIONAL'}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setEditingUser(u)} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg" title="Edit User">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => toggleBlockUser(u.id)} className={`p-2 rounded-xl transition-all shadow-lg ${u.isBlocked ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-slate-400 hover:bg-red-500 hover:text-white'}`} title={u.isBlocked ? 'Unblock' : 'Block'}>
                              <ShieldAlert size={16} />
                            </button>
                            <button onClick={() => deleteUser(u.id)} className="p-2 bg-slate-950 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-lg" title="Delete Account">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-bold">No users found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 space-y-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <header className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white">Modify Portfolio: {editingUser.username}</h3>
                <button onClick={() => setEditingUser(null)} className="p-2 text-slate-500 hover:text-white transition"><X /></button>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Current Balance (Rs)</label>
                  <input 
                    type="number" 
                    value={editingUser.balance}
                    onChange={e => setEditingUser({...editingUser, balance: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none font-black text-emerald-400 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Lifetime Earnings (Rs)</label>
                  <input 
                    type="number" 
                    value={editingUser.totalEarnings}
                    onChange={e => setEditingUser({...editingUser, totalEarnings: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none font-black text-blue-400 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Active Trading Bots</h4>
                {editingUser.activePlans && editingUser.activePlans.length > 0 ? (
                  <div className="space-y-3">
                    {editingUser.activePlans.map(ap => {
                      const pDef = plans.find(p => p.id === ap.planId);
                      return (
                        <div key={ap.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                          <div>
                            <p className="text-sm font-bold text-white">{pDef?.name || 'Unknown Plan'}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Expires: {new Date(ap.expiryDate).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => {
                            if(window.confirm("Cancel this user plan?")) {
                               const updated = {...editingUser, activePlans: editingUser.activePlans.filter(p => p.id !== ap.id)};
                               setEditingUser(updated);
                            }
                          }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition">
                            <Pause size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 text-xs py-4 italic">No active bots found.</p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                <button onClick={updateUserInfo} className="flex-1 py-4 bg-emerald-600 font-black text-white rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition">SAVE MODIFICATIONS</button>
              </div>
            </div>
          </div>
        )}

        {/* Deposits View */}
        {activeView === 'DEPOSITS' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white tracking-tighter">Deposit Verification</h2>
            <div className="space-y-6">
              {pendingDeposits.length > 0 ? pendingDeposits.map(tx => (
                <div key={tx.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-emerald-400 border border-slate-800 shadow-inner">
                        <DollarSign size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-white">Rs {tx.amount}</p>
                        <p className="text-xs font-bold text-slate-400">USER: <span className="text-emerald-400 font-black uppercase tracking-tighter">{tx.username}</span></p>
                        <p className="text-[10px] text-slate-600 font-bold">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setViewingScreenshot(tx.screenshot || null)}
                        className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3 hover:bg-slate-800 transition-colors group"
                        disabled={!tx.screenshot}
                      >
                         <ImageIcon size={20} className={tx.screenshot ? "text-blue-400 group-hover:scale-110 transition-transform" : "text-slate-700"} />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           {tx.screenshot ? "View Actual Pic" : "No Pic"}
                         </span>
                      </button>
                      <div className="flex space-x-2">
                        <button onClick={() => rejectTx(tx.userId, tx.id)} className="px-6 py-4 bg-slate-950 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black transition-all">REJECT</button>
                        <button onClick={() => approveTx(tx.userId, tx.id)} className="px-6 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl text-xs font-black transition-all shadow-xl shadow-emerald-500/20">APPROVE</button>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-800">
                  <p className="text-slate-600 font-black uppercase tracking-[0.2em]">Queue is empty</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Screenshot Viewer Modal */}
        {viewingScreenshot && (
          <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <button 
              onClick={() => setViewingScreenshot(null)}
              className="absolute top-6 right-6 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="max-w-2xl w-full h-[80vh] bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
              <img 
                src={viewingScreenshot} 
                className="w-full h-full object-contain" 
                alt="Deposit Proof" 
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-center font-bold">User Uploaded Receipt</p>
                <p className="text-white/60 text-center text-xs mt-1 italic">Please verify the amount matches the JazzCash transfer</p>
              </div>
            </div>
          </div>
        )}

        {/* Withdraws View */}
        {activeView === 'WITHDRAWS' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white tracking-tighter">Payout Processing</h2>
            <div className="space-y-6">
              {pendingWithdraws.length > 0 ? pendingWithdraws.map(tx => (
                <div key={tx.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-red-500 border border-slate-800 shadow-inner">
                        <ArrowUpCircle size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-white">Rs {tx.amount}</p>
                        <p className="text-xs font-bold text-slate-400">PAY TO: <span className="text-blue-400 font-black uppercase tracking-tighter">{tx.username}</span></p>
                        <p className="text-[9px] text-slate-600 font-bold italic">{tx.details}</p>
                      </div>
                   </div>
                   <div className="flex space-x-2">
                      <button onClick={() => rejectTx(tx.userId, tx.id)} className="px-6 py-3 bg-slate-950 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black transition-all">REJECT</button>
                      <button onClick={() => approveTx(tx.userId, tx.id)} className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl text-xs font-black transition-all shadow-xl shadow-blue-500/20">MARK AS PAID</button>
                   </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-800">
                  <p className="text-slate-600 font-black uppercase tracking-[0.2em]">No pending payouts</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plan Hub View */}
        {activeView === 'PLANS' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white tracking-tighter">Plan Ecosystem</h2>
              <button onClick={() => setEditingPlan({id: `plan_${Date.now()}`, name: '', price: 0, dailyEarning: 0, totalEarning: 0, durationDays: 50, imageUrl: ''})} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center shadow-lg transition-all active:scale-95">
                <Plus size={18} className="mr-2" /> CREATE NEW
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.length > 0 ? plans.map(p => (
                <div key={p.id} className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl group transition-transform hover:scale-[1.02]">
                  <div className="h-40 relative">
                    <img src={p.imageUrl || `https://picsum.photos/seed/${p.id}/400/200`} className="w-full h-full object-cover grayscale opacity-50" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <h3 className="absolute bottom-4 left-6 text-xl font-black text-white">{p.name}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Price</p>
                        <p className="font-bold text-emerald-400">Rs {p.price}</p>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Daily</p>
                        <p className="font-bold text-blue-400">Rs {p.dailyEarning}</p>
                      </div>
                    </div>
                    <button onClick={() => setEditingPlan(p)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold flex items-center justify-center transition-colors">
                      <Edit2 size={14} className="mr-2" /> Modify Configuration
                    </button>
                  </div>
                </div>
              )) : <p className="col-span-full text-center py-20 text-slate-600 font-bold">No active plans.</p>}
            </div>
          </div>
        )}

        {/* Global Parameters View */}
        {activeView === 'SETTINGS' && (
          <div className="max-w-2xl space-y-10 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white tracking-tighter">Global Parameters</h2>
            <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 space-y-6 shadow-2xl">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest px-2 mb-2 block">Minimum Payout (Rs)</label>
                    <input type="number" value={settings.minWithdraw} onChange={e => setSettings({...settings, minWithdraw: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl mt-1 font-black outline-none focus:border-red-500" />
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest px-2 mb-2 block">Check-in Reward (Rs)</label>
                    <input type="number" value={settings.dailyBonus} onChange={e => setSettings({...settings, dailyBonus: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl mt-1 font-black outline-none focus:border-red-500" />
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest px-2 mb-2 block">Referral Commission (Rs)</label>
                    <input type="number" value={settings.referralBonusReferrer} onChange={e => setSettings({...settings, referralBonusReferrer: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl mt-1 font-black outline-none focus:border-red-500" />
                 </div>
               </div>
               
               <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 mt-4">
                  <input 
                    type="checkbox" 
                    id="bonus-toggle"
                    checked={settings.bonusEnabled} 
                    onChange={e => setSettings({...settings, bonusEnabled: e.target.checked})} 
                    className="w-6 h-6 rounded-lg accent-red-600 cursor-pointer" 
                  />
                  <label htmlFor="bonus-toggle" className="font-black text-sm uppercase tracking-tighter cursor-pointer select-none">Global Daily Login Bonus System</label>
               </div>

               <button onClick={() => {saveSettings(settings); alert('System Updated Successfully');}} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black transition-all shadow-2xl shadow-red-600/20 active:scale-95">REDEPLOY SETTINGS</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
