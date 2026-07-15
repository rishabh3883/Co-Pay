import React, { useState, useEffect, useMemo, useRef } from 'react';
import useCanvasAnimation from '../hooks/useCanvasAnimation';
import { API_BASE, buildApiFetcher } from '../api/apiClient';
import { calculateSettlementsData } from '../utils/settlementUtils';
import confetti from 'canvas-confetti';

export default function useAppController() {
  const [theme, setTheme] = useState(localStorage.getItem('copay_theme') || 'light');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('copay_theme', nextTheme);
  };
  const canvasRef = useRef(null);
  useCanvasAnimation(canvasRef);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - width / 2) / 100;
      mouseY = (e.clientY - height / 2) / 100;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const points = [];
    const rows = 20;
    const cols = 20;
    const spacing = 45;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({
          x: (c - cols / 2) * spacing,
          y: 100,
          z: (r - rows / 2) * spacing,
          baseY: 100,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    let angleX = 0.4;
    let angleY = 0.2;
    const focalLength = 400;

    const animate = (time) => {
      if (!canvas) return;
      ctx.clearRect(0, 0, width, height);

      angleY += (mouseX * 0.05 - angleY) * 0.1;
      angleX += (mouseY * 0.05 + 0.4 - angleX) * 0.1;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = points.map((p) => {
        const wave = Math.sin(time * 0.0015 + p.phase + (p.x * 0.01) + (p.z * 0.01)) * 35;
        const currentY = p.baseY + wave;

        let rx = p.x * cosY - p.z * sinY;
        let rz = p.z * cosY + p.x * sinY;

        let ry = currentY * cosX - rz * sinX;
        rz = rz * cosX + currentY * sinX;

        const scale = focalLength / (focalLength + rz + 300);
        const screenX = rx * scale + width / 2;
        const screenY = ry * scale + height / 2;

        return { x: screenX, y: screenY, z: rz, scale };
      });

      ctx.lineWidth = 0.65;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const p1 = projected[idx];

          if (c < cols - 1) {
            const p2 = projected[idx + 1];
            const opacity = Math.min(Math.max(p1.scale * 0.18, 0.01), 0.28);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          if (r < rows - 1) {
            const p2 = projected[idx + cols];
            const opacity = Math.min(Math.max(p1.scale * 0.18, 0.01), 0.28);
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          if (p1.scale > 0.4) {
            const opacity = Math.min(Math.max(p1.scale * 0.22, 0.02), 0.45);
            ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 1.2 * p1.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Authentication & Session
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState(null);
  const [showBrief, setShowBrief] = useState(true);

  // Application States
  const [homes, setHomes] = useState([]);
  const [activeHomeId, setActiveHomeId] = useState('');
  const [activeHome, setActiveHome] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState({ totalSpent: 0, share: 0, memberContributions: [], transfers: [] });
  const [aiInsights, setAiInsights] = useState({ insights: [], predictedNextMonth: 0, healthScore: 85 });
  
  // Modals / Input Forms
  const [homeForm, setHomeForm] = useState({ name: '', monthlyBudget: '15000' });
  const [joinCode, setJoinCode] = useState('');
  const [expenseForm, setExpenseForm] = useState({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '', needsApproval: false, billImage: '' });
  const [personalExpenseForm, setPersonalExpenseForm] = useState({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [userBudgetInput, setUserBudgetInput] = useState('');
  const [homeBudgetInput, setHomeBudgetInput] = useState('');

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [calcSubTab, setCalcSubTab] = useState('daily');
  const [calcTab, setCalcTab] = useState('shared');

  // UI Tabs / Filter States
  const [activeTab, setActiveTab] = useState('personal');
  const [sharedFilter, setSharedFilter] = useState({ search: '', category: 'All', member: 'All' });
  const [personalFilter, setPersonalFilter] = useState({ search: '', category: 'All' });
  const [showQR, setShowQR] = useState(false);

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-07-05');
  const [newEventText, setNewEventText] = useState('');

  // Profile properties
  const [profilePhone, setProfilePhone] = useState('');
  const [profileUpi, setProfileUpi] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Reminders states
  const [reminders, setReminders] = useState([]);
  const [isSendingReminderId, setIsSendingReminderId] = useState(null);

  // Settlements payments states
  const [settlementPayments, setSettlementPayments] = useState([]);
  const [selectedSettlementPayee, setSelectedSettlementPayee] = useState(null);
  const [settlementRefId, setSettlementRefId] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isVerifyingPaymentId, setIsVerifyingPaymentId] = useState(null);

  // AI Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState(null);
  const [voiceError, setVoiceError] = useState(null);

  useEffect(() => {
    if (!activeHomeId) return;
    const saved = JSON.parse(localStorage.getItem(`copay_calendar_events_${activeHomeId}`) || '[]');
    if (saved.length === 0) {
      const defaults = [
        { id: 'def-1', date: '2026-07-05', title: 'Rent Due Payment', notes: 'Avg. expected amount: ₹15,000' },
        { id: 'def-2', date: '2026-07-15', title: 'WiFi Broadband Split', notes: 'Avg. expected amount: ₹1,200' },
        { id: 'def-3', date: '2026-07-28', title: 'Cleaning Maid Salary', notes: 'Avg. expected amount: ₹3,000' }
      ];
      localStorage.setItem(`copay_calendar_events_${activeHomeId}`, JSON.stringify(defaults));
      setCalendarEvents(defaults);
    } else {
      setCalendarEvents(saved);
    }
  }, [activeHomeId]);

  const [recurringTemplates, setRecurringTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({ label: '', title: '', category: '', amount: '', emoji: '💰' });

  useEffect(() => {
    if (!activeHomeId) {
      setRecurringTemplates([]);
      return;
    }
    const stored = localStorage.getItem(`copay_recurring_templates_${activeHomeId}`);
    if (stored) {
      setRecurringTemplates(JSON.parse(stored));
    } else {
      const defaults = [
        { id: 't-1', title: 'House Rent Charge', category: 'Rent', amount: 15000, emoji: '🏢', label: 'House Rent' },
        { id: 't-2', title: 'WiFi Router Bill', category: 'Internet', amount: 1200, emoji: '🌐', label: 'Fiber Internet' },
        { id: 't-3', title: 'Maid/Cleaning Salary', category: 'Maid', amount: 3000, emoji: '🧹', label: 'House Cleaning Maid' }
      ];
      localStorage.setItem(`copay_recurring_templates_${activeHomeId}`, JSON.stringify(defaults));
      setRecurringTemplates(defaults);
    }
  }, [activeHomeId]);

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!templateForm.label || !templateForm.amount || !activeHomeId) return;

    let updated;
    if (editingTemplate) {
      updated = recurringTemplates.map(t => t.id === editingTemplate.id ? {
        ...t,
        label: templateForm.label,
        title: templateForm.title || templateForm.label,
        category: templateForm.category || 'Shared',
        amount: Number(templateForm.amount),
        emoji: templateForm.emoji || '💰'
      } : t);
      setEditingTemplate(null);
    } else {
      const newT = {
        id: 'temp-' + Math.random().toString(36).substring(2, 9),
        label: templateForm.label,
        title: templateForm.title || templateForm.label,
        category: templateForm.category || 'Shared',
        amount: Number(templateForm.amount),
        emoji: templateForm.emoji || '💰'
      };
      updated = [...recurringTemplates, newT];
      setIsAddingTemplate(false);
    }

    setRecurringTemplates(updated);
    localStorage.setItem(`copay_recurring_templates_${activeHomeId}`, JSON.stringify(updated));
    setTemplateForm({ label: '', title: '', category: '', amount: '', emoji: '💰' });
    confetti({ particleCount: 30, colors: ['#8B5CF6', '#10B981'] });
  };

  const handleDeleteTemplate = (id) => {
    if (!window.confirm('Delete this recurring bill template?')) return;
    const updated = recurringTemplates.filter(t => t.id !== id);
    setRecurringTemplates(updated);
    localStorage.setItem(`copay_recurring_templates_${activeHomeId}`, JSON.stringify(updated));
  };

  const startEditTemplate = (t) => {
    setEditingTemplate(t);
    setIsAddingTemplate(false);
    setTemplateForm({
      label: t.label,
      title: t.title,
      category: t.category,
      amount: t.amount.toString(),
      emoji: t.emoji
    });
  };

  const startAddTemplate = () => {
    setIsAddingTemplate(true);
    setEditingTemplate(null);
    setTemplateForm({ label: '', title: '', category: '', amount: '', emoji: '💰' });
  };

  // Offline / Hybrid mode warning
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Fetch helper with auth header
  const apiFetch = buildApiFetcher(token, setIsBackendConnected);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setHomes([]);
      setActiveHomeId('');
      setActiveHome(null);
      setExpenses([]);
      return;
    }
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const userProfile = await apiFetch('/auth/me');
      setUser(userProfile);
      setUserBudgetInput(userProfile.personalBudget.toString());
      setProfilePhone(userProfile.phone || '');
      setProfileUpi(userProfile.upiId || '');

      const userHomes = await apiFetch('/homes');
      setHomes(userHomes);

      if (userHomes.length > 0) {
        const savedHomeId = localStorage.getItem('lastHomeId');
        const defaultHome = userHomes.find(h => h.id === savedHomeId) || userHomes[0];
        setActiveHomeId(defaultHome.id);
      }
    } catch (err) {
      loadOfflineFallback();
    }
  };

  const loadOfflineFallback = () => {
    setIsBackendConnected(false);
    const mockUser = {
      id: 'offline-user-1',
      name: localStorage.getItem('mockName') || 'Curious Roommate',
      email: 'offline@copay.io',
      personalBudget: Number(localStorage.getItem('mockPersonalBudget') || '10000'),
      phone: localStorage.getItem('mockPhone') || '',
      upiId: localStorage.getItem('mockUpiId') || '',
      personalExpenses: JSON.parse(localStorage.getItem('mockPersonalExpenses') || '[]'),
      streaks: 4,
      badges: ['Early Payer', 'Budget Master']
    };
    setUser(mockUser);
    setUserBudgetInput(mockUser.personalBudget.toString());
    setProfilePhone(mockUser.phone);
    setProfileUpi(mockUser.upiId);

    const mockHomes = JSON.parse(localStorage.getItem('mockHomes') || '[]');
    if (mockHomes.length === 0) {
      const defaultHome = {
        id: 'offline-home-1',
        name: 'Co-Living Flat 4B',
        inviteCode: 'COPLAY',
        adminId: 'offline-user-1',
        monthlyBudget: 25000,
        members: [
          { id: 'offline-user-1', name: mockUser.name, email: mockUser.email, streaks: 4, badges: ['Early Payer'] },
          { id: 'offline-user-2', name: 'Aman Sharma', email: 'aman@copay.io', streaks: 7, badges: ['Saver'] },
          { id: 'offline-user-3', name: 'Rohit Verma', email: 'rohit@copay.io', streaks: 2, badges: ['Responsible Roommate'] }
        ]
      };
      mockHomes.push(defaultHome);
      localStorage.setItem('mockHomes', JSON.stringify(mockHomes));
    }
    setHomes(mockHomes);

    const savedHomeId = localStorage.getItem('lastHomeId');
    const active = mockHomes.find(h => h.id === savedHomeId) || mockHomes[0];
    setActiveHomeId(active.id);
  };

  useEffect(() => {
    if (!activeHomeId) return;
    localStorage.setItem('lastHomeId', activeHomeId);
    
    if (isBackendConnected) {
      fetchHomeData(activeHomeId);
    } else {
      loadOfflineHomeData(activeHomeId);
    }
  }, [activeHomeId, isBackendConnected]);

  const fetchHomeData = async (homeId) => {
    try {
      const homeDetails = await apiFetch(`/homes/${homeId}`);
      setActiveHome(homeDetails);
      setHomeBudgetInput(homeDetails.monthlyBudget.toString());

      const ledger = await apiFetch(`/expenses/${homeId}`);
      setExpenses(ledger);

      const splits = await apiFetch(`/expenses/${homeId}/settlement`);
      setSettlement(splits);

      const insightsData = await apiFetch(`/ai/${homeId}`);
      setAiInsights(insightsData);

      const remindersData = await apiFetch(`/reminders/${homeId}`);
      setReminders(remindersData);

      const paymentsData = await apiFetch(`/settlements/${homeId}`);
      setSettlementPayments(paymentsData);
    } catch (err) {
      loadOfflineHomeData(homeId);
    }
  };

  const loadOfflineHomeData = (homeId) => {
    const mockHomes = JSON.parse(localStorage.getItem('mockHomes') || '[]');
    const home = mockHomes.find(h => h.id === homeId);
    if (!home) return;

    setActiveHome(home);
    setHomeBudgetInput(home.monthlyBudget.toString());

    let mockExpenses = JSON.parse(localStorage.getItem(`mockExpenses_${homeId}`) || '[]');
    if (mockExpenses.length === 0) {
      mockExpenses = [
        { id: 'e1', homeId, title: 'House Rent', category: 'Rent', amount: 15000, paidBy: 'offline-user-3', date: new Date().toISOString().split('T')[0], status: 'approved', approvals: [] },
        { id: 'e2', homeId, title: 'High-speed Fiber WiFi', category: 'Internet', amount: 1200, paidBy: 'offline-user-1', date: new Date().toISOString().split('T')[0], status: 'approved', approvals: [] },
        { id: 'e3', homeId, title: 'Electricity Bill May', category: 'Electricity', amount: 2800, paidBy: 'offline-user-2', date: new Date().toISOString().split('T')[0], status: 'approved', approvals: [] },
        { id: 'e4', homeId, title: 'Organic Milk & Groceries', category: 'Grocery', amount: 1400, paidBy: 'offline-user-1', date: new Date().toISOString().split('T')[0], status: 'approved', approvals: [] },
        { id: 'e5', homeId, title: 'Geyser Repair Service', category: 'Repairs', amount: 800, paidBy: 'offline-user-1', date: new Date().toISOString().split('T')[0], status: 'pending', approvals: ['offline-user-1'] }
      ];
      localStorage.setItem(`mockExpenses_${homeId}`, JSON.stringify(mockExpenses));
    }
    setExpenses(mockExpenses);
    calculateOfflineSettlement(home, mockExpenses);

    const offlineReminders = JSON.parse(localStorage.getItem(`mockReminders_${homeId}`) || '[]');
    setReminders(offlineReminders);

    const offlinePayments = JSON.parse(localStorage.getItem(`mockSettlements_${homeId}`) || '[]');
    setSettlementPayments(offlinePayments);
  };

  const calculateOfflineSettlement = (home, list) => {
    const data = calculateSettlementsData(home, list);
    setSettlement(data.settlement);
    setAiInsights(data.insights);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (isRegistering) {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email, password: authForm.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      setAuthError(err.message);
      if (err.message.includes('Failed to fetch')) {
        localStorage.setItem('token', 'offline-token-key');
        localStorage.setItem('mockName', authForm.name || 'Lovely Novelist');
        setToken('offline-token-key');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastHomeId');
    setToken(null);
    setUser(null);
    confetti({ particleCount: 50, spread: 40 });
  };

  const handleCreateHome = async (e) => {
    e.preventDefault();
    if (!homeForm.name) return;
    try {
      if (isBackendConnected) {
        const newHome = await apiFetch('/homes', {
          method: 'POST',
          body: JSON.stringify({ name: homeForm.name, monthlyBudget: Number(homeForm.monthlyBudget) })
        });
        setHomes([...homes, newHome]);
        setActiveHomeId(newHome.id);
      } else {
        const newHome = {
          id: 'home-' + Math.random().toString(36).substring(2, 9),
          name: homeForm.name,
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          adminId: 'offline-user-1',
          monthlyBudget: Number(homeForm.monthlyBudget),
          members: [
            { id: 'offline-user-1', name: user.name, email: user.email, streaks: 4, badges: ['Early Payer'] }
          ]
        };
        const updated = [...homes, newHome];
        setHomes(updated);
        localStorage.setItem('mockHomes', JSON.stringify(updated));
        setActiveHomeId(newHome.id);
      }
      setHomeForm({ name: '', monthlyBudget: '15000' });
      confetti({ particleCount: 100, spread: 60 });
    } catch (err) {
      alert('Error creating workspace');
    }
  };

  const handleJoinHome = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    try {
      if (isBackendConnected) {
        const joinedHome = await apiFetch('/homes/join', {
          method: 'POST',
          body: JSON.stringify({ inviteCode: joinCode })
        });
        setHomes([...homes, joinedHome]);
        setActiveHomeId(joinedHome.id);
      } else {
        alert('Cannot join workspaces in Offline Sandbox Mode. Create a workspace instead!');
      }
      setJoinCode('');
      confetti({ particleCount: 120, colors: ['#10B981', '#34D399'] });
    } catch (err) {
      alert(err.message || 'Invalid invite code or already joined');
    }
  };

  const handleAddSharedExpense = async (e) => {
    e.preventDefault();
    const { title, category, amount, date, notes, needsApproval, billImage } = expenseForm;
    if (!title || !amount) return;

    try {
      if (editingExpenseId) {
        // Edit mode execution
        if (isBackendConnected) {
          await apiFetch(`/expenses/${editingExpenseId}`, {
            method: 'PUT',
            body: JSON.stringify({ title, category, amount: Number(amount), date, notes })
          });
          fetchHomeData(activeHomeId);
          loadData();
        } else {
          // Offline mock update
          const currentLocal = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
          const idx = currentLocal.findIndex(x => x.id === editingExpenseId);
          if (idx !== -1) {
            currentLocal[idx] = { ...currentLocal[idx], title, category, amount: Number(amount), date, notes };
            localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(currentLocal));
            loadOfflineHomeData(activeHomeId);
          }
        }
        setEditingExpenseId(null);
      } else {
        // Create mode execution
        if (isBackendConnected) {
          // Post to shared ledger database
          await apiFetch(`/expenses/${activeHomeId}`, {
            method: 'POST',
            body: JSON.stringify({ title, category, amount: Number(amount), date, notes, needsApproval, billImage })
          });

          // Auto-sync: Post matching personal expense record
          await apiFetch('/auth/personal-expense', {
            method: 'POST',
            body: JSON.stringify({ 
              title: `[Shared] ${title}`, 
              category: category || 'Shared', 
              amount: Number(amount), 
              date, 
              notes: notes || 'Synced from shared ledger.' 
            })
          });

          fetchHomeData(activeHomeId);
          loadData();
        } else {
          // Post offline shared mock
          const newExpense = {
            id: 'expense-' + Math.random().toString(36).substring(2, 9),
            homeId: activeHomeId,
            title,
            category,
            amount: Number(amount),
            paidBy: 'offline-user-1',
            date,
            notes,
            billImage,
            status: needsApproval ? 'pending' : 'approved',
            approvals: needsApproval ? ['offline-user-1'] : []
          };
          const currentLocal = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
          currentLocal.push(newExpense);
          localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(currentLocal));
          loadOfflineHomeData(activeHomeId);

          // Auto-sync offline personal mock
          const newPersonalExpense = {
            id: 'p-' + Math.random().toString(36).substring(2, 9),
            title: `[Shared] ${title}`,
            category: category || 'Shared',
            amount: Number(amount),
            date,
            notes: notes || 'Synced from shared ledger.'
          };
          const currentPersonalLocal = JSON.parse(localStorage.getItem('mockPersonalExpenses') || '[]');
          currentPersonalLocal.push(newPersonalExpense);
          localStorage.setItem('mockPersonalExpenses', JSON.stringify(currentPersonalLocal));
          loadOfflineFallback();
        }
      }

      setExpenseForm({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '', needsApproval: false, billImage: '' });
      confetti({ particleCount: 60, colors: ['#6366F1', '#8B5CF6'] });
    } catch (err) {
      alert('Error saving expense record');
    }
  };

  const handleDeleteSharedExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this shared expense?')) return;
    try {
      if (isBackendConnected) {
        await apiFetch(`/expenses/${expenseId}`, {
          method: 'DELETE'
        });
        fetchHomeData(activeHomeId);
        loadData();
      } else {
        const currentLocal = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
        const filtered = currentLocal.filter(x => x.id !== expenseId);
        localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(filtered));
        loadOfflineHomeData(activeHomeId);
      }
      confetti({ particleCount: 50, colors: ['#EF4444', '#F3F4F6'] });
    } catch (err) {
      alert('Error deleting shared expense');
    }
  };

  const handleAddCalendarEvent = (e) => {
    e.preventDefault();
    if (!newEventText.trim() || !activeHomeId) return;

    const newEvent = {
      id: 'event-' + Math.random().toString(36).substring(2, 9),
      date: selectedDate,
      title: newEventText.trim(),
      notes: `Logged by ${user?.name || 'Roommate'}`
    };

    const updated = [...calendarEvents, newEvent];
    setCalendarEvents(updated);
    localStorage.setItem(`copay_calendar_events_${activeHomeId}`, JSON.stringify(updated));
    setNewEventText('');
    confetti({ particleCount: 30, colors: ['#6366F1', '#10B981'] });
  };

  const handleDeleteCalendarEvent = (eventId) => {
    if (!activeHomeId) return;
    const updated = calendarEvents.filter(ev => ev.id !== eventId);
    setCalendarEvents(updated);
    localStorage.setItem(`copay_calendar_events_${activeHomeId}`, JSON.stringify(updated));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      if (isBackendConnected) {
        const res = await apiFetch('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ phone: profilePhone, upiId: profileUpi })
        });
        setUser(prev => ({ ...prev, phone: res.phone, upiId: res.upiId }));
      } else {
        localStorage.setItem('mockPhone', profilePhone);
        localStorage.setItem('mockUpiId', profileUpi);
        setUser(prev => ({ ...prev, phone: profilePhone, upiId: profileUpi }));
      }
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendReminder = async (transfer) => {
    setIsSendingReminderId(transfer.fromId);
    try {
      if (isBackendConnected) {
        const res = await apiFetch(`/reminders/${activeHomeId}/send`, {
          method: 'POST',
          body: JSON.stringify({
            memberId: transfer.fromId,
            amount: transfer.amount,
            title: 'Shared split dues',
            dueDate: '10th of this month'
          })
        });
        const updatedReminders = await apiFetch(`/reminders/${activeHomeId}`);
        setReminders(updatedReminders);
        if (res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank');
        }
      } else {
        const mockMsg = `Hi ${transfer.fromName || 'Roommate'} 👋\nYour contribution of *₹${transfer.amount}* for *Shared split dues* is still pending.\nPlease complete your payment to avoid delays.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(mockMsg)}`, '_blank');

        const newReminder = {
          id: 'rem-' + Math.random().toString(36).substring(2, 9),
          homeId: activeHomeId,
          recipient: transfer.fromName || 'Roommate',
          phone: 'Offline Simulator',
          dateTime: new Date().toISOString(),
          expenseTitle: 'Shared split dues',
          amount: transfer.amount,
          deliveryStatus: 'Sent'
        };
        const local = JSON.parse(localStorage.getItem(`mockReminders_${activeHomeId}`) || '[]');
        local.push(newReminder);
        localStorage.setItem(`mockReminders_${activeHomeId}`, JSON.stringify(local));
        setReminders(local);
      }
    } catch (err) {
      alert('Error sending reminder: ' + err.message);
    } finally {
      setIsSendingReminderId(null);
    }
  };

  const handleSubmitSettlementPayment = async (e) => {
    e.preventDefault();
    if (!selectedSettlementPayee) return;
    setIsSubmittingPayment(true);
    try {
      if (isBackendConnected) {
        await apiFetch(`/settlements/${activeHomeId}/pay`, {
          method: 'POST',
          body: JSON.stringify({
            receiverId: selectedSettlementPayee.toId,
            amount: selectedSettlementPayee.amount,
            refId: settlementRefId
          })
        });
        const updated = await apiFetch(`/settlements/${activeHomeId}`);
        setSettlementPayments(updated);
      } else {
        const newPayment = {
          id: 'pay-' + Math.random().toString(36).substring(2, 9),
          homeId: activeHomeId,
          senderId: user.id,
          senderName: user.name,
          receiverId: selectedSettlementPayee.toId,
          receiverName: selectedSettlementPayee.toName,
          amount: selectedSettlementPayee.amount,
          date: new Date().toISOString(),
          refId: settlementRefId,
          status: 'Pending'
        };
        const local = JSON.parse(localStorage.getItem(`mockSettlements_${activeHomeId}`) || '[]');
        local.push(newPayment);
        localStorage.setItem(`mockSettlements_${activeHomeId}`, JSON.stringify(local));
        setSettlementPayments(local);
      }
      alert('Payment submitted! Notify your roommate to verify it.');
      setSelectedSettlementPayee(null);
      setSettlementRefId('');
    } catch (err) {
      alert('Payment submission failed: ' + err.message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleVerifySettlementPayment = async (paymentId) => {
    setIsVerifyingPaymentId(paymentId);
    try {
      if (isBackendConnected) {
        await apiFetch(`/settlements/${paymentId}/verify`, {
          method: 'POST'
        });
        await fetchHomeData(activeHomeId);
      } else {
        const local = JSON.parse(localStorage.getItem(`mockSettlements_${activeHomeId}`) || '[]');
        const index = local.findIndex(p => p.id === paymentId);
        if (index !== -1) {
          local[index].status = 'Verified';
          localStorage.setItem(`mockSettlements_${activeHomeId}`, JSON.stringify(local));
          setSettlementPayments(local);

          const mockExpenses = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
          const newExp = {
            id: 'mock-settle-exp-' + Math.random().toString(36).substring(2, 9),
            homeId: activeHomeId,
            title: `UPI Settlement: ${local[index].senderName} paid ${local[index].receiverName}`,
            category: 'Settlement',
            amount: local[index].amount,
            paidBy: local[index].senderId,
            date: new Date().toISOString().split('T')[0],
            notes: `Verified Settlement via UPI (Ref: ${local[index].refId || 'N/A'}).`,
            status: 'approved',
            approvals: []
          };
          mockExpenses.push(newExp);
          localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(mockExpenses));
          setExpenses(mockExpenses);
          loadOfflineHomeData(activeHomeId);
        }
      }
      alert('Payment verified & balances updated successfully!');
    } catch (err) {
      alert('Verification failed: ' + err.message);
    } finally {
      setIsVerifyingPaymentId(null);
    }
  };

  const handleStartVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setVoiceError(null);

    recognition.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      try {
        if (isBackendConnected) {
          const parsed = await apiFetch('/ai/voice-parse', {
            method: 'POST',
            body: JSON.stringify({ text: speechText, homeId: activeHomeId })
          });
          setVoiceDraft(parsed);
        } else {
          const cleanText = speechText.toLowerCase();
          
          let amount = 0;
          const amtRegex = /(?:rs\.?|₹|rupees?|amount\sof|for)?\s*(\d+(?:\.\d{1,2})?)/i;
          const match = speechText.match(amtRegex);
          if (match) amount = Number(match[1]);

          let category = 'Shared';
          if (cleanText.match(/grocer|food|vegetable|milk|bread|egg|snack|restaurant/i)) category = 'Grocery';
          else if (cleanText.match(/rent|house|flat/i)) category = 'Rent';
          else if (cleanText.match(/wifi|internet|broadband/i)) category = 'Internet';
          else if (cleanText.match(/maid|cleaner/i)) category = 'Maid';
          else if (cleanText.match(/petrol|travel|uber|cab|auto|flight/i)) category = 'Travel';
          else if (cleanText.match(/elect|bill|power/i)) category = 'Electricity';

          let isShared = false;
          if (cleanText.match(/split|among|shared|everyone|us|group/i)) {
            isShared = true;
          }

          let finalPaidBy = user.id;
          let finalPaidByName = user.name;
          if (activeHome?.members) {
            for (const m of activeHome.members) {
              if (cleanText.includes(m.name.toLowerCase())) {
                 if (!cleanText.match(/split with/i)) { 
                   finalPaidBy = m.id;
                   finalPaidByName = m.name;
                   break;
                 }
              }
            }
          }

          let date = new Date().toISOString().split('T')[0];
          if (cleanText.includes('yesterday')) {
             date = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          }

          let titleCand = speechText
            .replace(/(?:rs\.?|₹|rupees?|\b\d+\b)/gi, '')
            .replace(/\b(add|record|split|spent|paid|for|yesterday|today|bought|purchased|rupee|rupees)\b/gi, '')
            .replace(new RegExp(`\\b${finalPaidByName}\\b`, 'gi'), '')
            .replace(/\b(among us|with everyone|with group|dollars|bucks)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          titleCand = titleCand.replace(/^(by|on|in|at)\s+/i, '').replace(/\s+(by|on|in|at)$/i, '').trim();

          let title = titleCand.length > 2 
            ? titleCand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
            : `${category} Bill`;

          setVoiceDraft({
            title,
            amount,
            category,
            date,
            paidBy: finalPaidBy,
            paidByUserName: finalPaidByName,
            isShared,
            notes: `Voice input: "${speechText}"`
          });
        }
      } catch (err) {
        setVoiceError('Failed to parse speech: ' + err.message);
      } finally {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setVoiceError('Speech recognition error: ' + event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCommitVoiceDraft = async () => {
    if (!voiceDraft) return;
    try {
      if (voiceDraft.isShared) {
        if (isBackendConnected) {
          await apiFetch(`/expenses/${activeHomeId}`, {
            method: 'POST',
            body: JSON.stringify({
              title: voiceDraft.title,
              category: voiceDraft.category,
              amount: voiceDraft.amount,
              date: voiceDraft.date,
              notes: voiceDraft.notes,
              needsApproval: false
            })
          });
          await fetchHomeData(activeHomeId);
        } else {
          const newExp = {
            id: 'mock-exp-' + Math.random().toString(36).substring(2, 9),
            homeId: activeHomeId,
            title: voiceDraft.title,
            category: voiceDraft.category,
            amount: voiceDraft.amount,
            paidBy: voiceDraft.paidBy,
            date: voiceDraft.date,
            notes: voiceDraft.notes,
            status: 'approved',
            approvals: []
          };
          const mockExpenses = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
          mockExpenses.push(newExp);
          localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(mockExpenses));
          setExpenses(mockExpenses);
          loadOfflineHomeData(activeHomeId);
        }
      } else {
        if (isBackendConnected) {
          await apiFetch('/auth/personal-expense', {
            method: 'POST',
            body: JSON.stringify({
              title: voiceDraft.title,
              category: voiceDraft.category,
              amount: voiceDraft.amount,
              date: voiceDraft.date,
              notes: voiceDraft.notes
            })
          });
          const userProfile = await apiFetch('/auth/me');
          setUser(userProfile);
        } else {
          const newExp = {
            id: 'mock-p-exp-' + Math.random().toString(36).substring(2, 9),
            title: voiceDraft.title,
            category: voiceDraft.category,
            amount: voiceDraft.amount,
            date: voiceDraft.date,
            notes: voiceDraft.notes
          };
          const mockP = JSON.parse(localStorage.getItem('mockPersonalExpenses') || '[]');
          mockP.push(newExp);
          localStorage.setItem('mockPersonalExpenses', JSON.stringify(mockP));
          setUser(prev => ({ ...prev, personalExpenses: mockP }));
        }
      }
      alert('Expense committed successfully!');
      setVoiceDraft(null);
    } catch (err) {
      alert('Failed to commit expense: ' + err.message);
    }
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      if (isBackendConnected) {
        await apiFetch(`/expenses/${expenseId}/approve`, { method: 'POST' });
        fetchHomeData(activeHomeId);
      } else {
        const currentLocal = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
        const index = currentLocal.findIndex(x => x.id === expenseId);
        if (index !== -1) {
          const exp = currentLocal[index];
          if (!exp.approvals.includes('offline-user-1')) {
            exp.approvals.push('offline-user-1');
            if (exp.approvals.length >= 2 || activeHome.members.length <= 1) {
              exp.status = 'approved';
            }
          }
          localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(currentLocal));
          loadOfflineHomeData(activeHomeId);
        }
      }
      confetti({ particleCount: 40 });
    } catch (err) {
      alert('Approval rejected');
    }
  };

  const handleAddPersonalExpense = async (e) => {
    e.preventDefault();
    const { title, category, amount, date, notes } = personalExpenseForm;
    if (!title || !amount) return;

    try {
      if (isBackendConnected) {
        await apiFetch('/auth/personal-expense', {
          method: 'POST',
          body: JSON.stringify({ title, category, amount: Number(amount), date, notes })
        });
        loadData();
      } else {
        const newExpense = {
          id: 'p-' + Math.random().toString(36).substring(2, 9),
          title,
          category,
          amount: Number(amount),
          date,
          notes
        };
        const currentLocal = JSON.parse(localStorage.getItem('mockPersonalExpenses') || '[]');
        currentLocal.push(newExpense);
        localStorage.setItem('mockPersonalExpenses', JSON.stringify(currentLocal));
        loadOfflineFallback();
      }
      setPersonalExpenseForm({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      confetti({ particleCount: 80, colors: ['#EC4899', '#F43F5E'] });
    } catch (err) {
      alert('Error recording personal expense');
    }
  };

  const handleDeletePersonalExpense = async (expenseId) => {
    try {
      if (isBackendConnected) {
        await apiFetch(`/auth/personal-expense/${expenseId}`, { method: 'DELETE' });
        loadData();
      } else {
        const currentLocal = JSON.parse(localStorage.getItem('mockPersonalExpenses') || '[]');
        const filtered = currentLocal.filter(x => x.id !== expenseId);
        localStorage.setItem('mockPersonalExpenses', JSON.stringify(filtered));
        loadOfflineFallback();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleUpdatePersonalBudget = async (e) => {
    e.preventDefault();
    const parsed = Number(userBudgetInput);
    if (isNaN(parsed) || parsed < 0) return;
    try {
      if (isBackendConnected) {
        await apiFetch('/auth/budget', {
          method: 'PUT',
          body: JSON.stringify({ personalBudget: parsed })
        });
        loadData();
      } else {
        localStorage.setItem('mockPersonalBudget', parsed.toString());
        loadOfflineFallback();
      }
      alert('Personal budget limit configured!');
    } catch (err) {
      alert('Failed to configure budget');
    }
  };

  const handleUpdateHomeBudget = async (e) => {
    e.preventDefault();
    const parsed = Number(homeBudgetInput);
    if (isNaN(parsed) || parsed < 0 || !activeHomeId) return;
    try {
      if (isBackendConnected) {
        await apiFetch(`/homes/${activeHomeId}/budget`, {
          method: 'PUT',
          body: JSON.stringify({ monthlyBudget: parsed })
        });
        fetchHomeData(activeHomeId);
      } else {
        const mockHomes = JSON.parse(localStorage.getItem('mockHomes') || '[]');
        const idx = mockHomes.findIndex(h => h.id === activeHomeId);
        if (idx !== -1) {
          mockHomes[idx].monthlyBudget = parsed;
          localStorage.setItem('mockHomes', JSON.stringify(mockHomes));
          loadOfflineHomeData(activeHomeId);
        }
      }
      alert('Flat/Home workspace monthly budget updated!');
    } catch (err) {
      alert('Only the workspace creator can modify the group budget limit.');
    }
  };

  const handleDirectSettle = async (fromId, toId, amount) => {
    if (!window.confirm(`Confirm that you have transferred ₹${amount} and want to settle this debt?`)) return;
    try {
      if (isBackendConnected) {
        await apiFetch(`/expenses/${activeHomeId}/settle-all`, {
          method: 'POST',
          body: JSON.stringify({ fromId, toId, amount })
        });
        fetchHomeData(activeHomeId);
      } else {
        const newExpense = {
          id: 'settle-' + Math.random().toString(36).substring(2, 9),
          homeId: activeHomeId,
          title: `Settled: Debt cleared`,
          category: 'Settlement',
          amount,
          paidBy: fromId,
          date: new Date().toISOString().split('T')[0],
          notes: 'Settlement split matching',
          status: 'approved',
          approvals: []
        };
        const currentLocal = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
        currentLocal.push(newExpense);
        localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(currentLocal));
        loadOfflineHomeData(activeHomeId);
      }
      confetti({ particleCount: 200, colors: ['#10B981', '#34D399', '#60A5FA'] });
    } catch (err) {
      alert('Error performing settlement log');
    }
  };

  const handleTriggerRecurring = async (title, category, amount) => {
    try {
      if (isBackendConnected) {
        await apiFetch(`/expenses/${activeHomeId}/recurring`, {
          method: 'POST',
          body: JSON.stringify({ title, category, amount })
        });
        fetchHomeData(activeHomeId);
        loadData();
      } else {
        const membersList = activeHome?.members || [{ id: 'offline-user-1', name: user?.name || 'You' }];
        const memberCount = membersList.length || 1;
        const shareAmount = Math.round((Number(amount) / memberCount) * 100) / 100;

        const currentLocal = JSON.parse(localStorage.getItem(`mockExpenses_${activeHomeId}`) || '[]');
        
        membersList.forEach(m => {
          const newExpense = {
            id: 'recur-' + Math.random().toString(36).substring(2, 9),
            homeId: activeHomeId,
            title: `Recurring: ${title} (${m.name}'s Share)`,
            category,
            amount: shareAmount,
            paidBy: m.id,
            date: new Date().toISOString().split('T')[0],
            notes: 'Automatically divided equal share of monthly recurring bill.',
            status: 'approved',
            approvals: []
          };
          currentLocal.push(newExpense);

          if (m.id === user?.id || m.id === 'offline-user-1') {
            const newPersonalLocal = JSON.parse(localStorage.getItem('mockPersonalExpenses') || '[]');
            newPersonalLocal.push({
              id: 'p-' + Math.random().toString(36).substring(2, 9),
              title: `[Shared] Recurring: ${title} (Your Share)`,
              category,
              amount: shareAmount,
              date: new Date().toISOString().split('T')[0],
              notes: 'Synced from shared ledger.'
            });
            localStorage.setItem('mockPersonalExpenses', JSON.stringify(newPersonalLocal));
          }
        });

        localStorage.setItem(`mockExpenses_${activeHomeId}`, JSON.stringify(currentLocal));
        loadOfflineHomeData(activeHomeId);
        loadOfflineFallback();
      }
      alert(`Recurring bill for ${title} logged successfully!`);
    } catch (err) {
      alert('Error creating recurring log');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExpenseForm(prev => ({ ...prev, billImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = (format) => {
    let content = '';
    let filename = `copay-report-${activeHome?.name || 'workspace'}`;

    if (format === 'json') {
      const reportData = {
        workspace: activeHome,
        ledger: expenses,
        settlementSummary: settlement
      };
      content = JSON.stringify(reportData, null, 2);
      filename += '.json';
    } else {
      const headers = 'ID,Title,Category,Amount,PaidBy,Date,Status,Notes\n';
      const rows = expenses.map(e => 
        `"${e.id}","${e.title.replace(/"/g, '""')}","${e.category}",${e.amount},"${e.paidBy}","${e.date}","${e.status}","${(e.notes || '').replace(/"/g, '""')}"`
      ).join('\n');
      content = headers + rows;
      filename += '.csv';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniquePersonalCategories = useMemo(() => {
    const cats = new Set();
    if (user && user.personalExpenses) {
      user.personalExpenses.forEach(e => {
        if (e.category) cats.add(e.category);
      });
    }
    return Array.from(cats);
  }, [user]);

  const uniqueSharedCategories = useMemo(() => {
    const cats = new Set();
    expenses.forEach(e => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats);
  }, [expenses]);

  // Week number generator helper
  const getWeekNumber = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Week date range helper
  const getWeekRange = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.toLocaleDateString(undefined, {month:'short', day:'numeric'})} - ${sunday.toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}`;
  };

  const calculationsData = useMemo(() => {
    // Shared active expenses
    const activeShared = expenses.filter(e => e.status === 'approved' && e.category !== 'Settlement');

    // Personal active expenses
    const activePersonal = user?.personalExpenses || [];


    // Shared Grouping Accumulators
    const sDaily = {};
    const sWeekly = {};
    const sMonthly = {};

    activeShared.forEach(e => {
      const dateObj = new Date(e.date);
      if (isNaN(dateObj.getTime())) return;
      const dayStr = e.date;
      const monthStr = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const weekStr = `Week ${getWeekNumber(dateObj)} (${getWeekRange(e.date)})`;
      const amount = Number(e.amount) || 0;
      const payerId = e.paidBy;

      if (!sDaily[dayStr]) sDaily[dayStr] = { total: 0, members: {} };
      sDaily[dayStr].total += amount;
      sDaily[dayStr].members[payerId] = (sDaily[dayStr].members[payerId] || 0) + amount;

      if (!sWeekly[weekStr]) sWeekly[weekStr] = { total: 0, members: {} };
      sWeekly[weekStr].total += amount;
      sWeekly[weekStr].members[payerId] = (sWeekly[weekStr].members[payerId] || 0) + amount;

      if (!sMonthly[monthStr]) sMonthly[monthStr] = { total: 0, members: {} };
      sMonthly[monthStr].total += amount;
      sMonthly[monthStr].members[payerId] = (sMonthly[monthStr].members[payerId] || 0) + amount;
    });

    // Personal Grouping Accumulators
    const pDaily = {};
    const pWeekly = {};
    const pMonthly = {};

    activePersonal.forEach(e => {
      const dateObj = new Date(e.date);
      if (isNaN(dateObj.getTime())) return;
      const dayStr = e.date;
      const monthStr = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const weekStr = `Week ${getWeekNumber(dateObj)} (${getWeekRange(e.date)})`;
      const amount = Number(e.amount) || 0;
      const category = e.category || 'Uncategorized';

      if (!pDaily[dayStr]) pDaily[dayStr] = { total: 0, categories: {} };
      pDaily[dayStr].total += amount;
      pDaily[dayStr].categories[category] = (pDaily[dayStr].categories[category] || 0) + amount;

      if (!pWeekly[weekStr]) pWeekly[weekStr] = { total: 0, categories: {} };
      pWeekly[weekStr].total += amount;
      pWeekly[weekStr].categories[category] = (pWeekly[weekStr].categories[category] || 0) + amount;

      if (!pMonthly[monthStr]) pMonthly[monthStr] = { total: 0, categories: {} };
      pMonthly[monthStr].total += amount;
      pMonthly[monthStr].categories[category] = (pMonthly[monthStr].categories[category] || 0) + amount;
    });

    // Sort & format Shared list views
    const sortedSDaily = Object.keys(sDaily).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(day => ({
      key: day,
      label: new Date(day).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      total: sDaily[day].total,
      members: sDaily[day].members
    }));

    const sortedSWeekly = Object.keys(sWeekly).sort((a, b) => b.localeCompare(a)).map(week => ({
      key: week,
      label: week,
      total: sWeekly[week].total,
      members: sWeekly[week].members
    }));

    const sortedSMonthly = Object.keys(sMonthly).sort((a, b) => new Date(b) - new Date(a)).map(month => ({
      key: month,
      label: month,
      total: sMonthly[month].total,
      members: sMonthly[month].members
    }));

    // Sort & format Personal list views
    const sortedPDaily = Object.keys(pDaily).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(day => ({
      key: day,
      label: new Date(day).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      total: pDaily[day].total,
      categories: pDaily[day].categories
    }));

    const sortedPWeekly = Object.keys(pWeekly).sort((a, b) => b.localeCompare(a)).map(week => ({
      key: week,
      label: week,
      total: pWeekly[week].total,
      categories: pWeekly[week].categories
    }));

    const sortedPMonthly = Object.keys(pMonthly).sort((a, b) => new Date(b) - new Date(a)).map(month => ({
      key: month,
      label: month,
      total: pMonthly[month].total,
      categories: pMonthly[month].categories
    }));

    return {
      shared: { daily: sortedSDaily, weekly: sortedSWeekly, monthly: sortedSMonthly },
      personal: { daily: sortedPDaily, weekly: sortedPWeekly, monthly: sortedPMonthly }
    };
  }, [expenses, user]);

  const personalExpensesTotal = useMemo(() => {
    if (!user) return 0;
    return (user.personalExpenses || []).reduce((sum, e) => sum + e.amount, 0);
  }, [user]);

  const myNetBalance = useMemo(() => {
    if (!user || !settlement.memberContributions) return 0;
    return settlement.memberContributions.find(c => c.userId === user.id)?.netBalance || 0;
  }, [user, settlement]);

  const fixedLiabilityShare = useMemo(() => {
    if (!activeHome) return 0;
    const membersList = activeHome.members || [];
    const memberCount = membersList.length || 1;
    // House Rent: ₹15,000 + Maid Salary: ₹3,000 + Fiber Internet: ₹1,200. Total = 19,200.
    return Math.round((19200 / memberCount) * 100) / 100;
  }, [activeHome]);

  const spentAgainstBudget = useMemo(() => {
    return personalExpensesTotal - myNetBalance + fixedLiabilityShare;
  }, [personalExpensesTotal, myNetBalance, fixedLiabilityShare]);

  const filteredPersonalExpenses = useMemo(() => {
    if (!user) return [];
    return (user.personalExpenses || []).filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(personalFilter.search.toLowerCase()) || e.category.toLowerCase().includes(personalFilter.search.toLowerCase());
      const matchesCategory = !personalFilter.category || personalFilter.category === 'All' || e.category.toLowerCase().includes(personalFilter.category.toLowerCase());
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user, personalFilter]);

  const filteredSharedExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(sharedFilter.search.toLowerCase()) || (e.notes || '').toLowerCase().includes(sharedFilter.search.toLowerCase());
      const matchesCategory = !sharedFilter.category || sharedFilter.category === 'All' || e.category.toLowerCase().includes(sharedFilter.category.toLowerCase());
      const matchesMember = sharedFilter.member === 'All' || e.paidBy === sharedFilter.member;
      return matchesSearch && matchesCategory && matchesMember;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, sharedFilter]);

  const personalDailyChartData = useMemo(() => {
    if (!user) return [];
    const grouped = {};
    (user.personalExpenses || []).forEach(e => {
      const dateLabel = e.date.substring(5);
      grouped[dateLabel] = (grouped[dateLabel] || 0) + e.amount;
    });
    return Object.keys(grouped).sort().map(k => ({ date: k, amount: grouped[k] }));
  }, [user]);

  const personalCategoryPieData = useMemo(() => {
    if (!user) return [];
    const grouped = {};
    (user.personalExpenses || []).forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.keys(grouped).map(k => ({ name: k, value: grouped[k] }));
  }, [user]);

  const sharedCategoryBarData = useMemo(() => {
    const approved = expenses.filter(e => e.status === 'approved' && e.category !== 'Settlement');
    const grouped = {};
    approved.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.keys(grouped).map(k => ({ category: k, amount: grouped[k] }));
  }, [expenses]);

  const contributionGridCells = useMemo(() => {
    const cells = [];
    const now = new Date();
    const totalDays = 112; 
    const dateMap = {};

    const userPayments = expenses.filter(e => e.status === 'approved' && e.paidBy === (user?.id || 'offline-user-1'));
    userPayments.forEach(e => {
      dateMap[e.date] = (dateMap[e.date] || 0) + e.amount;
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const spent = dateMap[str] || 0;
      
      let level = 0;
      if (spent > 0) {
        if (spent < 1000) level = 1;
        else if (spent < 5000) level = 2;
        else if (spent < 10000) level = 3;
        else level = 4;
      }

      cells.push({ date: str, amount: spent, level });
    }
    return cells;
  }, [expenses, user]);

  const leaderboardRankings = useMemo(() => {
    if (!activeHome || !settlement.memberContributions) return [];
    return [...settlement.memberContributions].sort((a, b) => b.paid - a.paid);
  }, [activeHome, settlement]);

  const categoryColors = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#14B8A6'];

  const appState = { theme, toggleTheme, canvasRef, token, setToken, user, setUser, isRegistering, setIsRegistering, authForm, setAuthForm, authError, setAuthError, showBrief, setShowBrief, homes, setHomes, activeHomeId, setActiveHomeId, activeHome, setActiveHome, expenses, setExpenses, settlement, setSettlement, aiInsights, setAiInsights, homeForm, setHomeForm, joinCode, setJoinCode, expenseForm, setExpenseForm, personalExpenseForm, setPersonalExpenseForm, userBudgetInput, setUserBudgetInput, homeBudgetInput, setHomeBudgetInput, editingExpenseId, setEditingExpenseId, calcSubTab, setCalcSubTab, calcTab, setCalcTab, activeTab, setActiveTab, sharedFilter, setSharedFilter, personalFilter, setPersonalFilter, showQR, setShowQR, calendarEvents, setCalendarEvents, selectedDate, setSelectedDate, newEventText, setNewEventText, profilePhone, setProfilePhone, profileUpi, setProfileUpi, isUpdatingProfile, setIsUpdatingProfile, reminders, setReminders, isSendingReminderId, setIsSendingReminderId, settlementPayments, setSettlementPayments, selectedSettlementPayee, setSelectedSettlementPayee, settlementRefId, setSettlementRefId, isSubmittingPayment, setIsSubmittingPayment, isVerifyingPaymentId, setIsVerifyingPaymentId, isListening, setIsListening, voiceDraft, setVoiceDraft, voiceError, setVoiceError, recurringTemplates, setRecurringTemplates, editingTemplate, setEditingTemplate, isAddingTemplate, setIsAddingTemplate, templateForm, setTemplateForm, isBackendConnected, setIsBackendConnected, apiFetch, loadData, loadOfflineFallback, fetchHomeData, loadOfflineHomeData, calculateOfflineSettlement, handleAuthSubmit, handleLogout, handleCreateHome, handleJoinHome, handleAddSharedExpense, handleDeleteSharedExpense, handleAddCalendarEvent, handleDeleteCalendarEvent, handleUpdateProfile, handleSendReminder, handleSubmitSettlementPayment, handleVerifySettlementPayment, handleStartVoiceRecognition, handleCommitVoiceDraft, handleApproveExpense, handleAddPersonalExpense, handleDeletePersonalExpense, handleUpdatePersonalBudget, handleUpdateHomeBudget, handleDirectSettle, handleTriggerRecurring, handleFileChange, handleExport, getWeekNumber, getWeekRange, personalExpensesTotal, myNetBalance, fixedLiabilityShare, spentAgainstBudget, filteredPersonalExpenses, filteredSharedExpenses, personalDailyChartData, personalCategoryPieData, sharedCategoryBarData, contributionGridCells, leaderboardRankings, categoryColors, calculationsData, startAddTemplate, startEditTemplate, handleSaveTemplate, handleDeleteTemplate };
  return appState;
}
