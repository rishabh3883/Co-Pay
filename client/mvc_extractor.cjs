const fs = require('fs');

const controllerPath = 'src/controllers/useAppController.jsx';
let lines = fs.readFileSync(controllerPath, 'utf8').split('\n');

// Directories
if (!fs.existsSync('src/api')) fs.mkdirSync('src/api');
if (!fs.existsSync('src/hooks')) fs.mkdirSync('src/hooks');
if (!fs.existsSync('src/utils')) fs.mkdirSync('src/utils');

// 1. EXTRACT CANVAS ANIMATION (lines 16 to 136 roughly, we find exact bounds)
const canvasStart = lines.findIndex(l => l.includes('useEffect(() => {') && lines[l+1] && lines[l+1].includes('canvasRef.current'));
let canvasEnd = lines.findIndex((l, i) => i > canvasStart && l.includes('}, []);'));

const canvasCode = lines.slice(canvasStart, canvasEnd + 1).join('\n');
const useCanvasHook = `import { useEffect } from 'react';

export default function useCanvasAnimation(canvasRef) {
${canvasCode.replace(/useEffect\(\(\) => {/g, '  useEffect(() => {')}
}
`;
fs.writeFileSync('src/hooks/useCanvasAnimation.js', useCanvasHook);
lines.splice(canvasStart, canvasEnd - canvasStart + 1, '  useCanvasAnimation(canvasRef);');


// 2. EXTRACT API FETCH
const apiStart = lines.findIndex(l => l.includes('const apiFetch = async'));
let apiEnd = lines.findIndex((l, i) => i > apiStart && l.includes('throw err;'));
apiEnd = lines.findIndex((l, i) => i > apiEnd && l.includes('};'));

const apiCode = lines.slice(apiStart, apiEnd + 1).join('\n');
const apiModel = `const API_BASE = 'http://localhost:5000/api';

export const buildApiFetcher = (token, setIsBackendConnected) => {
${apiCode.replace(/const apiFetch = async/g, '  return async')}
};
`;
fs.writeFileSync('src/api/apiClient.js', apiModel);

// Replace apiFetch definition in controller
lines.splice(apiStart, apiEnd - apiStart + 1, '  const apiFetch = buildApiFetcher(token, setIsBackendConnected);');


// 3. EXTRACT SETTLEMENT CALCULATION
const calcStart = lines.findIndex(l => l.includes('const calculateOfflineSettlement = '));
let calcEnd = lines.findIndex((l, i) => i > calcStart + 50 && l.trim() === '  };');

const calcCode = lines.slice(calcStart, calcEnd + 1).join('\n');
const utilsSource = `
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
        \`💡 Food & Grocery expenses total ₹\${foodSpent} this month. Buying bulk essentials can save up to ₹800.\`,
        \`⚡ Switch off idle rooms to lower electricity splits by an estimated 12%.\`
      ],
      predictedNextMonth: Math.round(totalSpent * 0.95),
      healthScore: 82
    }
  };
};
`;
fs.writeFileSync('src/utils/settlementUtils.js', utilsSource);

const replacementCall = `  const calculateOfflineSettlement = (home, list) => {
    const data = calculateSettlementsData(home, list);
    setSettlement(data.settlement);
    setAiInsights(data.insights);
  };`;
lines.splice(calcStart, calcEnd - calcStart + 1, replacementCall);

// 4. Update imports
lines.splice(1, 0, "import useCanvasAnimation from '../hooks/useCanvasAnimation';\nimport { buildApiFetcher } from '../api/apiClient';\nimport { calculateSettlementsData } from '../utils/settlementUtils';");

fs.writeFileSync('src/controllers/useAppController.jsx', lines.join('\n'));
console.log('Extraction complete');
