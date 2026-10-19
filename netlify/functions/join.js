const SUPABASE_REST = process.env.SUPABASE_REST_URL || 'https://vganmmygqhvkrvsxpcks.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYW5tbXlncWh2a3J2c3hwY2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDQ4OTMsImV4cCI6MjEwNzk4MDg5M30.8eyKKRZb5RixIcCz-aIoajVyNAByMJn1Cv8aHyDKLyU';

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
    if (userId) {
      const currentMembers = Array.isArray(home.members) ? home.members : [];
      const alreadyMember = currentMembers.some(m => {
        if (!m) return false;
        if (typeof m === 'string') return m === userId;
        return m._id === userId || m.id === userId;
      });

      if (!alreadyMember) {
        const updatedMemberIds = [
          ...currentMembers.map(m => (typeof m === 'object' && m !== null) ? (m._id || m.id) : m),
          userId
        ];

        await fetch(`${SUPABASE_REST}/homes?id=eq.${home.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ members: updatedMemberIds })
        });
        home.members = updatedMemberIds;
      }
    }

    // 3. Populate full member profiles
    if (Array.isArray(home.members) && home.members.length > 0) {
      const memberIds = home.members.map(m => (typeof m === 'object' && m !== null) ? (m._id || m.id) : m).filter(Boolean);
      if (memberIds.length > 0) {
        try {
          const userQuery = memberIds.map(id => `id.eq.${id}`).join(',');
          const usersRes = await fetch(`${SUPABASE_REST}/users?or=(${userQuery})&select=id,name,email,avatar,phone,upiId`, {
            headers
          });
          const memberUsers = await usersRes.json();
          if (Array.isArray(memberUsers)) {
            home.members = memberUsers.map(u => ({
              _id: u.id,
              name: u.name,
              email: u.email,
              avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'User')}`,
              phone: u.phone,
              upiId: u.upiId
            }));
          }
        } catch (popErr) {
          console.warn('Could not populate members in Netlify join function:', popErr);
        }
      }
    }

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify(home)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ message: err.message || 'Server error' })
    };
  }
};
