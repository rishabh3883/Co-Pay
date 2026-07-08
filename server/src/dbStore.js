const mongoose = require('mongoose');
const dbModule = require('./db');

const Schema = mongoose.Schema;

// --- MONGOOSE SCHEMAS ---

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  personalBudget: { type: Number, default: 0 },
  phone: { type: String, default: '' },
  upiId: { type: String, default: '' },
  personalExpenses: [{
    id: String,
    title: String,
    category: String,
    amount: Number,
    date: String,
    notes: String
  }],
  streaks: { type: Number, default: 1 },
  badges: [{ type: String }],
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const HomeSchema = new Schema({
  name: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  adminId: { type: String, required: true },
  monthlyBudget: { type: Number, default: 0 },
  members: [{ type: String }],
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ExpenseSchema = new Schema({
  homeId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  date: { type: String, required: true },
  billImage: { type: String },
  notes: { type: String },
  status: { type: String, default: 'approved' },
  approvals: [{ type: String }]
});

const ReminderSchema = new Schema({
  homeId: { type: String, required: true },
  recipient: { type: String, required: true },
  phone: { type: String, default: '' },
  dateTime: { type: String, default: () => new Date().toISOString() },
  expenseTitle: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  deliveryStatus: { type: String, default: 'Sent' }
});

const SettlementPaymentSchema = new Schema({
  homeId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  refId: { type: String, default: '' },
  status: { type: String, default: 'Pending' }
});

// Get or compile models
const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const MongoHome = mongoose.models.Home || mongoose.model('Home', HomeSchema);
const MongoExpense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const MongoReminder = mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
const MongoSettlementPayment = mongoose.models.SettlementPayment || mongoose.model('SettlementPayment', SettlementPaymentSchema);

// Helper to generate unique IDs
function makeId() {
  return new mongoose.Types.ObjectId().toString();
}

// --- DATA ACCESS LAYER WRAPPER ---

const dbStore = {
  // --- USERS ---
  async findUserById(id) {
    if (dbModule.isMongoConnected) {
      const doc = await MongoUser.findById(id).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
    }
    const list = dbModule.jsonDb.read('users');
    return list.find(u => u.id === id) || null;
  },

  async findUserByEmail(email) {
    if (dbModule.isMongoConnected) {
      const doc = await MongoUser.findOne({ email: email.toLowerCase() }).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
    }
    const list = dbModule.jsonDb.read('users');
    return list.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(user) {
    const id = makeId();
    const createdAt = new Date().toISOString();
    const newUser = { phone: '', upiId: '', ...user, id, createdAt, personalExpenses: [], streaks: 1, badges: ['Early Payer'] };

    if (dbModule.isMongoConnected) {
      const doc = new MongoUser({
        _id: id,
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
      });
      await doc.save();
      return newUser;
    }

    const list = dbModule.jsonDb.read('users');
    list.push(newUser);
    dbModule.jsonDb.write('users', list);
    return newUser;
  },

  async updateUser(id, updates) {
    if (dbModule.isMongoConnected) {
      const { id: _, ...rest } = updates;
      const doc = await MongoUser.findByIdAndUpdate(id, rest, { new: true }).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
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
    if (dbModule.isMongoConnected) {
      const doc = await MongoHome.findById(id).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
    }
    const list = dbModule.jsonDb.read('homes');
    return list.find(h => h.id === id) || null;
  },

  async findHomeByInviteCode(code) {
    if (dbModule.isMongoConnected) {
      const doc = await MongoHome.findOne({ inviteCode: code.toUpperCase() }).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
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

    if (dbModule.isMongoConnected) {
      const doc = new MongoHome({
        _id: id,
        name,
        inviteCode,
        adminId,
        monthlyBudget,
        members: [adminId],
        createdAt
      });
      await doc.save();
      return newHome;
    }

    const list = dbModule.jsonDb.read('homes');
    list.push(newHome);
    dbModule.jsonDb.write('homes', list);
    return newHome;
  },

  async updateHome(id, updates) {
    if (dbModule.isMongoConnected) {
      const { id: _, ...rest } = updates;
      const doc = await MongoHome.findByIdAndUpdate(id, rest, { new: true }).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
    }

    const list = dbModule.jsonDb.read('homes');
    const index = list.findIndex(h => h.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    dbModule.jsonDb.write('homes', list);
    return list[index];
  },

  async findUserHomes(userId) {
    if (dbModule.isMongoConnected) {
      const docs = await MongoHome.find({ members: userId }).lean();
      return docs.map(doc => ({ ...doc, id: doc._id.toString() }));
    }
    const list = dbModule.jsonDb.read('homes');
    return list.filter(h => h.members.includes(userId));
  },

  // --- EXPENSES ---
  async findExpenseById(id) {
    if (dbModule.isMongoConnected) {
      const doc = await MongoExpense.findById(id).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
    }
    const list = dbModule.jsonDb.read('expenses');
    return list.find(e => e.id === id) || null;
  },

  async createExpense(expense) {
    const id = makeId();
    const newExpense = { ...expense, id };

    if (dbModule.isMongoConnected) {
      const doc = new MongoExpense({
        _id: id,
        homeId: expense.homeId,
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        paidBy: expense.paidBy,
        date: expense.date,
        billImage: expense.billImage,
        notes: expense.notes,
        status: expense.status,
        approvals: expense.approvals
      });
      await doc.save();
      return newExpense;
    }

    const list = dbModule.jsonDb.read('expenses');
    list.push(newExpense);
    dbModule.jsonDb.write('expenses', list);
    return newExpense;
  },

  async updateExpense(id, updates) {
    if (dbModule.isMongoConnected) {
      const { id: _, ...rest } = updates;
      const doc = await MongoExpense.findByIdAndUpdate(id, rest, { new: true }).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
    }

    const list = dbModule.jsonDb.read('expenses');
    const index = list.findIndex(e => e.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    dbModule.jsonDb.write('expenses', list);
    return list[index];
  },

  async deleteExpense(id) {
    if (dbModule.isMongoConnected) {
      const result = await MongoExpense.findByIdAndDelete(id);
      return result !== null;
    }

    const list = dbModule.jsonDb.read('expenses');
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length === list.length) return false;
    dbModule.jsonDb.write('expenses', filtered);
    return true;
  },

  async findExpensesByHome(homeId) {
    if (dbModule.isMongoConnected) {
      const docs = await MongoExpense.find({ homeId }).lean();
      return docs.map(doc => ({ ...doc, id: doc._id.toString() }));
    }
    const list = dbModule.jsonDb.read('expenses');
    return list.filter(e => e.homeId === homeId);
  },

  async findRemindersByHome(homeId) {
    if (dbModule.isMongoConnected) {
      const docs = await MongoReminder.find({ homeId }).lean();
      return docs.map(doc => ({ ...doc, id: doc._id.toString() }));
    }
    const list = dbModule.jsonDb.read('reminders');
    return list.filter(r => r.homeId === homeId);
  },

  async createReminder(reminder) {
    const id = makeId();
    const newReminder = { ...reminder, id, dateTime: reminder.dateTime || new Date().toISOString() };
    if (dbModule.isMongoConnected) {
      const doc = new MongoReminder({
        _id: id,
        homeId: reminder.homeId,
        recipient: reminder.recipient,
        phone: reminder.phone,
        dateTime: newReminder.dateTime,
        expenseTitle: reminder.expenseTitle,
        amount: reminder.amount,
        deliveryStatus: reminder.deliveryStatus
      });
      await doc.save();
      return newReminder;
    }
    const list = dbModule.jsonDb.read('reminders');
    list.push(newReminder);
    dbModule.jsonDb.write('reminders', list);
    return newReminder;
  },

  async findSettlementPaymentsByHome(homeId) {
    if (dbModule.isMongoConnected) {
      const docs = await MongoSettlementPayment.find({ homeId }).lean();
      return docs.map(doc => ({ ...doc, id: doc._id.toString() }));
    }
    const list = dbModule.jsonDb.read('settlements');
    return list.filter(s => s.homeId === homeId);
  },

  async findSettlementPaymentById(id) {
    if (dbModule.isMongoConnected) {
      const doc = await MongoSettlementPayment.findById(id).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
    }
    const list = dbModule.jsonDb.read('settlements');
    return list.find(s => s.id === id) || null;
  },

  async createSettlementPayment(payment) {
    const id = makeId();
    const newPayment = { ...payment, id, date: payment.date || new Date().toISOString(), status: payment.status || 'Pending' };
    if (dbModule.isMongoConnected) {
      const doc = new MongoSettlementPayment({
        _id: id,
        homeId: payment.homeId,
        senderId: payment.senderId,
        receiverId: payment.receiverId,
        amount: payment.amount,
        date: newPayment.date,
        refId: payment.refId || '',
        status: newPayment.status
      });
      await doc.save();
      return newPayment;
    }
    const list = dbModule.jsonDb.read('settlements');
    list.push(newPayment);
    dbModule.jsonDb.write('settlements', list);
    return newPayment;
  },

  async updateSettlementPayment(id, updates) {
    if (dbModule.isMongoConnected) {
      const { id: _, ...rest } = updates;
      const doc = await MongoSettlementPayment.findByIdAndUpdate(id, rest, { new: true }).lean();
      return doc ? { ...doc, id: doc._id.toString() } : null;
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
