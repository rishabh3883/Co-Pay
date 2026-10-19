const SUPABASE_REST = process.env.SUPABASE_REST_URL || 'https://vganmmygqhvkrvsxpcks.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYW5tbXlncWh2a3J2c3hwY2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDQ4OTMsImV4cCI6MjEwNzk4MDg5M30.8eyKKRZb5RixIcCz-aIoajVyNAByMJn1Cv8aHyDKLyU';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path || '';

  // GET /api/expenses/:homeId/settlement
  if (path.includes('/settlement')) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalRoomExpenses: 0,
        perPersonShare: 0,
        balances: {},
        settlementPlan: []
      })
    };
  }

  // GET /api/expenses/:homeId
  if (event.httpMethod === 'GET') {
    try {
      const res = await fetch(`${SUPABASE_REST}/expenses?select=*&order=createdAt.desc`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      if (res.ok) {
        const expenses = await res.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(expenses || [])
        };
      }
    } catch (_) {}
    return { statusCode: 200, headers, body: JSON.stringify([]) };
  }

  // POST /api/expenses
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');
      const newExpense = {
        id: 'exp_' + Math.random().toString(36).substring(2, 10),
        ...data,
        createdAt: new Date().toISOString()
      };
      await fetch(`${SUPABASE_REST}/expenses`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(newExpense)
      });
      return { statusCode: 201, headers, body: JSON.stringify(newExpense) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
    }
  }

  return { statusCode: 200, headers, body: JSON.stringify([]) };
};
