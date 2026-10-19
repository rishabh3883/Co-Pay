import PersonalTab from '../components/PersonalTab';
import SharedTab from '../components/SharedTab';
import BalancesTab from '../components/BalancesTab';
import CalendarTab from '../components/CalendarTab';
import CalculationsTab from '../components/CalculationsTab';
import NeedsChatTab from '../components/NeedsChatTab';
import FlatmateMessengerTab from '../components/FlatmateMessengerTab';
import ContributionDashboard from '../components/ContributionDashboard';
import BauhausLanding from '../components/BauhausLanding';
import ReceiptScannerModal from '../components/ReceiptScannerModal';
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
  Camera,
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
    isReceiptScannerOpen, setIsReceiptScannerOpen,
    handleReceiptExpenseAdded,
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
        <BauhausLanding
          onEnterApp={() => setShowBrief(false)}
          onOpenLogin={() => {
            setIsRegistering(false);
            setShowBrief(false);
          }}
          onOpenRegister={() => {
            setIsRegistering(true);
            setShowBrief(false);
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#F0F0F0] text-[#121212] font-bauhaus flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Bauhaus Graphic Shapes */}
        <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-[#D02020] border-4 border-[#121212] opacity-35 pointer-events-none"></div>
        <div className="absolute bottom-8 right-8 w-36 h-36 bg-[#1040C0] border-4 border-[#121212] rotate-12 opacity-35 pointer-events-none"></div>
        <div className="absolute top-1/2 left-4 w-24 h-24 bg-[#F0C020] bauhaus-triangle border-4 border-[#121212] opacity-30 pointer-events-none"></div>

        <div className="w-full max-w-md bg-white border-4 border-[#121212] p-8 sm:p-10 bauhaus-shadow-lg relative z-10">
          
          {/* Top Primary Color Bar */}
          <div className="flex h-3 border-2 border-black mb-6">
            <div className="w-1/3 bg-[#D02020]"></div>
            <div className="w-1/3 bg-[#1040C0]"></div>
            <div className="w-1/3 bg-[#F0C020]"></div>
          </div>

          {/* Logo Header */}
          <div className="flex items-center justify-between mb-6 border-b-4 border-[#121212] pb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#121212]">
                <div className="w-3 h-3 rounded-full bg-[#D02020]"></div>
                <div className="w-3 h-3 rounded-none bg-[#1040C0]"></div>
                <div className="w-3 h-3 bg-[#F0C020] bauhaus-triangle"></div>
              </div>
              <span className="text-2xl font-black uppercase tracking-tight">CO-PAY</span>
            </div>
            <span className="text-2xs font-mono font-black uppercase bg-[#121212] text-white px-2 py-0.5">
              PORTAL 1919
            </span>
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tight text-[#121212] mb-1">
            {isRegistering ? 'ESTABLISH CLAN' : 'AUTHENTICATE'}
          </h2>
          <p className="text-xs font-bold uppercase text-gray-600 mb-6 tracking-wide">
            {isRegistering 
              ? 'FORM FOLLOWS FUNCTION · PEER-REVIEWED FINANCIAL LEDGER' 
              : 'ENTER YOUR ROOMMATE CREDENTIALS TO RESOLVE SPLITS'}
          </p>

          {authError && (
            <div className="bg-[#D02020] text-white border-2 border-[#121212] p-3 mb-5 text-xs font-black uppercase flex items-center gap-2 bauhaus-shadow-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">FULL NAME</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.G. AMAN SHARMA" 
                  value={authForm.name}
                  onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full bg-[#F0F0F0] border-2 sm:border-4 border-[#121212] p-3 text-sm font-bold uppercase placeholder-gray-400 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">EMAIL IDENTIFIER</label>
              <input 
                type="email" 
                required
                placeholder="YOURNAME@DOMAIN.COM" 
                value={authForm.email}
                onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full bg-[#F0F0F0] border-2 sm:border-4 border-[#121212] p-3 text-sm font-bold uppercase placeholder-gray-400 focus:outline-none focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">PASSWORD KEY</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full bg-[#F0F0F0] border-2 sm:border-4 border-[#121212] p-3 text-sm font-bold uppercase placeholder-gray-400 focus:outline-none focus:bg-white transition-colors"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#D02020] text-white border-4 border-[#121212] font-black uppercase text-sm py-3.5 bauhaus-shadow-sm bauhaus-btn-press cursor-pointer hover:bg-[#D02020]/90 transition-colors mt-2"
            >
              {isRegistering ? 'INITIALIZE CLAN' : 'SIGN IN TO LEDGER'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-[#121212] flex flex-col gap-2.5 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="text-xs font-black uppercase hover:underline text-[#1040C0] cursor-pointer"
            >
              {isRegistering ? 'ALREADY ACTIVE? SIGN IN INSTEAD' : 'NEW RESIDENCE? ESTABLISH NEW CLAN'}
            </button>
            <button 
              onClick={() => setShowBrief(true)}
              className="text-xs font-bold uppercase text-gray-500 hover:text-black cursor-pointer"
            >
              ← RETURN TO BAUHAUS MANIFESTO
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0] text-[#121212] font-bauhaus selection:bg-[#F0C020] selection:text-[#121212]">
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-transparent pointer-events-none opacity-20" />

      {/* ── Sidebar Backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#121212]/60 backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Slide-in Sidebar (Bauhaus Drawer) ── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-72 flex flex-col bg-white border-r-4 border-[#121212] shadow-[8px_0px_0px_0px_#121212] transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-4 border-[#121212] bg-[#F0C020]">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#D02020] border-2 border-[#121212]" />
            <span className="text-xs font-black text-[#121212] uppercase tracking-wider">NAV // INDEX</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-[#D02020] hover:text-white text-[#121212] border-2 border-[#121212] font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            ✕
          </button>
        </div>

        {/* Sidebar nav items */}
        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto bg-[#F8F8F8]">
          {sidebarItems.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer text-left w-full border-3 ${
                activeTab === key
                  ? 'bg-[#1040C0] text-white border-[#121212] shadow-[4px_4px_0px_0px_#121212] translate-x-1'
                  : 'bg-white text-[#121212] border-[#121212] hover:bg-[#F0C020] shadow-[2px_2px_0px_0px_#121212]'
              }`}
            >
              <span className="text-base leading-none">{emoji}</span>
              <span className="flex-1">{label}</span>
              {activeTab === key && (
                <div className="w-2.5 h-2.5 bg-[#F0C020] border-2 border-white" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer — user */}
        <div className="p-4 border-t-4 border-[#121212] bg-white">
          <div className="flex items-center gap-3 p-2 bg-[#F0F0F0] border-3 border-[#121212]">
            <div className="w-9 h-9 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-white text-xs uppercase shadow-[2px_2px_0px_0px_#121212] shrink-0">
              {(user?.name || 'C').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[#121212] uppercase truncate">{user?.name || 'Curious Coder'}</p>
              <p className="text-[10px] text-[#404040] font-mono truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 bg-white hover:bg-[#D02020] text-[#121212] hover:text-white border-2 border-[#121212] transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Sticky Bauhaus Navbar ── */}
      <header className="sticky top-0 z-30 w-full border-b-4 border-[#121212] bg-white px-5 py-3 flex items-center justify-between gap-4 shadow-[0_4px_0_0_#121212]">

        {/* Brand + Hamburger (left side) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Hamburger menu — opens sidebar */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex flex-col justify-center items-center gap-[4px] w-10 h-10 border-3 border-[#121212] transition-all cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              isSidebarTab
                ? 'bg-[#1040C0] text-white'
                : 'bg-[#F0C020] text-[#121212] hover:bg-[#D02020] hover:text-white'
            }`}
            title="More tabs"
          >
            <span className="block w-4 h-[2.5px] bg-current" />
            <span className="block w-4 h-[2.5px] bg-current" />
            <span className="block w-4 h-[2.5px] bg-current" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#D02020] border-2 border-[#121212]" />
            <span className="text-xl font-black text-[#121212] tracking-tighter uppercase font-bauhaus">
              CO-PAY<span className="text-[#1040C0]">.</span>
            </span>
          </div>
        </div>

        {/* Primary 3-tab Bauhaus Bar */}
        <nav className="flex items-center border-3 border-[#121212] bg-[#F0F0F0] p-1 gap-1 shadow-[3px_3px_0px_0px_#121212] ml-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === 'personal'
                ? 'bg-[#D02020] text-white border-[#121212] shadow-[2px_2px_0px_0px_#121212]'
                : 'bg-transparent text-[#121212] border-transparent hover:bg-white hover:border-[#121212]'
            }`}
          >
            01 / PERSONAL
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === 'shared'
                ? 'bg-[#1040C0] text-white border-[#121212] shadow-[2px_2px_0px_0px_#121212]'
                : 'bg-transparent text-[#121212] border-transparent hover:bg-white hover:border-[#121212]'
            }`}
          >
            02 / SHARED
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === 'balances'
                ? 'bg-[#F0C020] text-[#121212] border-[#121212] shadow-[2px_2px_0px_0px_#121212]'
                : 'bg-transparent text-[#121212] border-transparent hover:bg-white hover:border-[#121212]'
            }`}
          >
            03 / FIXED DUES
          </button>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isBackendConnected && (
            <div className="bg-[#D02020] text-white border-2 border-[#121212] text-2xs px-2 py-1 flex items-center gap-1 font-mono font-black shadow-[2px_2px_0px_0px_#121212]">
              <AlertTriangle className="w-3 h-3 shrink-0 animate-bounce" />
              <span className="hidden sm:inline">OFFLINE MODE</span>
            </div>
          )}

          {/* Quick Scan Receipt Button */}
          <button
            onClick={() => setIsReceiptScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D02020] hover:bg-[#b01818] text-white border-3 border-[#121212] text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            title="Scan Receipt & Split 3-Way"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SCAN RECEIPT</span>
            <span className="bg-[#F0C020] text-[#121212] text-[9px] px-1 font-mono font-black border border-[#121212]">
              3-SPLIT
            </span>
          </button>

          {/* User avatar circular badge */}
          <div className="flex items-center bg-white border-3 border-[#121212] px-2.5 py-1 gap-2 shadow-[3px_3px_0px_0px_#121212]">
            <div className="w-6 h-6 rounded-full bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-white text-3xs uppercase">
              {(user?.name || 'C').charAt(0)}
            </div>
            <span className="text-xs font-black text-[#121212] uppercase hidden lg:inline select-none">{user?.name || 'User'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* AI Receipt Scanner & 3-Way Splitter Modal */}
        <ReceiptScannerModal
          isOpen={isReceiptScannerOpen}
          onClose={() => setIsReceiptScannerOpen(false)}
          activeHome={activeHome}
          user={user}
          onExpenseAdded={handleReceiptExpenseAdded}
        />

        {/* AI Voice Expense Entry Preview Draft Modal */}
        {voiceDraft && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white p-6 border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] max-w-2xl w-full space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b-4 border-[#121212] bg-[#F0C020] -mx-6 -mt-6 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-[#D02020] border-2 border-[#121212]" />
                  <Sparkles className="w-5 h-5 text-[#121212]" />
                  <h3 className="text-sm font-black text-[#121212] font-bauhaus uppercase tracking-wider">AI SPEECH // PARSER DRAFT</h3>
                </div>
                <button 
                  onClick={() => setVoiceDraft(null)}
                  className="bg-white text-[#121212] hover:bg-[#D02020] hover:text-white border-2 border-[#121212] px-2.5 py-1 text-xs font-black cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  DISCARD
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block mb-1">Expense Title</label>
                  <input 
                    type="text" 
                    value={voiceDraft.title}
                    onChange={e => setVoiceDraft({ ...voiceDraft, title: e.target.value })}
                    className="w-full bg-white border-3 border-[#121212] px-3 py-2 text-xs text-[#121212] font-black shadow-[3px_3px_0px_0px_#121212]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block mb-1">Amount (₹)</label>
                    <input 
                      type="number" 
                      value={voiceDraft.amount}
                      onChange={e => setVoiceDraft({ ...voiceDraft, amount: Number(e.target.value) })}
                      className="w-full bg-white border-3 border-[#121212] px-3 py-2 text-xs text-[#121212] font-mono font-black shadow-[3px_3px_0px_0px_#121212]"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block mb-1">Category</label>
                    <input 
                      type="text" 
                      value={voiceDraft.category}
                      onChange={e => setVoiceDraft({ ...voiceDraft, category: e.target.value })}
                      className="w-full bg-white border-3 border-[#121212] px-3 py-2 text-xs text-[#121212] font-black shadow-[3px_3px_0px_0px_#121212]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block mb-1">Payer</label>
                  <div className="w-full bg-[#F0F0F0] border-3 border-[#121212] px-3 py-2 text-xs text-[#121212] font-black">
                    {voiceDraft.paidByUserName || 'Me'}
                  </div>
                </div>

                <div>
                  <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block mb-1">Split Type</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setVoiceDraft({ ...voiceDraft, isShared: true })}
                      className={`flex-1 py-1.5 px-3 text-xs font-black uppercase tracking-wider border-3 border-[#121212] cursor-pointer transition-all ${
                        voiceDraft.isShared 
                          ? 'bg-[#1040C0] text-white shadow-[3px_3px_0px_0px_#121212]' 
                          : 'bg-white text-[#121212] hover:bg-[#F0C020]'
                      }`}
                    >
                      SHARED SPLIT
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVoiceDraft({ ...voiceDraft, isShared: false })}
                      className={`flex-1 py-1.5 px-3 text-xs font-black uppercase tracking-wider border-3 border-[#121212] cursor-pointer transition-all ${
                        !voiceDraft.isShared 
                          ? 'bg-[#D02020] text-white shadow-[3px_3px_0px_0px_#121212]' 
                          : 'bg-white text-[#121212] hover:bg-[#F0C020]'
                      }`}
                    >
                      PERSONAL
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block mb-1">Payment Date</label>
                  <input 
                    type="date" 
                    value={voiceDraft.date}
                    onChange={e => setVoiceDraft({ ...voiceDraft, date: e.target.value })}
                    className="w-full bg-white border-3 border-[#121212] px-3 py-2 text-xs text-[#121212] font-black shadow-[3px_3px_0px_0px_#121212]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block mb-1">Transcription Notes</label>
                  <textarea 
                    value={voiceDraft.notes}
                    onChange={e => setVoiceDraft({ ...voiceDraft, notes: e.target.value })}
                    className="w-full bg-white border-3 border-[#121212] px-3 py-2 text-xs text-[#121212] h-14 resize-none font-sans font-bold shadow-[3px_3px_0px_0px_#121212]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t-3 border-[#121212] flex gap-3 justify-end">
                <button 
                  onClick={() => setVoiceDraft(null)}
                  className="bg-white hover:bg-[#F0F0F0] text-[#121212] border-3 border-[#121212] px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCommitVoiceDraft}
                  className="bg-[#D02020] hover:bg-[#b01818] text-white border-3 border-[#121212] px-5 py-2 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                >
                  Confirm & Commit Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Speech Recognition Error Banner */}
        {voiceError && (
          <div className="bg-[#D02020] text-white border-3 border-[#121212] text-xs font-black px-4 py-3 shadow-[4px_4px_0px_0px_#121212] max-w-xl mx-auto flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-white" />
              <span>{voiceError}</span>
            </div>
            <button onClick={() => setVoiceError(null)} className="bg-white text-[#121212] border-2 border-[#121212] px-2 py-0.5 text-2xs font-black cursor-pointer shadow-[2px_2px_0px_0px_#121212]">DISMISS</button>
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

        </main>

      {/* UPI QR Payment Modal (Bauhaus Ticket Style) */}
      {selectedSettlementPayee && (() => {
        const payeeMember = activeHome?.members?.find(m => m.id === selectedSettlementPayee.toId);
        const rawUpiId = payeeMember?.upiId || localStorage.getItem('mockUpiId') || 'roommate@upi';
        const payeeNameEncoded = encodeURIComponent(selectedSettlementPayee.toName);
        const upiString = `upi://pay?pa=${rawUpiId}&pn=${payeeNameEncoded}&am=${selectedSettlementPayee.amount}&cu=INR&tn=CoPay%20Settlement`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

        return (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white p-6 border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center pb-3 border-b-4 border-[#121212] bg-[#F0C020] -mx-6 -mt-6 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-[#1040C0] border-2 border-[#121212]" />
                  <h3 className="text-xs font-black font-bauhaus text-[#121212] uppercase tracking-wider">UPI CLEARANCE // TICKET</h3>
                </div>
                <button 
                  onClick={() => setSelectedSettlementPayee(null)}
                  className="bg-white text-[#121212] hover:bg-[#D02020] hover:text-white border-2 border-[#121212] px-2 py-0.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  ✕
                </button>
              </div>

              <div className="text-center space-y-1 pt-1">
                <p className="text-xs text-[#404040] font-bold uppercase tracking-wider">Payee: <span className="text-[#121212] font-black underline decoration-[#D02020] decoration-2">{selectedSettlementPayee.toName}</span></p>
                <p className="text-4xl font-black text-[#121212] font-mono tracking-tight">₹{selectedSettlementPayee.amount}</p>
                <p className="text-xs text-[#1040C0] font-mono font-bold bg-[#F0F0F0] py-1 border-2 border-[#121212]">UPI: {rawUpiId}</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-white border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212]">
                <img src={qrUrl} alt="UPI Settlement QR" className="w-40 h-40 object-contain" />
                <span className="text-2xs text-[#121212] font-mono font-black mt-2 uppercase tracking-wider bg-[#F0C020] px-2 py-0.5 border border-[#121212]">SCAN TO PAY VIA UPI APP</span>
              </div>

              <div className="space-y-3">
                <a 
                  href={upiString}
                  className="w-full bg-[#1040C0] hover:bg-[#0c3196] text-white font-black py-2.5 border-3 border-[#121212] text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-center block"
                >
                  <span>Launch UPI App Directly &rarr;</span>
                </a>

                <form onSubmit={handleSubmitSettlementPayment} className="space-y-2 pt-2 border-t-3 border-[#121212]">
                  <label className="text-3xs font-black text-[#121212] uppercase tracking-wider block">Reference / UTR ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter 12-digit transaction ID" 
                    value={settlementRefId}
                    onChange={e => setSettlementRefId(e.target.value)}
                    className="w-full bg-white border-3 border-[#121212] px-3 py-1.5 text-xs text-[#121212] font-mono font-bold shadow-[2px_2px_0px_0px_#121212]"
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmittingPayment}
                    className="w-full bg-[#D02020] hover:bg-[#b01818] text-white font-black py-2.5 border-3 border-[#121212] text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    {isSubmittingPayment ? 'Submitting...' : 'Mark Settlement Paid'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bauhaus Constructivist Footer */}
      <footer className="mt-16 py-8 border-t-4 border-[#121212] bg-[#F0C020] text-center font-bauhaus text-xs font-black text-[#121212]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#D02020] border-2 border-[#121212]" />
            <span className="uppercase tracking-widest font-black">CO-PAY ARCHITECTURE &copy; 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white border-2 border-[#121212] px-2 py-0.5 shadow-[2px_2px_0px_0px_#121212]">WEIMAR SYSTEM</span>
            <span className="bg-[#1040C0] text-white border-2 border-[#121212] px-2 py-0.5 shadow-[2px_2px_0px_0px_#121212]">VERIFIED BALANCES</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
