# Co-Pay 💸
### *Like GitHub but for your shared flatmate expenses*

> **Transparent roommate expense tracking, settlement automation, UPI-integrated payment flows, AI-powered insights, and real-time flatmate messaging — all in one modern full-stack app.**

---

## ✨ Features

### 🏠 Shared Expense Ledger
- Log shared bills (Rent, Internet, Electricity, Groceries, etc.)
- Approve/reject expenses with roommate voting
- Bill image upload for receipts
- AI voice input — speak your expense, we parse it

### 💰 Settlement Engine
- Auto-calculates who owes whom using a **greedy minimum-transfer algorithm**
- Minimizes the number of UPI transfers needed to zero out everyone
- UPI QR code generation per settlement
- WhatsApp payment reminders (one click)
- Verify settlements — marked as `Verified` once receiver confirms

### 📊 Contribution Balance & Analytics
- **4 time periods** — Today / This Week / This Month / Lifetime
- Per-member balance: who overpaid, who underpaid
- Smart notification system:
  - 🎉 **Creditor** — "You paid ₹X extra. Aman will pay you ₹Y"
  - 📢 **Debtor** — "You owe ₹X. Pay Rishabh ₹Y"
  - ✅ **Balanced** — "No payment required"
- Full dashboard: Total Expense · Expected Share · Your Contribution · Pending/Completed Settlements

### 🤖 AI Finance Assistant
- Expense pattern analysis
- Next-month spend prediction
- Daily "safe-to-spend" limit
- Voice-to-expense parser

### 💬 Chat & Connect
- Flatmate-only private messaging
- Group creation and proximity-based friend requests
- Workspace invite via link & QR code

### 📅 Calendar & Reminders
- Shared bill due date calendar
- WhatsApp reminder blasts

### 🛒 Restock Chat
- AI-powered household restock tracker

### 👤 Personal Expense Tracker
- Separate private expense log
- Personal budget limit with progress tracking
- Contribution heatmap (GitHub-style)
- Achievement badges: `Early Payer`, `Budget Master`, `Responsible Roommate`

### 🔁 Fast Recurring Bills
- Predefined templates for monthly recurring bills
- One-click post to split across all flatmates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS + Glassmorphism |
| **Charts** | Recharts |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (via Mongoose) · JSON file fallback |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **AI** | Google Gemini API |
| **Animations** | canvas-confetti · CSS transitions |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
co-pay/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # API client & fetcher
│       ├── components/         # All UI components
│       │   ├── PersonalTab.jsx
│       │   ├── SharedTab.jsx
│       │   ├── BalancesTab.jsx
│       │   ├── ContributionDashboard.jsx  ← Settlement system
│       │   ├── SettlementsManager.jsx
│       │   ├── FlatmateMessengerTab.jsx
│       │   ├── CalendarTab.jsx
│       │   ├── CalculationsTab.jsx
│       │   └── ...
│       ├── controllers/        # useAppController.jsx (main state)
│       ├── hooks/              # useCanvasAnimation
│       ├── utils/              # settlementUtils.js
│       └── views/              # AppView.jsx (root layout)
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js         # Register, Login, Profile, Budget
│   │   │   ├── expenses.js     # CRUD + Settlement engine
│   │   │   ├── homes.js        # Workspace management
│   │   │   ├── settlements.js  # UPI payment tracking
│   │   │   ├── analytics.js    # Daily/Weekly/Monthly/Lifetime analytics
│   │   │   ├── reminders.js    # WhatsApp reminders
│   │   │   └── ai.js           # Gemini AI integration
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── db.js               # MongoDB connection + JSON fallback
│   │   ├── dbStore.js          # Data access layer (works with both DBs)
│   │   └── index.js            # Express app entry
│   ├── data/                   # JSON fallback storage (auto-created)
│   └── package.json
│
└── package.json                # Monorepo scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (optional — app works offline too)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/co-pay.git
cd co-pay
```

### 2. Install all dependencies

```bash
npm run install-all
```

### 3. Configure environment

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/copay
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
```

> **No MongoDB?** — Leave `MONGODB_URI` empty. The app will auto-fallback to local JSON files in `server/data/`. Works perfectly for local dev!

### 4. Start both servers

```bash
npm start
```

This launches:
- 🖥️ **Backend** → `http://localhost:5000`
- 🌐 **Frontend** → `http://localhost:5173`

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/profile` | Update phone/UPI |
| PUT | `/api/auth/budget` | Set personal budget |
| POST | `/api/auth/personal-expense` | Add personal expense |
| DELETE | `/api/auth/personal-expense/:id` | Delete personal expense |

### Homes (Workspaces)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/homes` | Get user's workspaces |
| POST | `/api/homes` | Create workspace |
| POST | `/api/homes/join` | Join via invite code |
| GET | `/api/homes/:id` | Get workspace details |
| PUT | `/api/homes/:id/budget` | Update monthly budget |

### Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses/:homeId` | Get all expenses |
| POST | `/api/expenses/:homeId` | Add expense |
| PUT | `/api/expenses/:expenseId` | Edit expense |
| DELETE | `/api/expenses/:expenseId` | Delete expense |
| POST | `/api/expenses/:expenseId/approve` | Approve expense |
| GET | `/api/expenses/:homeId/settlement` | Get settlement plan |
| POST | `/api/expenses/:homeId/settle-all` | Direct settle |
| POST | `/api/expenses/:homeId/recurring` | Post recurring bill |

### Analytics & Settlements
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/:homeId/daily` | Today's analytics |
| GET | `/api/analytics/:homeId/weekly` | This week's analytics |
| GET | `/api/analytics/:homeId/monthly` | This month's analytics |
| GET | `/api/analytics/:homeId/lifetime` | Lifetime analytics |
| GET | `/api/analytics/:homeId/notifications` | Smart notifications |
| GET | `/api/settlements/:homeId` | Settlement payments list |
| POST | `/api/settlements/:homeId/pay` | Submit UPI payment |
| POST | `/api/settlements/:paymentId/verify` | Verify payment received |

### Reminders & AI
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reminders/:homeId` | Get reminders |
| POST | `/api/reminders/:homeId/send` | Send WhatsApp reminder |
| GET | `/api/ai/:homeId` | Get AI insights |
| POST | `/api/ai/voice-parse` | Parse voice expense |

---

## 🧠 Settlement Algorithm

The app uses a **greedy minimum-transfer algorithm** to settle debts:

```
1. Calculate each member's balance = paid - fair_share
2. Sort debtors (negative balance) and creditors (positive balance)
3. Pair the largest debtor with the largest creditor
4. Transfer min(|debtor_balance|, creditor_balance)
5. Repeat until all balances are ~₹0
```

This guarantees the **minimum number of bank transfers** needed to balance everyone.

---

## 🔐 Auth Flow

```
Register/Login → JWT Token (stored in localStorage)
                      ↓
All protected routes → Authorization: Bearer <token>
                      ↓
authMiddleware validates token → attaches req.userId
```

---

## 📱 Offline Mode

If the backend is unreachable, the app automatically:
- Falls back to **localStorage** for all data
- Computes settlements client-side
- Shows `⚠️ Offline Sandbox` badge in navbar
- Works fully for demo/testing without any server

---

## 🤝 Contributing

```bash
# Fork → clone → feature branch
git checkout -b feature/my-cool-feature
git commit -m "feat: add my cool feature"
git push origin feature/my-cool-feature
# Open a Pull Request
```

---

## 📄 License

MIT © 2026 Co-Pay

---

<div align="center">
  <strong>Built with ☕ cold coffee and a lot of roommate drama.</strong>
</div>
