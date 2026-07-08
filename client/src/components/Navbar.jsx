import React from 'react';
import {
  DollarSign,
  Home as HomeIcon,
  LogOut,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({
  theme,
  toggleTheme,
  user,
  homes,
  activeHomeId,
  setActiveHomeId,
  activeTab,
  setActiveTab,
  isBackendConnected,
  handleLogout,
}) {
  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'shared', label: 'Shared Ledger' },
    { id: 'balances', label: 'Balances' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'calculations', label: 'Calculations' },
    { id: 'needs', label: 'Restock Chat' },
    { id: 'messenger', label: 'Chat & Discovery' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.03] bg-[#040714]/40 backdrop-blur-md px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

      {/* Left Side: Brand Logo & Workspace Switcher */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight font-sans">
            Co-Pay<span className="text-emerald-400 font-black">.</span>
          </span>
        </div>

        {user && homes.length > 0 && (
          <div className="flex items-center gap-2 border-l border-white/[0.08] pl-4">
            <div className="p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-gray-400 flex items-center justify-center shrink-0">
              <HomeIcon className="w-3.5 h-3.5" />
            </div>
            <select
              value={activeHomeId}
              onChange={(e) => setActiveHomeId(e.target.value)}
              className="bg-[#1e293b]/85 border border-white/5 rounded-full px-3 py-1.5 text-2xs font-sans font-bold text-white shadow-lg cursor-pointer focus:outline-none transition-all hover:bg-[#2e3b4e]/85"
            >
              {homes.map(h => (
                <option key={h.id} value={h.id} className="bg-[#040714] text-white font-sans font-semibold text-2xs">{h.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Side: Nav + Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto ml-auto justify-end">

        {/* Navigation Pill */}
        <nav className="flex items-center bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg px-1.5 py-1.5 rounded-full gap-1.5 w-full md:w-auto overflow-x-auto shadow-inner">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4.5 py-1.5 text-2xs font-sans font-bold rounded-full transition-all duration-200 cursor-pointer ${activeTab === tab.id ? 'bg-[#1e293b]/85 border border-white/5 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Profile Info and Logout */}
        <div className="flex items-center gap-3.5 justify-between w-full md:w-auto shrink-0">
          {!isBackendConnected && (
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-3xs px-2 py-1 rounded-lg flex items-center gap-1 font-mono">
              <AlertTriangle className="w-3 h-3 shrink-0 animate-bounce" />
              <span>Offline Sandbox</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] rounded-full text-gray-400 hover:text-white cursor-pointer transition-all flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <div className="flex items-center bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg px-2.5 py-1 rounded-full gap-2.5 shadow-inner">
            <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center font-black text-white text-3xs uppercase shadow">
              {(user?.name || 'C').charAt(0)}
            </div>
            <span className="text-2xs font-sans font-bold text-gray-200 hidden lg:inline select-none border-r border-white/10 pr-2.5 py-0.5">{user?.name || 'Curious Coder'}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center"
              title="Logout Profile"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
