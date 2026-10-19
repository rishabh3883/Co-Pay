const SUPABASE_REST = process.env.SUPABASE_REST_URL || 'https://vganmmygqhvkrvsxpcks.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYW5tbXlncWh2a3J2c3hwY2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDQ4OTMsImV4cCI6MjEwNzk4MDg5M30.8eyKKRZb5RixIcCz-aIoajVyNAByMJn1Cv8aHyDKLyU';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

async function populateHomeMembers(home, allUsers) {
  const memberIds = Array.isArray(home.members) ? [...home.members] : [];
  if (home.adminId && !memberIds.includes(home.adminId)) {
    memberIds.unshift(home.adminId);
  }

  const populated = memberIds.map(mId => {
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: responseHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: responseHeaders,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { inviteCode, userId } = JSON.parse(event.body || '{}');

    // Extract user from token if userId not provided in body
    let effectiveUserId = userId;
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    if (!effectiveUserId && authHeader.startsWith('Bearer ')) {
      const rawToken = authHeader.substring(7);
      if (rawToken.startsWith('jwt_')) {
        try {
          const decoded = JSON.parse(Buffer.from(rawToken.substring(4), 'base64').toString('utf8'));
          effectiveUserId = decoded.userId || decoded.id;
        } catch (_) {}
      }
    }

    if (!inviteCode) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({ message: 'Invite code is required' })
      };
    }

    const cleanCode = inviteCode.trim().toUpperCase();

    // 1. Find home with this inviteCode
    const findRes = await fetch(`${SUPABASE_REST}/homes?inviteCode=eq.${encodeURIComponent(cleanCode)}&select=*`, {
      headers
    });
    const homes = await findRes.json();

    if (!homes || homes.length === 0) {
      return {
        statusCode: 404,
        headers: responseHeaders,
        body: JSON.stringify({ message: 'Room not found with this code' })
      };
    }

    const home = homes[0];

    // 2. Add user to members list if not already present
    if (effectiveUserId) {
      const currentMembers = Array.isArray(home.members) ? home.members : [];
      const alreadyMember = currentMembers.some(m => {
        if (!m) return false;
        if (typeof m === 'string') return m === effectiveUserId;
        return m._id === effectiveUserId || m.id === effectiveUserId;
      });

      if (!alreadyMember) {
        const updatedMemberIds = [
          ...currentMembers.map(m => (typeof m === 'object' && m !== null) ? (m._id || m.id) : m),
          effectiveUserId
        ];

        await fetch(`${SUPABASE_REST}/homes?id=eq.${home.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ members: updatedMemberIds })
        });
        home.members = updatedMemberIds;
      }
    }

    // 3. Populate all members
    const usersRes = await fetch(`${SUPABASE_REST}/users?select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    const allUsers = usersRes.ok ? await usersRes.json() : [];
    const populated = await populateHomeMembers(home, allUsers);

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify(populated)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ message: err.message || 'Server error' })
    };
  }
};
