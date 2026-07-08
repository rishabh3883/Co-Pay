import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, CheckCircle, AlertCircle, ArrowRight,
  RefreshCw, Clock, Calendar, Infinity, Zap, DollarSign,
  Users, ArrowUpRight, ArrowDownLeft, Bell, ChevronDown, ChevronUp,
  Sparkles, Shield
} from 'lucide-react';

// ─── Period tab config ────────────────────────
const PERIODS = [
  { key: 'daily',    label: 'Today',      icon: Zap },
  { key: 'weekly',   label: 'This Week',  icon: Calendar },
  { key: 'monthly',  label: 'This Month', icon: Clock },
  { key: 'lifetime', label: 'Lifetime',   icon: Infinity },
];

// ─── Pill badge ───────────────────────────────
function Badge({ children, color = 'gray' }) {
  const map = {
    green:  'bg-emerald-950/60 text-emerald-400 border-emerald-500/20',
    red:    'bg-rose-950/60    text-rose-400    border-rose-500/20',
    amber:  'bg-amber-950/60  text-amber-400   border-amber-500/20',
    purple: 'bg-purple-950/60 text-purple-400  border-purple-500/20',
    gray:   'bg-gray-900       text-gray-400   border-gray-700',
  };
  return (
    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[color]}`}>
      {children}
    </span>
  );
}

// ─── Stat card ───────────────────────────────
function StatCard({ label, value, sub, accent = 'emerald', icon: Icon }) {
  const cols = {
    emerald: 'text-emerald-400',
    rose:    'text-rose-400',
    amber:   'text-amber-400',
    indigo:  'text-indigo-400',
    purple:  'text-purple-400',
  };
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2 border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-3.5 h-3.5 ${cols[accent]}`} />}
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-xl font-black font-mono ${cols[accent]} group-hover:scale-[1.02] transition-transform`}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-gray-500 font-mono">{sub}</span>}
    </div>
  );
}

// ─── Member contribution row ─────────────────
function ContributionRow({ mc, isMe }) {
  const isCredit  = mc.balance > 0.5;
  const isDebt    = mc.balance < -0.5;
  const pct       = mc.share > 0 ? Math.min((mc.paid / mc.share) * 100, 200) : 0;
  const barWidth  = Math.min(pct, 100);
  const barColor  = isCredit ? 'bg-emerald-500' : isDebt ? 'bg-rose-500' : 'bg-indigo-400';

  return (
    <div className={`rounded-xl p-4 border flex flex-col gap-3 transition-all duration-200
      ${isMe
        ? 'bg-indigo-950/30 border-indigo-500/25 ring-1 ring-indigo-500/20'
        : 'bg-gray-950/40 border-gray-800/60 hover:border-gray-700/60'}`}>

      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            {mc.userName}
            {isMe && <Badge color="purple">You</Badge>}
          </p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">Paid ₹{mc.paid.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] text-gray-500 font-mono uppercase">Expected</p>
          <p className="text-[11px] text-gray-300 font-mono font-bold">₹{mc.share.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[9px] text-gray-500 font-mono uppercase">Net Balance</span>
        <span className={`text-xs font-black font-mono transition-all
          ${isCredit ? 'text-emerald-400' : isDebt ? 'text-rose-400' : 'text-indigo-300'}`}>
          {mc.balance >= 0 ? '+' : ''}₹{mc.balance.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─── Settlement transfer card ────────────────
function TransferCard({ t, isMyDebt, isMyReceivable }) {
  return (
    <div className={`rounded-xl p-4 border flex items-center justify-between gap-3 transition-all duration-200
      ${isMyDebt      ? 'bg-rose-950/20 border-rose-500/20 ring-1 ring-rose-500/15'
      : isMyReceivable ? 'bg-emerald-950/20 border-emerald-500/20 ring-1 ring-emerald-500/15'
      : 'bg-gray-950/40 border-gray-800/60'}`}>
      <div className="min-w-0">
        <p className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5 truncate">
          <span className={`font-bold ${isMyDebt ? 'text-rose-300' : 'text-gray-200'}`}>{t.fromName}</span>
          <ArrowRight className="w-3 h-3 shrink-0 text-gray-500" />
          <span className={`font-bold ${isMyReceivable ? 'text-emerald-300' : 'text-gray-200'}`}>{t.toName}</span>
        </p>
        {isMyDebt      && <p className="text-[9px] text-rose-400 font-mono mt-0.5">💸 You need to pay this</p>}
        {isMyReceivable && <p className="text-[9px] text-emerald-400 font-mono mt-0.5">💰 You will receive this</p>}
      </div>
      <span className="text-base font-black font-mono text-white shrink-0">
        ₹{t.amount.toLocaleString('en-IN')}
      </span>
    </div>
  );
}

// ─── Smart Notification card ─────────────────
function NotificationCard({ notif, isMe }) {
  const [expanded, setExpanded] = useState(false);

  const borderMap = {
    balanced: 'border-indigo-500/25 bg-indigo-950/20',
    creditor: 'border-emerald-500/25 bg-emerald-950/20',
    debtor:   'border-rose-500/25  bg-rose-950/20',
  };
  const headlineMap = {
    balanced: 'text-indigo-300',
    creditor: 'text-emerald-300',
    debtor:   'text-rose-300',
  };

  const badgeColor = { balanced: 'purple', creditor: 'green', debtor: 'red' };

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200
      ${borderMap[notif.type]} ${isMe ? 'ring-1 ring-white/10' : 'opacity-90 hover:opacity-100'}`}>

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none mt-0.5">{notif.emoji}</span>
          <div>
            <p className={`text-sm font-black ${headlineMap[notif.type]} flex items-center gap-2`}>
              {notif.headline}
              {isMe && <Badge color="purple">Your Status</Badge>}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed mt-1 max-w-prose">{notif.message}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <Badge color={badgeColor[notif.type]}>
            {notif.type === 'balanced' ? 'Balanced'
              : notif.type === 'creditor' ? `+₹${notif.balance.toFixed(0)}`
              : `-₹${Math.abs(notif.balance).toFixed(0)}`}
          </Badge>
        </div>
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/[0.04] pt-3">
        <div>
          <p className="text-gray-500 uppercase">Contributed</p>
          <p className="text-white font-bold">₹{notif.paid.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 uppercase">Fair Share</p>
          <p className="text-white font-bold">₹{notif.share.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Actions (payables / receivables) */}
      {notif.actions && notif.actions.length > 0 && (
        <div className="border-t border-white/[0.04] pt-3">
          <button
            onClick={() => setExpanded(x => !x)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 hover:text-white transition-colors cursor-pointer mb-2"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {notif.actionLabel} ({notif.actions.length} transfer{notif.actions.length > 1 ? 's' : ''})
          </button>

          {expanded && (
            <div className="space-y-1.5">
              {notif.type === 'creditor'
                ? notif.actions.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono px-3 py-2 bg-emerald-950/30 rounded-lg border border-emerald-500/15">
                      <span className="text-gray-300">
                        <span className="text-emerald-400 font-bold">{a.fromName}</span> will pay you
                      </span>
                      <span className="text-white font-bold">₹{a.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                : notif.actions.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono px-3 py-2 bg-rose-950/30 rounded-lg border border-rose-500/15">
                      <span className="text-gray-300">
                        Pay <span className="text-rose-400 font-bold">{a.toName}</span>
                      </span>
                      <span className="text-white font-bold">₹{a.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────
export default function ContributionDashboard({ user, activeHome, activeHomeId, apiFetch, isBackendConnected, expenses, settlement }) {
  const [period,   setPeriod]   = useState('lifetime');
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [notifTab, setNotifTab] = useState('mine'); // 'mine' | 'all'

  const fetchAnalytics = useCallback(async (p) => {
    if (!activeHomeId) return;
    setLoading(true);
    setError(null);
    try {
      if (isBackendConnected) {
        const result = await apiFetch(`/analytics/${activeHomeId}/${p}`);
        setData(result);
      } else {
        // ── offline fallback: compute from local expenses + settlement ─
        const members = activeHome?.members || [];
        const memberCount = members.length || 1;

        const now = new Date();
        const filterDate = (() => {
          if (p === 'daily')   return now.toISOString().split('T')[0];
          if (p === 'weekly') {
            const d = new Date(now); d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
            return d.toISOString().split('T')[0];
          }
          if (p === 'monthly') return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
          return null;
        })();

        const approved = expenses.filter(e =>
          e.status === 'approved' && e.category !== 'Settlement' &&
          (!filterDate || e.date >= filterDate)
        );

        const totalSpent    = approved.reduce((s, e) => s + e.amount, 0);
        const expectedShare = totalSpent / memberCount;

        const paidMap = {};
        members.forEach(m => {
          const id = typeof m === 'string' ? m : m.id;
          paidMap[id] = 0;
        });
        approved.forEach(e => { if (paidMap[e.paidBy] !== undefined) paidMap[e.paidBy] += e.amount; });

        const getMemberName = (id) => {
          const found = members.find(m => (typeof m === 'string' ? m === id : m.id === id));
          if (!found) return 'Roommate';
          return typeof found === 'string' ? (user?.id === found ? user?.name : 'Roommate') : found.name;
        };

        const memberContributions = Object.keys(paidMap).map(mId => {
          const paid    = Math.round((paidMap[mId] || 0) * 100) / 100;
          const share   = Math.round(expectedShare * 100) / 100;
          const balance = Math.round((paid - expectedShare) * 100) / 100;
          return { userId: mId, userName: getMemberName(mId), paid, share, balance, netBalance: balance };
        });

        // Simple settlement engine
        const debtors   = memberContributions.filter(m => m.balance < -0.5)
          .map(m => ({ ...m })).sort((a, b) => a.balance - b.balance);
        const creditors = memberContributions.filter(m => m.balance > 0.5)
          .map(m => ({ ...m })).sort((a, b) => b.balance - a.balance);
        const transfers = [];
        let di = 0, ci = 0;
        while (di < debtors.length && ci < creditors.length) {
          const d = debtors[di], c = creditors[ci];
          const amt = Math.min(-d.balance, c.balance);
          if (Math.round(amt * 100) / 100 > 0) transfers.push({ fromId: d.userId, fromName: d.userName, toId: c.userId, toName: c.userName, amount: Math.round(amt * 100) / 100 });
          d.balance += amt; c.balance -= amt;
          if (Math.abs(d.balance) < 0.01) di++;
          if (Math.abs(c.balance) < 0.01) ci++;
        }

        const myContrib = memberContributions.find(m => m.userId === user?.id) || null;

        const notifications = memberContributions.map(mc => {
          const eps = 0.5;
          if (Math.abs(mc.balance) < eps) return { ...mc, type: 'balanced', emoji: '✅', headline: `Great, ${mc.userName}!`, message: 'Your contribution is perfectly balanced.', actions: [], actionLabel: '' };
          if (mc.balance > 0) {
            const actions = transfers.filter(t => t.toId === mc.userId).map(t => ({ fromId: t.fromId, fromName: t.fromName, amount: t.amount }));
            return { ...mc, type: 'creditor', emoji: '🎉', headline: `Thank you, ${mc.userName}!`, message: `You contributed ₹${mc.balance.toFixed(2)} more than your fair share.`, actions, actionLabel: 'Pending Receivables' };
          }
          const actions = transfers.filter(t => t.fromId === mc.userId).map(t => ({ toId: t.toId, toName: t.toName, amount: t.amount }));
          return { ...mc, type: 'debtor', emoji: '📢', headline: `Hello, ${mc.userName}!`, message: `You contributed ₹${Math.abs(mc.balance).toFixed(2)} less than your fair share.`, actions, actionLabel: 'Payment Required' };
        });

        setData({
          period: p,
          totalSpent: Math.round(totalSpent * 100) / 100,
          expectedShare: Math.round(expectedShare * 100) / 100,
          memberCount,
          memberContributions,
          transfers,
          pendingSettlements:   0,
          completedSettlements: 0,
          myContribution:  myContrib?.paid    || 0,
          myExpectedShare: myContrib?.share   || 0,
          myShouldReceive: myContrib && myContrib.balance > 0 ? myContrib.balance : 0,
          myShouldPay:     myContrib && myContrib.balance < 0 ? Math.abs(myContrib.balance) : 0,
          myNotification:  notifications.find(n => n.userId === user?.id) || null,
          notifications,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [activeHomeId, isBackendConnected, apiFetch, expenses, activeHome, user]);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  if (!activeHome) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800">
          <Users className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-sm font-bold text-gray-400">No workspace selected</p>
        <p className="text-xs text-gray-600 font-mono">Join or create a workspace to see contribution analytics.</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Contribution Balance &amp; Settlement
          </h2>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
            Smart breakdown of who paid what and who owes whom.
          </p>
        </div>
        <button
          onClick={() => fetchAnalytics(period)}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 hover:text-white bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* ── Period Tabs ─────────────────────── */}
      <div className="flex items-center gap-1.5 bg-gray-950/60 border border-gray-800/60 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto">
        {PERIODS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex-1 justify-center
              ${period === key
                ? 'bg-[#1e293b] border border-white/[0.07] text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Error ───────────────────────────── */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/25 text-rose-300 text-xs font-mono px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading skeleton ─────────────────── */}
      {loading && !data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-900 rounded-2xl border border-gray-800" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* ── Dashboard stat cards ─────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Shared Expense"
              value={`₹${data.totalSpent.toLocaleString('en-IN')}`}
              sub={`${data.memberCount} members`}
              accent="purple"
              icon={DollarSign}
            />
            <StatCard
              label="Expected Contribution"
              value={`₹${data.expectedShare.toLocaleString('en-IN')}`}
              sub="per member"
              accent="indigo"
              icon={Users}
            />
            <StatCard
              label={data.myShouldReceive > 0 ? 'You Should Receive' : 'Your Contribution'}
              value={`₹${(data.myContribution || 0).toLocaleString('en-IN')}`}
              sub={data.myShouldReceive > 0
                ? `+₹${data.myShouldReceive.toFixed(2)} receivable`
                : data.myShouldPay > 0
                  ? `-₹${data.myShouldPay.toFixed(2)} owed`
                  : 'Balanced ✓'}
              accent={data.myShouldReceive > 0 ? 'emerald' : data.myShouldPay > 0 ? 'rose' : 'indigo'}
              icon={data.myShouldReceive > 0 ? ArrowUpRight : ArrowDownLeft}
            />
            <StatCard
              label="Settlements"
              value={`${data.pendingSettlements} Pending`}
              sub={`${data.completedSettlements} completed`}
              accent="amber"
              icon={Shield}
            />
          </div>

          {/* ── Two-column layout ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT — contributions + transfers */}
            <div className="lg:col-span-2 space-y-6">

              {/* Member Contributions Matrix */}
              <div className="glass-panel rounded-2xl p-5 border border-white/[0.04] space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Roommate Contribution Matrix
                  </h3>
                  <p className="text-[10px] text-gray-600 mt-1 font-mono">
                    Fair share target: ₹{data.expectedShare.toLocaleString('en-IN')} per member
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.memberContributions.map(mc => (
                    <ContributionRow
                      key={mc.userId}
                      mc={mc}
                      isMe={mc.userId === user?.id}
                    />
                  ))}
                  {data.memberContributions.length === 0 && (
                    <p className="text-xs text-gray-500 font-mono col-span-2 text-center py-6">
                      No expenses found for this period.
                    </p>
                  )}
                </div>
              </div>

              {/* Settlement Transfers */}
              <div className="glass-panel rounded-2xl p-5 border border-white/[0.04] space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Settlement Engine — Minimum Transfers
                  </h3>
                  <p className="text-[10px] text-gray-600 mt-1 font-mono">
                    Optimized transfers to balance everyone's contribution.
                  </p>
                </div>

                {data.transfers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 opacity-70" />
                    <p className="text-sm font-bold text-emerald-400">All contributions balanced!</p>
                    <p className="text-[10px] text-gray-600 font-mono">No transfers needed for this period.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data.transfers.map((t, i) => (
                      <TransferCard
                        key={i}
                        t={t}
                        isMyDebt={t.fromId === user?.id}
                        isMyReceivable={t.toId === user?.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — smart notifications */}
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-5 border border-white/[0.04] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-purple-400" />
                    Smart Notifications
                  </h3>
                  {/* tab switcher */}
                  <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setNotifTab('mine')}
                      className={`px-2.5 py-1 text-[9px] font-mono rounded transition-all cursor-pointer
                        ${notifTab === 'mine' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      Mine
                    </button>
                    <button
                      onClick={() => setNotifTab('all')}
                      className={`px-2.5 py-1 text-[9px] font-mono rounded transition-all cursor-pointer
                        ${notifTab === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-0.5">
                  {notifTab === 'mine' && data.myNotification && (
                    <NotificationCard notif={data.myNotification} isMe={true} />
                  )}
                  {notifTab === 'mine' && !data.myNotification && (
                    <p className="text-xs text-gray-500 font-mono text-center py-6">No notification for your account in this period.</p>
                  )}
                  {notifTab === 'all' && data.notifications.map(n => (
                    <NotificationCard key={n.userId} notif={n} isMe={n.userId === user?.id} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
