import React from 'react';
import {
  Home as HomeIcon,
  Plus,
  Check,
  Pencil,
  Trash2,
  Search,
  Download,
  QrCode,
  AlertTriangle,
  Mic
} from 'lucide-react';

export default function SharedWorkspace({
  user,
  homes,
  activeHome,
  homeForm,
  setHomeForm,
  joinCode,
  setJoinCode,
  handleCreateHome,
  handleJoinHome,
  expenseForm,
  setExpenseForm,
  editingExpenseId,
  setEditingExpenseId,
  handleAddSharedExpense,
  handleDeleteSharedExpense,
  handleApproveExpense,
  handleFileChange,
  filteredSharedExpenses,
  sharedFilter,
  setSharedFilter,
  showQR,
  setShowQR,
  handleExport,
  isListening,
  handleStartVoiceRecognition,
}) {
  if (homes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-8 rounded-2xl shadow-xl max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl w-max mx-auto border border-purple-500/20">
              <HomeIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No active workspaces</h3>
            <p className="text-xs text-gray-400 leading-normal max-w-sm mx-auto">
              To start logging shared expenses, you need to establish a new flat/room space or enter an existing invite code from your flatmates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800/60">
            <form onSubmit={handleCreateHome} className="space-y-3">
              <span className="text-3xs font-mono text-emerald-400 uppercase tracking-widest block font-bold">1. Establish New Space</span>
              <input
                type="text"
                required
                placeholder="e.g. Flat A / Room 204"
                value={homeForm.name}
                onChange={e => setHomeForm({ ...homeForm, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="number"
                placeholder="Group Monthly Budget Limit"
                value={homeForm.monthlyBudget}
                onChange={e => setHomeForm({ ...homeForm, monthlyBudget: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            </form>

            <form onSubmit={handleJoinHome} className="space-y-3">
              <span className="text-3xs font-mono text-purple-400 uppercase tracking-widest block font-bold">2. Join Existing Space</span>
              <input
                type="text"
                required
                placeholder="Invite Code (e.g. COPLAY)"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none"
              />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                Join Flat Space
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Active Workspace Info Panel */}
      {activeHome && (
        <div className="glass-panel p-5 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
          <div className="space-y-3">
            <div>
              <span className="text-4xs font-mono text-gray-500 uppercase tracking-wider block">ACTIVE WORKSPACE</span>
              <h3 className="text-xl font-black text-white mt-1">{activeHome.name}</h3>
            </div>

            <div className="flex gap-2">
              <span className="bg-emerald-950/60 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <span>Code: {activeHome.inviteCode}</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeHome.inviteCode);
                  alert('Invite code copied to clipboard!');
                }}
                className="bg-gray-900 border border-gray-800 text-gray-300 hover:text-white px-3 py-1 rounded-lg text-2xs font-semibold cursor-pointer"
              >
                Copy
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-gray-900 border border-gray-800 text-gray-300 hover:text-white p-2 rounded-lg cursor-pointer"
                title="Show QR"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>

            {showQR && (
              <div className="p-3 bg-white rounded-xl flex flex-col items-center justify-center space-y-1 w-max border border-gray-855">
                <QrCode className="w-24 h-24 text-gray-800" />
                <span className="text-4xs text-gray-800 font-mono font-bold">Scan: {activeHome.inviteCode}</span>
              </div>
            )}
          </div>

          {/* Roommate Roster */}
          <div className="space-y-2 border-l border-gray-800 pl-0 md:pl-6">
            <span className="text-4xs font-mono text-gray-500 uppercase tracking-wider block">ROOMMATE ROSTER ({activeHome.members?.length || 1})</span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {activeHome.members?.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-xs bg-gray-950/40 p-2 rounded border border-gray-900">
                  <div className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 font-bold flex items-center justify-center text-4xs">
                    {m.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-300 truncate">{m.name}</span>
                  {activeHome.adminId === m.id && (
                    <span className="text-4xs bg-purple-950 text-purple-300 px-1 py-0.2 rounded font-mono border border-purple-500/20 ml-auto">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workspace actions & ledger table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Expense Form */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl h-max">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              {editingExpenseId ? 'Update Shared Expense' : 'Post Shared Expense'}
            </h4>
            <button
              type="button"
              onClick={handleStartVoiceRecognition}
              className={`p-1.5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${isListening ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
              title="AI Voice Expense Entry"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleAddSharedExpense} className="space-y-3">
            <div>
              <label className="text-3xs font-mono text-gray-400 tracking-wider block mb-1">Bill Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Gas cylinder / Electricity"
                value={expenseForm.title}
                onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-3xs font-mono text-gray-400 tracking-wider block mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rent, Internet, Maid"
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-3xs font-mono text-gray-400 tracking-wider block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="₹"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-3xs font-mono text-gray-400 tracking-wider block mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={expenseForm.date}
                onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full bg-gray-900 border border-gray-805 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-3xs font-mono text-gray-400 tracking-wider block mb-1">Attach Receipt</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-3xs text-gray-500 file:mr-3 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-3xs file:font-semibold file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 cursor-pointer"
              />
              {expenseForm.billImage && (
                <div className="mt-2 relative w-16 h-16 rounded overflow-hidden border border-gray-800">
                  <img src={expenseForm.billImage} alt="Receipt preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="needsApproval"
                checked={expenseForm.needsApproval}
                onChange={e => setExpenseForm({ ...expenseForm, needsApproval: e.target.checked })}
                className="rounded border-gray-800 bg-gray-900 text-emerald-500 cursor-pointer"
              />
              <label htmlFor="needsApproval" className="text-3xs font-mono text-gray-400 cursor-pointer select-none">Require Approvals</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                {editingExpenseId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingExpenseId ? 'Save Changes' : 'Post Ledger Node'}</span>
              </button>
              {editingExpenseId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingExpenseId(null);
                    setExpenseForm({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '', needsApproval: false, billImage: '' });
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Manage homes forms */}
          <div className="mt-6 pt-4 border-t border-gray-800/80 space-y-4">
            <span className="text-4xs font-mono text-gray-500 uppercase tracking-widest block font-bold">Add Another Flat Space</span>
            <form onSubmit={handleCreateHome} className="space-y-2 flex gap-2">
              <input
                type="text"
                placeholder="Room/Home name"
                value={homeForm.name}
                onChange={e => setHomeForm({ ...homeForm, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-805 rounded px-2.5 py-1 text-2xs text-white"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Ledger Log History Table */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Commit Ledger History</h4>

            <div className="flex gap-1.5">
              <button
                onClick={() => handleExport('json')}
                className="bg-gray-800 hover:bg-gray-750 text-gray-300 text-4xs font-mono border border-gray-700 px-2 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="bg-gray-800 hover:bg-gray-750 text-gray-300 text-4xs font-mono border border-gray-700 px-2 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <div className="relative flex-1 min-w-[120px]">
              <Search className="w-3 h-3 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shared bills..."
                value={sharedFilter.search}
                onChange={e => setSharedFilter({ ...sharedFilter, search: e.target.value })}
                className="w-full bg-gray-900 border border-gray-850 rounded-lg pl-7 pr-2 py-1 text-3xs text-white"
              />
            </div>

            <input
              type="text"
              value={sharedFilter.category === 'All' ? '' : sharedFilter.category}
              onChange={e => setSharedFilter({ ...sharedFilter, category: e.target.value })}
              placeholder="Category filter"
              className="bg-gray-900 border border-gray-855 rounded-lg px-3 py-1 text-3xs text-white focus:outline-none focus:border-emerald-500 w-28"
            />

            <select
              value={sharedFilter.member}
              onChange={e => setSharedFilter({ ...sharedFilter, member: e.target.value })}
              className="bg-gray-900 border border-gray-855 rounded-lg px-1.5 py-1 text-3xs text-gray-300 cursor-pointer"
            >
              <option value="All">All Roommates</option>
              {activeHome?.members?.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left font-mono">
                  <th className="pb-2 font-medium">Expense</th>
                  <th className="pb-2 font-medium">Paid By</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-center">Status</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSharedExpenses.map((e) => {
                  const payerName = activeHome?.members?.find(m => m.id === e.paidBy)?.name || 'Roommate';
                  const isPendingApproval = e.status === 'pending';
                  const hasApproved = user && e.approvals?.includes(user.id);
                  const isAuthorized = user && activeHome && (user.id === activeHome.adminId || user.id === e.paidBy);
                  return (
                    <tr key={e.id} className="border-b border-gray-850 hover:bg-gray-900/35 transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          {e.billImage && (
                            <div className="w-8 h-8 rounded border border-gray-800 overflow-hidden shrink-0 cursor-pointer" onClick={() => window.open(e.billImage)}>
                              <img src={e.billImage} alt="Receipt" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-200">{e.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="bg-gray-900 border border-gray-800 px-1.5 py-0.2 rounded text-gray-400 font-mono text-4xs uppercase">{e.category}</span>
                              {e.notes && <span className="text-4xs text-gray-500 truncate max-w-32">{e.notes}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-300 font-medium">{payerName}</td>
                      <td className="py-2.5 text-gray-400 font-mono text-2xs">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="py-2.5 text-center">
                        {isPendingApproval ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-4xs text-amber-400 font-mono flex items-center gap-1 uppercase tracking-wider bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/25">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Pending ({e.approvals?.length}/{Math.max(1, Math.ceil(activeHome?.members?.length / 2))})</span>
                            </span>
                            {!hasApproved && (
                              <button
                                onClick={() => handleApproveExpense(e.id)}
                                className="text-4xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-0.5 rounded flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <Check className="w-2 h-2" />
                                <span>Approve</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-4xs text-emerald-400 font-mono flex items-center gap-1 uppercase tracking-wider bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/25 justify-center w-max mx-auto">
                            <Check className="w-2.5 h-2.5" />
                            <span>Cleared</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-white">₹{e.amount}</td>
                      <td className="py-2.5 text-center">
                        {isAuthorized ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingExpenseId(e.id);
                                setExpenseForm({
                                  title: e.title,
                                  category: e.category,
                                  amount: e.amount,
                                  date: e.date,
                                  notes: e.notes || '',
                                  needsApproval: e.status === 'pending',
                                  billImage: e.billImage || ''
                                });
                                window.scrollTo({ top: 400, behavior: 'smooth' });
                              }}
                              className="text-gray-500 hover:text-indigo-400 transition-colors p-1"
                              title="Edit Expense"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSharedExpense(e.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredSharedExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 font-mono">
                      No shared ledger entries recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
