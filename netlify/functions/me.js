const SUPABASE_REST = process.env.SUPABASE_REST_URL || 'https://vganmmygqhvkrvsxpcks.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYW5tbXlncWh2a3J2c3hwY2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDQ4OTMsImV4cCI6MjEwNzk4MDg5M30.8eyKKRZb5RixIcCz-aIoajVyNAByMJn1Cv8aHyDKLyU';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let authUserId = 'usr_me';
  let authUserEmail = '';
  const authHeader = event.headers.authorization || event.headers.Authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7);
    if (rawToken.startsWith('jwt_')) {
      try {
        const decoded = JSON.parse(Buffer.from(rawToken.substring(4), 'base64').toString('utf8'));
        if (decoded.userId || decoded.id) authUserId = decoded.userId || decoded.id;
        if (decoded.email) authUserEmail = decoded.email.toLowerCase();
      } catch (_) {}
    } else {
      const parts = rawToken.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.userId || payload.id) authUserId = payload.userId || payload.id;
          if (payload.email) authUserEmail = payload.email.toLowerCase();
        } catch (_) {}
      }
    }
  }

  try {
    let user = null;
    if (authUserId && authUserId !== 'usr_me') {
      const res = await fetch(`${SUPABASE_REST}/users?id=eq.${encodeURIComponent(authUserId)}&select=*`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const users = await res.json();
      if (users && users.length > 0) user = users[0];
    }

    if (!user && authUserEmail) {
      const res = await fetch(`${SUPABASE_REST}/users?email=eq.${encodeURIComponent(authUserEmail)}&select=*`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const users = await res.json();
      if (users && users.length > 0) user = users[0];
    }

    if (user) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          personalBudget: user.personalBudget || 10000,
          phone: user.phone || '',
          upiId: user.upiId || '',
          streaks: user.streaks || 1,
          badges: user.badges || ['Roommate']
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: authUserId,
        name: 'Roommate',
        email: authUserEmail || 'user@copay.io',
        personalBudget: 10000,
        phone: '',
        upiId: '',
        streaks: 1,
        badges: ['Roommate']
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message })
    };
  }
};
