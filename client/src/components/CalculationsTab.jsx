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


export default function CalculationsTab(props) {
  const { calculationsData, theme, toggleTheme, canvasRef, token, setToken, user, setUser, isRegistering, setIsRegistering, authForm, setAuthForm, authError, setAuthError, showBrief, setShowBrief, homes, setHomes, activeHomeId, setActiveHomeId, activeHome, setActiveHome, expenses, setExpenses, settlement, setSettlement, aiInsights, setAiInsights, homeForm, setHomeForm, joinCode, setJoinCode, expenseForm, setExpenseForm, personalExpenseForm, setPersonalExpenseForm, userBudgetInput, setUserBudgetInput, homeBudgetInput, setHomeBudgetInput, editingExpenseId, setEditingExpenseId, calcSubTab, setCalcSubTab, calcTab, setCalcTab, activeTab, setActiveTab, sharedFilter, setSharedFilter, personalFilter, setPersonalFilter, showQR, setShowQR, calendarEvents, setCalendarEvents, selectedDate, setSelectedDate, newEventText, setNewEventText, profilePhone, setProfilePhone, profileUpi, setProfileUpi, isUpdatingProfile, setIsUpdatingProfile, reminders, setReminders, isSendingReminderId, setIsSendingReminderId, settlementPayments, setSettlementPayments, selectedSettlementPayee, setSelectedSettlementPayee, settlementRefId, setSettlementRefId, isSubmittingPayment, setIsSubmittingPayment, isVerifyingPaymentId, setIsVerifyingPaymentId, isListening, setIsListening, voiceDraft, setVoiceDraft, voiceError, setVoiceError, recurringTemplates, setRecurringTemplates, editingTemplate, setEditingTemplate, isAddingTemplate, setIsAddingTemplate, templateForm, setTemplateForm, isBackendConnected, setIsBackendConnected, apiFetch, loadData, loadOfflineFallback, fetchHomeData, loadOfflineHomeData, calculateOfflineSettlement, handleAuthSubmit, handleLogout, handleCreateHome, handleJoinHome, handleAddSharedExpense, handleDeleteSharedExpense, handleAddCalendarEvent, handleDeleteCalendarEvent, handleUpdateProfile, handleSendReminder, handleSubmitSettlementPayment, handleVerifySettlementPayment, handleStartVoiceRecognition, handleCommitVoiceDraft, handleApproveExpense, handleAddPersonalExpense, handleDeletePersonalExpense, handleUpdatePersonalBudget, handleUpdateHomeBudget, handleDirectSettle, handleTriggerRecurring, handleFileChange, handleExport, getWeekNumber, getWeekRange, personalExpensesTotal, myNetBalance, fixedLiabilityShare, spentAgainstBudget, filteredPersonalExpenses, filteredSharedExpenses, personalDailyChartData, personalCategoryPieData, sharedCategoryBarData, contributionGridCells, leaderboardRankings, categoryColors } = props;

  return (
          <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-6">
            
            {/* Top Level calculations switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/80 pb-4">
              <div className="flex gap-2 bg-white/[0.02] border border-white/[0.08] p-1 rounded-full w-max">
                <button 
                  onClick={() => setCalcTab('shared')}
                  className={`px-4.5 py-1.5 rounded-full text-4xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-all ${calcTab === 'shared' ? 'bg-[#1e293b]/90 text-white border border-white/5 shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  Shared Ledger
                </button>
                <button 
                  onClick={() => setCalcTab('personal')}
                  className={`px-4.5 py-1.5 rounded-full text-4xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-all ${calcTab === 'personal' ? 'bg-[#1e293b]/90 text-white border border-white/5 shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  Personal Tracker
                </button>
              </div>

              {/* Sub-tab Pill Selectors (Daily/Weekly/Monthly) */}
              <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.08] p-1 rounded-full">
                {['daily', 'weekly', 'monthly'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCalcSubTab(tab)}
                    className={`px-4.5 py-1.5 rounded-full text-4xs font-bold uppercase tracking-widest font-mono cursor-pointer transition-all ${calcSubTab === tab ? 'bg-[#1e293b]/90 text-white border border-white/5 shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown List */}
            <div className="space-y-4">
              {(() => {
                const list = calculationsData[calcTab]?.[calcSubTab] || [];
                if (list.length === 0) {
                  return (
                    <div className="py-16 text-center text-gray-500 font-mono text-xs">
                      No cleared transactions logged for this {calcTab} breakdown level.
                    </div>
                  );
                }

                if (calcTab === 'shared') {
                  return list.map(item => (
                    <div key={item.key} className="bg-gray-900/35 border border-white/[0.04] p-4.5 rounded-xl space-y-3.5 hover:border-white/[0.08] transition-all">
                      {/* Header info */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-gray-300">{item.label}</span>
                        <div className="text-right">
                          <span className="text-4xs text-gray-500 block uppercase font-mono">Total Shared money</span>
                          <span className="text-sm font-black text-emerald-400 font-mono font-bold">₹{item.total}</span>
                        </div>
                      </div>

                      {/* Member Breakdown grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-white/[0.03]">
                        {activeHome?.members?.map(m => {
                          const spent = item.members[m.id] || 0;
                          const percentage = item.total > 0 ? (spent / item.total) * 100 : 0;
                          return (
                            <div key={m.id} className="space-y-1.5 bg-black/25 border border-white/[0.02] p-3 rounded-lg flex flex-col justify-between">
                              <div className="flex justify-between items-center text-2xs">
                                <span className="font-semibold text-gray-300">{m.name}</span>
                                <span className="font-mono text-gray-400 font-bold">₹{spent} <span className="text-gray-600 text-3xs font-normal">({Math.round(percentage)}%)</span></span>
                              </div>

                              {/* Progress bar indicator */}
                              <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                } else {
                  // Personal Calculations view
                  return list.map(item => (
                    <div key={item.key} className="bg-gray-900/35 border border-white/[0.04] p-4.5 rounded-xl space-y-3.5 hover:border-white/[0.08] transition-all">
                      {/* Header info */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-gray-300">{item.label}</span>
                        <div className="text-right">
                          <span className="text-4xs text-gray-500 block uppercase font-mono">Total Personal outlays</span>
                          <span className="text-sm font-black text-purple-400 font-mono font-bold">₹{item.total}</span>
                        </div>
                      </div>

                      {/* Category Breakdown grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-white/[0.03]">
                        {Object.keys(item.categories).map(catName => {
                          const spent = item.categories[catName];
                          const percentage = item.total > 0 ? (spent / item.total) * 100 : 0;
                          return (
                            <div key={catName} className="space-y-1.5 bg-black/25 border border-white/[0.02] p-3 rounded-lg flex flex-col justify-between">
                              <div className="flex justify-between items-center text-2xs">
                                <span className="font-semibold text-gray-300 capitalize">{catName}</span>
                                <span className="font-mono text-gray-400 font-bold">₹{spent} <span className="text-gray-600 text-3xs font-normal">({Math.round(percentage)}%)</span></span>
                              </div>

                              {/* Progress bar indicator */}
                              <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                }
              })()}
            </div>
          </div>
  );
}
