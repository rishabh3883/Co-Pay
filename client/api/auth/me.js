export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let user = {
    id: 'usr_me',
    name: 'Roommate',
    email: 'user@copay.io',
    personalBudget: 15000,
    streaks: 2,
    badges: ['Active Roommate']
  };

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer jwt_')) {
    try {
      const b64 = authHeader.replace('Bearer jwt_', '');
      const parsed = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      if (parsed && typeof parsed === 'object') {
        user = {
          ...user,
          ...parsed,
          name: parsed.name || user.name,
          email: parsed.email || user.email
        };
      }
    } catch (_) {}
  }

  return res.status(200).json(user);
}
