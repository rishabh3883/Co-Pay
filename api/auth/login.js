const SUPABASE_REST = 'https://vganmmygqhvkrvsxpcks.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYW5tbXlncWh2a3J2c3hwY2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDQ4OTMsImV4cCI6MjEwNzk4MDg5M30.8eyKKRZb5RixIcCz-aIoajVyNAByMJn1Cv8aHyDKLyU';

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const str = Buffer.concat(buffers).toString('utf8');
    return str ? JSON.parse(str) : {};
  } catch (_) {
    return {};
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const email = body.email?.trim()?.toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide both email and password to sign in.' 
      });
    }

    try {
      // 1. Query Supabase for this user
      const queryRes = await fetch(`${SUPABASE_REST}/users?email=eq.${encodeURIComponent(email)}&select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!queryRes.ok) {
        return res.status(401).json({
          message: 'Account not found! Please register first before logging in.'
        });
      }

      const users = await queryRes.json();
      
      // 2. User not found check
      if (!users || users.length === 0) {
        return res.status(401).json({
          message: 'Account not found! This email is not registered yet. Please click "Register Here" below to create your account first.'
        });
      }

      const user = users[0];

      // 3. Password verification check
      if (user.passwordHash && user.passwordHash !== password) {
        return res.status(401).json({
          message: 'Incorrect password! Please check your credentials.'
        });
      }

      // 4. Update login streak
      const updatedStreaks = (user.streaks || 1) + 1;
      try {
        fetch(`${SUPABASE_REST}/users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ streaks: updatedStreaks })
        }).catch(() => {});
      } catch (_) {}

      const userPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        personalBudget: Number(user.personalBudget) || 15000,
        phone: user.phone || '',
        upiId: user.upiId || '',
        streaks: updatedStreaks,
        badges: user.badges || ['Roommate']
      };

      const token = 'jwt_' + Buffer.from(JSON.stringify(userPayload)).toString('base64');

      return res.status(200).json({
        token,
        user: userPayload
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(401).json({
        message: 'Account not found! Please register first before logging in.'
      });
    }
  }

  return res.status(200).json({ status: 'ok', service: 'copay-auth-login' });
}
