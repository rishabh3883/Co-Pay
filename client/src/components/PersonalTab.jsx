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


export default function PersonalTab(props) {
  const { theme, toggleTheme, canvasRef, token, setToken, user, setUser, isRegistering, setIsRegistering, authForm, setAuthForm, authError, setAuthError, showBrief, setShowBrief, homes, setHomes, activeHomeId, setActiveHomeId, activeHome, setActiveHome, expenses, setExpenses, settlement, setSettlement, aiInsights, setAiInsights, homeForm, setHomeForm, joinCode, setJoinCode, expenseForm, setExpenseForm, personalExpenseForm, setPersonalExpenseForm, userBudgetInput, setUserBudgetInput, homeBudgetInput, setHomeBudgetInput, editingExpenseId, setEditingExpenseId, calcSubTab, setCalcSubTab, calcTab, setCalcTab, activeTab, setActiveTab, sharedFilter, setSharedFilter, personalFilter, setPersonalFilter, showQR, setShowQR, calendarEvents, setCalendarEvents, selectedDate, setSelectedDate, newEventText, setNewEventText, profilePhone, setProfilePhone, profileUpi, setProfileUpi, isUpdatingProfile, setIsUpdatingProfile, reminders, setReminders, isSendingReminderId, setIsSendingReminderId, settlementPayments, setSettlementPayments, selectedSettlementPayee, setSelectedSettlementPayee, settlementRefId, setSettlementRefId, isSubmittingPayment, setIsSubmittingPayment, isVerifyingPaymentId, setIsVerifyingPaymentId, isListening, setIsListening, voiceDraft, setVoiceDraft, voiceError, setVoiceError, recurringTemplates, setRecurringTemplates, editingTemplate, setEditingTemplate, isAddingTemplate, setIsAddingTemplate, templateForm, setTemplateForm, isBackendConnected, setIsBackendConnected, apiFetch, loadData, loadOfflineFallback, fetchHomeData, loadOfflineHomeData, calculateOfflineSettlement, handleAuthSubmit, handleLogout, handleCreateHome, handleJoinHome, handleAddSharedExpense, handleDeleteSharedExpense, handleAddCalendarEvent, handleDeleteCalendarEvent, handleUpdateProfile, handleSendReminder, handleSubmitSettlementPayment, handleVerifySettlementPayment, handleStartVoiceRecognition, handleCommitVoiceDraft, handleApproveExpense, handleAddPersonalExpense, handleDeletePersonalExpense, handleUpdatePersonalBudget, handleUpdateHomeBudget, handleDirectSettle, handleTriggerRecurring, handleFileChange, handleExport, getWeekNumber, getWeekRange, personalExpensesTotal, myNetBalance, fixedLiabilityShare, spentAgainstBudget, filteredPersonalExpenses, filteredSharedExpenses, personalDailyChartData, personalCategoryPieData, sharedCategoryBarData, contributionGridCells, leaderboardRankings, categoryColors } = props;

  return (
    <div className="space-y-6">
            
            {/* Top Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-3xs font-mono text-gray-400 uppercase tracking-widest font-bold">Personal Budget Limit</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-4">
                  <span className="text-2xl font-black text-white">₹{spentAgainstBudget}</span>
                  <span className="text-xs text-gray-500"> / ₹{user?.personalBudget || 0}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-gray-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${spentAgainstBudget > (user?.personalBudget || 0) ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, ((spentAgainstBudget / (user?.personalBudget || 1)) * 100))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-4xs font-mono text-gray-500">
                    <span>{Math.round((spentAgainstBudget / (user?.personalBudget || 1)) * 100)}% Used</span>
                    <span>₹{Math.max(0, (user?.personalBudget || 0) - spentAgainstBudget)} Left</span>
                  </div>
                  
                  {/* Detailed Math Breakdown showing out-of-pocket spent vs roommate debt and fixed templates adjustments */}
                  <div className="flex flex-col gap-1 text-[10px] text-gray-400 font-mono mt-2 bg-black/25 px-2 py-1.5 rounded border border-white/[0.02] space-y-1">
                    <div className="flex justify-between">
                      <span>Expenses: ₹{personalExpensesTotal}</span>
                      <span className={myNetBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'} title="Roommate Balance Offset (credit or debt)">
                        Balances: {myNetBalance >= 0 ? '+' : '-' }₹{Math.abs(myNetBalance)}
                      </span>
                    </div>
                    {fixedLiabilityShare > 0 && (
                      <div className="flex justify-between border-t border-white/[0.03] pt-1 text-gray-500">
                        <span>Fixed Dues (Rent, Maid & Internet Share):</span>
                        <span>+₹{fixedLiabilityShare}</span>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleUpdatePersonalBudget} className="mt-4 pt-3 border-t border-gray-800/60 flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Set Limit" 
                    value={userBudgetInput}
                    onChange={e => setUserBudgetInput(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                  <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer">
                    Save
                  </button>
                </form>
              </div>

              <div className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-3xs font-mono text-gray-400 uppercase tracking-widest font-bold">Daily Safety Margin</span>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div className="my-4">
                  {(() => {
                    const now = new Date();
                    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                    const daysRemaining = Math.max(1, daysInMonth - now.getDate());
                    const budgetLeft = Math.max(0, (user?.personalBudget || 0) - personalExpensesTotal);
                    const safeLimit = Math.round(budgetLeft / daysRemaining);
                    return (
                      <>
                        <span className="text-2xl font-black text-white">₹{safeLimit}</span>
                        <span className="text-xs text-gray-500"> / day</span>
                      </>
                    );
                  })()}
                </div>
                <p className="text-3xs text-gray-400 leading-relaxed font-mono">
                  Spend less than this daily safety threshold for the remaining month to secure your surplus goals.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden ai-card-highlight">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-3xs font-mono text-gray-300 uppercase tracking-wider font-extrabold">Co-Pay Finance AI</span>
                </div>
                
                <div className="my-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-3xs text-gray-500 font-mono uppercase">Health Score:</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">{aiInsights.healthScore || 85}/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xs text-gray-500 font-mono uppercase">Next Month Est:</span>
                    <span className="text-sm font-black text-indigo-400 font-mono">₹{aiInsights.predictedNextMonth || 0}</span>
                  </div>
                </div>

                <div className="bg-purple-950/30 border border-purple-500/20 rounded-lg p-2 text-4xs font-mono text-purple-300 max-h-20 overflow-y-auto">
                  {aiInsights.insights?.[0] || 'Analyzing transaction history matrices... Keep logging for suggestions.'}
                </div>
              </div>

            </div>

            {/* Middle Section: Record Personal Outgo & Private Ledger Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="glass-panel p-5 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Record Personal Outgo</h4>
                  <button 
                    type="button"
                    onClick={handleStartVoiceRecognition}
                    className={`p-1.5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${isListening ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="AI Voice Expense Entry"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
                <form onSubmit={handleAddPersonalExpense} className="space-y-3">
                  <div>
                    <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Expense Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Swiggy Dinner / Gym Fees" 
                      value={personalExpenseForm.title}
                      onChange={e => setPersonalExpenseForm({ ...personalExpenseForm, title: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Food, Shopping, Travel" 
                        value={personalExpenseForm.category}
                        onChange={e => setPersonalExpenseForm({ ...personalExpenseForm, category: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-855 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Amount (₹)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="₹" 
                        value={personalExpenseForm.amount}
                        onChange={e => setPersonalExpenseForm({ ...personalExpenseForm, amount: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Payment Date</label>
                    <input 
                      type="date" 
                      required
                      value={personalExpenseForm.date}
                      onChange={e => setPersonalExpenseForm({ ...personalExpenseForm, date: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-855 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Optional Notes</label>
                    <textarea 
                      placeholder="Additional notes" 
                      value={personalExpenseForm.notes}
                      onChange={e => setPersonalExpenseForm({ ...personalExpenseForm, notes: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-lg px-3 py-2 text-xs text-white h-16 resize-none focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Commit Outgo Log</span>
                  </button>
                </form>
              </div>

              <div className="glass-panel p-5 rounded-2xl shadow-xl md:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Private Ledger Logs</h4>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-44">
                      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={personalFilter.search}
                        onChange={e => setPersonalFilter({ ...personalFilter, search: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-850 rounded-lg pl-8 pr-2.5 py-1.5 text-2xs text-white"
                      />
                    </div>
                    <input 
                      type="text"
                      value={personalFilter.category === 'All' ? '' : personalFilter.category}
                      onChange={e => setPersonalFilter({ ...personalFilter, category: e.target.value })}
                      className="bg-gray-900 border border-gray-855 rounded-lg px-3 py-1.5 text-2xs text-white focus:outline-none focus:border-emerald-500 w-28"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 text-left font-mono">
                        <th className="pb-2 font-medium">Expense</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium text-right">Amount</th>
                        <th className="pb-2 font-medium text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersonalExpenses.map((e) => (
                        <tr key={e.id} className="border-b border-gray-855 hover:bg-gray-900/35 transition-colors">
                          <td className="py-2.5">
                            <div>
                              <p className="font-semibold text-gray-200">{e.title}</p>
                              {e.notes && <span className="text-3xs text-gray-500 block">{e.notes}</span>}
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span className="bg-gray-900 border border-gray-800 px-2 py-0.5 rounded text-gray-400 font-mono text-3xs">{e.category}</span>
                          </td>
                          <td className="py-2.5 text-gray-400 font-mono text-2xs">
                            {new Date(e.date).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-white">
                            ₹{e.amount}
                          </td>
                          <td className="py-2.5 text-center">
                            <button 
                              onClick={() => handleDeletePersonalExpense(e.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredPersonalExpenses.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No matching transaction records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Bottom Section: Chart Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="glass-panel p-5 rounded-2xl shadow-xl">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Personal Daily Spending Matrix</h4>
                <div className="h-64">
                  {personalDailyChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-500">
                      Insufficient log nodes to render curves. Log expenses below.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={personalDailyChartData}>
                        <defs>
                          <linearGradient id="colorPersonal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0b0f19', borderColor: '#334155', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPersonal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Private Category Shares</h4>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="h-44 w-full md:w-1/2">
                    {personalCategoryPieData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-gray-500">No chart slices</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={personalCategoryPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {personalCategoryPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#0b0f19', borderColor: '#334155', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  
                  <div className="w-full md:w-1/2 space-y-1.5 max-h-44 overflow-y-auto">
                    {personalCategoryPieData.map((e, idx) => (
                      <div key={idx} className="flex items-center justify-between text-2xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[idx % categoryColors.length] }}></div>
                          <span className="font-semibold text-gray-300">{e.name}</span>
                        </div>
                        <span className="font-mono text-gray-400">₹{e.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
  );
}
