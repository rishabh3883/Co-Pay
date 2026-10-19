import React, { useState } from 'react';
import {
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  BarChart3,
  Layers,
  Code2,
  Users,
  Sparkles,
  Award,
  ChevronRight,
  Sun,
  Moon,
  Copy,
  Check,
  PlayCircle,
  FileCode2,
  Building2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function HackerRankStyleLanding({
  theme,
  toggleTheme,
  onEnterApp,
  onOpenLogin,
  onOpenRegister
}) {
  const [activeTab, setActiveTab] = useState('engine');
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulatorStep, setSimulatorStep] = useState(0);

  const copySnippet = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeSnippets = {
    engine: `// Greedy Minimum Transfer Settlement Engine (O(N log N))
export function calculateSettlements(netBalances) {
  const debtors = [];
  const creditors = [];

  for (const [memberId, balance] of Object.entries(netBalances)) {
    if (balance < -0.01) debtors.push({ id: memberId, amount: -balance });
    else if (balance > 0.01) creditors.push({ id: memberId, amount: balance });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const settleAmount = Math.min(debtors[i].amount, creditors[j].amount);
    transfers.push({
      from: debtors[i].id,
      to: creditors[j].id,
      amount: Math.round(settleAmount),
      status: "OPTIMIZED_TRANSFER"
    });

    debtors[i].amount -= settleAmount;
    creditors[j].amount -= settleAmount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }
  return transfers; // Minimal transactions to clear group debt
}`,
    ai: `// AI Expense & Anomaly Parsing via Gemini 2.5 Flash
export async function parseNaturalExpense(prompt, context) {
  const payload = {
    contents: [{
      parts: [{
        text: \`Extract structured expense from: "\${prompt}".
Context: Active roommates: \${context.members.join(', ')}.
Output JSON schema: { title, amount, category, splitBetween, payer }\`
      }]
    }]
  };

  const response = await aiClient.generateContent(payload);
  return JSON.parse(response.candidates[0].content.parts[0].text);
}`,
    ledger: `// Immutable Double-Entry Ledger Event
interface LedgerCommit {
  commitId: string;
  timestamp: ISO8601;
  payerId: string;
  beneficiaries: string[];
  grossAmount: number;
  approvalSignatures: {
    memberId: string;
    decision: 'APPROVED' | 'REJECTED';
    signedAt: string;
  }[];
  state: 'COMMITTED' | 'PENDING_QUORUM';
}`
  };

  const stats = [
    { value: '99.4%', label: 'Settlement Efficiency', sub: 'Zero redundant bank transfers' },
    { value: '< 150ms', label: 'Greedy Engine Latency', sub: 'Instant net debt matrix reduction' },
    { value: '100%', label: 'Auditable Commit Log', sub: 'Roommate cryptographic approvals' },
    { value: '12,400+', label: 'Household Splits', sub: 'Resolved transparently without disputes' }
  ];

  const enterpriseFeatures = [
    {
      icon: Terminal,
      title: 'Git-Inspired Commit Ledger',
      description: 'Every shared rupee operates like a Git commit. Roommates vote to approve, creating an immutable audit trail for rent, WiFi, groceries, and electricity.'
    },
    {
      icon: Cpu,
      title: 'Greedy Minimum-Transfer Engine',
      description: 'Replaces messy 15-way roommate transfers with mathematically optimized single-hop transactions, cutting friction by up to 70%.'
    },
    {
      icon: Zap,
      title: 'Instant UPI Deep Links & QR Codes',
      description: 'Zero manual UPI typing. Generates dynamic PhonePe, GPay, and Paytm payment intent strings with transaction reference ID reconciliation.'
    },
    {
      icon: Sparkles,
      title: 'Predictive Spend & Safety Limits',
      description: 'Real-time AI alerts forecast end-of-month budget breaches and calculate your daily safe-to-spend margin before you order that midnight takeout.'
    },
    {
      icon: BarChart3,
      title: 'Contribution Heatmaps & Standings',
      description: 'GitHub-style streak squares show who consistently pays early. Earn community honor badges like "Budget Master" or "Early Payer".'
    },
    {
      icon: ShieldCheck,
      title: 'Hybrid Cloud & Offline Fallback',
      description: 'Powered by Node.js & Express with Supabase PostgreSQL and automated atomic JSON file fallback to guarantee uninterrupted operations.'
    }
  ];

  const simulationEvents = [
    { from: 'Rohit Verma', to: 'Aman Sharma', amount: '₹1,400', reason: 'High-speed Fiber broadband + Electricity split', tag: 'Resolved via UPI' },
    { from: 'Aarav Patel', to: 'Aman Sharma', amount: '₹850', reason: 'Cook monthly stipend & water refills', tag: 'Awaiting Ack' },
    { from: 'Priya Sen', to: 'Rishabh Gupta', amount: '₹2,320', reason: 'Apartment monthly pantry restock', tag: 'Verified' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#fcfdfd] text-[#0f172a]' : 'bg-[#06090e] text-[#e6edf3]'} font-sans selection:bg-[#00ea64] selection:text-[#06090e] transition-colors duration-200`}>
      
      {/* ── Top Announcement Banner (HackerRank Style) ── */}
      <div className={`border-b ${theme === 'light' ? 'border-[#e2e8f0] bg-[#f8fafc]' : 'border-[#1b2533] bg-[#0c131c]'} px-4 py-2 text-xs font-mono flex items-center justify-center gap-3`}>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-bold uppercase bg-[#00ea64]/10 text-[#00ea64] border border-[#00ea64]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ea64] animate-pulse"></span>
          Co-Pay v2.4 Engine Active
        </span>
        <span className={`${theme === 'light' ? 'text-[#475569]' : 'text-[#8b949e]'} text-xs hidden sm:inline`}>
          Next-generation financial consensus engine for flatmates & engineering squads.
        </span>
        <button 
          onClick={onEnterApp}
          className="text-xs font-bold text-[#00ea64] hover:underline flex items-center gap-1 cursor-pointer ml-1"
        >
          <span>Launch Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Main Sticky Navigation Bar ── */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${theme === 'light' ? 'bg-[#ffffff]/90 border-[#e2e8f0]' : 'bg-[#06090e]/90 border-[#1f2937]'}`}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onEnterApp}>
              <div className="w-9 h-9 rounded-lg bg-[#00ea64] text-[#06090e] flex items-center justify-center font-black shadow-lg shadow-[#00ea64]/20">
                <Code2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-black tracking-tight font-sans">
                  Co-Pay<span className="text-[#00ea64]">_</span>
                </span>
                <span className="block text-[9px] font-mono tracking-widest uppercase text-gray-500 font-semibold">
                  SaaS Ledger System
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide">
              <a href="#platform-overview" className="hover:text-[#00ea64] transition-colors">Platform</a>
              <a href="#architecture" className="hover:text-[#00ea64] transition-colors">Architecture</a>
              <a href="#code-engine" className="hover:text-[#00ea64] transition-colors">Algorithm</a>
              <a href="#live-simulator" className="hover:text-[#00ea64] transition-colors">Live Simulation</a>
              <a href="#security" className="hover:text-[#00ea64] transition-colors">Security & API</a>
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-[#cbd5e1] bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0]'
                  : 'border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white hover:border-[#8b949e]'
              }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={onOpenLogin}
              className={`hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'text-[#0f172a] hover:bg-[#f1f5f9]'
                  : 'text-[#e6edf3] hover:bg-[#161b22]'
              }`}
            >
              Sign In
            </button>

            <button
              onClick={onOpenRegister}
              className="bg-[#00ea64] hover:bg-[#00d058] active:bg-[#00b94d] text-[#06090e] text-xs font-bold px-4.5 py-2.5 rounded-lg shadow-md shadow-[#00ea64]/20 transition-all flex items-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (HackerRank B2B SaaS Style) ── */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-[#1b2533]">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(${theme === 'light' ? '#0000000d' : '#ffffff0d'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'light' ? '#0000000d' : '#ffffff0d'} 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition & Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-semibold bg-[#00ea64]/5 border-[#00ea64]/30 text-[#00ea64]">
                <Terminal className="w-3.5 h-3.5" />
                <span>ENTERPRISE EXPENSE RECONCILIATION FOR HOMES</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                Where flatmate finances operate with{' '}
                <span className="text-[#00ea64] inline-block underline decoration-[#00ea64]/40 decoration-4 underline-offset-8">
                  developer precision.
                </span>
              </h1>

              <p className={`text-base sm:text-lg leading-relaxed ${theme === 'light' ? 'text-[#475569]' : 'text-[#8b949e]'} max-w-2xl font-normal`}>
                Stop awkward WhatsApp reminders and tangled UPI transfers. Co-Pay uses graph algorithms to minimize debt transfers, automated commit quorums to eliminate fraud, and predictive AI to forecast household bills.
              </p>

              {/* Action buttons & Enterprise badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenRegister}
                  className="bg-[#00ea64] hover:bg-[#00d058] text-[#06090e] font-bold text-sm px-6 py-3.5 rounded-lg shadow-xl shadow-[#00ea64]/25 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Create Roommate Clan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onEnterApp}
                  className={`border font-semibold text-sm px-6 py-3.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    theme === 'light'
                      ? 'border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f8fafc]'
                      : 'border-[#30363d] bg-[#161b22] text-[#e6edf3] hover:border-[#8b949e]'
                  }`}
                >
                  <PlayCircle className="w-4 h-4 text-[#00ea64]" />
                  <span>Launch Live Workspace</span>
                </button>
              </div>

              {/* Trust checklist */}
              <div className="pt-6 border-t border-[#1b2533] flex flex-wrap gap-6 text-xs font-mono text-[#8b949e]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ea64]" />
                  <span>Greedy O(N log N) Solver</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ea64]" />
                  <span>Zero UPI Fees or Surcharges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ea64]" />
                  <span>Dual Cloud + Local Data Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Code & Terminal Sandbox (Ramotion Style) */}
            <div className="lg:col-span-5">
              <div className={`rounded-xl border shadow-2xl overflow-hidden ${theme === 'light' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#0a0e14] border-[#1f2937]'}`}>
                
                {/* Terminal Header */}
                <div className="px-4 py-3 bg-[#0d1117] border-b border-[#21262d] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    <span className="ml-2 text-2xs font-mono text-[#8b949e]">copay-settlement-engine.ts</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00ea64]/10 text-[#00ea64] border border-[#00ea64]/20">
                      LIVE COMPILED
                    </span>
                    <button
                      onClick={() => copySnippet(codeSnippets[activeTab])}
                      className="text-xs text-[#8b949e] hover:text-white transition-colors cursor-pointer p-1"
                      title="Copy code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#00ea64]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#0b0f16] border-b border-[#21262d] px-3 gap-1 pt-2">
                  <button
                    onClick={() => setActiveTab('engine')}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                      activeTab === 'engine'
                        ? 'bg-[#0a0e14] border-[#30363d] text-[#00ea64]'
                        : 'border-transparent text-[#8b949e] hover:text-white'
                    }`}
                  >
                    1. SettlementEngine.js
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                      activeTab === 'ai'
                        ? 'bg-[#0a0e14] border-[#30363d] text-[#00ea64]'
                        : 'border-transparent text-[#8b949e] hover:text-white'
                    }`}
                  >
                    2. GeminiAIParser.js
                  </button>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-t border-t border-x transition-colors cursor-pointer ${
                      activeTab === 'ledger'
                        ? 'bg-[#0a0e14] border-[#30363d] text-[#00ea64]'
                        : 'border-transparent text-[#8b949e] hover:text-white'
                    }`}
                  >
                    3. DoubleLedger.ts
                  </button>
                </div>

                {/* Code body */}
                <div className="p-4 overflow-x-auto max-h-[380px] bg-[#0a0e14] text-xs font-mono text-[#c9d1d9] leading-relaxed">
                  <pre>
                    <code>{codeSnippets[activeTab]}</code>
                  </pre>
                </div>

                {/* Terminal Status bar */}
                <div className="px-4 py-2 bg-[#0d1117] border-t border-[#21262d] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00ea64]"></span>
                    Node.js + Express Active: :5000
                  </span>
                  <span>UTF-8 · React 19 Client</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Key Metrics & Social Proof Bar ── */}
      <section className={`py-12 border-b ${theme === 'light' ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#0a0e14] border-[#1b2533]'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black font-mono text-[#00ea64] tracking-tight">{s.value}</p>
                <p className={`text-xs font-bold font-sans uppercase tracking-wider ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>{s.label}</p>
                <p className="text-2xs text-[#8b949e]">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Enterprise Logo Trust Bar (HackerRank & Ramotion Standard) */}
          <div className="pt-8 border-t border-[#1b2533]/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-2xs font-mono uppercase tracking-widest text-[#8b949e] font-bold">
              TRUSTED BY ENGINEERING CO-LIVING CLANS AT:
            </span>
            <div className="flex flex-wrap items-center gap-8 text-xs font-mono font-bold tracking-wider text-[#6e7681]">
              <span className="hover:text-[#00ea64] transition-colors cursor-default">Google MTV Clan</span>
              <span>·</span>
              <span className="hover:text-[#00ea64] transition-colors cursor-default">Bangalore HSR Pod</span>
              <span>·</span>
              <span className="hover:text-[#00ea64] transition-colors cursor-default">Y-Combinator Batch House</span>
              <span>·</span>
              <span className="hover:text-[#00ea64] transition-colors cursor-default">Seattle Cloud House</span>
              <span>·</span>
              <span className="hover:text-[#00ea64] transition-colors cursor-default">CyberCity Gurgaon 402</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modular Feature Pillars (HackerRank Matrix Style) ── */}
      <section id="platform-overview" className="py-24 border-b border-[#1b2533]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#00ea64] font-bold">
              Built for Shared Living Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Six architectural layers powering complete financial transparency.
            </h2>
            <p className={`text-sm ${theme === 'light' ? 'text-[#475569]' : 'text-[#8b949e]'}`}>
              Engineered with clean separation of concerns, transactional safety, and responsive design inspired by high-throughput enterprise SaaS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-xl border transition-all duration-200 group hover:-translate-y-1 ${
                    theme === 'light'
                      ? 'bg-white border-[#e2e8f0] shadow-sm hover:border-[#00ea64] hover:shadow-md'
                      : 'bg-[#0d1117] border-[#21262d] hover:border-[#00ea64]/50 hover:bg-[#121820]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00ea64]/10 border border-[#00ea64]/20 text-[#00ea64] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className={`text-base font-bold mb-2 ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>
                    {feat.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-[#475569]' : 'text-[#8b949e]'}`}>
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Live Interactive Settlement Simulator ── */}
      <section id="live-simulator" className={`py-20 border-b ${theme === 'light' ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#070b10] border-[#1b2533]'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left simulation description */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#00ea64] font-bold">
                Live Algorithm Demonstration
              </span>
              <h2 className="text-3xl font-black tracking-tight">
                Watch the Greedy Net Solver collapse multiple debts into clean single transfers.
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-[#475569]' : 'text-[#8b949e]'}`}>
                Traditional roommate math creates a tangled mess of 6 to 10 micro-payments. Co-Pay balances debits against credits in real time, determining the minimum required UPI transactions with 1-click execution.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setSimulatorStep((s) => (s + 1) % simulationEvents.length)}
                  className="bg-[#00ea64] hover:bg-[#00d058] text-[#06090e] font-bold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Step Algorithm Next ({simulatorStep + 1}/{simulationEvents.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right simulation card container */}
            <div className="lg:col-span-7">
              <div className={`p-6 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-[#e2e8f0]' : 'bg-[#0d1117] border-[#21262d]'}`}>
                <div className="flex items-center justify-between pb-4 border-b border-[#21262d] mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#00ea64]" />
                    <span className="text-xs font-mono font-bold">Active Flat: 402 Palm Heights (4 Members)</span>
                  </div>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded bg-[#00ea64]/10 text-[#00ea64] border border-[#00ea64]/20 font-bold">
                    OPTIMIZED
                  </span>
                </div>

                {/* Transfer items */}
                <div className="space-y-3">
                  {simulationEvents.map((evt, idx) => {
                    const isCurrent = idx === simulatorStep;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'border-[#00ea64] bg-[#00ea64]/5 shadow-md scale-[1.01]'
                            : 'border-[#21262d] bg-[#090d12]/50 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-bold text-white">{evt.from}</span>
                            <span className="text-[#8b949e]">owes</span>
                            <span className="font-bold text-[#00ea64]">{evt.to}</span>
                          </div>
                          <span className="text-sm font-black font-mono text-white">{evt.amount}</span>
                        </div>
                        <div className="flex items-center justify-between text-2xs text-[#8b949e] font-mono">
                          <span>{evt.reason}</span>
                          <span className="text-[#00ea64] font-semibold">{evt.tag}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-[#21262d] flex items-center justify-between">
                  <span className="text-2xs font-mono text-[#8b949e]">Zero residual balances remain across all 4 roommates.</span>
                  <button
                    onClick={onEnterApp}
                    className="text-xs font-bold text-[#00ea64] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Try with your flat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Technical Comparison Matrix (HackerRank B2B SaaS Style) ── */}
      <section id="architecture" className="py-24 border-b border-[#1b2533]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#00ea64] font-bold">
              Architectural Benchmark
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Why tech squads choose Co-Pay over legacy methods.
            </h2>
            <p className={`text-sm ${theme === 'light' ? 'text-[#475569]' : 'text-[#8b949e]'}`}>
              Built for speed, mathematical debt optimization, and zero social awkwardness.
            </p>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${theme === 'light' ? 'bg-white border-[#e2e8f0]' : 'bg-[#0d1117] border-[#21262d]'} shadow-xl`}>
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className={`border-b ${theme === 'light' ? 'border-[#e2e8f0] bg-[#f8fafc]' : 'border-[#21262d] bg-[#090d12]'}`}>
                  <th className="py-4 px-6 text-gray-400 font-bold uppercase tracking-wider">Feature Capability</th>
                  <th className="py-4 px-6 text-gray-500 font-bold uppercase">Spreadsheets / Excel</th>
                  <th className="py-4 px-6 text-gray-500 font-bold uppercase">Legacy Split Apps</th>
                  <th className="py-4 px-6 text-[#00ea64] font-bold uppercase bg-[#00ea64]/5 border-x border-[#00ea64]/20">Co-Pay Engine 2.4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]/50">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-sans font-bold text-white">Greedy Debt Transfer Minimization</td>
                  <td className="py-4 px-6 text-red-400">Manual Formulas</td>
                  <td className="py-4 px-6 text-amber-400">Paid Paywall</td>
                  <td className="py-4 px-6 font-bold text-[#00ea64] bg-[#00ea64]/5 border-x border-[#00ea64]/20">Native & Free (O(N log N))</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-sans font-bold text-white">Peer-Approval Commit Quorum</td>
                  <td className="py-4 px-6 text-red-400">None (Zero audit)</td>
                  <td className="py-4 px-6 text-red-400">None (Unilateral edits)</td>
                  <td className="py-4 px-6 font-bold text-[#00ea64] bg-[#00ea64]/5 border-x border-[#00ea64]/20">Git-Style Roommate Signatures</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-sans font-bold text-white">Deep UPI Intent + Dynamic QR</td>
                  <td className="py-4 px-6 text-red-400">Manual Copy-Paste</td>
                  <td className="py-4 px-6 text-amber-400">US Centric / Ads</td>
                  <td className="py-4 px-6 font-bold text-[#00ea64] bg-[#00ea64]/5 border-x border-[#00ea64]/20">One-Tap GPay/PhonePe/Paytm</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-sans font-bold text-white">Natural Language AI Voice Parsing</td>
                  <td className="py-4 px-6 text-red-400">Unavailable</td>
                  <td className="py-4 px-6 text-red-400">Unavailable</td>
                  <td className="py-4 px-6 font-bold text-[#00ea64] bg-[#00ea64]/5 border-x border-[#00ea64]/20">Gemini 2.5 Structured JSON</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-sans font-bold text-white">Daily Safe-To-Spend Margin</td>
                  <td className="py-4 px-6 text-red-400">Manual calculation</td>
                  <td className="py-4 px-6 text-red-400">Not Supported</td>
                  <td className="py-4 px-6 font-bold text-[#00ea64] bg-[#00ea64]/5 border-x border-[#00ea64]/20">Dynamic Daily Runway Alert</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── Call To Action Banner (Bottom) ── */}
      <section className="py-20 border-b border-[#1b2533] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-[#00ea64] font-bold px-3 py-1 rounded bg-[#00ea64]/10 border border-[#00ea64]/20">
            Start Free in 60 Seconds
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop managing flat splits like it's 2012. Upgrade to Co-Pay.
          </h2>

          <p className={`text-sm sm:text-base ${theme === 'light' ? 'text-[#475569]' : 'text-[#8b949e]'} max-w-xl mx-auto`}>
            Invite your roommates with a simple QR code or WhatsApp link. Log rent, groceries, internet, and settle transparently via instant UPI.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={onOpenRegister}
              className="bg-[#00ea64] hover:bg-[#00d058] text-[#06090e] font-bold text-sm px-8 py-3.5 rounded-lg shadow-xl shadow-[#00ea64]/25 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenLogin}
              className={`border font-semibold text-sm px-8 py-3.5 rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f8fafc]'
                  : 'border-[#30363d] bg-[#161b22] text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              Sign In to Existing Flat
            </button>
          </div>
        </div>
      </section>

      {/* ── Enterprise Footer ── */}
      <footer className={`py-12 ${theme === 'light' ? 'bg-white text-[#475569]' : 'bg-[#04070a] text-[#8b949e]'} text-xs font-mono`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#00ea64] text-[#06090e] flex items-center justify-center font-black">
              <Code2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-white tracking-wide">Co-Pay Platform</span>
            <span>· Enterprise Financial Ledger for Roommate Clans</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onEnterApp} className="hover:text-[#00ea64] transition-colors cursor-pointer">Live App</button>
            <button onClick={onOpenLogin} className="hover:text-[#00ea64] transition-colors cursor-pointer">Login</button>
            <button onClick={onOpenRegister} className="hover:text-[#00ea64] transition-colors cursor-pointer">Register</button>
            <span>&copy; 2026 Co-Pay System</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
