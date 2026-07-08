import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  MapPin, 
  Compass, 
  Plus, 
  Hash, 
  Lock, 
  User, 
  Smartphone, 
  Check, 
  Circle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function FlatmateMessengerTab({ activeHome, user, homes }) {
  // Primary Tabs under list: 'chats' | 'nearby' | 'friends'
  const [subTab, setSubTab] = useState('chats');
  
  // Database / LocalStorage keys
  const MESSAGES_KEY = `co_pay_messenger_messages`;
  const CHATS_KEY = `co_pay_messenger_chats`;
  const FRIENDS_KEY = `co_pay_messenger_friends`;
  const REQUESTS_KEY = `co_pay_messenger_requests`;

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  
  // User Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Group creation
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

  // Friends & Friend Requests
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  // Mock list of global users that can be searched
  const globalUserDatabase = [
    { id: 'u1', name: 'Rohit Verma', username: 'rohit_verma', isFlatmate: true },
    { id: 'u2', name: 'Aman Sharma', username: 'aman_sharma', isFlatmate: true },
    { id: 'u3', name: 'Karan Kapoor', username: 'karan_k', isFlatmate: false, distance: '0.3 km' },
    { id: 'u4', name: 'Riya Joshi', username: 'riya_j', isFlatmate: false, distance: '0.7 km' },
    { id: 'u5', name: 'Neha Sen', username: 'neha_sen', isFlatmate: false, distance: '1.2 km' },
    { id: 'u6', name: 'Sanjana Goel', username: 'sanjana_goel', isFlatmate: true },
    { id: 'u7', name: 'Raj Malhotra', username: 'raj_m', isFlatmate: false, distance: '1.8 km' },
    { id: 'u8', name: 'Kabir Thapar', username: 'kabir_t', isFlatmate: false, distance: '2.5 km' },
  ];

  // Mock nearby users
  const nearbyUsersList = [
    { id: 'u3', name: 'Karan Kapoor', username: 'karan_k', distance: '150 meters away', hasRequestSent: false },
    { id: 'u4', name: 'Riya Joshi', username: 'riya_j', distance: '400 meters away', hasRequestSent: false },
    { id: 'u5', name: 'Neha Sen', username: 'neha_sen', distance: '850 meters away', hasRequestSent: false },
    { id: 'u7', name: 'Raj Malhotra', username: 'raj_m', distance: '1.2 km away', hasRequestSent: false },
  ];

  const chatEndRef = useRef(null);

  // Initialize data
  useEffect(() => {
    if (!user) return;

    // Load Friend Requests
    const storedRequests = localStorage.getItem(REQUESTS_KEY);
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    } else {
      const initialRequests = [
        { id: 'req1', senderId: 'u3', senderName: 'Karan Kapoor', senderUsername: 'karan_k', timestamp: new Date().toISOString() }
      ];
      setRequests(initialRequests);
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(initialRequests));
    }

    // Load Friends
    const storedFriends = localStorage.getItem(FRIENDS_KEY);
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    } else {
      // Default friends are current & previous flatmates
      const defaultFriends = [
        { id: 'u1', name: 'Rohit Verma', username: 'rohit_verma', isFlatmate: true },
        { id: 'u2', name: 'Aman Sharma', username: 'aman_sharma', isFlatmate: true },
        { id: 'u6', name: 'Sanjana Goel', username: 'sanjana_goel', isFlatmate: true }
      ];
      setFriends(defaultFriends);
      localStorage.setItem(FRIENDS_KEY, JSON.stringify(defaultFriends));
    }

    // Load Chats (List of conversations)
    const storedChats = localStorage.getItem(CHATS_KEY);
    const storedMsgs = localStorage.getItem(MESSAGES_KEY);

    let currentChats = [];
    if (storedChats) {
      currentChats = JSON.parse(storedChats);
      setChats(currentChats);
    } else {
      currentChats = [
        { 
          id: 'c1', 
          name: 'Rohit Verma', 
          type: 'private', 
          members: [user.id, 'u1'],
          avatarText: 'RV',
          lastMessage: 'Let\'s split the maid bill by Friday.',
          timestamp: new Date(Date.now() - 3600000).toISOString() 
        },
        { 
          id: 'c2', 
          name: 'Flat Mate Squad', 
          type: 'group', 
          members: [user.id, 'u1', 'u2'],
          avatarText: 'SG',
          lastMessage: 'Aman: Added the groceries details.',
          timestamp: new Date(Date.now() - 172800000).toISOString() 
        }
      ];
      setChats(currentChats);
      localStorage.setItem(CHATS_KEY, JSON.stringify(currentChats));
    }

    if (storedMsgs) {
      setMessages(JSON.parse(storedMsgs));
    } else {
      const initialMsgs = {
        'c1': [
          { id: 'm1', senderId: 'u1', senderName: 'Rohit Verma', text: 'Hey, did you make the electricity payment?', timestamp: new Date(Date.now() - 7200000).toISOString() },
          { id: 'm2', senderId: user.id, senderName: user.name, text: 'Yes, just updated the shared ledger tab.', timestamp: new Date(Date.now() - 5400000).toISOString() },
          { id: 'm3', senderId: 'u1', senderName: 'Rohit Verma', text: 'Awesome. Let\'s split the maid bill by Friday.', timestamp: new Date(Date.now() - 3600000).toISOString() }
        ],
        'c2': [
          { id: 'gm1', senderId: 'u2', senderName: 'Aman Sharma', text: 'Hey guys, creating this group chat for flat updates!', timestamp: new Date(Date.now() - 259200000).toISOString() },
          { id: 'gm2', senderId: 'u1', senderName: 'Rohit Verma', text: 'Perfect, much easier to talk here than other messengers.', timestamp: new Date(Date.now() - 250000000).toISOString() },
          { id: 'gm3', senderId: 'u2', senderName: 'Aman Sharma', text: 'Aman: Added the groceries details.', timestamp: new Date(Date.now() - 172800000).toISOString() }
        ]
      };
      setMessages(initialMsgs);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialMsgs));
    }

    // Set first active chat if available
    if (currentChats.length > 0 && !activeChatId) {
      setActiveChatId(currentChats[0].id);
    }
  }, [user]);

  // Scroll active chat view to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  // Handle Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !user) return;

    const timestamp = new Date().toISOString();
    const newMsgObj = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text: newMessage.trim(),
      timestamp
    };

    // Update Message map
    const updatedMessages = {
      ...messages,
      [activeChatId]: [...(messages[activeChatId] || []), newMsgObj]
    };
    setMessages(updatedMessages);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));

    // Update last message in Chat List
    const updatedChats = chats.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: `${user.name}: ${newMessage.trim()}`,
          timestamp
        };
      }
      return c;
    });
    setChats(updatedChats);
    localStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));

    setNewMessage('');
  };

  // Search User Callback
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = globalUserDatabase.filter(u => 
      u.username.toLowerCase().includes(query.toLowerCase()) || 
      u.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Start private chat with found/selected user
  const startPrivateChat = (recipient) => {
    const existing = chats.find(c => c.type === 'private' && c.members.includes(recipient.id));
    if (existing) {
      setActiveChatId(existing.id);
      setSubTab('chats');
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    const newChatId = `chat_${Date.now()}`;
    const newChatObj = {
      id: newChatId,
      name: recipient.name,
      type: 'private',
      members: [user.id, recipient.id],
      avatarText: recipient.name.split(' ').map(n=>n[0]).join(''),
      lastMessage: 'Conversation started.',
      timestamp: new Date().toISOString()
    };

    const newChatsList = [newChatObj, ...chats];
    setChats(newChatsList);
    localStorage.setItem(CHATS_KEY, JSON.stringify(newChatsList));

    const updatedMsgs = {
      ...messages,
      [newChatId]: []
    };
    setMessages(updatedMsgs);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMsgs));

    setActiveChatId(newChatId);
    setSubTab('chats');
    setSearchQuery('');
    setSearchResults([]);
  };

  // Submit Friend Request / Connect request
  const sendFriendRequest = (targetUser) => {
    // Save sent visual state in localStorage or memory
    const reqKey = `co_pay_friend_req_sent_${targetUser.id}`;
    localStorage.setItem(reqKey, 'true');

    // Notify user
    alert(`Friend request sent to ${targetUser.name} (@${targetUser.username})!`);
    
    // Simulate updating list
    setSearchQuery('');
    setSearchResults([]);
  };

  // Accept Friend Request
  const acceptRequest = (req) => {
    // Add to Friends list
    const newFriend = {
      id: req.senderId,
      name: req.senderName,
      username: req.senderUsername,
      isFlatmate: false
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));

    // Remove from request queue
    const updatedRequests = requests.filter(r => r.id !== req.id);
    setRequests(updatedRequests);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updatedRequests));

    alert(`You are now connected with ${req.senderName}!`);
  };

  // Reject Friend Request
  const rejectRequest = (requestId) => {
    const updatedRequests = requests.filter(r => r.id !== requestId);
    setRequests(updatedRequests);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updatedRequests));
  };

  // Create Group Chat
  const handleCreateGroupChat = (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupMembers.length === 0) {
      alert('Provide a group name and choose at least one member!');
      return;
    }

    const newChatId = `chat_${Date.now()}`;
    const memberIds = [user.id, ...selectedGroupMembers];
    
    const newChatObj = {
      id: newChatId,
      name: groupName.trim(),
      type: 'group',
      members: memberIds,
      avatarText: groupName.substring(0, 2).toUpperCase(),
      lastMessage: `${user.name} created the group "${groupName.trim()}"`,
      timestamp: new Date().toISOString()
    };

    const newChatsList = [newChatObj, ...chats];
    setChats(newChatsList);
    localStorage.setItem(CHATS_KEY, JSON.stringify(newChatsList));

    const updatedMsgs = {
      ...messages,
      [newChatId]: [
        {
          id: Date.now().toString(),
          senderId: 'system',
          senderName: 'System',
          text: `Group chat created with ${memberIds.length} members.`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    setMessages(updatedMsgs);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMsgs));

    setActiveChatId(newChatId);
    setGroupName('');
    setSelectedGroupMembers([]);
    setIsCreatingGroup(false);
  };

  const toggleGroupMemberSelect = (friendId) => {
    if (selectedGroupMembers.includes(friendId)) {
      setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== friendId));
    } else {
      setSelectedGroupMembers([...selectedGroupMembers, friendId]);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="max-w-6xl mx-auto h-[78vh] flex flex-col space-y-6">
      
      {/* Tab Header Banner */}
      <div className="glass-panel p-5 rounded-2xl shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Flatmate Connections Board</h2>
            <p className="text-4xs font-mono text-gray-400 uppercase tracking-widest mt-1">
              Global User Locator & Roommate Group Messaging
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreatingGroup(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-mono px-3.5 py-1.5 rounded-full text-2xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Group Chat</span>
        </button>
      </div>

      {/* Main Messaging Container */}
      <div className="flex-1 flex gap-5 overflow-hidden">
        
        {/* Left Side Pane: Chat Sessions / Discovery / Friends */}
        <div className="w-full md:w-80 glass-panel rounded-2xl shadow-xl overflow-hidden flex flex-col shrink-0">
          
          {/* Sub Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-white/[0.04]">
            <button 
              onClick={() => setSubTab('chats')}
              className={`py-3.5 text-2xs font-sans font-bold text-center border-b-2 transition-all cursor-pointer ${
                subTab === 'chats' 
                  ? 'border-purple-500 text-white bg-purple-950/10' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Chats
            </button>
            <button 
              onClick={() => setSubTab('nearby')}
              className={`py-3.5 text-2xs font-sans font-bold text-center border-b-2 transition-all cursor-pointer ${
                subTab === 'nearby' 
                  ? 'border-purple-500 text-white bg-purple-950/10' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Nearby
            </button>
            <button 
              onClick={() => setSubTab('friends')}
              className={`py-3.5 text-2xs font-sans font-bold text-center border-b-2 transition-all cursor-pointer ${
                subTab === 'friends' 
                  ? 'border-purple-500 text-white bg-purple-950/10' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Friends ({friends.length + requests.length})
            </button>
          </div>

          {/* Tab content inside left sidebar */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            
            {subTab === 'chats' && (
              <>
                {/* Search Bar for filtering active chats or finding new users */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search globally by @username..."
                    className="w-full bg-[#090812] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-3xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all font-mono"
                  />
                </div>

                {/* Display global user search results if query typed */}
                {searchQuery.trim().length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest pl-1 font-bold">Global User Directory</p>
                    {searchResults.length === 0 ? (
                      <p className="text-[10px] text-gray-500 font-mono text-center py-2">No user matches found.</p>
                    ) : (
                      searchResults.map((usr) => (
                        <div key={usr.id} className="bg-gray-950/50 border border-gray-850 p-2.5 rounded-xl flex items-center justify-between gap-2">
                          <div>
                            <p className="text-2xs font-bold text-white leading-tight">{usr.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono">@{usr.username} {usr.isFlatmate && '• Flatmate'}</p>
                          </div>
                          
                          <button
                            onClick={() => startPrivateChat(usr)}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
                          >
                            Chat
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* Active Chats List */
                  <div className="space-y-2.5">
                    {chats.length === 0 ? (
                      <p className="text-3xs text-gray-500 font-mono text-center py-8">No current chat threads. Locate flatmates near you or use search to establish a private line.</p>
                    ) : (
                      chats.map((c) => (
                        <div 
                          key={c.id}
                          onClick={() => setActiveChatId(c.id)}
                          className={`p-3 rounded-xl flex items-center gap-3 border transition-all cursor-pointer ${
                            c.id === activeChatId 
                              ? 'bg-purple-950/20 border-purple-500/25 shadow'
                              : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-2xs uppercase shadow-md ${
                            c.type === 'group' 
                              ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white' 
                              : 'bg-gray-800 text-purple-300'
                          }`}>
                            {c.avatarText}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className="text-2xs font-sans font-bold text-white truncate">{c.name}</h4>
                              <span className="text-[9px] text-gray-500 font-mono">
                                {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 truncate leading-snug">{c.lastMessage}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}

            {subTab === 'nearby' && (
              <div className="space-y-3.5">
                <div className="bg-purple-950/15 border border-purple-500/10 p-3.5 rounded-xl flex gap-2.5 items-start">
                  <Compass className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-purple-200 leading-normal">
                    This location board tracks users logged onto the flatmates platform within 3 km of your workspace address. Connect as friends to split offline rents or borrow domestic essentials!
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Flatmates Nearby Now</p>
                  
                  {nearbyUsersList.map(usr => {
                    const isRequestSent = localStorage.getItem(`co_pay_friend_req_sent_${usr.id}`) === 'true';
                    const isAlreadyFriend = friends.some(f => f.id === usr.id);
                    
                    return (
                      <div key={usr.id} className="bg-gray-950/40 border border-gray-850 p-3 rounded-xl flex items-center justify-between gap-2.5 transition-all hover:bg-gray-950/65">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-slow"></span>
                            <span className="text-2xs font-semibold text-gray-200 truncate">{usr.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-500 font-mono">
                            <MapPin className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                            <span>{usr.distance} • @{usr.username}</span>
                          </div>
                        </div>

                        {isAlreadyFriend ? (
                          <span className="bg-gray-900 border border-gray-800 text-gray-400 font-mono text-[8px] px-2 py-0.5 rounded">Connected</span>
                        ) : isRequestSent ? (
                          <span className="bg-gray-900 text-purple-400 font-mono text-[8px] px-2 py-0.5 rounded border border-purple-500/10 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(usr)}
                            className="bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 text-purple-300 font-mono text-[8px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-0.5 shrink-0"
                          >
                            <UserPlus className="w-2.5 h-2.5" /> Connect
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {subTab === 'friends' && (
              <div className="space-y-4">
                
                {/* Incoming Invites Ledger */}
                {requests.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest pl-1 font-bold">Incoming Connect Invites</p>
                    <div className="space-y-2">
                      {requests.map(req => (
                        <div key={req.id} className="bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-2xs font-bold text-white">{req.senderName}</p>
                              <p className="text-[9px] text-gray-500 font-mono">@{req.senderUsername}</p>
                            </div>
                            <span className="text-[8px] text-[10px] text-gray-400 font-mono">Nearby invite</span>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => rejectRequest(req.id)}
                              className="bg-gray-900 border border-gray-800 text-gray-400 font-sans text-3xs font-semibold px-2 py-1 rounded cursor-pointer transition-all hover:bg-gray-800"
                            >
                              Ignore
                            </button>
                            <button
                              onClick={() => acceptRequest(req)}
                              className="bg-purple-600 hover:bg-purple-500 text-white font-sans text-3xs font-bold px-3 py-1 rounded cursor-pointer transition-all flex items-center gap-0.5"
                            >
                              <UserCheck className="w-2.5 h-2.5" /> Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Friends / Flatmate Directory */}
                <div className="space-y-2">
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pl-1">Flatmate Connect Directory</p>
                  {friends.length === 0 ? (
                    <p className="text-3xs text-gray-500 font-mono text-center py-6">Your registry is clean. Find previous or nearby flatmates globally to establish connections.</p>
                  ) : (
                    friends.map(fr => (
                      <div key={fr.id} className="bg-gray-950/30 border border-gray-850 p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all hover:bg-gray-950/50">
                        <div>
                          <p className="text-2xs font-bold text-white">{fr.name}</p>
                          <p className="text-[9px] text-gray-500 font-mono">@{fr.username} {fr.isFlatmate && '• Flatmate history'}</p>
                        </div>
                        
                        <button
                          onClick={() => startPrivateChat(fr)}
                          className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/20 text-purple-300 font-mono text-[9px] px-2.5 py-1 rounded cursor-pointer transition-all"
                        >
                          Message
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Side Pane: Chat Messages Area */}
        <div className="flex-1 glass-panel rounded-2xl shadow-xl overflow-hidden flex flex-col relative">
          
          {activeChat ? (
            <>
              {/* Chat Session Header Details */}
              <div className="p-4 border-b border-white/[0.04] bg-white/[0.01] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-950/45 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                    {activeChat.avatarText}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                      <span>{activeChat.name}</span>
                      {activeChat.type === 'group' ? (
                        <span className="bg-purple-900/40 text-purple-300 border border-purple-500/10 font-mono text-[8px] font-semibold px-2 py-0.5 rounded-full lowercase flex items-center gap-0.5">
                          <Users className="w-2 h-2" /> {activeChat.members.length} members
                        </span>
                      ) : (
                        <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 font-mono text-[8px] font-semibold px-2 py-0.5 rounded-full lowercase flex items-center gap-0.5">
                          <Circle className="w-1.5 h-1.5 fill-current" /> direct line
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono truncate max-w-sm mt-0.5">
                      {activeChat.type === 'group' 
                        ? 'Flatmates community room' 
                        : `End-to-end encrypted connection with @${globalUserDatabase.find(u => u.id === activeChat.members.find(m => m !== user?.id))?.username || activeChat.name.toLowerCase().replace(' ', '_')}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Message scroll index */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(messages[activeChat.id] || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40 space-y-2">
                    <MessageSquare className="w-10 h-10 text-purple-400" />
                    <p className="text-xs text-gray-400 font-mono">Initiated secure connection. Type below to converse.</p>
                  </div>
                ) : (
                  (messages[activeChat.id] || []).map((msg, index) => {
                    const isMe = msg.senderId === user?.id;
                    const isSystem = msg.senderId === 'system';
                    const showSenderName = index === 0 || (messages[activeChat.id][index - 1].senderId !== msg.senderId);

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <span className="bg-[#0e0c1a] border border-white/5 py-1 px-3.5 rounded-full font-mono text-[9px] text-gray-500 flex items-center gap-1.5">
                            <Lock className="w-2.5 h-2.5 text-purple-500" /> {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && showSenderName && (
                          <span className="text-[9px] font-mono text-gray-500 mb-0.5 pl-1.5 uppercase tracking-wide">
                            {msg.senderName}
                          </span>
                        )}
                        <div className={`relative px-4 py-2.5 max-w-[85%] md:max-w-[70%] text-xs shadow-md border ${
                          isMe 
                            ? 'bg-purple-600/90 text-white rounded-2xl rounded-tr-sm border-purple-500'
                            : 'bg-[#090812] text-gray-200 rounded-2xl rounded-tl-sm border-gray-800'
                        }`}>
                          <p className="leading-relaxed font-sans">{msg.text}</p>
                          <span className="text-[8px] block opacity-40 font-mono text-right mt-1.5">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-3 border-t border-white/[0.04] bg-[#040714]/30 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Write a message to ${activeChat.name}...`}
                    className="flex-1 bg-[#090812] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-600 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-900 disabled:text-gray-700 disabled:border-transparent text-white p-3 rounded-xl font-bold cursor-pointer transition-colors shrink-0 border border-purple-500"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="p-4 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl shadow">
                <MessageSquare className="w-12 h-12 animate-bounce-slow" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Select a chat window to begin</h3>
                <p className="text-3xs text-gray-500 font-mono uppercase tracking-widest mt-1">
                  Private Channels are active & encrypted
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal: New Group Creator */}
      {isCreatingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel border-purple-500/20 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4">
            
            <div>
              <h3 className="text-base font-black text-white">Create Group Workspace Chat</h3>
              <p className="text-4xs font-mono text-gray-400 uppercase tracking-widest mt-1">Community boards for flatmates</p>
            </div>

            <form onSubmit={handleCreateGroupChat} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono block uppercase">Group Room Name</label>
                <input 
                  type="text"
                  required
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. Flat 3B Expenses & Fun"
                  className="w-full bg-[#0d0a1a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Friends checklist */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono block uppercase">Add Chat Members</label>
                <div className="bg-[#0d0a1a] border border-gray-800 rounded-xl max-h-36 overflow-y-auto p-2.5 space-y-2">
                  {friends.length === 0 ? (
                    <p className="text-[10px] text-gray-600 text-center font-mono py-4">No connections to add. Connect first!</p>
                  ) : (
                    friends.map(f => {
                      const isSelected = selectedGroupMembers.includes(f.id);
                      return (
                        <div 
                          key={f.id}
                          onClick={() => toggleGroupMemberSelect(f.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-purple-950/20 border-purple-500/25'
                              : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                          }`}
                        >
                          <div>
                            <p className="text-2xs font-semibold text-white leading-none">{f.name}</p>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">@{f.username}</p>
                          </div>
                          
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected 
                              ? 'bg-purple-600 border-purple-500 text-white' 
                              : 'border-gray-700 bg-transparent'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingGroup(false);
                    setGroupName('');
                    setSelectedGroupMembers([]);
                  }}
                  className="flex-1 bg-gray-900 border border-gray-805 hover:bg-gray-800 text-gray-400 py-1.5 rounded-lg text-2xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-1.5 rounded-lg text-2xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Assemble Room
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
