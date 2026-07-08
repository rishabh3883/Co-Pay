import React from 'react';
import {
  DollarSign,
  FileText,
  Sparkles,
  Award,
  TrendingUp,
  Plus,
  Check,
  ShieldAlert,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

export default function AuthScreen({
  theme,
  toggleTheme,
  canvasRef,
  showBrief,
  setShowBrief,
  isRegistering,
  setIsRegistering,
  authForm,
  setAuthForm,
  authError,
  handleAuthSubmit,
}) {
  if (showBrief) {
    return (
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'light' ? 'light-mode text-slate-900' : 'text-gray-200'}`}
        style={
          theme === 'dark'
            ? { backgroundImage: "linear-gradient(rgba(11, 9, 20, 0.40), rgba(11, 9, 20, 0.40)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
            : { backgroundImage: "linear-gradient(rgba(245, 243, 255, 0.15), rgba(245, 243, 255, 0.15)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
        }
      >
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
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
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
                  <span className="text-4xs font-mono text-gray-500 uppercase tracking-widest block">ACTIVE FLATMATES (3)</span>
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
                    {[
                      { title: 'WiFi Router Internet Bill', sub: 'Internet ● Paid by Aman Sharma', amount: '₹1,200' },
                      { title: 'Household Groceries (BigBasket)', sub: 'Groceries ● Paid by You', amount: '₹1,450' },
                      { title: 'Geyser Thermostat Repairs', sub: 'Repairs ● Paid by Rohit Verma', amount: '₹850', pending: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-950/30 p-2.5 rounded border border-gray-900 hover:bg-gray-950/60 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-200">{item.title}</p>
                          <span className="text-4xs font-mono text-gray-500 block uppercase">{item.sub}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold block">{item.amount}</span>
                          {item.pending
                            ? <span className="text-4xs text-amber-400 bg-amber-950/30 border border-amber-500/25 px-1 py-0.2 rounded font-mono uppercase">Pending (1/2)</span>
                            : <span className="text-4xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/25 px-1 py-0.2 rounded font-mono uppercase">Approved</span>
                          }
                        </div>
                      </div>
                    ))}
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
        <footer className="py-6 border-t border-gray-900 bg-gray-950/30 text-center font-mono text-4xs text-gray-600">
          <p>CO-PAY BRIEFING SUITE &copy; 2026. INTERACTIVE DEMO ONLY.</p>
        </footer>
      </div>
    );
  }

  // Auth Form
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'light' ? 'light-mode text-slate-900' : 'text-gray-200'}`}
      style={
        theme === 'dark'
          ? { backgroundImage: "linear-gradient(rgba(11, 9, 20, 0.40), rgba(11, 9, 20, 0.40)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
          : { backgroundImage: "linear-gradient(rgba(245, 243, 255, 0.15), rgba(245, 243, 255, 0.15)), url('/space_rocket_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
      }
    >
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
