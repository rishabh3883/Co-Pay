import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Check,
  Zap,
  TrendingUp,
  Award,
  Users,
  Code2,
  Terminal,
  ShieldCheck,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Building2,
  FileText,
  DollarSign
} from 'lucide-react';

export default function BauhausLanding({
  onEnterApp,
  onOpenLogin,
  onOpenRegister
}) {
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [demoStep, setDemoStep] = useState(0);

  const faqs = [
    {
      q: 'HOW DOES THE GREEDY MINIMUM-TRANSFER ENGINE WORK?',
      a: 'The system computes each roommate’s net balance (total contributed minus fair consumption share). It matches the highest debtor with the highest creditor iteratively in O(N log N) time, collapsing messy 12-way payments into 2 to 3 single UPI transfers.'
    },
    {
      q: 'WHY USE COMMIT QUORUMS INSTEAD OF CASUAL SPLITS?',
      a: 'Casual notes lead to forgotten debts and awkward house disputes. Co-Pay treats every shared expense as an immutable proposal requiring roommate confirmation signatures before settling into the permanent balance ledger.'
    },
    {
      q: 'DOES IT SUPPORT DIRECT UPI APP INTEGRATION?',
      a: 'Yes. It creates standard deep links (upi://pay) and auto-generates dynamic QR codes compatible with PhonePe, Google Pay, Paytm, and BHIM, complete with custom transaction reference reconciliation.'
    },
    {
      q: 'CAN WE RUN THIS LOCALLY WITHOUT EXTERNAL CLOUD?',
      a: 'Absolutely. Co-Pay operates on a dual-engine architecture: Supabase PostgreSQL for cloud sync and local atomic JSON flat-files for offline local-first resilience.'
    }
  ];

  const simulationEvents = [
    { from: 'ROHIT VERMA', to: 'AMAN SHARMA', amount: '₹1,400', category: 'FIBER INTERNET', shape: 'circle' },
    { from: 'AARAV PATEL', to: 'AMAN SHARMA', amount: '₹850', category: 'MONTHLY WATER CAN REFILLS', shape: 'square' },
    { from: 'PRIYA SEN', to: 'RISHABH GUPTA', amount: '₹2,320', category: 'APARTMENT PANTRY GROCERIES', shape: 'triangle' }
  ];

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] font-bauhaus selection:bg-[#F0C020] selection:text-[#121212]">
      
      {/* ── Top Announcement Ticker ── */}
      <div className="bg-[#121212] text-[#F0F0F0] border-b-4 border-[#121212] px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold tracking-widest uppercase overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#D02020]"></div>
          <div className="w-3 h-3 rounded-none bg-[#1040C0]"></div>
          <div className="w-3 h-3 bg-[#F0C020] bauhaus-triangle"></div>
          <span>BAUHAUS PROTOCOL · WEIMAR 1919 TO MONOREPO 2026</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-black">
          <span className="hidden md:inline">FORM FOLLOWS FINANCE · IMMUTABLE EXPENSE MATRIX</span>
          <button 
            onClick={onEnterApp}
            className="text-[#F0C020] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>LIVE APP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Navigation Header (Bauhaus Graphic Identity) ── */}
      <header className="bg-white border-b-4 border-[#121212] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo with 3 pure primary shapes */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterApp}>
            <div className="flex items-center gap-1.5 p-1.5 bg-[#121212] border-2 border-[#121212]">
              <div className="w-4 h-4 rounded-full bg-[#D02020]"></div>
              <div className="w-4 h-4 rounded-none bg-[#1040C0]"></div>
              <div className="w-4 h-4 bg-[#F0C020] bauhaus-triangle"></div>
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none">
              CO-PAY<span className="text-[#D02020]">.</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
            <a href="#hero-manifesto" className="hover:text-[#D02020] transition-colors">Manifesto</a>
            <a href="#features-grid" className="hover:text-[#1040C0] transition-colors">Composition</a>
            <a href="#algorithm-solver" className="hover:text-[#F0C020] transition-colors">Solver</a>
            <a href="#comparison-matrix" className="hover:text-[#D02020] transition-colors">Matrix</a>
            <a href="#faq-accordion" className="hover:text-[#1040C0] transition-colors">Theory</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="bg-white text-[#121212] border-2 md:border-4 border-[#121212] font-black uppercase text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 bauhaus-shadow-sm bauhaus-btn-press cursor-pointer hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegister}
              className="bg-[#D02020] text-white border-2 md:border-4 border-[#121212] font-black uppercase text-xs sm:text-sm px-5 py-2 sm:px-6 sm:py-2.5 bauhaus-shadow-sm bauhaus-btn-press cursor-pointer hover:bg-[#D02020]/90 transition-colors flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Composition: Poster Section (Geometric Split) ── */}
      <section id="hero-manifesto" className="border-b-4 border-[#121212] bg-[#F0F0F0] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Column: Bold Constructivist Typography */}
          <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212] space-y-8 bg-white relative">
            
            {/* Small shape badge */}
            <div className="inline-flex items-center gap-2.5 bg-[#F0C020] text-[#121212] border-2 md:border-4 border-[#121212] px-3.5 py-1.5 font-black text-xs uppercase tracking-widest w-fit bauhaus-shadow-sm">
              <span className="w-3 h-3 rounded-full bg-[#D02020]"></span>
              <span>CONSTRUCTIVIST EXPENSE RECONCILIATION</span>
            </div>

            {/* Massive Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-[#121212]">
              FORM FOLLOWS <span className="bg-[#D02020] text-white px-3 py-1 inline-block -rotate-1 border-2 border-black bauhaus-shadow-sm">FINANCE</span>.
              <br />
              SETTLE DEBTS WITH PURE GEOMETRY.
            </h1>

            <p className="text-base sm:text-lg font-medium text-[#121212]/80 leading-relaxed max-w-xl">
              Eliminate emotional friction from roommate living. Co-Pay transforms apartment bills, groceries, and WiFi into mathematically verified, peer-approved single transactions.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenRegister}
                className="bg-[#D02020] text-white border-4 border-[#121212] font-black uppercase text-sm sm:text-base px-8 py-4 bauhaus-shadow-md bauhaus-btn-press cursor-pointer hover:bg-[#D02020]/90 transition-colors flex items-center gap-3"
              >
                <span>Launch Roommate Clan</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>

              <button
                onClick={onEnterApp}
                className="bg-[#F0C020] text-[#121212] border-4 border-[#121212] font-black uppercase text-sm sm:text-base px-8 py-4 bauhaus-shadow-md bauhaus-btn-press cursor-pointer hover:bg-[#F0C020]/90 transition-colors"
              >
                Explore Live Demo
              </button>
            </div>

            {/* Bottom Graphic Feature Tickers */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t-4 border-[#121212]">
              <div className="p-2 border-2 border-[#121212] bg-[#F0F0F0] text-center">
                <span className="block text-2xl font-black">O(N log N)</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Solver Speed</span>
              </div>
              <div className="p-2 border-2 border-[#121212] bg-[#F0F0F0] text-center">
                <span className="block text-2xl font-black">100%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Audit Quorum</span>
              </div>
              <div className="p-2 border-2 border-[#121212] bg-[#F0F0F0] text-center">
                <span className="block text-2xl font-black">ZERO</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">UPI Surcharges</span>
              </div>
            </div>

          </div>

          {/* Right Column: Bauhaus Pure Primary Graphic Composition (Blue Block) */}
          <div className="lg:col-span-5 bg-[#1040C0] p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden text-white">
            
            {/* Background dot pattern */}
            <div className="absolute inset-0 opacity-15 bauhaus-dot-pattern-light pointer-events-none"></div>

            {/* Overlapping Geometric Poster Artwork */}
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center z-10">
              
              {/* Outer yellow rotated square */}
              <div className="absolute w-64 h-64 sm:w-72 sm:h-72 bg-[#F0C020] border-4 border-[#121212] rotate-12 bauhaus-shadow-lg flex items-center justify-center">
                <span className="text-black font-black text-xs uppercase tracking-widest rotate-[-12deg] opacity-75">CO-PAY FINANCIAL LEDGER</span>
              </div>

              {/* Red Circle */}
              <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#D02020] border-4 border-[#121212] bauhaus-shadow-md flex items-center justify-center -rotate-6">
                <div className="w-12 h-12 bg-white bauhaus-triangle border-2 border-black"></div>
              </div>

              {/* Center Black & White Stamping Card */}
              <div className="relative z-20 bg-white text-[#121212] border-4 border-[#121212] p-5 bauhaus-shadow-lg max-w-[240px] text-center rotate-3">
                <div className="w-8 h-8 rounded-full bg-[#1040C0] mx-auto mb-2 border-2 border-black flex items-center justify-center text-white font-black text-xs">
                  ₹
                </div>
                <p className="text-xs font-black uppercase tracking-wider">EXPENSE VERIFIED</p>
                <p className="text-2xl font-black font-mono">₹4,850.00</p>
                <div className="mt-2 text-[9px] font-mono uppercase bg-[#F0F0F0] border border-black p-1">
                  QUORUM: 4/4 APPROVED
                </div>
              </div>

            </div>

            <div className="mt-8 text-center relative z-10">
              <span className="inline-block bg-[#121212] text-white border-2 border-white px-4 py-1.5 font-black text-xs uppercase tracking-widest">
                CONSTRUCTIVIST COMPOSITION NO. 1
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ── Section 2: Primary Yellow Stats Strip ── */}
      <section className="bg-[#F0C020] border-b-4 border-[#121212] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white border-4 border-[#121212] p-6 bauhaus-shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-[#121212]">Settlement Efficiency</span>
                <div className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-black"></div>
              </div>
              <p className="text-4xl sm:text-5xl font-black tracking-tighter">99.4%</p>
              <p className="text-xs font-bold uppercase text-gray-700 mt-2">Zero Redundant Bank Transfers</p>
            </div>

            <div className="bg-white border-4 border-[#121212] p-6 bauhaus-shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-[#121212]">Engine Latency</span>
                <div className="w-4 h-4 rounded-none bg-[#1040C0] border-2 border-black"></div>
              </div>
              <p className="text-4xl sm:text-5xl font-black tracking-tighter">&lt;150MS</p>
              <p className="text-xs font-bold uppercase text-gray-700 mt-2">Instant Net Matrix Reduction</p>
            </div>

            <div className="bg-white border-4 border-[#121212] p-6 bauhaus-shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-[#121212]">Audit Quorum</span>
                <div className="w-4 h-4 bg-[#F0C020] bauhaus-triangle border-2 border-black"></div>
              </div>
              <p className="text-4xl sm:text-5xl font-black tracking-tighter">100%</p>
              <p className="text-xs font-bold uppercase text-gray-700 mt-2">Roommate Signature Approvals</p>
            </div>

            <div className="bg-white border-4 border-[#121212] p-6 bauhaus-shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-[#121212]">Household Splits</span>
                <div className="w-4 h-4 rounded-full bg-[#121212] border-2 border-black"></div>
              </div>
              <p className="text-4xl sm:text-5xl font-black tracking-tighter">12,400+</p>
              <p className="text-xs font-bold uppercase text-gray-700 mt-2">Resolved Transparently</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 3: Bauhaus Features Grid ── */}
      <section id="features-grid" className="py-24 px-6 border-b-4 border-[#121212] bg-[#F0F0F0]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-block bg-[#D02020] text-white border-2 md:border-4 border-[#121212] px-4 py-1 text-xs font-black uppercase tracking-widest bauhaus-shadow-sm">
              FUNCTIONAL HONESTY
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">
              SIX STRUCTURAL PILLARS OF FLAT CONSENSUS.
            </h2>
            <p className="text-base font-medium text-[#121212]/80">
              Each component is engineered as an architectural necessity. No useless gradients, no empty fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white border-4 border-[#121212] p-8 bauhaus-shadow-lg relative group hover:-translate-y-2 transition-transform duration-200">
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#D02020] border-2 border-black"></div>
              <div className="w-12 h-12 bg-[#121212] text-white border-2 border-black flex items-center justify-center font-black mb-6">
                <Terminal className="w-6 h-6 text-[#F0C020]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">1. COMMIT LEDGER</h3>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                Transactions operate like Git commits. Expenses require quorum approvals before balances are recorded.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border-4 border-[#121212] p-8 bauhaus-shadow-lg relative group hover:-translate-y-2 transition-transform duration-200">
              <div className="absolute top-4 right-4 w-5 h-5 rounded-none bg-[#1040C0] border-2 border-black"></div>
              <div className="w-12 h-12 bg-[#1040C0] text-white border-2 border-black flex items-center justify-center font-black mb-6">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">2. GREEDY ENGINE</h3>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                Collapses complex multi-person roommate debt graphs into the absolute minimum required single-hop UPI payments.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border-4 border-[#121212] p-8 bauhaus-shadow-lg relative group hover:-translate-y-2 transition-transform duration-200">
              <div className="absolute top-4 right-4 w-5 h-5 bg-[#F0C020] bauhaus-triangle border-2 border-black"></div>
              <div className="w-12 h-12 bg-[#F0C020] text-black border-2 border-black flex items-center justify-center font-black mb-6">
                <Zap className="w-6 h-6 text-[#121212]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">3. INSTANT UPI INTENTS</h3>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                Zero manual typing. Dynamic UPI QR codes and app deep links for PhonePe, Google Pay, and Paytm with reference IDs.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border-4 border-[#121212] p-8 bauhaus-shadow-lg relative group hover:-translate-y-2 transition-transform duration-200">
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#F0C020] border-2 border-black"></div>
              <div className="w-12 h-12 bg-[#D02020] text-white border-2 border-black flex items-center justify-center font-black mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">4. SAFE-TO-SPEND MARGIN</h3>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                Computes daily safe spend limit based on remaining monthly budget so flatmates don’t run dry before rent day.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white border-4 border-[#121212] p-8 bauhaus-shadow-lg relative group hover:-translate-y-2 transition-transform duration-200">
              <div className="absolute top-4 right-4 w-5 h-5 rounded-none bg-[#D02020] border-2 border-black"></div>
              <div className="w-12 h-12 bg-[#121212] text-white border-2 border-black flex items-center justify-center font-black mb-6">
                <BarChart3 className="w-6 h-6 text-[#D02020]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">5. STREAKS & STANDINGS</h3>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                GitHub-style contribution heatmaps that reward prompt settlements with honor badges like "Early Payer".
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white border-4 border-[#121212] p-8 bauhaus-shadow-lg relative group hover:-translate-y-2 transition-transform duration-200">
              <div className="absolute top-4 right-4 w-5 h-5 bg-[#1040C0] bauhaus-triangle border-2 border-black"></div>
              <div className="w-12 h-12 bg-[#1040C0] text-white border-2 border-black flex items-center justify-center font-black mb-6">
                <ShieldCheck className="w-6 h-6 text-[#F0C020]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">6. HYBRID CLOUD FALLBACK</h3>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                Built on Node Express + Supabase Postgres with instant local JSON fallback if cloud connectivity drops.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── Section 4: Red Color Block (Interactive Solver Simulation) ── */}
      <section id="algorithm-solver" className="bg-[#D02020] text-white py-24 px-6 border-b-4 border-[#121212]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="bg-[#121212] text-white border-2 border-white px-3.5 py-1 text-xs font-black uppercase tracking-widest inline-block">
              MATHEMATICAL SOLVER
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">
              GREEDY MINIMUM TRANSFER DEMONSTRATOR.
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Why send six confused micro-payments when two direct transfers achieve mathematically perfect zero-sum equilibrium?
            </p>
            
            <button
              onClick={() => setDemoStep((s) => (s + 1) % simulationEvents.length)}
              className="bg-[#F0C020] text-[#121212] border-4 border-[#121212] font-black uppercase text-sm px-6 py-3.5 bauhaus-shadow-sm bauhaus-btn-press cursor-pointer hover:bg-[#F0C020]/90 transition-colors flex items-center gap-2"
            >
              <span>Step Demonstration ({demoStep + 1}/{simulationEvents.length})</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white text-[#121212] border-4 border-[#121212] p-8 bauhaus-shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-4 border-[#121212]">
                <span className="font-black text-sm uppercase">Active Clan: FLAT 402 VERIFICATION</span>
                <span className="bg-[#1040C0] text-white text-xs font-black px-2 py-0.5 uppercase">OPTIMAL</span>
              </div>

              <div className="space-y-3 pt-2">
                {simulationEvents.map((evt, idx) => {
                  const isCurrent = idx === demoStep;
                  return (
                    <div
                      key={idx}
                      className={`p-4 border-4 border-[#121212] transition-all ${
                        isCurrent
                          ? 'bg-[#F0C020] translate-x-1 bauhaus-shadow-sm'
                          : 'bg-[#F0F0F0] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm font-black uppercase">
                        <div>
                          <span>{evt.from}</span>
                          <span className="text-red-600 mx-2">OWES</span>
                          <span>{evt.to}</span>
                        </div>
                        <span className="text-lg font-mono">{evt.amount}</span>
                      </div>
                      <div className="text-xs font-bold uppercase text-gray-700 mt-1 flex items-center justify-between">
                        <span>{evt.category}</span>
                        <span className="text-black font-black">UPI READY</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs font-black uppercase text-gray-700">
                <span>REMAINING RESIDUAL DEBT: ₹0.00</span>
                <button onClick={onEnterApp} className="text-[#1040C0] hover:underline font-black cursor-pointer">
                  Test Your Clan →
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Section 5: Architectural Comparison Matrix ── */}
      <section id="comparison-matrix" className="py-24 px-6 border-b-4 border-[#121212] bg-[#F0F0F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="bg-[#1040C0] text-white border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-widest inline-block bauhaus-shadow-sm">
              SYSTEM MATRIX
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter">
              CO-PAY VS TRADITIONAL FLAT SPLITTING.
            </h2>
          </div>

          <div className="overflow-x-auto border-4 border-[#121212] bg-white bauhaus-shadow-lg">
            <table className="w-full text-left text-sm font-bold border-collapse">
              <thead>
                <tr className="bg-[#121212] text-white border-b-4 border-[#121212] uppercase text-xs">
                  <th className="py-4 px-6">Capability Feature</th>
                  <th className="py-4 px-6">Spreadsheets / Excel</th>
                  <th className="py-4 px-6">Legacy Mobile Splitters</th>
                  <th className="py-4 px-6 bg-[#D02020] text-white border-l-4 border-black">Co-Pay Bauhaus Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black uppercase">
                <tr>
                  <td className="py-4 px-6 font-black">Greedy Transfer Optimization</td>
                  <td className="py-4 px-6 text-red-600">Manual Formulas</td>
                  <td className="py-4 px-6 text-amber-600">Locked Behind Subscription</td>
                  <td className="py-4 px-6 bg-[#F0C020] text-black font-black border-l-4 border-black">Native Free (O(N log N))</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-black">Quorum Approval Log</td>
                  <td className="py-4 px-6 text-red-600">None (Prone to Overwriting)</td>
                  <td className="py-4 px-6 text-red-600">No Signatures</td>
                  <td className="py-4 px-6 bg-[#F0C020] text-black font-black border-l-4 border-black">Git-Style Peer Commits</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-black">Direct UPI Intent + QR</td>
                  <td className="py-4 px-6 text-red-600">Manual Copy-Paste</td>
                  <td className="py-4 px-6 text-amber-600">Ad-heavy US Focus</td>
                  <td className="py-4 px-6 bg-[#F0C020] text-black font-black border-l-4 border-black">One-Tap GPay/PhonePe/Paytm</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-black">AI Expense Voice Parser</td>
                  <td className="py-4 px-6 text-red-600">Unsupported</td>
                  <td className="py-4 px-6 text-red-600">Unsupported</td>
                  <td className="py-4 px-6 bg-[#F0C020] text-black font-black border-l-4 border-black">Gemini 2.5 Structured JSON</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── Section 6: Bauhaus Accordion (FAQ) ── */}
      <section id="faq-accordion" className="py-24 px-6 border-b-4 border-[#121212] bg-white">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="space-y-4">
            <span className="bg-[#F0C020] text-black border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-widest inline-block bauhaus-shadow-sm">
              THEORY & PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter">
              FREQUENTLY ENCOUNTERED QUESTIONS.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeAccordion === index;
              return (
                <div
                  key={index}
                  className="border-4 border-[#121212] bauhaus-shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveAccordion(isOpen ? -1 : index)}
                    className={`w-full p-5 sm:p-6 text-left font-black uppercase text-base sm:text-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isOpen ? 'bg-[#D02020] text-white' : 'bg-white text-[#121212] hover:bg-gray-50'
                    }`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-6 h-6 stroke-[3] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="bg-[#FFF9C4] text-[#121212] p-6 border-t-4 border-[#121212] font-medium text-sm sm:text-base leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Section 7: Final CTA (Pure Bauhaus Yellow Block) ── */}
      <section className="bg-[#F0C020] border-b-4 border-[#121212] py-20 px-6 relative overflow-hidden">
        {/* Decorative corner geometric shapes */}
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-[#D02020] border-4 border-black opacity-30 pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-[#1040C0] border-4 border-black rotate-45 opacity-30 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="bg-[#121212] text-white border-2 border-white px-4 py-1.5 font-black text-xs uppercase tracking-widest inline-block">
            COMMENCE TRANSPARENCY
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-tight text-[#121212]">
            END ROOMMATE FRICTION TODAY.
          </h2>
          <p className="text-base sm:text-lg font-medium text-[#121212]/80 max-w-xl mx-auto">
            Set up your shared flat workspace in 60 seconds. Invite housemates via QR code and start logging consensus expenses.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={onOpenRegister}
              className="bg-[#D02020] text-white border-4 border-[#121212] font-black uppercase text-base px-8 py-4 bauhaus-shadow-md bauhaus-btn-press cursor-pointer hover:bg-[#D02020]/90 transition-colors flex items-center gap-2"
            >
              <span>Initialize Clan Free</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
            <button
              onClick={onOpenLogin}
              className="bg-white text-[#121212] border-4 border-[#121212] font-black uppercase text-base px-8 py-4 bauhaus-shadow-md bauhaus-btn-press cursor-pointer hover:bg-gray-100 transition-colors"
            >
              Sign In Existing Clan
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer: Stark Black Constructivist Grid ── */}
      <footer className="bg-[#121212] text-[#F0F0F0] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-white/20 pb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-white border border-black">
              <div className="w-3.5 h-3.5 rounded-full bg-[#D02020]"></div>
              <div className="w-3.5 h-3.5 rounded-none bg-[#1040C0]"></div>
              <div className="w-3.5 h-3.5 bg-[#F0C020] bauhaus-triangle"></div>
            </div>
            <span className="font-black text-xl tracking-tight uppercase">CO-PAY PROTOCOL</span>
            <span className="text-xs text-gray-400 font-mono">/ WEIMAR TO BROWSER</span>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-bold uppercase tracking-wider">
            <button onClick={onEnterApp} className="hover:text-[#F0C020] cursor-pointer">Live App</button>
            <button onClick={onOpenLogin} className="hover:text-[#D02020] cursor-pointer">Sign In</button>
            <button onClick={onOpenRegister} className="hover:text-[#F0C020] cursor-pointer">Register</button>
            <a href="#hero-manifesto" className="hover:text-[#1040C0]">Back to Top ↑</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-gray-500 uppercase">
          <p>© 2026 CO-PAY PLATFORM. BUILT ON THE TIMELESS FOUNDATION OF FORM FOLLOWS FUNCTION.</p>
          <p className="mt-2 sm:mt-0">DESIGN SYSTEM: BAUHAUS (1920S CONSTRUCTIVISM)</p>
        </div>
      </footer>

    </div>
  );
}
