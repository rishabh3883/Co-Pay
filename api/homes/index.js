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

  // Extract user info from Authorization header if present
  let authUserId = 'usr_me';
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.userId || payload.id) authUserId = payload.userId || payload.id;
      }
    } catch (_) {}
  }

  // POST: Create Home
  if (req.method === 'POST') {
    const body = await parseBody(req);
    const homeName = body.name?.trim() || 'Flat Room';
    const monthlyBudget = Number(body.monthlyBudget) || 15000;
    const homeId = 'home_' + Math.random().toString(36).substring(2, 10);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const createdAt = new Date().toISOString();

    const newHome = {
      id: homeId,
      name: homeName,
      inviteCode,
      adminId: authUserId,
      monthlyBudget,
      members: [authUserId],
      createdAt
    };

    try {
      const insertRes = await fetch(`${SUPABASE_REST}/homes`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(newHome)
      });

      if (insertRes.ok) {
        const inserted = await insertRes.json();
        return res.status(201).json(Array.isArray(inserted) ? inserted[0] : newHome);
      }
    } catch (e) {
      console.warn('Supabase homes insert error:', e.message);
    }

    return res.status(201).json(newHome);
  }

  // GET: Fetch all homes
  if (req.method === 'GET') {
    try {
      const queryRes = await fetch(`${SUPABASE_REST}/homes?select=*&order=createdAt.desc`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (queryRes.ok) {
        const allHomes = await queryRes.json();
        // Return homes where user is a member or admin, or return all homes for user workspace
        const userHomes = (allHomes || []).filter(h => {
          if (!authUserId || authUserId === 'usr_me') return true;
          return h.adminId === authUserId || (Array.isArray(h.members) && h.members.includes(authUserId));
        });
        return res.status(200).json(userHomes.length > 0 ? userHomes : (allHomes || []));
      }
    } catch (err) {
      console.warn('Supabase homes fetch error:', err.message);
    }

    return res.status(200).json([]);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
