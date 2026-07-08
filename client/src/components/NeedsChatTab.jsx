import React, { useState, useEffect, useRef } from 'react';
import { Send, ShoppingBag, Info, User, Trash2 } from 'lucide-react';

export default function NeedsChatTab({ activeHome, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  // Load from local storage based on active home
  useEffect(() => {
    if (!activeHome) return;
    const key = `co_pay_needs_chat_${activeHome.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      // Mock initial message
      const initial = [
        {
          id: '1',
          text: 'Welcome to the Needs Board! Tap here when you notice we are out of staples like Milk, Toilet Paper, or Butter.',
          senderId: 'system',
          senderName: 'System',
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  }, [activeHome]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeHome) return;

    const key = `co_pay_needs_chat_${activeHome.id}`;
    const newMsg = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setNewMessage('');
  };

  const handleClearChat = () => {
    if (!activeHome) return;
    if (window.confirm("Are you sure you want to clear the restocking chat history?")) {
      const key = `co_pay_needs_chat_${activeHome.id}`;
      localStorage.removeItem(key);
      setMessages([]);
    }
  };

  if (!activeHome) {
    return (
      <div className="glass-panel p-8 rounded-2xl shadow-xl max-w-xl mx-auto space-y-6 text-center">
        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl w-max mx-auto border border-indigo-500/20">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Active Space</h3>
        <p className="text-xs text-gray-400 leading-normal">
          Join or establish a flat space first to start noting down required supplies with your roommates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[75vh] flex flex-col">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Needs & Restocking</h2>
            <p className="text-4xs font-mono text-gray-400 uppercase tracking-widest mt-1">Live Notice Board • {activeHome.name}</p>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="glass-panel rounded-2xl shadow-xl flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
              <ShoppingBag className="w-12 h-12 text-gray-600" />
              <p className="text-xs text-gray-500 font-mono">No items requested yet.</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const isSystem = msg.senderId === 'system';
            const showHeader = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-xl text-3xs font-mono text-gray-400 flex items-center justify-center max-w-md text-center">
                    <Info className="w-3.5 h-3.5 inline mr-1.5 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showHeader && (
                  <span className="text-4xs font-mono text-gray-500 mb-1 px-1 uppercase tracking-wider flex items-center gap-1">
                    {!isMe && <User className="w-2.5 h-2.5" />}
                    {isMe ? 'You' : msg.senderName} 
                  </span>
                )}
                
                <div className={`relative px-4 py-2.5 max-w-[80%] md:max-w-[70%] text-xs shadow-md ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm border border-indigo-500' 
                    : 'glass-panel text-gray-200 rounded-2xl rounded-tl-sm border border-gray-700'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  
                  {/* Time bubble */}
                  <span className={`text-[9px] block mt-1.5 opacity-60 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-gray-800 bg-gray-950/40">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="e.g. We're completely out of milk and dish soap..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
