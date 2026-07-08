
export const calculateSettlementsData = (home, list) => {
  const members = home.members;
  const approved = list.filter(e => e.status === 'approved' && e.category !== 'Settlement');

  const paidMap = {};
  members.forEach(m => { paidMap[m.id] = 0; });
  approved.forEach(e => {
    if (paidMap[e.paidBy] !== undefined) paidMap[e.paidBy] += e.amount;
  });

  const totalSpent = approved.reduce((sum, e) => sum + e.amount, 0);
  const share = totalSpent / (members.length || 1);

  const balances = members.map(m => ({
    userId: m.id,
    balance: paidMap[m.id] - share
  }));

  const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

  const transfers = [];
  let dIdx = 0, cIdx = 0;
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const oweAmount = -debtor.balance;
    const creditAmount = creditor.balance;
    const settledAmount = Math.min(oweAmount, creditAmount);

    transfers.push({
      fromId: debtor.userId,
      fromName: members.find(m => m.id === debtor.userId)?.name || 'Roommate',
      toId: creditor.userId,
      toName: members.find(m => m.id === creditor.userId)?.name || 'Roommate',
      amount: Math.round(settledAmount * 100) / 100
    });

    debtor.balance += settledAmount;
    creditor.balance -= settledAmount;
    if (Math.abs(debtor.balance) < 0.01) dIdx++;
    if (Math.abs(creditor.balance) < 0.01) cIdx++;
  }

  const memberContributions = members.map(m => ({
    userId: m.id,
    userName: m.name,
    paid: Math.round(paidMap[m.id] * 100) / 100,
    share: Math.round(share * 100) / 100,
    netBalance: Math.round((paidMap[m.id] - share) * 100) / 100
  }));

  const foodSpent = approved.filter(e => e.category === 'Grocery').reduce((sum, e) => sum + e.amount, 0);

  return {
    settlement: { totalSpent, share, memberContributions, transfers },
    insights: {
      insights: [
        `💡 Food & Grocery expenses total ₹${foodSpent} this month. Buying bulk essentials can save up to ₹800.`,
        `⚡ Switch off idle rooms to lower electricity splits by an estimated 12%.`
      ],
      predictedNextMonth: Math.round(totalSpent * 0.95),
      healthScore: 82
    }
  };
};
