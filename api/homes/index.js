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

async function populateHomeMembers(home, allUsers) {
  const memberIds = Array.isArray(home.members) ? home.members : [];
  // Ensure adminId is in the list
  if (home.adminId && !memberIds.includes(home.adminId)) {
    memberIds.unshift(home.adminId);
  }

  const populated = memberIds.map(mId => {
    // If it's already an object with name, keep it
    if (typeof mId === 'object' && mId !== null && mId.name) return mId;

    const found = allUsers.find(u => u.id === mId || u.email === mId);
    if (found) {
      return {
        id: found.id,
        name: found.name,
        email: found.email,
        phone: found.phone || '',
        whatsapp: found.phone || '',
        upiId: found.upiId || '',
        streaks: found.streaks || 1,
        badges: found.id === home.adminId ? ['Creator'] : (found.badges || ['Roommate'])
      };
    }
    return {
      id: mId,
      name: mId === home.adminId ? 'Roommate (Admin)' : 'Roommate',
      email: '',
      phone: '',
      whatsapp: '',
      upiId: '',
      streaks: 1,
      badges: mId === home.adminId ? ['Creator'] : ['Roommate']
    };
  });

  return { ...home, members: populated };
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
  let authUserEmail = '';
  let authUserName = 'Roommate';
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.userId || payload.id) authUserId = payload.userId || payload.id;
        if (payload.email) authUserEmail = payload.email.toLowerCase();
        if (payload.name) authUserName = payload.name;
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

    const creatorId = body.adminId || authUserId;

    const newHome = {
      id: homeId,
      name: homeName,
      inviteCode,
      adminId: creatorId,
      monthlyBudget,
      members: [creatorId],
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
        const baseHome = Array.isArray(inserted) ? inserted[0] : newHome;
        // Fetch users to populate
        const usersRes = await fetch(`${SUPABASE_REST}/users?select=*`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const allUsers = usersRes.ok ? await usersRes.json() : [];
        const populated = await populateHomeMembers(baseHome, allUsers);
        return res.status(201).json(populated);
      }
    } catch (e) {
      console.warn('Supabase homes insert error:', e.message);
    }

    const fallbackMembers = [
      { id: creatorId, name: authUserName, email: authUserEmail, streaks: 1, badges: ['Creator'] }
    ];
    return res.status(201).json({ ...newHome, members: fallbackMembers });
  }

  // GET: Fetch all homes
  if (req.method === 'GET') {
    try {
      const [queryRes, usersRes] = await Promise.all([
        fetch(`${SUPABASE_REST}/homes?select=*&order=createdAt.desc`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        }),
        fetch(`${SUPABASE_REST}/users?select=*`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        })
      ]);

      if (queryRes.ok) {
        const allHomes = await queryRes.json();
        const allUsers = usersRes.ok ? await usersRes.json() : [];

        // Return homes where user is a member or admin
        const matchingHomes = (allHomes || []).filter(h => {
          if (!authUserId || authUserId === 'usr_me') return true;
          return h.adminId === authUserId || 
                 (Array.isArray(h.members) && h.members.includes(authUserId)) ||
                 (authUserEmail && Array.isArray(h.members) && h.members.includes(authUserEmail));
        });

        const targets = matchingHomes.length > 0 ? matchingHomes : (allHomes || []);
        const populatedHomes = await Promise.all(targets.map(h => populateHomeMembers(h, allUsers)));

        return res.status(200).json(populatedHomes);
      }
    } catch (err) {
      console.warn('Supabase homes fetch error:', err.message);
    }

    return res.status(200).json([]);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
