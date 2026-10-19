import React, { useState } from 'react';
import { 
  Home as HomeIcon, 
  Plus, 
  Users, 
  Copy, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  DoorOpen, 
  Sparkles,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function RoomSwitcherModal({
  isOpen,
  onClose,
  homes,
  activeHomeId,
  setActiveHomeId,
  user,
  homeForm,
  setHomeForm,
  handleCreateHome,
  joinCode,
  setJoinCode,
  handleJoinHome,
  onViewRoommates
}) {
  const [tab, setTab] = useState('list'); // 'list' | 'create' | 'join'
  const [copiedCode, setCopiedCode] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const onTabChange = (newTab) => {
    setTab(newTab);
    setErrorMsg(null);
  };

  const handleValidateCreate = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanName = homeForm?.name?.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Room name is required and must be at least 2 characters.');
      return;
    }
    if (cleanName.length > 50) {
      setErrorMsg('Room name must not exceed 50 characters.');
      return;
    }
    if (homes && homes.some(h => h.name?.toLowerCase() === cleanName.toLowerCase())) {
      setErrorMsg(`You already have a room named "${cleanName}"! Please choose a unique name.`);
      return;
    }
    handleCreateHome(e);
    onClose();
  };

  const handleValidateJoin = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCode = joinCode?.trim()?.toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setErrorMsg('Please enter a valid room invite code (at least 3 characters).');
      return;
    }
    if (homes && homes.some(h => (h.inviteCode?.toUpperCase() === cleanCode || h.joinCode?.toUpperCase() === cleanCode))) {
      setErrorMsg('You have already joined this room! Check your active rooms list.');
      return;
    }
    handleJoinHome(e);
    onClose();
  };

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isRoomCreatedByUser = (home) => {
    if (!home) return false;
    const myId = user?.id;
    const myEmail = user?.email?.toLowerCase();
    if (home.adminId === myId || (myEmail && home.creatorEmail?.toLowerCase() === myEmail)) return true;
    if (home.members && home.members.length > 0) {
      const first = home.members[0];
      if (first.id === myId || (myEmail && first.email?.toLowerCase() === myEmail)) {
        if (first.badges?.includes('Creator') || first.badges?.includes('Admin')) return true;
      }
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/75 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-[#F0C020]">
      <div className="bg-white border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-150 overflow-hidden">
        
        {/* Top 3-color primary bar */}
        <div className="flex h-3 border-b-2 border-[#121212]">
          <div className="w-1/3 bg-[#D02020]" />
          <div className="w-1/3 bg-[#1040C0]" />
          <div className="w-1/3 bg-[#F0C020]" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-4 border-[#121212] bg-[#F0C020] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white border-2 border-[#121212] flex items-center justify-center shadow-[2px_2px_0px_0px_#121212]">
              <HomeIcon className="w-4 h-4 text-[#1040C0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xs font-mono font-black uppercase bg-[#121212] text-white px-1.5 py-0.5">
                  ROOM INDEX
                </span>
                <span className="text-2xs font-mono font-black text-[#121212] uppercase">
                  TOTAL: {homes?.length || 0} {homes?.length === 1 ? 'ROOM' : 'ROOMS'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase text-[#121212] tracking-tight leading-tight">
                SWITCH WORKSPACE OR ESTABLISH NEW ROOM
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-[#D02020] hover:text-white text-[#121212] border-2 border-[#121212] font-black cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Action Toggle Navigation */}
        <div className="flex border-b-4 border-[#121212] bg-[#F8F8F8] p-2 gap-2 text-xs font-black uppercase overflow-x-auto">
          <button
            onClick={() => onTabChange('list')}
            className={`px-3 py-1.5 border-2 border-[#121212] cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'list'
                ? 'bg-[#1040C0] text-white shadow-[2px_2px_0px_0px_#121212]'
                : 'bg-white text-[#121212] hover:bg-[#F0C020]'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>ALL ROOMS ({homes?.length || 0})</span>
          </button>

          <button
            onClick={() => onTabChange('create')}
            className={`px-3 py-1.5 border-2 border-[#121212] cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'create'
                ? 'bg-[#D02020] text-white shadow-[2px_2px_0px_0px_#121212]'
                : 'bg-white text-[#121212] hover:bg-[#D02020] hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ CREATE NEW ROOM</span>
          </button>

          <button
            onClick={() => onTabChange('join')}
            className={`px-3 py-1.5 border-2 border-[#121212] cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'join'
                ? 'bg-[#F0C020] text-[#121212] shadow-[2px_2px_0px_0px_#121212]'
                : 'bg-white text-[#121212] hover:bg-[#F0C020]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>🔑 JOIN VIA CODE</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-[#F5F5F5]">
          {errorMsg && (
            <div className="bg-[#D02020] text-white border-2 border-[#121212] p-3 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#121212] flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}
          
          {/* TAB 1: ALL ROOMS LIST */}
          {tab === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-3xs font-mono font-black uppercase tracking-wider text-[#555]">
                  YOUR ROOMS & FLATS LIST
                </span>
                <span className="text-2xs font-mono text-[#888]">
                  Click any room to switch workspace immediately
                </span>
              </div>

              {(!homes || homes.length === 0) ? (
                <div className="bg-white border-3 border-[#121212] p-6 text-center shadow-[4px_4px_0px_0px_#121212]">
                  <p className="text-xs font-black uppercase text-[#121212]">No rooms found</p>
                  <p className="text-2xs text-[#666] mt-1 font-mono">Create a new room or join with a room code to get started.</p>
                  <button
                    onClick={() => setTab('create')}
                    className="mt-3 bg-[#D02020] text-white border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212]"
                  >
                    + Create Your First Room
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {homes.map((h) => {
                    const isActive = h.id === activeHomeId;
                    const isCreated = isRoomCreatedByUser(h);
                    const code = h.inviteCode || h.joinCode || h.id;

                    return (
                      <div
                        key={h.id}
                        className={`border-3 border-[#121212] p-4 transition-all ${
                          isActive
                            ? 'bg-[#F0C020] shadow-[5px_5px_0px_0px_#121212] translate-x-1'
                            : 'bg-white hover:bg-white shadow-[3px_3px_0px_0px_#121212]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {isActive && (
                                <span className="bg-[#121212] text-white text-3xs font-mono font-black px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse" />
                                  ACTIVE WORKSPACE
                                </span>
                              )}

                              {isCreated ? (
                                <span className="bg-[#10B981] text-white border border-[#121212] text-3xs font-mono font-black px-2 py-0.5 uppercase tracking-wider">
                                  ★ CREATED BY YOU
                                </span>
                              ) : (
                                <span className="bg-[#1040C0] text-white border border-[#121212] text-3xs font-mono font-black px-2 py-0.5 uppercase tracking-wider">
                                  ✓ JOINED ROOM
                                </span>
                              )}

                              <span className="text-3xs font-mono font-bold text-[#444] bg-[#F0F0F0] border border-[#121212] px-1.5 py-0.2">
                                👥 {h.members?.length || 1} Roommates
                              </span>
                            </div>

                            <h3 className="text-base font-black uppercase text-[#121212] tracking-tight truncate">
                              {h.name}
                            </h3>

                            <div className="flex items-center gap-2 text-2xs font-mono text-[#444]">
                              <span>INVITE CODE:</span>
                              <span className="font-black text-[#121212] bg-white border border-[#121212] px-1.5 py-0.5 select-all">
                                {code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(code)}
                                className="hover:text-[#1040C0] cursor-pointer flex items-center gap-0.5 text-3xs uppercase font-bold"
                                title="Copy Invite Code"
                              >
                                {copiedCode === code ? (
                                  <span className="text-[#10B981] font-black flex items-center gap-0.5"><Check className="w-3 h-3" /> Copied!</span>
                                ) : (
                                  <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy</span>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="shrink-0 flex sm:flex-col justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (onViewRoommates) {
                                  onViewRoommates(h);
                                }
                              }}
                              className="bg-[#F0C020] hover:bg-[#D02020] hover:text-white text-[#121212] border-2 border-[#121212] px-3 py-1.5 text-3xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1"
                              title="See who created and who joined this room"
                            >
                              <Users className="w-3 h-3 text-[#1040C0]" />
                              <span>MEMBERS ({h.members?.length || 1})</span>
                            </button>

                            {isActive ? (
                              <div className="bg-white text-[#121212] border-2 border-[#121212] px-3 py-1.5 text-xs font-black uppercase text-center shadow-[2px_2px_0px_0px_#121212]">
                                CURRENT
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveHomeId(h.id);
                                  onClose();
                                }}
                                className="bg-[#1040C0] hover:bg-[#0c3196] text-white border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                              >
                                <span>SWITCH</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE NEW ROOM FORM */}
          {tab === 'create' && (
            <div className="bg-white border-3 border-[#121212] p-5 sm:p-6 shadow-[5px_5px_0px_0px_#121212] space-y-4">
              <div className="border-b-2 border-[#121212] pb-3">
                <span className="bg-[#D02020] text-white text-3xs font-mono font-black px-2 py-0.5 uppercase tracking-wider inline-block mb-1">
                  NEW FLATSPACE
                </span>
                <h3 className="text-base font-black uppercase text-[#121212]">
                  ESTABLISH ANOTHER ROOM / FLAT
                </h3>
                <p className="text-xs text-[#555] mt-0.5">
                  Set up an additional shared flat, hostel room, or trip workspace.
                </p>
              </div>

              <form onSubmit={handleValidateCreate} className="space-y-4">
                <div>
                  <label className="text-3xs font-black uppercase tracking-wider block mb-1 text-[#121212]">
                    ROOM / FLAT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302 / Summer Trip Group"
                    value={homeForm.name}
                    onChange={(e) => setHomeForm({ ...homeForm, name: e.target.value })}
                    className="w-full bg-[#FAFAFA] border-3 border-[#121212] p-3 text-xs font-black uppercase text-[#121212] focus:bg-white focus:outline-none focus:border-[#D02020] shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#D02020] hover:bg-[#b01818] text-white border-3 border-[#121212] py-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>CREATE ROOM & SWITCH &rarr;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('list')}
                    className="bg-white text-[#121212] border-2 border-[#121212] px-4 py-3 text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: JOIN VIA INVITE CODE */}
          {tab === 'join' && (
            <div className="bg-white border-3 border-[#121212] p-5 sm:p-6 shadow-[5px_5px_0px_0px_#121212] space-y-4">
              <div className="border-b-2 border-[#121212] pb-3">
                <span className="bg-[#1040C0] text-white text-3xs font-mono font-black px-2 py-0.5 uppercase tracking-wider inline-block mb-1">
                  JOIN ROOM
                </span>
                <h3 className="text-base font-black uppercase text-[#121212]">
                  JOIN ANOTHER EXISTING FLAT WITH INVITE CODE
                </h3>
                <p className="text-xs text-[#555] mt-0.5">
                  Enter the 6-character room code shared by your flatmates.
                </p>
              </div>

              <form onSubmit={handleValidateJoin} className="space-y-4">
                <div>
                  <label className="text-3xs font-black uppercase tracking-wider block mb-1 text-[#121212]">
                    ROOM INVITE CODE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COPLAY"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full bg-[#FAFAFA] border-3 border-[#121212] p-3 text-xs font-mono font-black uppercase text-[#121212] focus:bg-white focus:outline-none focus:border-[#1040C0] shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#1040C0] hover:bg-[#0c3196] text-white border-3 border-[#121212] py-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>JOIN ROOM & SWITCH &rarr;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('list')}
                    className="bg-white text-[#121212] border-2 border-[#121212] px-4 py-3 text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_#121212]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t-3 border-[#121212] p-3 bg-white flex items-center justify-between text-2xs font-mono text-[#555]">
          <span>YOU CAN CREATE OR JOIN MULTIPLE ROOMS AND SWITCH ANYTIME</span>
          <button
            onClick={onClose}
            className="font-black text-[#121212] underline hover:text-[#D02020] cursor-pointer uppercase"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
