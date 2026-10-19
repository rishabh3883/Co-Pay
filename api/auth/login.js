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
    const safeEmail = body.email?.trim() || 'user@copay.io';
    const safeName = safeEmail.split('@')[0];
    const userPayload = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: safeName.charAt(0).toUpperCase() + safeName.slice(1),
      email: safeEmail
    };
    const token = 'jwt_' + Buffer.from(JSON.stringify(userPayload)).toString('base64');

    return res.status(200).json({
      token,
      user: userPayload
    });
  }

  return res.status(200).json({ status: 'ok', service: 'copay-auth-login' });
}
