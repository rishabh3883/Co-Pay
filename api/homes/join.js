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
    const code = (body.inviteCode || 'COPLAY').toUpperCase();
    const joinedHome = {
      id: 'home_' + Math.random().toString(36).substring(2, 9),
      name: `Flat Room (${code})`,
      inviteCode: code,
      monthlyBudget: 25000,
      adminId: 'admin_peer',
      members: [
        { id: 'admin_peer', name: 'Roommate (Admin)', email: 'admin@copay.io', streaks: 2, badges: ['Creator'] },
        { id: 'usr_me', name: 'You', email: 'user@copay.io', streaks: 1, badges: ['Roommate'] }
      ]
    };
    return res.status(200).json(joinedHome);
  }

  return res.status(200).json({ status: 'ok' });
}
