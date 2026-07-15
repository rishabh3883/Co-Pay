const dbModule = require('./db');

// Helper to generate unique IDs
function makeId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// --- DATA ACCESS LAYER WRAPPER ---

const dbStore = {
  // --- USERS ---
  async findUserById(id) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const list = dbModule.jsonDb.read('users');
    return list.find(u => u.id === id) || null;
  },

  async findUserByEmail(email) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const list = dbModule.jsonDb.read('users');
    return list.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(user) {
    const id = makeId();
    const createdAt = new Date().toISOString();
    const newUser = { phone: '', upiId: '', ...user, id, createdAt, personalExpenses: [], streaks: 1, badges: ['Early Payer'] };

    if (dbModule.isSupabaseConnected) {
      const { error } = await dbModule.supabase
        .from('users')
        .insert([{
          id,
          name: newUser.name,
          email: newUser.email.toLowerCase(),
          passwordHash: newUser.passwordHash,
          personalBudget: newUser.personalBudget,
          phone: newUser.phone,
          upiId: newUser.upiId,
          personalExpenses: [],
          streaks: 1,
          badges: ['Early Payer'],
          createdAt
        }]);
      if (error) throw error;
      return newUser;
    }

    const list = dbModule.jsonDb.read('users');
    list.push(newUser);
    dbModule.jsonDb.write('users', list);
    return newUser;
  },

  async updateUser(id, updates) {
    if (dbModule.isSupabaseConnected) {
      const { id: _, ...rest } = updates;
      const { data, error } = await dbModule.supabase
        .from('users')
        .update(rest)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }

    const list = dbModule.jsonDb.read('users');
    const index = list.findIndex(u => u.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    dbModule.jsonDb.write('users', list);
    return list[index];
  },

  // --- HOMES ---
  async findHomeById(id) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('homes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const list = dbModule.jsonDb.read('homes');
    return list.find(h => h.id === id) || null;
  },

  async findHomeByInviteCode(code) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('homes')
        .select('*')
        .eq('inviteCode', code.toUpperCase())
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const list = dbModule.jsonDb.read('homes');
    return list.find(h => h.inviteCode.toUpperCase() === code.toUpperCase()) || null;
  },

  async createHome(name, adminId, monthlyBudget) {
    const id = makeId();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const createdAt = new Date().toISOString();
    const newHome = {
      id,
      name,
      inviteCode,
      adminId,
      monthlyBudget,
      members: [adminId],
      createdAt
    };

    if (dbModule.isSupabaseConnected) {
      const { error } = await dbModule.supabase
        .from('homes')
        .insert([{
          id,
          name,
          inviteCode,
          adminId,
          monthlyBudget,
          members: [adminId],
          createdAt
        }]);
      if (error) throw error;
      return newHome;
    }

    const list = dbModule.jsonDb.read('homes');
    list.push(newHome);
    dbModule.jsonDb.write('homes', list);
    return newHome;
  },

  async updateHome(id, updates) {
    if (dbModule.isSupabaseConnected) {
      const { id: _, ...rest } = updates;
      const { data, error } = await dbModule.supabase
        .from('homes')
        .update(rest)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }

    const list = dbModule.jsonDb.read('homes');
    const index = list.findIndex(h => h.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    dbModule.jsonDb.write('homes', list);
    return list[index];
  },

  async findUserHomes(userId) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('homes')
        .select('*')
        .contains('members', [userId]);
      if (error) throw error;
      return data || [];
    }
    const list = dbModule.jsonDb.read('homes');
    return list.filter(h => h.members.includes(userId));
  },

  // --- EXPENSES ---
  async findExpenseById(id) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const list = dbModule.jsonDb.read('expenses');
    return list.find(e => e.id === id) || null;
  },

  async createExpense(expense) {
    const id = makeId();
    const newExpense = { ...expense, id };

    if (dbModule.isSupabaseConnected) {
      const { error } = await dbModule.supabase
        .from('expenses')
        .insert([{
          id,
          homeId: expense.homeId,
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          paidBy: expense.paidBy,
          date: expense.date,
          billImage: expense.billImage || '',
          notes: expense.notes || '',
          status: expense.status || 'approved',
          approvals: expense.approvals || []
        }]);
      if (error) throw error;
      return newExpense;
    }

    const list = dbModule.jsonDb.read('expenses');
    list.push(newExpense);
    dbModule.jsonDb.write('expenses', list);
    return newExpense;
  },

  async updateExpense(id, updates) {
    if (dbModule.isSupabaseConnected) {
      const { id: _, ...rest } = updates;
      const { data, error } = await dbModule.supabase
        .from('expenses')
        .update(rest)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }

    const list = dbModule.jsonDb.read('expenses');
    const index = list.findIndex(e => e.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    dbModule.jsonDb.write('expenses', list);
    return list[index];
  },

  async deleteExpense(id) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .select();
      if (error) throw error;
      return data && data.length > 0;
    }

    const list = dbModule.jsonDb.read('expenses');
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length === list.length) return false;
    dbModule.jsonDb.write('expenses', filtered);
    return true;
  },

  async findExpensesByHome(homeId) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('expenses')
        .select('*')
        .eq('homeId', homeId);
      if (error) throw error;
      return data || [];
    }
    const list = dbModule.jsonDb.read('expenses');
    return list.filter(e => e.homeId === homeId);
  },

  async findRemindersByHome(homeId) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('reminders')
        .select('*')
        .eq('homeId', homeId);
      if (error) throw error;
      return data || [];
    }
    const list = dbModule.jsonDb.read('reminders');
    return list.filter(r => r.homeId === homeId);
  },

  async createReminder(reminder) {
    const id = makeId();
    const newReminder = { ...reminder, id, dateTime: reminder.dateTime || new Date().toISOString() };
    if (dbModule.isSupabaseConnected) {
      const { error } = await dbModule.supabase
        .from('reminders')
        .insert([{
          id,
          homeId: reminder.homeId,
          recipient: reminder.recipient,
          phone: reminder.phone || '',
          dateTime: newReminder.dateTime,
          expenseTitle: reminder.expenseTitle || '',
          amount: reminder.amount || 0,
          deliveryStatus: reminder.deliveryStatus || 'Sent'
        }]);
      if (error) throw error;
      return newReminder;
    }
    const list = dbModule.jsonDb.read('reminders');
    list.push(newReminder);
    dbModule.jsonDb.write('reminders', list);
    return newReminder;
  },

  async findSettlementPaymentsByHome(homeId) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('settlements')
        .select('*')
        .eq('homeId', homeId);
      if (error) throw error;
      return data || [];
    }
    const list = dbModule.jsonDb.read('settlements');
    return list.filter(s => s.homeId === homeId);
  },

  async findSettlementPaymentById(id) {
    if (dbModule.isSupabaseConnected) {
      const { data, error } = await dbModule.supabase
        .from('settlements')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const list = dbModule.jsonDb.read('settlements');
    return list.find(s => s.id === id) || null;
  },

  async createSettlementPayment(payment) {
    const id = makeId();
    const newPayment = { ...payment, id, date: payment.date || new Date().toISOString(), status: payment.status || 'Pending' };
    if (dbModule.isSupabaseConnected) {
      const { error } = await dbModule.supabase
        .from('settlements')
        .insert([{
          id,
          homeId: payment.homeId,
          senderId: payment.senderId,
          receiverId: payment.receiverId,
          amount: payment.amount,
          date: newPayment.date,
          refId: payment.refId || '',
          status: newPayment.status
        }]);
      if (error) throw error;
      return newPayment;
    }
    const list = dbModule.jsonDb.read('settlements');
    list.push(newPayment);
    dbModule.jsonDb.write('settlements', list);
    return newPayment;
  },

  async updateSettlementPayment(id, updates) {
    if (dbModule.isSupabaseConnected) {
      const { id: _, ...rest } = updates;
      const { data, error } = await dbModule.supabase
        .from('settlements')
        .update(rest)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const list = dbModule.jsonDb.read('settlements');
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    dbModule.jsonDb.write('settlements', list);
    return list[index];
  }
};

module.exports = { dbStore };
