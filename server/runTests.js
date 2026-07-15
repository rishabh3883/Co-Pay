const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDB } = require('./src/db');
const { dbStore } = require('./src/dbStore');

// Colors for console logging
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

const testResults = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

async function runTest(name, fn) {
  console.log(`${colors.blue}⏳ Running test: ${name}...${colors.reset}`);
  try {
    await fn();
    console.log(`${colors.green}✔ PASSED: ${name}${colors.reset}\n`);
    testResults.push({ name, status: 'PASSED' });
  } catch (err) {
    console.error(`${colors.red}❌ FAILED: ${name}${colors.reset}`);
    console.error(`${colors.red}${err.stack}${colors.reset}\n`);
    testResults.push({ name, status: 'FAILED', error: err.message });
  }
}

// Mock calculation solver (pure function) matching settlementUtils.js logic
function calculateSettlementsData(home, list) {
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

  return { totalSpent, share, memberContributions, transfers };
}

async function main() {
  console.log(`${colors.magenta}====================================================${colors.reset}`);
  console.log(`${colors.magenta}      CO-PAY PLATFORM AUTOMATED TEST RUNNER        ${colors.reset}`);
  console.log(`${colors.magenta}====================================================${colors.reset}\n`);

  // Initialize DB Connection
  await connectDB();

  // Test 1: Calculation Logic Correctness (Arithmetic Validation)
  await runTest("Arithmetic Split Settlement Formula", async () => {
    const mockHome = {
      id: "h-test",
      name: "Test Group",
      members: [
        { id: "u-1", name: "Aman" },
        { id: "u-2", name: "Rohit" },
        { id: "u-3", name: "Karan" }
      ]
    };

    const mockExpenses = [
      { id: "e-1", paidBy: "u-1", amount: 900, status: "approved", category: "Grocery" }, // Aman paid 900
      { id: "e-2", paidBy: "u-2", amount: 0, status: "approved", category: "WiFi" },   // Rohit paid 0
      { id: "e-3", paidBy: "u-3", amount: 0, status: "approved", category: "Water" }   // Karan paid 0
    ];

    const result = calculateSettlementsData(mockHome, mockExpenses);

    // Total = 900. Share per member = 300.
    // Aman balance = 900 - 300 = +600 (Creditor)
    // Rohit balance = 0 - 300 = -300 (Debtor)
    // Karan balance = 0 - 300 = -300 (Debtor)
    // Transfers: Rohit must owe Aman 300, Karan must owe Aman 300.

    assert(result.totalSpent === 900, `Expected total Spent to be 900, got ${result.totalSpent}`);
    assert(result.share === 300, `Expected share to be 300, got ${result.share}`);
    assert(result.transfers.length === 2, `Expected 2 transactions, got ${result.transfers.length}`);

    const transferNames = result.transfers.map(t => `${t.fromName}->${t.toName}:₹${t.amount}`).sort();
    assert(transferNames[0] === "Karan->Aman:₹300", `Expected Karan to owe Aman 300, got ${transferNames[0]}`);
    assert(transferNames[1] === "Rohit->Aman:₹300", `Expected Rohit to owe Aman 300, got ${transferNames[1]}`);
  });

  // Test 2: Database Store Operations (Users)
  await runTest("Database Store - User Profiles", async () => {
    const testId = "u-test-" + Math.random().toString(36).substring(2, 6);
    const testEmail = `${testId}@copay.com`;

    // 1. Create user
    const newUser = await dbStore.createUser({
      name: "Tester bot",
      email: testEmail,
      passwordHash: "encryptedhash123",
      personalBudget: 15000
    });
    assert(newUser !== null, "User creation returned null");
    assert(newUser.email === testEmail, "Created user email mismatch");

    // 2. Query user by ID
    const foundUser = await dbStore.findUserById(newUser.id);
    assert(foundUser !== null, "Queried user by ID returned null");
    assert(foundUser.name === "Tester bot", "Username mismatch");

    // 3. Update user profile
    const updated = await dbStore.updateUser(newUser.id, { personalBudget: 22000 });
    assert(updated !== null, "User update returned null");
    assert(updated.personalBudget === 22000, `Expected updated budget 22000, got ${updated.personalBudget}`);
  });

  // Test 3: Database Store Operations (Homes & Workspace)
  await runTest("Database Store - Flat Workspaces", async () => {
    const testHomeId = "h-test-" + Math.random().toString(36).substring(2, 6);
    const adminId = "u-admin-test";

    // 1. Create target home
    const newHome = await dbStore.createHome("Suite 404 Roommates", adminId, 50000);
    assert(newHome !== null, "Home creation returned null");
    assert(newHome.name === "Suite 404 Roommates", "Home name mismatch");

    // 2. Query home by ID
    const foundHome = await dbStore.findHomeById(newHome.id);
    assert(foundHome !== null, "Queried home details returned null");
    
    // 3. Update workspace details
    const updatedHome = await dbStore.updateHome(newHome.id, { monthlyBudget: 65000 });
    assert(updatedHome.monthlyBudget === 65000, `Expected 65000 budget, got ${updatedHome.monthlyBudget}`);
  });

  // Test 4: Database Store Operations (Expenses Logging)
  await runTest("Database Store - Expense Nodes", async () => {
    const testExpense = {
      title: "Grocery bill Node",
      amount: 450,
      paidBy: "u-tester",
      homeId: "h-test-workspace",
      category: "Grocery",
      date: new Date().toISOString().substring(0, 10),
      status: "approved"
    };

    // 1. Log expense node
    const logged = await dbStore.createExpense(testExpense);
    assert(logged !== null, "Expense creation returned null");
    assert(logged.title === "Grocery bill Node", "Expense title mismatch");

    // 2. Check querying expenses by workspace
    const list = await dbStore.findExpensesByHome("h-test-workspace");
    assert(list.length > 0, "Expenses search list returned empty");
    assert(list.some(e => e.id === logged.id), "Logged expense not found in workspace query");

    // 3. Delete expense node
    const deleted = await dbStore.deleteExpense(logged.id);
    assert(deleted === true, "Delete expense result returned false");
  });

  console.log(`${colors.magenta}====================================================${colors.reset}`);
  console.log(`${colors.magenta}              TEST SUITE RUN COMPLETED             ${colors.reset}`);
  console.log(`${colors.magenta}====================================================${colors.reset}\n`);

  const failedCount = testResults.filter(t => t.status === 'FAILED').length;
  console.log(`Summary: ${colors.green}${testResults.length - failedCount} Passed${colors.reset}, ${failedCount > 0 ? colors.red : colors.green}${failedCount} Failed${colors.reset}`);

  // Exit cleanly
  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error("Unhandle test failure: ", err);
  process.exit(1);
});
