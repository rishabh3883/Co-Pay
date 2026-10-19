import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  QrCode, 
  DollarSign, 
  Check, 
  Copy, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Users,
  Home as HomeIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfileSettings({
  user,
  setUser,
  homes,
  activeHome,
  activeHomeId,
  setActiveHomeId,
  isRoomModalOpen,
  setIsRoomModalOpen,
  profilePhone,
  setProfilePhone,
  profileUpi,
  setProfileUpi,
  userBudgetInput,
  setUserBudgetInput,
  isUpdatingProfile,
  handleUpdateProfile,
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || profilePhone || '');
  const [upiId, setUpiId] = useState(user?.upiId || profileUpi || '');
  const [budget, setBudget] = useState(userBudgetInput || user?.personalBudget || '15000');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.phone || profilePhone) setPhone(user.phone || profilePhone);
    if (user?.upiId || profileUpi) setUpiId(user.upiId || profileUpi);
    if (user?.personalBudget || userBudgetInput) setBudget((user?.personalBudget || userBudgetInput).toString());
  }, [user, profilePhone, profileUpi, userBudgetInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    if (!handleUpdateProfile) return;

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setProfileError('Display Name must be at least 2 characters long.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setProfileError('Please enter a valid email address (e.g. name@gmail.com).');
        return;
      }
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone) {
      const phoneDigits = cleanPhone.replace(/^\+91/, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        setProfileError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    const cleanUpi = upiId.trim();
    if (cleanUpi) {
      if (!cleanUpi.includes('@') || cleanUpi.length < 4) {
        setProfileError('Please enter a valid UPI ID (e.g. mobile@upi or name@okaxis).');
        return;
      }
    }

    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      setProfileError('Personal monthly budget must be greater than ₹0.');
      return;
    }

    const res = await handleUpdateProfile({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      upiId: cleanUpi,
      personalBudget: numBudget
    });

    if (res?.success) {
      setSavedSuccess(true);
      setProfileError(null);
      setTimeout(() => setSavedSuccess(false), 4000);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const currentUpi = upiId.trim() || 'roommate@upi';
  const upiPayString = `upi://pay?pa=${encodeURIComponent(currentUpi)}&pn=${encodeURIComponent(name || 'Roommate')}&cu=INR&tn=CoPay%20Settlement`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayString)}`;

  return (
    <div className="space-y-6">
      {/* Bauhaus Top Card */}
      <div className="bg-white border-4 border-[#121212] p-5 shadow-[6px_6px_0px_0px_#121212] relative overflow-hidden">
        {/* Color bar top */}
        <div className="flex h-2.5 border-2 border-[#121212] mb-4">
          <div className="w-1/3 bg-[#D02020]" />
          <div className="w-1/3 bg-[#1040C0]" />
          <div className="w-1/3 bg-[#F0C020]" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D02020] border-3 border-[#121212] flex items-center justify-center font-black text-white text-lg shadow-[3px_3px_0px_0px_#121212] shrink-0">
              {(name || user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono font-black uppercase bg-[#1040C0] text-white px-2 py-0.5 border border-[#121212]">
                  PROFILE // 04
                </span>
                <span className="text-2xs font-mono text-[#555] uppercase font-bold">
                  ID: {user?.id || 'usr_local'}
                </span>
              </div>
              <h2 className="text-xl font-black uppercase text-[#121212] tracking-tight mt-0.5">
                {name || user?.name || 'Roommate'}
              </h2>
              <p className="text-xs text-[#555] font-mono">
                {email || user?.email || 'user@copay.io'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#F0C020] border-2 border-[#121212] px-3 py-1.5 shadow-[2px_2px_0px_0px_#121212]">
              <span className="text-3xs font-mono uppercase font-black text-[#121212] block">Current Streak</span>
              <span className="text-sm font-black text-[#121212]">🔥 {user?.streaks || 2} Cycles</span>
            </div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#10B981] text-white border-3 border-[#121212] p-4 font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#121212] flex items-center justify-between animate-in fade-in zoom-in duration-150">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Profile and contact details saved successfully! All room rosters updated.</span>
          </div>
          <button 
            onClick={() => setSavedSuccess(false)}
            className="bg-white text-[#121212] border-2 border-[#121212] px-2 py-0.5 text-2xs cursor-pointer shadow-[2px_2px_0px_0px_#121212]"
          >
            DISMISS
          </button>
        </div>
      )}

      {profileError && (
        <div className="bg-[#D02020] text-white border-3 border-[#121212] p-4 font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#121212] flex items-center justify-between animate-in fade-in zoom-in duration-150">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{profileError}</span>
          </div>
          <button 
            onClick={() => setProfileError(null)}
            className="bg-white text-[#121212] border-2 border-[#121212] px-2 py-0.5 text-2xs cursor-pointer shadow-[2px_2px_0px_0px_#121212]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Main Grid: Form + UPI / Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-4 border-[#121212] p-6 shadow-[6px_6px_0px_0px_#121212]">
            <div className="border-b-3 border-[#121212] pb-3 mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#121212] uppercase tracking-wider">
                  MEMBER INFORMATION
                </h3>
                <p className="text-2xs text-[#555] font-mono mt-0.5">
                  Update your display name, contact email, and phone for room notifications.
                </p>
              </div>
              <User className="w-5 h-5 text-[#1040C0]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-3xs font-black uppercase text-[#121212] block mb-1 tracking-wider">
                  Full Display Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-[#888]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#FAFAFA] border-3 border-[#121212] pl-9 pr-3 py-2 text-xs font-black text-[#121212] placeholder:text-[#888] focus:bg-white focus:outline-none focus:border-[#1040C0] shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-3xs font-black uppercase text-[#121212] block mb-1 tracking-wider">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-[#888]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full bg-[#FAFAFA] border-3 border-[#121212] pl-9 pr-3 py-2 text-xs font-black font-mono text-[#121212] placeholder:text-[#888] focus:bg-white focus:outline-none focus:border-[#1040C0] shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="text-3xs font-black uppercase text-[#121212] block mb-1 tracking-wider">
                  Mobile / WhatsApp Number (For Split Reminders)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-[#888]" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAFAFA] border-3 border-[#121212] pl-9 pr-3 py-2 text-xs font-black font-mono text-[#121212] placeholder:text-[#888] focus:bg-white focus:outline-none focus:border-[#1040C0] shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>
                <span className="text-[10px] text-[#666] font-mono block mt-1">
                  Used by roommates to send direct WhatsApp split payment reminders.
                </span>
              </div>

              {/* UPI ID */}
              <div>
                <label className="text-3xs font-black uppercase text-[#121212] block mb-1 tracking-wider">
                  Preferred UPI ID (VPA for Settlement QR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <QrCode className="w-4 h-4 text-[#888]" />
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okaxis / user@upi"
                    className="w-full bg-[#FAFAFA] border-3 border-[#121212] pl-9 pr-3 py-2 text-xs font-black font-mono text-[#121212] placeholder:text-[#888] focus:bg-white focus:outline-none focus:border-[#1040C0] shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>
                <span className="text-[10px] text-[#666] font-mono block mt-1">
                  Enables instant QR codes for flatmates when they settle balances with you.
                </span>
              </div>

              {/* Personal Budget Limit */}
              <div>
                <label className="text-3xs font-black uppercase text-[#121212] block mb-1 tracking-wider">
                  Monthly Personal Expense Budget (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-[#888]" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="15000"
                    className="w-full bg-[#FAFAFA] border-3 border-[#121212] pl-9 pr-3 py-2 text-xs font-black font-mono text-[#121212] placeholder:text-[#888] focus:bg-white focus:outline-none focus:border-[#1040C0] shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-[#D02020] hover:bg-[#b01818] text-white border-3 border-[#121212] py-3 px-5 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'SAVING CHANGES...' : 'SAVE PROFILE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: QR Settlement Card & Badges (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* UPI QR Settlement Card */}
          <div className="bg-white border-4 border-[#121212] p-5 shadow-[6px_6px_0px_0px_#121212] text-center">
            <div className="border-b-3 border-[#121212] pb-2 mb-4 flex items-center justify-between text-left">
              <div>
                <h3 className="text-xs font-black text-[#121212] uppercase tracking-wider">
                  YOUR SETTLEMENT QR
                </h3>
                <p className="text-[10px] text-[#555] font-mono">
                  Roommates scan this to pay you directly
                </p>
              </div>
              <div className="w-3 h-3 bg-[#F0C020] border-2 border-[#121212]" />
            </div>

            <div className="bg-[#F8F8F8] border-3 border-[#121212] p-4 inline-block shadow-[3px_3px_0px_0px_#121212] mb-3">
              <img
                src={qrCodeUrl}
                alt="My UPI QR Code"
                className="w-48 h-48 mx-auto object-contain bg-white p-2 border-2 border-[#121212]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-black text-[#121212] bg-[#F0F0F0] px-3 py-1 border-2 border-[#121212] truncate max-w-[220px]">
                  {upiId.trim() || 'No UPI ID set'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  disabled={!upiId.trim()}
                  className="bg-white hover:bg-[#F0C020] text-[#121212] border-2 border-[#121212] px-2.5 py-1 text-2xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#666] font-mono">
                Works with Google Pay, PhonePe, Paytm, and BHIM UPI
              </p>
            </div>
          </div>

          {/* Roster Badges & Achievements */}
          <div className="bg-white border-4 border-[#121212] p-5 shadow-[6px_6px_0px_0px_#121212]">
            <div className="border-b-3 border-[#121212] pb-2 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#121212] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D02020]" />
                REPUTATION & BADGES
              </h3>
              <span className="text-2xs font-mono font-black text-[#1040C0]">
                LEVEL 01
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(user?.badges || ['Active Roommate', 'Verified Identity', 'UPI Enabled']).map((badge, idx) => {
                const colors = ['bg-[#D02020]', 'bg-[#1040C0]', 'bg-[#F0C020]'];
                const textColors = ['text-white', 'text-white', 'text-[#121212]'];
                const bg = colors[idx % colors.length];
                const tc = textColors[idx % textColors.length];
                return (
                  <div
                    key={badge}
                    className={`${bg} ${tc} border-2 border-[#121212] px-2.5 py-1 text-3xs font-black uppercase font-mono shadow-[2px_2px_0px_0px_#121212] flex items-center gap-1.5`}
                  >
                    <span>🏅</span>
                    <span>{badge}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rooms and Flats Workspaces */}
          <div className="bg-[#F8F8F8] border-4 border-[#121212] p-4 shadow-[6px_6px_0px_0px_#121212] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-[#1040C0]" />
                <span className="text-2xs font-black uppercase tracking-wider text-[#121212]">
                  YOUR ROOMS ({homes?.length || 0})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomModalOpen && setIsRoomModalOpen(true)}
                className="bg-[#1040C0] hover:bg-[#0c3196] text-white border-2 border-[#121212] px-2.5 py-1 text-3xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                + New / Switch
              </button>
            </div>

            {(!homes || homes.length === 0) ? (
              <p className="text-2xs text-[#777] font-mono italic">No rooms joined yet.</p>
            ) : (
              <div className="space-y-2">
                {homes.map((h) => {
                  const isActive = h.id === activeHomeId;
                  const isCreated = (h.adminId === user?.id || (user?.email && h.creatorEmail?.toLowerCase() === user?.email.toLowerCase()) || (h.members?.[0]?.id === user?.id && h.members?.[0]?.badges?.includes('Creator')));
                  const code = h.inviteCode || h.joinCode || h.id;

                  return (
                    <div
                      key={h.id}
                      className={`border-2 border-[#121212] p-2.5 transition-all ${
                        isActive ? 'bg-[#F0C020] shadow-[3px_3px_0px_0px_#121212]' : 'bg-white shadow-[2px_2px_0px_0px_#121212]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 uppercase border border-[#121212] text-white ${
                              isCreated ? 'bg-[#10B981]' : 'bg-[#1040C0]'
                            }`}>
                              {isCreated ? 'CREATED' : 'JOINED'}
                            </span>
                            {isActive && (
                              <span className="text-[9px] font-mono font-black text-[#121212] uppercase bg-white border border-[#121212] px-1">
                                ● ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-black uppercase text-[#121212] truncate mt-1">{h.name}</p>
                          <p className="text-[10px] font-mono text-[#555] truncate">Code: {code}</p>
                        </div>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => setActiveHomeId && setActiveHomeId(h.id)}
                            className="bg-[#1040C0] hover:bg-[#0c3196] text-white border border-[#121212] px-2.5 py-1 text-3xs font-black uppercase cursor-pointer shrink-0 shadow-[1px_1px_0px_0px_#121212]"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
