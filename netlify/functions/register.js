const SUPABASE_REST = 'https://vganmmygqhvkrvsxpcks.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYW5tbXlncWh2a3J2c3hwY2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDQ4OTMsImV4cCI6MjEwNzk4MDg5M30.8eyKKRZb5RixIcCz-aIoajVyNAByMJn1Cv8aHyDKLyU';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const name = body.name?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing required registration fields: name, email, and password.' })
      };
    }

    if (password.length < 4) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Password must be at least 4 characters long.' })
      };
    }

    // Check if user already exists in Supabase
    const checkRes = await fetch(`${SUPABASE_REST}/users?email=eq.${encodeURIComponent(email)}&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (checkRes.ok) {
      const existingUsers = await checkRes.json();
      if (existingUsers && existingUsers.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: 'An account with this email already exists! Please click "Sign In" below.'
          })
        };
      }
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name,
      email: email,
      passwordHash: password,
      personalBudget: 15000,
      phone: '',
      upiId: '',
      streaks: 1,
      badges: ['Roommate'],
      createdAt: new Date().toISOString()
    };

    const insertRes = await fetch(`${SUPABASE_REST}/users`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(newUser)
    });

    const token = 'jwt_' + Buffer.from(JSON.stringify({ userId: newUser.id, email: newUser.email })).toString('base64');

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: '',
          upiId: '',
          personalBudget: 15000,
          streaks: 1,
          badges: ['Roommate']
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error: ' + err.message })
    };
  }
};
