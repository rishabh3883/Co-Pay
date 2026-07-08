const express = require('express');
const { dbStore } = require('../dbStore');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/:homeId', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const userId = req.userId;

    const user = await dbStore.findUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    const personalExpenses = user.personalExpenses || [];
    const homeExpenses = (await dbStore.findExpensesByHome(homeId)).filter(e => e.status === 'approved' && e.category !== 'Settlement');

    const membersCount = home.members.length || 1;
    const sharedContribution = homeExpenses.map(e => ({
      title: e.title,
      category: e.category,
      amount: e.amount / membersCount,
      date: e.date,
      isShared: true
    }));

    const personalContribution = personalExpenses.map(e => ({
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.date,
      isShared: false
    }));

    const allExpenses = [...personalContribution, ...sharedContribution];

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let lastMonth = now.getMonth() - 1;
    let lastYear = now.getFullYear();
    if (lastMonth < 0) {
      lastMonth = 11;
      lastYear -= 1;
    }
    const lastMonthStr = `${lastYear}-${String(lastMonth + 1).padStart(2, '0')}`;

    const currentMonthExpenses = allExpenses.filter(e => e.date.startsWith(currentMonthStr));
    const lastMonthExpenses = allExpenses.filter(e => e.date.startsWith(lastMonthStr));

    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const getCategoryTotals = (list) => {
      const totals = {};
      list.forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
      });
      return totals;
    };

    const currentCats = getCategoryTotals(currentMonthExpenses);
    const lastCats = getCategoryTotals(lastMonthExpenses);

    const insights = [];

    if (lastTotal > 0) {
      const percentChange = ((currentTotal - lastTotal) / lastTotal) * 100;
      if (percentChange > 15) {
        insights.push(`⚠️ Your total spending increased by ${Math.round(percentChange)}% compared to last month.`);
      } else if (percentChange < -15) {
        insights.push(`🎉 Fantastic! You spent ${Math.round(Math.abs(percentChange))}% less than last month.`);
      }
    }

    const currentFood = (currentCats['Food'] || 0) + (currentCats['Grocery'] || 0);
    const lastFood = (lastCats['Food'] || 0) + (lastCats['Grocery'] || 0);
    if (lastFood > 0) {
      const foodChange = ((currentFood - lastFood) / lastFood) * 100;
      if (foodChange > 25) {
        insights.push(`🍔 Food & Grocery expenses are ${Math.round(foodChange)}% higher than last month. Consider cooking at home to save around ₹${Math.round(currentFood * 0.15)}.`);
      }
    }

    const currentElec = currentCats['Electricity'] || 0;
    const lastElec = lastCats['Electricity'] || 0;
    if (lastElec > 0 && currentElec > lastElec) {
      const elecChange = ((currentElec - lastElec) / lastElec) * 100;
      if (elecChange > 10) {
        insights.push(`⚡ Electricity bill increased by ${Math.round(elecChange)}%. Remember to switch off appliances when not in use!`);
      }
    }

    const currentShop = currentCats['Shopping'] || 0;
    if (currentShop > user.personalBudget * 0.3) {
      insights.push(`🛍️ Shopping makes up ${Math.round((currentShop / user.personalBudget) * 100)}% of your personal budget. Slow down on impulsive purchases.`);
    }

    if (insights.length === 0) {
      insights.push('💡 Your spending patterns look steady. Keep tracking to unlock deeper suggestions!');
      insights.push('💡 Tip: Try saving 10% of your budget early in the month to build healthy habits.');
    }

    let predictedNextMonth = currentTotal;
    if (lastTotal > 0) {
      const trend = currentTotal - lastTotal;
      predictedNextMonth = Math.max(0, currentTotal + trend * 0.5);
    } else {
      predictedNextMonth = currentTotal || (user.personalBudget * 0.8);
    }

    let healthScore = 85;
    const personalSpent = personalExpenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((sum, e) => sum + e.amount, 0);
    if (user.personalBudget > 0) {
      const budgetUsage = personalSpent / user.personalBudget;
      if (budgetUsage > 1) {
        healthScore -= 30;
      } else if (budgetUsage > 0.8) {
        healthScore -= 10;
      } else {
        healthScore += 5;
      }
    }
    
    healthScore += Math.min(10, Math.floor((user.streaks || 1) / 2));
    healthScore = Math.max(10, Math.min(100, healthScore));

    return res.json({
      insights,
      predictedNextMonth: Math.round(predictedNextMonth),
      healthScore,
      spendingTrend: {
        currentTotal: Math.round(currentTotal),
        lastTotal: Math.round(lastTotal),
        difference: Math.round(currentTotal - lastTotal)
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Voice command NLP parsing endpoint
router.post('/voice-parse', authMiddleware, async (req, res) => {
  try {
    const { text, homeId } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Speech text transcription is required.' });
    }

    const cleanText = text.toLowerCase();
    
    // 1. Extract Amount
    let amount = 0;
    const amountRegex = /(?:rs\.?|₹|rupees?|amount\sof)?\s*(\d+(?:\.\d{1,2})?)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      amount = Number(amountMatch[1]);
    }

    // 2. Identify Category
    let category = 'Shared';
    if (cleanText.includes('grocer') || cleanText.includes('vegetable') || cleanText.includes('milk') || cleanText.includes('egg') || cleanText.includes('food') || cleanText.includes('dinner') || cleanText.includes('restaurant')) {
      category = 'Grocery';
    } else if (cleanText.includes('rent') || cleanText.includes('house') || cleanText.includes('flat')) {
      category = 'Rent';
    } else if (cleanText.includes('internet') || cleanText.includes('wifi') || cleanText.includes('broadband') || cleanText.includes('fiber')) {
      category = 'Internet';
    } else if (cleanText.includes('maid') || cleanText.includes('cleaning') || cleanText.includes('sweep') || cleanText.includes('salary')) {
      category = 'Maid';
    } else if (cleanText.includes('petrol') || cleanText.includes('fuel') || cleanText.includes('travel') || cleanText.includes('cab') || cleanText.includes('auto') || cleanText.includes('ride')) {
      category = 'Travel';
    } else if (cleanText.includes('elect') || cleanText.includes('power') || cleanText.includes('water') || cleanText.includes('bill') || cleanText.includes('maintenance')) {
      category = 'Electricity';
    } else if (cleanText.includes('groceries')) {
      category = 'Groceries';
    }

    // 3. Identify Date
    let date = new Date().toISOString().split('T')[0];
    if (cleanText.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      date = yesterday.toISOString().split('T')[0];
    }

    // 4. Identify Payer
    let paidByUserId = req.userId;
    let paidByUserName = 'Me';
    if (homeId) {
      const home = await dbStore.findHomeById(homeId);
      if (home) {
        for (const memberId of home.members) {
          const user = await dbStore.findUserById(memberId);
          if (user && cleanText.includes(user.name.toLowerCase())) {
            paidByUserId = memberId;
            paidByUserName = user.name;
            break;
          }
        }
      }
    }

    // 5. Shared vs Personal
    let isShared = false;
    if (cleanText.includes('split') || cleanText.includes('among') || cleanText.includes('shared') || cleanText.includes('group') || cleanText.includes('all member') || cleanText.includes('roommate')) {
      isShared = true;
    }

    // 6. Infer Title
    let title = '';
    // Clean text by removing command indicators
    let titleCand = text
      .replace(/(?:add|record|split|spent|paid|for|yesterday|today|rs\.?|₹|rupees?|\b\d+\b)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (titleCand.length > 2) {
      // Capitalize first letter of each word
      title = titleCand.split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' ');
    } else {
      title = `${category} Outlay`;
    }

    return res.json({
      title,
      amount,
      category,
      date,
      paidBy: paidByUserId,
      paidByUserName,
      isShared,
      notes: `Vocal input command: "${text}"`
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
