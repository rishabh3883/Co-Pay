import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  Check, 
  Copy, 
  Phone, 
  MessageSquare, 
  Mail, 
  RefreshCw, 
  Plus, 
  Share2, 
  X, 
  ShieldCheck,
  UserCheck,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RoommatesRosterModal({
  isOpen,
  onClose,
  activeHome,
  user,
  onSync,
  isSyncing,
  onOpenAddMember,
  onDeleteHome
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !activeHome) return null;

  const members = Array.isArray(activeHome.members) ? activeHome.members : [];
  const inviteCode = activeHome.inviteCode || activeHome.joinCode || activeHome.id;
  const adminId = activeHome.adminId;

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      confetti({ particleCount: 25, spread: 40 });
    }
  };

  const handleCopyLink = () => {
    if (inviteCode && typeof window !== 'undefined') {
      const link = `${window.location.origin}/?join=${inviteCode}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      confetti({ particleCount: 30, spread: 50 });
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && inviteCode) {
      const link = `${window.location.origin}/?join=${inviteCode}`;
      const text = `Hey! Join our shared flat room "${activeHome.name}" on Co-Pay using code: ${inviteCode}\nDirect link: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] max-w-2xl w-full my-6 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Top Bauhaus Tri-Color Bar */}
        <div className="flex h-3 border-b-3 border-[#121212]">
          <div className="w-1/3 bg-[#D02020]" />
          <div className="w-1/3 bg-[#1040C0]" />
          <div className="w-1/3 bg-[#F0C020]" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-4 border-[#121212] bg-[#F0F0F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1040C0] text-white flex items-center justify-center border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xs font-mono font-black uppercase bg-[#121212] text-white px-2 py-0.5">
                  ROOMMATES ROSTER
                </span>
                <span className="text-3xs font-mono font-black uppercase bg-[#10B981] text-white px-2 py-0.5 border border-[#121212]">
                  {members.length} JOINED
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase text-[#121212] tracking-tight mt-0.5">
                KON KON ROOM MEIN JOIN HAI
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSync && (
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                className="bg-white hover:bg-[#F0C020] text-[#121212] border-2 border-[#121212] p-2 text-2xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
                title="Live Refresh from Server"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#1040C0] ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline font-mono font-black">{isSyncing ? 'SYNCING...' : 'LIVE REFRESH'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-[#D02020] hover:text-white text-[#121212] border-2 border-[#121212] font-black cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room Info & Invite Bar */}
        <div className="bg-[#FFFEE0] border-b-4 border-[#121212] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-[#121212]">
                ROOM NAME: <strong className="underline decoration-[#1040C0] decoration-2">{activeHome.name}</strong>
              </span>
              <span className="text-3xs font-mono font-black bg-[#121212] text-white px-2 py-0.5">
                CODE: {inviteCode}
              </span>
            </div>
            <p className="text-2xs font-mono text-[#555] mt-1">
              Give this invite code to any flatmate so they can join this room instantly.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 sm:flex-none bg-white hover:bg-[#F0C020] text-[#121212] border-2 border-[#121212] px-3 py-1.5 text-2xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 font-mono"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-[#1040C0]" />}
              <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none bg-[#10B981] hover:bg-[#059669] text-white border-2 border-[#121212] px-3 py-1.5 text-2xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 font-mono"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE ON WHATSAPP</span>
            </button>
          </div>
        </div>

        {/* Member Cards List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh] space-y-3 bg-[#F8F8F8]">
          <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2 mb-2">
            <span className="text-xs font-black uppercase text-[#121212] tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#1040C0]" />
              VERIFIED ROOMMATES LIST ({members.length})
            </span>
            <span className="text-3xs font-mono text-gray-500 uppercase">
              REAL-TIME SYNCED
            </span>
          </div>

          {members.length === 0 ? (
            <div className="bg-white border-2 border-[#121212] p-8 text-center space-y-2">
              <p className="text-xs font-black uppercase text-gray-600">No members loaded yet</p>
              <p className="text-2xs font-mono text-gray-400">Click Live Refresh or share your invite code.</p>
            </div>
          ) : (
            members.map((m, index) => {
              const memberName = (typeof m === 'object' && m !== null) ? (m.name || m.email || 'Roommate') : 'Roommate';
              const memberEmail = (typeof m === 'object' && m !== null) ? (m.email || '') : '';
              const memberPhone = (typeof m === 'object' && m !== null) ? (m.phone || '') : '';
              const memberWhatsapp = (typeof m === 'object' && m !== null) ? (m.whatsapp || m.phone || '') : '';
              const memberUpi = (typeof m === 'object' && m !== null) ? (m.upiId || '') : '';
              const memberId = (typeof m === 'object' && m !== null) ? (m.id || m._id) : m;

              const isAdmin = memberId === adminId || (typeof m === 'object' && m?.badges?.includes('Creator'));
              const isCurrentUser = memberId === user?.id || (user?.email && memberEmail && user.email.toLowerCase() === memberEmail.toLowerCase());

              const waClean = memberWhatsapp.replace(/[^0-9]/g, '');
              const phoneClean = memberPhone.replace(/[^0-9+]/g, '');

              return (
                <div 
                  key={memberId || index}
                  className={`border-3 border-[#121212] p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#121212] transition-all ${
                    isAdmin 
                      ? 'bg-white border-l-[8px] border-l-[#10B981]' 
                      : 'bg-white border-l-[8px] border-l-[#1040C0]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* User Identity Column */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-none border-2 border-[#121212] flex items-center justify-center font-black text-sm uppercase shadow-[2px_2px_0px_0px_#121212] shrink-0 ${
                        isAdmin ? 'bg-[#10B981] text-white' : 'bg-[#1040C0] text-white'
                      }`}>
                        {memberName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black uppercase text-[#121212] truncate">
                            {memberName}
                          </h4>

                          {isCurrentUser && (
                            <span className="bg-[#F0C020] text-[#121212] border border-[#121212] text-3xs font-mono font-black px-1.5 py-0.2">
                              YOU
                            </span>
                          )}

                          {isAdmin ? (
                            <span className="bg-[#10B981] text-white text-3xs font-mono font-black px-2 py-0.5 border border-[#121212] flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              <span>CREATOR / ADMIN (ROOM BANANE WALA)</span>
                            </span>
                          ) : (
                            <span className="bg-[#1040C0] text-white text-3xs font-mono font-black px-2 py-0.5 border border-[#121212] flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>JOINED FLAT MATE</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-2xs font-mono text-[#555] mt-1 flex-wrap">
                          {memberEmail && (
                            <span className="flex items-center gap-1 bg-[#F0F0F0] px-1.5 py-0.5 border border-[#DDD] truncate">
                              <Mail className="w-3 h-3 text-[#1040C0]" />
                              <span>{memberEmail}</span>
                            </span>
                          )}
                          {memberPhone && (
                            <span className="flex items-center gap-1 bg-[#F0F0F0] px-1.5 py-0.5 border border-[#DDD]">
                              <Phone className="w-3 h-3 text-[#10B981]" />
                              <span>{memberPhone}</span>
                            </span>
                          )}
                          {memberUpi && (
                            <span className="flex items-center gap-1 bg-[#F0F0F0] px-1.5 py-0.5 border border-[#DDD]">
                              <span className="font-bold text-[#1040C0]">UPI:</span>
                              <span>{memberUpi}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Connect Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {waClean && (
                        <a
                          href={`https://wa.me/${waClean}?text=${encodeURIComponent(`Hey ${memberName}, let's check out our Co-Pay room expenses for ${activeHome.name}!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-50 hover:bg-[#10B981] hover:text-white text-emerald-800 border-2 border-[#121212] px-2.5 py-1.5 text-3xs font-black uppercase flex items-center gap-1 transition-all shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                          title="Open WhatsApp Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WHATSAPP</span>
                        </a>
                      )}

                      {phoneClean && (
                        <a
                          href={`tel:${phoneClean}`}
                          className="bg-blue-50 hover:bg-[#1040C0] hover:text-white text-blue-800 border-2 border-[#121212] px-2.5 py-1.5 text-3xs font-black uppercase flex items-center gap-1 transition-all shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                          title="Call Roommate"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>CALL</span>
                        </a>
                      )}

                      {memberEmail && (
                        <a
                          href={`mailto:${memberEmail}?subject=${encodeURIComponent(`Co-Pay Flat Room: ${activeHome.name}`)}`}
                          className="bg-white hover:bg-[#F0C020] text-[#121212] border-2 border-[#121212] px-2.5 py-1.5 text-3xs font-black uppercase flex items-center gap-1 transition-all shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F0F0F0] border-t-4 border-[#121212] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-3xs font-mono font-black uppercase tracking-wider text-[#555] block">
              STATUS: REAL-TIME LEDGER ACTIVE
            </span>
            <p className="text-2xs font-bold text-[#121212] mt-0.5">
              All listed roommates share split calculation and settlement tallies automatically.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {onDeleteHome && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteHome(activeHome.id);
                }}
                className="flex-1 sm:flex-none bg-white hover:bg-[#D02020] hover:text-white text-[#D02020] border-2 border-[#121212] px-3.5 py-2.5 text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                title={adminId === user?.id ? "Delete this room workspace permanently" : "Leave this room"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{adminId === user?.id ? "DELETE ROOM" : "LEAVE ROOM"}</span>
              </button>
            )}

            {onOpenAddMember && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddMember();
                }}
                className="flex-1 sm:flex-none bg-[#1040C0] hover:bg-[#0c3196] text-white border-2 border-[#121212] px-4 py-2.5 text-xs font-black uppercase cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD FLAT MATE</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none bg-[#D02020] hover:bg-[#b01818] text-white border-2 border-[#121212] px-5 py-2.5 text-xs font-black uppercase cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
