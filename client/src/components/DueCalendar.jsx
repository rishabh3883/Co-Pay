import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function DueCalendar({
  calendarEvents,
  selectedDate,
  setSelectedDate,
  newEventText,
  setNewEventText,
  handleAddCalendarEvent,
  handleDeleteCalendarEvent,
  user,
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-6">
      <div className="border-b border-gray-800/80 pb-4">
        <h3 className="text-base font-mono text-white uppercase tracking-wider">Bill Cycles & Flat Events</h3>
        <p className="text-xs text-gray-400 mt-1 font-mono">Commit custom event alerts, deadlines, and cycle dues on any date.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Calendar Month View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-mono text-indigo-400 uppercase tracking-widest font-bold">July 2026</span>
            <span className="text-3xs text-gray-500 font-mono">Click a date to manage event logs</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center font-mono">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-4xs text-gray-500 py-1 font-bold">{day}</div>
            ))}

            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-07-${dayNum.toString().padStart(2, '0')}`;
              const dayEvents = calendarEvents.filter(ev => ev.date === dateStr);
              const isSelected = selectedDate === dateStr;

              let highlightClass = 'bg-gray-900/60 border border-gray-950 text-gray-400 hover:bg-white/[0.03]';
              if (isSelected) {
                highlightClass = 'border border-emerald-500 bg-[#1e293b] text-white font-bold';
              } else if (dayEvents.length > 0) {
                highlightClass = 'bg-white/[0.04] border border-white/[0.06] text-gray-200 hover:bg-white/[0.08]';
              }

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square flex flex-col items-center justify-center text-xs rounded-xl cursor-pointer transition-all ${highlightClass}`}
                >
                  <span>{dayNum}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 justify-center w-full">
                      {dayEvents.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Manage events for selected date */}
        <div className="space-y-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-800/80 pt-6 lg:pt-0 lg:pl-6">
          <div className="space-y-4">
            <div>
              <span className="text-4xs font-mono text-gray-500 uppercase tracking-widest block font-bold">Selected Date</span>
              <h4 className="text-xs font-mono text-emerald-400 font-bold mt-0.5">
                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h4>
            </div>

            {/* Events list */}
            <div className="space-y-2">
              <span className="text-4xs font-mono text-gray-500 uppercase tracking-widest block font-bold">
                Scheduled Log ({calendarEvents.filter(ev => ev.date === selectedDate).length})
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {calendarEvents.filter(ev => ev.date === selectedDate).map(ev => (
                  <div key={ev.id} className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl flex justify-between items-center gap-2 hover:border-white/[0.08] transition-all">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{ev.title}</p>
                      {ev.notes && <span className="text-4xs text-gray-500 font-mono block mt-0.5">{ev.notes}</span>}
                    </div>
                    <button
                      onClick={() => handleDeleteCalendarEvent(ev.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer shrink-0"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {calendarEvents.filter(ev => ev.date === selectedDate).length === 0 && (
                  <p className="text-2xs font-mono text-gray-500 py-6 text-center italic">No scheduled flat notices for this date.</p>
                )}
              </div>
            </div>
          </div>

          {/* Add Event Form */}
          <form onSubmit={handleAddCalendarEvent} className="pt-4 border-t border-gray-800/80 space-y-2">
            <label className="text-4xs font-mono text-gray-400 uppercase tracking-widest block font-bold">Schedule Event Notice</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. WiFi Bill split / Room Cleaning"
                value={newEventText}
                onChange={e => setNewEventText(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-2xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-2xs cursor-pointer transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
