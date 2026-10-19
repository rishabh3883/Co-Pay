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
    const name = body.name?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required registration fields: name, email, and password.' 
      });
    }

    if (password.length < 4) {
      return res.status(400).json({ 
        message: 'Password must be at least 4 characters long.' 
      });
    }

    try {
      // 1. Check if user already exists in Supabase
      const checkRes = await fetch(`${SUPABASE_REST}/users?email=eq.${encodeURIComponent(email)}&select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (checkRes.ok) {
        const existingUsers = await checkRes.json();
        if (existingUsers && existingUsers.length > 0) {
          return res.status(400).json({
            message: 'An account with this email already exists! Please click "Sign In" below.'
          });
        }
      }

      // 2. Insert new registered user into Supabase
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

      if (!insertRes.ok) {
        const errJson = await insertRes.json().catch(() => ({}));
        if (errJson?.message?.includes('duplicate key') || errJson?.code === '23505') {
          return res.status(400).json({
            message: 'An account with this email already exists! Please sign in.'
          });
        }
      }

      const userPayload = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        personalBudget: newUser.personalBudget,
        phone: newUser.phone,
        upiId: newUser.upiId,
        streaks: newUser.streaks,
        badges: newUser.badges
      };

      const token = 'jwt_' + Buffer.from(JSON.stringify(userPayload)).toString('base64');

      return res.status(201).json({
        token,
        user: userPayload
      });
    } catch (err) {
      console.error('Registration error:', err);
      // Fallback local response
      const fallbackUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name,
        email,
        personalBudget: 15000,
        streaks: 1,
        badges: ['Roommate']
      };
      const token = 'jwt_' + Buffer.from(JSON.stringify(fallbackUser)).toString('base64');
      return res.status(201).json({ token, user: fallbackUser });
    }
  }

  return res.status(200).json({ status: 'ok', service: 'copay-auth-register' });
}
