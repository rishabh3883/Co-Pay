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


export default function BalancesTab(props) {
  const { theme, toggleTheme, canvasRef, token, setToken, user, setUser, isRegistering, setIsRegistering, authForm, setAuthForm, authError, setAuthError, showBrief, setShowBrief, homes, setHomes, activeHomeId, setActiveHomeId, activeHome, setActiveHome, expenses, setExpenses, settlement, setSettlement, aiInsights, setAiInsights, homeForm, setHomeForm, joinCode, setJoinCode, expenseForm, setExpenseForm, personalExpenseForm, setPersonalExpenseForm, userBudgetInput, setUserBudgetInput, homeBudgetInput, setHomeBudgetInput, editingExpenseId, setEditingExpenseId, calcSubTab, setCalcSubTab, calcTab, setCalcTab, activeTab, setActiveTab, sharedFilter, setSharedFilter, personalFilter, setPersonalFilter, showQR, setShowQR, calendarEvents, setCalendarEvents, selectedDate, setSelectedDate, newEventText, setNewEventText, profilePhone, setProfilePhone, profileUpi, setProfileUpi, isUpdatingProfile, setIsUpdatingProfile, reminders, setReminders, isSendingReminderId, setIsSendingReminderId, settlementPayments, setSettlementPayments, selectedSettlementPayee, setSelectedSettlementPayee, settlementRefId, setSettlementRefId, isSubmittingPayment, setIsSubmittingPayment, isVerifyingPaymentId, setIsVerifyingPaymentId, isListening, setIsListening, voiceDraft, setVoiceDraft, voiceError, setVoiceError, recurringTemplates, setRecurringTemplates, editingTemplate, setEditingTemplate, isAddingTemplate, setIsAddingTemplate, templateForm, setTemplateForm, isBackendConnected, setIsBackendConnected, apiFetch, loadData, loadOfflineFallback, fetchHomeData, loadOfflineHomeData, calculateOfflineSettlement, handleAuthSubmit, handleLogout, handleCreateHome, handleJoinHome, handleAddSharedExpense, handleDeleteSharedExpense, handleAddCalendarEvent, handleDeleteCalendarEvent, handleUpdateProfile, handleSendReminder, handleSubmitSettlementPayment, handleVerifySettlementPayment, handleStartVoiceRecognition, handleCommitVoiceDraft, handleApproveExpense, handleAddPersonalExpense, handleDeletePersonalExpense, handleUpdatePersonalBudget, handleUpdateHomeBudget, handleDirectSettle, handleTriggerRecurring, handleFileChange, handleExport, getWeekNumber, getWeekRange, personalExpensesTotal, myNetBalance, fixedLiabilityShare, spentAgainstBudget, filteredPersonalExpenses, filteredSharedExpenses, personalDailyChartData, personalCategoryPieData, sharedCategoryBarData, contributionGridCells, leaderboardRankings, categoryColors, startAddTemplate, startEditTemplate, handleSaveTemplate, handleDeleteTemplate } = props;

  return (
    <>
      <div className="space-y-6">
            
            {activeHome ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Debt split transfers */}
                {/* Debt split transfers */}
                <div className="glass-panel p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-6">
                  
                  {/* Roommate Balance Contributions Matrix */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Roommate Contributions & Splits</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Total expenses divided equally among all workspace members (Share: ₹{settlement?.share || 0} per member).
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {settlement?.memberContributions?.map((c) => (
                        <div key={c.userId} className="bg-gray-950/40 border border-gray-850 rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-2xs font-sans font-bold text-white">{c.userName}</p>
                              <span className="text-[10px] text-gray-500 font-mono">Paid outgo: ₹{c.paid}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-gray-500 block uppercase font-mono">Share Target</span>
                              <span className="text-[10px] text-gray-300 font-mono">₹{c.share}</span>
                            </div>
                          </div>
                          <div className="border-t border-white/[0.03] pt-2 flex justify-between items-center">
                            <span className="text-[9px] text-gray-400 font-mono">Net Balance Offset</span>
                            <span className={`text-2xs font-black font-mono ${c.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {c.netBalance >= 0 ? '+' : ''}₹{c.netBalance}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Split Settlement Matrix Direct Bank Transfers */}
                  <div className="border-t border-white/[0.04] pt-5 space-y-4">
                    <div>
                      <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Split Settlement Matrix</h3>
                      <p className="text-xs text-gray-500 mt-1">Roommate debts that must be cleared via bank/UPI transfers.</p>
                    </div>

                    {(settlement?.transfers?.length ?? 0) === 0 ? (
                      <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-8 flex flex-col items-center justify-center text-center text-emerald-300">
                        <div className="p-3 bg-emerald-600/20 rounded-full mb-3">
                          <Check className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-sm font-bold">Workspace ledger is balanced</p>
                        <p className="text-3xs text-gray-500 max-w-xs mt-1 leading-normal">
                          Every roommate has contributed exactly their target share. No outstanding transfers.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {settlement?.transfers?.map((t, idx) => {
                          const isMeDebtor = user && t.fromId === user.id;
                          return (
                            <div key={idx} className="bg-[#0b0914] border border-[#a855f7]/15 rounded-xl p-4 flex flex-col justify-between space-y-3">
                              <div className="flex items-center justify-between text-2xs">
                                <span className="text-gray-400">{t.fromName}</span>
                                <span className="text-gray-600">owes</span>
                                <span className="text-emerald-400 font-semibold">{t.toName}</span>
                              </div>
                              <div className="text-lg font-black text-white font-mono">
                                ₹{t.amount}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => handleSendReminder(t)}
                                  disabled={isSendingReminderId === t.fromId}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-2 rounded-lg text-3xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>{isSendingReminderId === t.fromId ? 'Sending...' : 'Remind WA'}</span>
                                </button>
                                <button 
                                  onClick={() => setSelectedSettlementPayee(t)}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 px-2 rounded-lg text-3xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>Pay UPI QR</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Reminder History Logs */}
                  {(reminders?.length ?? 0) > 0 && (
                    <div className="border-t border-white/[0.04] pt-5 space-y-3">
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">WhatsApp Reminders History Log</h4>
                      <div className="bg-[#0b0914] border border-white/5 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                        {reminders?.map((rem) => (
                          <div key={rem.id} className="flex justify-between items-center text-3xs border-b border-white/[0.02] pb-1.5 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold text-gray-200">To: {rem.recipient} ({rem.phone})</p>
                              <p className="text-gray-500 font-mono mt-0.5">{rem.expenseTitle} • {rem.dateTime ? new Date(rem.dateTime).toLocaleString() : ''}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white font-mono">₹{rem.amount}</p>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${(rem?.deliveryStatus || '').includes('Scheduled') ? 'bg-amber-950 text-amber-400 border border-amber-500/10' : 'bg-indigo-950 text-indigo-400 border border-indigo-500/10'}`}>
                                {rem?.deliveryStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Settlement Verification Ledger */}
                  {(settlementPayments?.length ?? 0) > 0 && (
                    <div className="border-t border-white/[0.04] pt-5 space-y-3">
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">UPI Settlements Verification Ledger</h4>
                      <div className="space-y-2.5">
                        {settlementPayments?.map((p) => {
                          const isReceiver = user && p.receiverId === user.id;
                          const isPending = p.status === 'Pending';
                          return (
                            <div key={p.id} className="bg-[#0b0914] border border-[#a855f7]/15 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                              <div className="space-y-1">
                                <p className="text-2xs font-bold text-gray-200">
                                  {p.senderName} paid {p.receiverName}
                                </p>
                                <p className="text-3xs text-gray-500 font-mono">
                                  Amount: ₹{p.amount} • Ref: {p.refId || 'None'} • {p.date ? new Date(p.date).toLocaleString() : ''}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className={`text-[8px] font-mono uppercase font-bold px-2 py-0.5 rounded ${p.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/10' : 'bg-amber-950 text-amber-400 border border-amber-500/10'}`}>
                                  {p.status}
                                </span>
                                
                                {isReceiver && isPending && (
                                  <button 
                                    onClick={() => handleVerifySettlementPayment(p.id)}
                                    disabled={isVerifyingPaymentId === p.id}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2.5 rounded-lg text-3xs transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {isVerifyingPaymentId === p.id ? 'Verifying...' : 'Verify & Settle'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fast Recurring templates */}
                <div className="glass-panel p-5 rounded-2xl shadow-xl space-y-4 h-max">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Fast Recurring Bills</h3>
                      <p className="text-3xs text-gray-500 mt-1 leading-normal">Instantly post recurring monthly bills with predefined amounts.</p>
                    </div>
                    {!isAddingTemplate && !editingTemplate && (
                      <button 
                        onClick={startAddTemplate}
                        className="p-1 bg-[#1e293b]/85 border border-white/5 text-emerald-400 hover:text-emerald-300 rounded-full cursor-pointer flex items-center justify-center"
                        title="Add Custom Template"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Inline Form for Add or Edit Template */}
                  {(isAddingTemplate || editingTemplate) ? (
                    <form onSubmit={handleSaveTemplate} className="space-y-3 bg-black/25 border border-white/[0.03] p-3.5 rounded-xl text-xs">
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block font-bold">
                        {editingTemplate ? 'Modify Bill Template' : 'Add New Bill Template'}
                      </span>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] text-gray-500 font-mono block uppercase">Display Label (e.g. Fiber Internet)</label>
                          <input 
                            type="text" 
                            required
                            value={templateForm.label}
                            onChange={e => setTemplateForm({ ...templateForm, label: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-2xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 font-mono block uppercase">Shared Ledger Title (e.g. WiFi Router Bill)</label>
                          <input 
                            type="text" 
                            value={templateForm.title}
                            placeholder="Defaults to label if blank"
                            onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-2xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-gray-500 font-mono block uppercase">Category</label>
                            <input 
                              type="text" 
                              placeholder="Rent, Maid, Internet, etc."
                              value={templateForm.category}
                              onChange={e => setTemplateForm({ ...templateForm, category: e.target.value })}
                              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-2xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 font-mono block uppercase">Emoji Icon</label>
                            <input 
                              type="text" 
                              value={templateForm.emoji}
                              onChange={e => setTemplateForm({ ...templateForm, emoji: e.target.value })}
                              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-2xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 font-mono block uppercase">Fixed Total Cost (₹)</label>
                          <input 
                            type="number" 
                            required
                            value={templateForm.amount}
                            onChange={e => setTemplateForm({ ...templateForm, amount: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-2xs text-white font-mono focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button 
                          type="button"
                          onClick={() => { setIsAddingTemplate(false); setEditingTemplate(null); }}
                          className="bg-gray-850 hover:bg-gray-800 text-gray-400 px-3 py-1 rounded text-2xs transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1 rounded text-2xs transition-all cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2 pt-2">
                      {recurringTemplates?.map((t) => (
                        <div key={t.id} className="flex gap-2 items-center group">
                          <button 
                            onClick={() => handleTriggerRecurring(t.title || t.label, t.category, t.amount)}
                            className="flex-1 bg-gray-955 hover:bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-2xs font-mono text-left flex justify-between items-center cursor-pointer transition-all hover:border-emerald-500/30"
                          >
                            <span>{t.emoji || '💰'} {t.label}</span>
                            <span className="text-white font-bold">₹{t.amount}</span>
                          </button>
                          
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button 
                              onClick={() => startEditTemplate(t)}
                              className="p-1.5 bg-gray-900 border border-gray-800 hover:border-gray-750 text-gray-400 hover:text-indigo-400 rounded-lg cursor-pointer flex items-center justify-center"
                              title="Edit Bill Template"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTemplate(t.id)}
                              className="p-1.5 bg-gray-900 border border-gray-800 hover:border-gray-750 text-gray-400 hover:text-red-400 rounded-lg cursor-pointer flex items-center justify-center"
                              title="Delete Bill Template"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(recurringTemplates?.length ?? 0) === 0 && (
                        <p className="text-[10px] text-gray-500 text-center font-mono py-4">No recurring bills. Click '+' to create one.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <p className="text-base font-bold text-gray-300 text-center drop-shadow-md">Establish or join a workspace from the Shared Ledger tab to view settlements.</p>
            )}

          </div>
    </>
  );
}
