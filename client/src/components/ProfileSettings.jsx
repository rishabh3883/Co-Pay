import React from 'react';
import { Award } from 'lucide-react';

export default function ProfileSettings({
  user,
  profilePhone,
  setProfilePhone,
  profileUpi,
  setProfileUpi,
  isUpdatingProfile,
  handleUpdateProfile,
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-6">
      <div className="border-b border-gray-800/80 pb-4">
        <h3 className="text-base font-mono text-white uppercase tracking-wider">Member Profile Settings</h3>
        <p className="text-xs text-gray-400 mt-1 font-mono">Verify your details to enable WhatsApp notifications and UPI Settlements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Column: Form details */}
        <div className="space-y-4">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">User Full Name</label>
              <div className="bg-gray-900 border border-gray-800 rounded-lg px-3.5 py-2 text-xs text-gray-400 font-medium select-none">
                {user?.name}
              </div>
            </div>

            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Registered Email Address</label>
              <div className="bg-gray-900 border border-gray-800 rounded-lg px-3.5 py-2 text-xs text-gray-400 font-mono select-none">
                {user?.email}
              </div>
            </div>

            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Mobile Phone Number (WhatsApp Reminders)</label>
              <input
                type="tel"
                placeholder="e.g. +919876543210"
                value={profilePhone}
                onChange={e => setProfilePhone(e.target.value)}
                className="w-full bg-[#0b0914] border border-gray-850 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-gray-500 block mt-1">Include country code (e.g. +91) for direct message mapping.</span>
            </div>

            <div>
              <label className="text-3xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Preferred UPI Identifier (QR-Settlement)</label>
              <input
                type="text"
                placeholder="e.g. username@upi"
                value={profileUpi}
                onChange={e => setProfileUpi(e.target.value)}
                className="w-full bg-[#0b0914] border border-gray-855 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-gray-500 block mt-1">Used to dynamically construct UPI QR settlement codes.</span>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Gamified Badges, Stats & Streaks */}
        <div className="space-y-6 bg-black/25 border border-white/[0.02] p-5 rounded-2xl">
          <div>
            <h4 className="text-2xs font-mono text-gray-400 uppercase tracking-widest font-bold">Roster Reputation Status</h4>
            <div className="flex items-center gap-3.5 mt-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-black text-white">{user?.badges?.length || 0} Badges Unlocked</p>
                <p className="text-3xs font-mono text-indigo-400 mt-0.5">CURRENT STREAK: {user?.streaks || 1} SESSION STREAKS</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-3xs font-mono text-gray-500 uppercase tracking-widest block">Unlocked Badge Medals</span>
            <div className="flex flex-wrap gap-2">
              {user?.badges?.map(b => (
                <span key={b} className="bg-indigo-950 text-indigo-300 text-4xs font-mono border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                  🏅 {b}
                </span>
              ))}
              {(user?.badges || []).length === 0 && (
                <span className="text-xs text-gray-500 italic">No badges earned yet. Settle flat splits to unlock!</span>
              )}
            </div>
          </div>

          {profileUpi && (
            <div className="pt-4 border-t border-white/[0.04] space-y-2 flex flex-col items-center">
              <span className="text-3xs font-mono text-gray-400 uppercase tracking-widest block self-start">Personal UPI QR Code Preview</span>
              <div className="p-3.5 bg-white rounded-xl shadow-lg border border-white/20 w-44 h-44 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${profileUpi}&pn=${encodeURIComponent(user?.name || '')}&cu=INR`)}`}
                  alt="My UPI QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-gray-500 font-mono text-center truncate w-full">{profileUpi}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
