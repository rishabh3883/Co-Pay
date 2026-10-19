import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  X, 
  Check, 
  Phone, 
  MessageSquare, 
  Mail, 
  CreditCard, 
  Trash2,
  Copy,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddMemberModal({
  isOpen,
  onClose,
  activeHome,
  user,
  onAddMember,
  onRemoveMember
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!isOpen || !activeHome) return null;

  const handleCopySameAsPhone = () => {
    if (phone.trim()) {
      setWhatsapp(phone.trim());
      setFormError(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setFormError('Member name is required and must be at least 2 characters.');
      return;
    }

    // Phone validation (if provided)
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone) {
      const phoneDigits = cleanPhone.replace(/^\+91/, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        setFormError('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
        return;
      }
    }

    // WhatsApp validation (if provided)
    const cleanWhatsapp = (whatsapp.trim() || phone.trim()).replace(/[\s-]/g, '');
    if (cleanWhatsapp) {
      const waDigits = cleanWhatsapp.replace(/^\+91/, '');
      if (!/^\d{10}$/.test(waDigits)) {
        setFormError('Please enter a valid 10-digit WhatsApp number.');
        return;
      }
    }

    // Email validation (if provided)
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setFormError('Please enter a valid email address (e.g. roommate@gmail.com).');
        return;
      }
    }

    // UPI ID validation (if provided)
    const cleanUpi = upiId.trim();
    if (cleanUpi) {
      if (!cleanUpi.includes('@') || cleanUpi.length < 4) {
        setFormError('Please enter a valid UPI ID containing "@" (e.g. mobile@upi or name@okaxis).');
        return;
      }
    }

    // Duplicate check in existing room roster
    const currentMembers = activeHome.members || [];
    const isDuplicate = currentMembers.some(m => {
      if (m.name && m.name.toLowerCase() === cleanName.toLowerCase()) return true;
      if (cleanEmail && m.email && m.email.toLowerCase() === cleanEmail) return true;
      if (cleanPhone && m.phone && m.phone.replace(/[\s-]/g, '') === cleanPhone) return true;
      return false;
    });

    if (isDuplicate) {
      setFormError(`A roommate with the name "${cleanName}" or this email/phone is already in this room!`);
      return;
    }

    if (onAddMember) {
      await onAddMember({
        name: cleanName,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        email: cleanEmail,
        upiId: cleanUpi
      });
    }

    confetti({ particleCount: 70, spread: 60 });
    setName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setUpiId('');
    setFormError(null);
  };

  const handleCopyInvite = () => {
    if (activeHome.inviteCode) {
      navigator.clipboard.writeText(activeHome.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const members = activeHome.members || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] max-w-2xl w-full my-auto overflow-hidden relative font-bauhaus">
        
        {/* Top Primary Color Accent Bar */}
        <div className="flex h-3 border-b-2 border-[#121212]">
          <div className="w-1/3 bg-[#D02020]"></div>
          <div className="w-1/3 bg-[#1040C0]"></div>
          <div className="w-1/3 bg-[#F0C020]"></div>
        </div>

        {/* Modal Header */}
        <div className="bg-[#F0C020] border-b-4 border-[#121212] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#121212] text-white flex items-center justify-center shadow-[2px_2px_0px_0px_white]">
              <Users className="w-5 h-5 text-[#F0C020]" />
            </div>
            <div>
              <span className="bg-[#121212] text-white text-3xs font-mono font-black px-2 py-0.5 uppercase tracking-wider block w-max">
                ROOM ROSTER SETUP
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#121212] uppercase tracking-tight">
                ADD MEMBERS // {activeHome.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-white hover:bg-gray-100 border-2 border-[#121212] flex items-center justify-center font-black text-sm cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Info Bar */}
        <div className="bg-[#F0F0F0] border-b-3 border-[#121212] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 uppercase text-3xs tracking-wider">ROOM INVITE CODE:</span>
            <span className="font-mono font-black bg-white border-2 border-[#121212] px-2 py-0.5 shadow-[1px_1px_0px_0px_#121212]">
              {activeHome.inviteCode || 'COPAY'}
            </span>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="text-3xs font-mono font-bold uppercase underline hover:text-[#1040C0] flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copiedCode ? 'COPIED!' : 'COPY CODE'}
            </button>
          </div>
          <span className="text-3xs font-black font-mono uppercase bg-[#1040C0] text-white px-2 py-0.5">
            {members.length} {members.length === 1 ? 'MEMBER' : 'MEMBERS'} CURRENTLY
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Add Member Form */}
          <form onSubmit={handleFormSubmit} className="bg-white border-3 border-[#121212] p-4 sm:p-5 shadow-[4px_4px_0px_0px_#121212] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
              <span className="text-xs font-black uppercase text-[#D02020] tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                NEW FLATMATE DETAILS
              </span>
              <span className="text-3xs font-mono text-gray-500 uppercase">
                ALL CONTACTS SYNC WITH ROOM
              </span>
            </div>

            {formError && (
              <div className="bg-[#D02020] text-white border-2 border-[#121212] p-2.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#121212] flex items-center gap-2">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Member Name */}
              <div className="sm:col-span-2">
                <label className="text-3xs font-black uppercase tracking-wider block mb-1 text-[#121212]">
                  MEMBER FULL NAME *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="E.G. ROHAN SHARMA"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#F0F0F0] border-2 border-[#121212] p-2.5 text-xs font-black uppercase placeholder-gray-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#121212]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-3xs font-black uppercase tracking-wider block mb-1 text-gray-700 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#1040C0]" />
                  PHONE NUMBER
                </label>
                <input 
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#F0F0F0] border-2 border-[#121212] p-2 text-xs font-mono font-bold placeholder-gray-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#121212]"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-3xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    WHATSAPP NUMBER
                  </label>
                  {phone.trim() && (
                    <button
                      type="button"
                      onClick={handleCopySameAsPhone}
                      className="text-4xs font-mono font-black text-gray-500 hover:text-black uppercase underline cursor-pointer"
                    >
                      SAME AS PHONE
                    </button>
                  )}
                </div>
                <input 
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-[#F0F0F0] border-2 border-[#121212] p-2 text-xs font-mono font-bold placeholder-gray-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#121212]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-3xs font-black uppercase tracking-wider block mb-1 text-gray-700 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#D02020]" />
                  EMAIL ADDRESS
                </label>
                <input 
                  type="email"
                  placeholder="rohan@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#F0F0F0] border-2 border-[#121212] p-2 text-xs font-bold placeholder-gray-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#121212]"
                />
              </div>

              {/* UPI ID */}
              <div>
                <label className="text-3xs font-black uppercase tracking-wider block mb-1 text-gray-700 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-purple-600" />
                  UPI ID (OPTIONAL)
                </label>
                <input 
                  type="text"
                  placeholder="rohan@okaxis"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full bg-[#F0F0F0] border-2 border-[#121212] p-2 text-xs font-mono font-bold placeholder-gray-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#121212]"
                />
              </div>

            </div>

            <button
              type="submit"
              className="w-full bg-[#1040C0] hover:bg-[#0c3196] text-white border-3 border-[#121212] font-black uppercase text-xs py-3 shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ SAVE MEMBER TO ROOM</span>
            </button>
          </form>

          {/* Current Roster List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-1.5">
              <span className="text-xs font-black uppercase text-[#121212] tracking-wider">
                CURRENT ROOMMATES ({members.length})
              </span>
              <span className="text-3xs font-mono text-gray-500 uppercase">
                DIRECT CONTACT CHANNELS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {members.map(m => {
                const waClean = (m.whatsapp || m.phone || '').replace(/[^0-9]/g, '');
                const phoneClean = (m.phone || '').replace(/[^0-9+]/g, '');

                return (
                  <div 
                    key={m.id}
                    className="bg-white border-2 border-[#121212] p-3 shadow-[2px_2px_0px_0px_#121212] flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#121212] text-[#F0C020] font-black flex items-center justify-center text-xs border border-black">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-[#121212]">{m.name}</span>
                          {activeHome.adminId === m.id && (
                            <span className="bg-[#D02020] text-white text-4xs font-mono font-black px-1.5 py-0.2">
                              CREATOR
                            </span>
                          )}
                        </div>
                        <span className="text-3xs text-gray-500 font-mono block">
                          {m.email || 'No email registered'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Contact & Action Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {waClean && (
                        <a
                          href={`https://wa.me/${waClean}?text=${encodeURIComponent(`Hey ${m.name}, check out our Co-Pay room expenses for ${activeHome.name}!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-600 px-2 py-1 text-3xs font-black flex items-center gap-1 transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span className="hidden sm:inline">WHATSAPP</span>
                        </a>
                      )}

                      {phoneClean && (
                        <a
                          href={`tel:${phoneClean}`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-600 px-2 py-1 text-3xs font-black flex items-center gap-1 transition-colors"
                          title="Call phone number"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span className="hidden sm:inline">CALL</span>
                        </a>
                      )}

                      {m.email && (
                        <a
                          href={`mailto:${m.email}?subject=${encodeURIComponent(`Co-Pay Flat Room: ${activeHome.name}`)}`}
                          className="bg-red-100 hover:bg-red-200 text-red-800 border border-red-600 px-2 py-1 text-3xs font-black flex items-center gap-1 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-3 h-3 text-red-600" />
                        </a>
                      )}

                      {onRemoveMember && m.id !== activeHome.adminId && m.id !== user?.id && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.id)}
                          className="bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-700 border border-gray-300 p-1 transition-colors cursor-pointer"
                          title="Remove roommate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F0F0F0] border-t-3 border-[#121212] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-3xs font-mono font-bold text-gray-500 uppercase tracking-wider text-center sm:text-left">
            ROOMMATES AUTOMATICALLY PARTICIPATE IN RECEIPT SPLITS
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-[#D02020] hover:bg-[#b01818] text-white border-2 border-[#121212] font-black uppercase text-xs py-2.5 px-6 shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <span>ENTER ROOM EXPENSES</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
