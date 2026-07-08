import PersonalTab from '../components/PersonalTab';
import SharedTab from '../components/SharedTab';
import BalancesTab from '../components/BalancesTab';
import CalendarTab from '../components/CalendarTab';
import CalculationsTab from '../components/CalculationsTab';
import NeedsChatTab from '../components/NeedsChatTab';
import FlatmateMessengerTab from '../components/FlatmateMessengerTab';
import ContributionDashboard from '../components/ContributionDashboard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  DollarSign, 
  Home as HomeIcon, 
  Users, 
  TrendingUp, 
  Plus, 
  Check, 
  LogOut, 
  Calendar, 
  FileText, 
  Sparkles, 
  Award, 
  Search, 
  Filter, 
  Share2, 
  QrCode, 
  Trash2, 
  Pencil,
  Zap, 
  ShieldAlert, 
  HelpCircle,
  Download,
  AlertTriangle,
  Sun,
  Moon,
  Mic,
  Volume2,
  PhoneCall
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import confetti from 'canvas-confetti';

import useAppController from '../controllers/useAppController';

export default function AppView() {
  const appState = useAppController();
  const {
    theme, toggleTheme, canvasRef, token, setToken, user, setUser,
    isBackendConnected, setIsBackendConnected,
    activeTab, setActiveTab,
    activeHomeId, setActiveHomeId,
    homes, setHomes,
    activeHome,
    showBrief, setShowBrief,
    isRegistering, setIsRegistering,
    authForm, setAuthForm,
    authError, setAuthError,
    isListening,
    voiceDraft, setVoiceDraft,
    handleStartVoiceRecognition, handleCommitVoiceDraft,
    voiceError, setVoiceError,
    selectedSettlementPayee, setSelectedSettlementPayee,
    settlementRefId, setSettlementRefId,
    handleSubmitSettlementPayment, isSubmittingPayment,
    categoryColors, calculationsData,
    handleLogout, handleAuthSubmit,
  } = appState;

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Sidebar nav items
  const sidebarItems = [
    { key: 'calendar',      label: 'Calendar',        emoji: '📅' },
    { key: 'calculations',  label: 'Calculations',    emoji: '🧮' },
    { key: 'needs',         label: 'Restock Chat',    emoji: '🛒' },
    { key: 'contributions', label: 'Settlements',     emoji: '💰' },
    { key: 'messenger',     label: 'Chat & Connect',  emoji: '💬' },
    { key: 'profile',       label: 'Profile',         emoji: '👤' },
  ];

  const isSidebarTab = sidebarItems.some(i => i.key === activeTab);

  if (!token) {
    if (showBrief) {
  return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'light' ? 'light-mode text-slate-900' : 'text-gray-200'}`} style={theme === 'dark' ? { backgroundImage: "linear-gradient(rgba(11, 9, 20, 0.40), rgba(11, 9, 20, 0.40)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : { backgroundImage: "linear-gradient(rgba(245, 243, 255, 0.0), rgba(245, 243, 255, 0.0)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
          <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-transparent pointer-events-none" />
          {/* Header */}
          <header className="glass-panel border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white m-0 leading-none">Co-Pay</h2>
                <span className="text-4xs text-emerald-400 font-mono tracking-widest uppercase block mt-1">Git-inspired Flatmate Wallet Sync</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] rounded-full text-gray-400 hover:text-white cursor-pointer transition-all flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
              <button 
                onClick={() => setShowBrief(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Access Wallet Portal</span>
              </button>
            </div>
          </header>

          {/* Immersive Hero brief & preview */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-12">
            
            {/* Hero Heading */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="bg-purple-950/60 text-purple-400 text-4xs font-mono font-bold border border-purple-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
                🚀 Version 2.0 Live Preview
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Like <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">GitHub</span> but for your shared Flatmate expenses
              </h1>
              <p className="text-sm md:text-base text-gray-100 drop-shadow-md font-medium max-w-2xl mx-auto leading-relaxed">
                Manage rent, internet, groceries, electricity, and water bills transparently. Clear debts instantly, log expense commits with roommate approvals, and view contribution heatmaps.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-3">
                <button 
                  onClick={() => setShowBrief(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Set Up Your Flat Space</span>
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('demo-dashboard');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 text-sm font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Explore Interactive Brief
                </button>
              </div>
            </div>

            {/* Feature Cards brief */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="glass-panel p-5 rounded-2xl border border-gray-800/80 space-y-3">
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-xl w-max">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-100 font-mono uppercase tracking-wider">1. Commit Ledger</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Log transactions like updates. Set rules to require roommate approvals before splits are added to balances.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-gray-800/80 space-y-3">
                <div className="p-2.5 bg-purple-950/60 border border-purple-500/20 text-purple-400 rounded-xl w-max">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-100 font-mono uppercase tracking-wider">2. Finance AI</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Analyzes expense patterns, predicts next month's totals, and calculates daily safety limits.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-gray-800/80 space-y-3">
                <div className="p-2.5 bg-amber-950/60 border border-amber-500/20 text-amber-400 rounded-xl w-max">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-100 font-mono uppercase tracking-wider">3. Standings & Medals</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Unlock achievements like "Saver" or "Budget Master" by settling group balances.
                </p>
              </div>

            </div>

            {/* Interactive Preview Dashboard */}
            <div id="demo-dashboard" className="space-y-6 pt-6 border-t border-gray-800/60 scroll-mt-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>Interactive Workspace Brief Dashboard</span>
                  </h2>
                  <p className="text-xs text-gray-500 font-mono uppercase mt-1">💡 Click items below to see how our layout functions</p>
                </div>
                <span className="bg-emerald-950 text-emerald-400 text-3xs font-mono border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                  DEMO NODE
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Sidebar Preview */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-4 text-xs">
                    <span className="text-4xs font-mono text-gray-500 uppercase tracking-widest block">ACTIVE FLATMETES (3)</span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-900/60 p-2 rounded border border-gray-800">
                        <span className="font-semibold text-gray-200">Aman Sharma</span>
                        <span className="text-4xs text-emerald-400 font-mono">🏆 Leader</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-900/60 p-2 rounded border border-gray-800">
                        <span className="font-semibold text-gray-200">Rohit Verma</span>
                        <span className="text-4xs text-gray-400 font-mono">Active</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-900/60 p-2 rounded border border-gray-800">
                        <span className="font-semibold text-gray-200">You (Preview User)</span>
                        <span className="text-4xs text-purple-400 font-mono">🎖️ Ally</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-850">
                      <span className="text-4xs font-mono text-gray-500 uppercase tracking-widest block mb-2">EARNED MEDALS</span>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-4xs bg-emerald-950 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase font-bold">Early Payer</span>
                        <span className="text-4xs bg-amber-950 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase font-bold">Saver</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-2">
                    <span className="text-4xs font-mono text-purple-400 uppercase tracking-widest block">AI Smart Insights</span>
                    <p className="text-3xs text-gray-400 leading-normal">
                      💡 Switching off geysers and idle appliances could reduce this month's shared electricity split by 12%.
                    </p>
                  </div>
                </div>

                {/* Main preview */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                      <span className="text-4xs font-mono text-gray-400 uppercase tracking-wider block">Flat budget target</span>
                      <span className="text-lg font-black text-white mt-1">₹25,000</span>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                      <span className="text-4xs font-mono text-gray-400 uppercase tracking-wider block">Safety Daily Margin</span>
                      <span className="text-lg font-black text-emerald-400 mt-1">₹420 / day</span>
                      <span className="text-4xs text-gray-500 mt-2 block font-mono">Keeps you under the target budget</span>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                      <span className="text-4xs font-mono text-gray-400 uppercase tracking-wider block">Real-time status</span>
                      <span className="text-lg font-black text-indigo-400 mt-1">3 Dues Outstanding</span>
                      <span className="text-4xs text-emerald-400 mt-2 block font-mono">● Backend Node Active</span>
                    </div>
                  </div>

                  {/* Contribution summary card */}
                  <div className="glass-panel p-4 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                    <span className="text-4xs font-mono text-gray-400 uppercase tracking-wider">Payment Ledger status</span>
                    <span className="text-4xs text-emerald-400 font-mono font-bold uppercase">All systems running cleanly</span>
                  </div>

                  {/* Ledger logs preview */}
                  <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3">
                    <span className="text-4xs font-mono text-gray-400 uppercase tracking-wider block">Preview Ledger Logs</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between bg-gray-950/30 p-2.5 rounded border border-gray-900 hover:bg-gray-950/60 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-200">WiFi Router Internet Bill</p>
                          <span className="text-4xs font-mono text-gray-500 block uppercase">Internet ● Paid by Aman Sharma</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold block">₹1,200</span>
                          <span className="text-4xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/25 px-1 py-0.2 rounded font-mono uppercase">Approved</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-950/30 p-2.5 rounded border border-gray-900 hover:bg-gray-950/60 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-200">Household Groceries (BigBasket)</p>
                          <span className="text-4xs font-mono text-gray-500 block uppercase">Groceries ● Paid by You</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold block">₹1,450</span>
                          <span className="text-4xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/25 px-1 py-0.2 rounded font-mono uppercase">Approved</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-950/30 p-2.5 rounded border border-gray-900 hover:bg-gray-950/60 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-200">Geyser Thermostat Repairs</p>
                          <span className="text-4xs font-mono text-gray-500 block uppercase">Repairs ● Paid by Rohit Verma</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold block">₹850</span>
                          <span className="text-4xs text-amber-400 bg-amber-950/30 border border-amber-500/25 px-1 py-0.2 rounded font-mono uppercase">Pending (1/2)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settlement calculations preview */}
                  <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3">
                    <span className="text-4xs font-mono text-gray-400 uppercase tracking-wider block">Automatic Balance Settlement Plan</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs">
                      <div className="bg-gray-950/60 border border-gray-900 rounded-lg p-3 flex flex-col justify-between space-y-2">
                        <span className="text-gray-400">Rohit Verma owes Aman Sharma</span>
                        <span className="text-sm font-black text-white">₹1,400</span>
                        <button onClick={() => alert('Demo action: UPI logs are settled after login!')} className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 py-1 rounded text-3xs font-mono">Settle UPI</button>
                      </div>
                      <div className="bg-gray-950/60 border border-gray-900 rounded-lg p-3 flex flex-col justify-between space-y-2">
                        <span className="text-gray-400">You owe Aman Sharma</span>
                        <span className="text-sm font-black text-white">₹850</span>
                        <button onClick={() => alert('Demo action: Register / login to clear balances!')} className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 py-1 rounded text-3xs font-mono">Settle UPI</button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="text-center py-6 border-t border-gray-800/40">
              <p className="text-xs text-gray-500 font-mono mb-4">READY TO COMMIT YOUR REAL FLAT TRANSACTIONS?</p>
              <button 
                onClick={() => setShowBrief(false)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-xl transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Access Live Wallet Portal Now
              </button>
            </div>

          </main>

          {/* Footer */}
          <footer className="py-6 border-t border-[#1e293b] bg-[#0b0f19]/80 text-center font-mono text-4xs text-[#475569]">
            <p>CO-PAY BRIEFING SUITE &copy; 2026. INTERACTIVE DEMO ONLY.</p>
          </footer>
        </div>
      );
    }

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'light' ? 'light-mode text-slate-900' : 'text-gray-200'}`} style={theme === 'dark' ? { backgroundImage: "linear-gradient(rgba(11, 9, 20, 0.40), rgba(11, 9, 20, 0.40)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : { backgroundImage: "linear-gradient(rgba(245, 243, 255, 0.0), rgba(245, 243, 255, 0.0)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-transparent pointer-events-none" />
        <div className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden neon-border-purple">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500"></div>
          <div className="absolute top-4 right-4">
            <button 
              onClick={toggleTheme}
              className="p-1.5 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] rounded-full text-gray-400 hover:text-white cursor-pointer transition-all flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
              <DollarSign className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Co-Pay</h1>
              <p className="text-xs text-purple-400 font-mono tracking-widest uppercase">Flatmate Expense Sync</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-center text-gray-100 mb-2">
            {isRegistering ? 'Form a Roommate Clan' : 'Re-join Your Flatmates'}
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            {isRegistering 
              ? 'Initiate transparency commitments and tracking metrics.' 
              : 'Sign in to commit contributions and resolve roommate split balances.'}
          </p>

          {authError && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Aman Sharma" 
                  value={authForm.name}
                  onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="e.g. yourname@mail.com" 
                value={authForm.email}
                onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
            >
              {isRegistering ? 'Create Clan Profile' : 'Authenticate Commit Log'}
            </button>
          </form>

          <div className="mt-6 text-center flex flex-col gap-2">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              {isRegistering ? 'Already sharing? Connect credential node' : 'First time? Establish clean credentials'}
            </button>
            <button 
              onClick={() => setShowBrief(true)}
              className="text-gray-500 hover:text-gray-400 text-xs font-mono transition-colors"
            >
              ← Back to Interactive brief dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'light' ? 'light-mode text-slate-900' : 'text-gray-200'}`} style={theme === 'dark' ? { backgroundImage: "linear-gradient(rgba(11, 9, 20, 0.40), rgba(11, 9, 20, 0.40)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : { backgroundImage: "linear-gradient(rgba(245, 243, 255, 0.0), rgba(245, 243, 255, 0.0)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-transparent pointer-events-none" />

      {/* ── Sidebar Backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Slide-in Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col bg-[#07090f]/95 border-r border-white/[0.06] backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">More</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Sidebar nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {sidebarItems.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left w-full group ${
                activeTab === key
                  ? 'bg-[#1e293b] border border-white/[0.07] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base leading-none">{emoji}</span>
              <span>{label}</span>
              {activeTab === key && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer — user */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center font-black text-white text-xs uppercase shadow shrink-0">
              {(user?.name || 'C').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Curious Coder'}</p>
              <p className="text-[10px] text-gray-500 font-mono truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto shrink-0 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-30 w-full border-b border-white/[0.03] bg-[#040714]/40 backdrop-blur-md px-5 py-3 flex items-center justify-between gap-4">

        {/* Brand + Hamburger (left side) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Hamburger menu — opens sidebar */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer ${
              isSidebarTab
                ? 'bg-purple-600/30 border-purple-500/40 text-purple-300'
                : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="More options"
          >
            <span className={`block w-4 h-[2px] rounded-full transition-all ${
              isSidebarTab ? 'bg-purple-400' : 'bg-current'
            }`} />
            <span className={`block w-3 h-[2px] rounded-full transition-all ${
              isSidebarTab ? 'bg-purple-400' : 'bg-current'
            }`} />
            <span className={`block w-4 h-[2px] rounded-full transition-all ${
              isSidebarTab ? 'bg-purple-400' : 'bg-current'
            }`} />
          </button>

          <span className="text-lg font-black text-white tracking-tight font-sans">
            Co-Pay<span className="text-emerald-400 font-black">.</span>
          </span>
        </div>

        {/* Primary 3-tab pill */}
        <nav className="flex items-center bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg px-1.5 py-1.5 rounded-full gap-1.5 shadow-inner ml-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-1.5 text-2xs font-sans font-bold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'personal' ? 'bg-[#1e293b]/85 border border-white/5 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Personal_Spend
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-1.5 text-2xs font-sans font-bold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'shared' ? 'bg-[#1e293b]/85 border border-white/5 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Shared_Spend
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-4 py-1.5 text-2xs font-sans font-bold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'balances' ? 'bg-[#1e293b]/85 border border-white/5 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Fixed_Spend
          </button>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isBackendConnected && (
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-3xs px-2 py-1 rounded-lg flex items-center gap-1 font-mono">
              <AlertTriangle className="w-3 h-3 shrink-0 animate-bounce" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] rounded-full text-gray-400 hover:text-white cursor-pointer transition-all flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User avatar */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg px-2.5 py-1 rounded-full gap-2 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center font-black text-white text-3xs uppercase shadow">
              {(user?.name || 'C').charAt(0)}
            </div>
            <span className="text-2xs font-bold text-gray-200 hidden lg:inline select-none">{user?.name || 'You'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* AI Voice Expense Entry Preview Draft Modal */}
        {voiceDraft && (
          <div className="fixed inset-0 z-50 bg-[#0b0914]/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 shadow-xl bg-[#0b0914] max-w-2xl w-full space-y-4 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">AI Voice Parser Preview</h3>
              </div>
              <button 
                onClick={() => setVoiceDraft(null)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                Discard
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-4xs font-mono text-purple-300 uppercase tracking-widest block mb-1 font-bold">Expense Title</label>
                <input 
                  type="text" 
                  value={voiceDraft.title}
                  onChange={e => setVoiceDraft({ ...voiceDraft, title: e.target.value })}
                  className="w-full bg-[#0b0914] border border-purple-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-4xs font-mono text-purple-300 uppercase tracking-widest block mb-1 font-bold">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={voiceDraft.amount}
                    onChange={e => setVoiceDraft({ ...voiceDraft, amount: Number(e.target.value) })}
                    className="w-full bg-[#0b0914] border border-purple-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-4xs font-mono text-purple-300 uppercase tracking-widest block mb-1 font-bold">Category</label>
                  <input 
                    type="text" 
                    value={voiceDraft.category}
                    onChange={e => setVoiceDraft({ ...voiceDraft, category: e.target.value })}
                    className="w-full bg-[#0b0914] border border-purple-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-4xs font-mono text-purple-300 uppercase tracking-widest block mb-1 font-bold">Payer</label>
                <div className="w-full bg-[#0b0914] border border-purple-500/20 rounded-lg px-3 py-2 text-xs text-purple-200 font-sans">
                  {voiceDraft.paidByUserName || 'Me'}
                </div>
              </div>

              <div>
                <label className="text-4xs font-mono text-purple-300 uppercase tracking-widest block mb-1 font-bold">Split Type</label>
                <div className="flex gap-2 mt-1">
                  <button 
                    type="button"
                    onClick={() => setVoiceDraft({ ...voiceDraft, isShared: true })}
                    className={`flex-1 py-1 px-3 rounded-lg text-2xs font-mono border cursor-pointer transition-all ${voiceDraft.isShared ? 'bg-purple-600/30 border-purple-500 text-white font-bold' : 'bg-[#0b0914] border-purple-500/10 text-gray-400'}`}
                  >
                    Shared split
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVoiceDraft({ ...voiceDraft, isShared: false })}
                    className={`flex-1 py-1 px-3 rounded-lg text-2xs font-mono border cursor-pointer transition-all ${!voiceDraft.isShared ? 'bg-purple-600/30 border-purple-500 text-white font-bold' : 'bg-[#0b0914] border-purple-500/10 text-gray-400'}`}
                  >
                    Personal Private
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-4xs font-mono text-purple-300 uppercase tracking-widest block mb-1 font-bold">Payment Date</label>
                <input 
                  type="date" 
                  value={voiceDraft.date}
                  onChange={e => setVoiceDraft({ ...voiceDraft, date: e.target.value })}
                  className="w-full bg-[#0b0914] border border-purple-500/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-4xs font-mono text-purple-300 uppercase tracking-widest block mb-1 font-bold">Speech Transcription Notes</label>
                <textarea 
                  value={voiceDraft.notes}
                  onChange={e => setVoiceDraft({ ...voiceDraft, notes: e.target.value })}
                  className="w-full bg-[#0b0914] border border-purple-500/20 rounded-lg px-3 py-1.5 text-2xs text-white h-12 resize-none focus:outline-none focus:border-purple-400 font-sans"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3 justify-end">
              <button 
                onClick={() => setVoiceDraft(null)}
                className="bg-gray-900 border border-gray-800 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCommitVoiceDraft}
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg cursor-pointer transition-all"
              >
                Confirm & Save Expense
              </button>
            </div>
            </div>
          </div>
        )}

        {/* Speech Recognition Error Banner */}
        {voiceError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-2xs px-4 py-2.5 rounded-xl max-w-xl mx-auto flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{voiceError}</span>
            </div>
            <button onClick={() => setVoiceError(null)} className="text-red-400 hover:text-white text-3xs font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        {activeTab === 'personal' && <PersonalTab {...appState} />}
        {activeTab === 'shared' && <SharedTab {...appState} />}
        {activeTab === 'balances' && <BalancesTab {...appState} />}
        {activeTab === 'calendar' && <CalendarTab {...appState} />}
        {activeTab === 'calculations' && <CalculationsTab {...appState} />}
        {activeTab === 'needs' && <NeedsChatTab {...appState} />}
        {activeTab === 'messenger' && <FlatmateMessengerTab {...appState} />}
        {activeTab === 'contributions' && (
          <ContributionDashboard
            user={appState.user}
            activeHome={appState.activeHome}
            activeHomeId={appState.activeHomeId}
            apiFetch={appState.apiFetch}
            isBackendConnected={appState.isBackendConnected}
            expenses={appState.expenses}
            settlement={appState.settlement}
          />
        )}

        {/* PAGE 7: User Profile Settings & Leaderboard Info */}
        </main>

      {/* UPI QR Payment Modal */}
      {selectedSettlementPayee && (() => {
        const payeeMember = activeHome?.members?.find(m => m.id === selectedSettlementPayee.toId);
        const rawUpiId = payeeMember?.upiId || localStorage.getItem('mockUpiId') || 'roommate@upi';
        const payeeNameEncoded = encodeURIComponent(selectedSettlementPayee.toName);
        const upiString = `upi://pay?pa=${rawUpiId}&pn=${payeeNameEncoded}&am=${selectedSettlementPayee.amount}&cu=INR&tn=CoPay%20Settlement`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

        return (
          <div className="fixed inset-0 z-50 bg-[#0b0914]/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-[#a855f7]/20 max-w-sm w-full space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest">UPI QR Payment Settlement</h3>
                <button 
                  onClick={() => setSelectedSettlementPayee(null)}
                  className="text-gray-500 hover:text-white text-xs cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-gray-400">Transferring to <span className="text-white font-bold">{selectedSettlementPayee.toName}</span></p>
                <p className="text-3xl font-black text-white font-mono">₹{selectedSettlementPayee.amount}</p>
                <p className="text-[10px] text-gray-500 font-mono">UPI ID: {rawUpiId}</p>
              </div>

              <div className="flex flex-col items-center space-y-2 bg-white p-4.5 rounded-2xl border border-white/20 shadow-md">
                <img src={qrUrl} alt="UPI Settlement QR" className="w-40 h-40 object-contain" />
                <span className="text-[9px] text-gray-800 font-mono font-bold">Scan using GPay, PhonePe, Paytm</span>
              </div>

              <div className="space-y-3.5">
                <a 
                  href={upiString}
                  className="w-full bg-[#a855f7]/20 hover:bg-[#a855f7]/30 border border-[#a855f7]/30 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg text-center block"
                >
                  <span>Pay via UPI App</span>
                </a>

                <form onSubmit={handleSubmitSettlementPayment} className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                  <label className="text-4xs font-mono text-gray-400 uppercase tracking-wider block font-bold">Transaction Reference ID (e.g. IMPS/UPI Ref)</label>
                  <input 
                    type="text" 
                    placeholder="Enter 12-digit transaction ID" 
                    value={settlementRefId}
                    onChange={e => setSettlementRefId(e.target.value)}
                    className="w-full bg-[#0b0914] border border-gray-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmittingPayment}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 shadow"
                  >
                    {isSubmittingPayment ? 'Submitting...' : 'Mark as Completed'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      <footer className="mt-12 py-8 border-t border-[#1e293b] bg-[#0b0f19]/80 text-center font-mono text-3xs text-[#475569]">
        <div className="max-w-2xl mx-auto px-6">
          <p className="mb-2">CO-PAY PLATFORM &copy; 2026. ALL FINANCIAL RECORDS PERMANENTLY INDEXED FOR COMMIT CLARITY.</p>
        </div>
      </footer>
    </div>
  );
}
