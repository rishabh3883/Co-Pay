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
    const email = body.email?.trim()?.toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing fields: email and password are required.' })
      };
    }

    // Query Supabase users table
    const queryRes = await fetch(`${SUPABASE_REST}/users?email=eq.${encodeURIComponent(email)}&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!queryRes.ok) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Database connection failed. Please try again.' })
      };
    }

    const users = await queryRes.json();

    if (!users || users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          message: 'Account not found! This email is not registered yet. Please click "Register Here" below to create your account first.'
        })
      };
    }

    const user = users[0];

    // Password verification
    if (user.passwordHash && user.passwordHash !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          message: 'Incorrect password! Please check your credentials.'
        })
      };
    }

    const token = 'jwt_' + Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          upiId: user.upiId || '',
          personalBudget: Number(user.personalBudget) || 15000,
          streaks: (user.streaks || 1) + 1,
          badges: user.badges || ['Roommate']
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
