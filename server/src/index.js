require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/homes');
const expenseRoutes = require('./routes/expenses');
const aiRoutes = require('./routes/ai');
const remindersRoutes = require('./routes/reminders');
const settlementsRoutes = require('./routes/settlements');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support uploads of bill images

// API Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/homes', homeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Co-Pay backend server running on http://localhost:${PORT}`);
  });
}

startServer();
