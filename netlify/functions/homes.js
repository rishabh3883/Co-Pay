const SUPABASE_REST = process.env.SUPABASE_REST_URL || 'https://vganmmygqhvkrvsxpcks.supabase.co/rest/v1';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYW5tbXlncWh2a3J2c3hwY2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDQ4OTMsImV4cCI6MjEwNzk4MDg5M30.8eyKKRZb5RixIcCz-aIoajVyNAByMJn1Cv8aHyDKLyU';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
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
    return { statusCode: 200, headers, body: '' };
  }

  // Extract user info from Authorization header
  let authUserId = 'usr_me';
  let authUserEmail = '';
  let authUserName = 'Roommate';
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7);
    if (rawToken.startsWith('jwt_')) {
      try {
        const decoded = JSON.parse(Buffer.from(rawToken.substring(4), 'base64').toString('utf8'));
        if (decoded.userId || decoded.id) authUserId = decoded.userId || decoded.id;
        if (decoded.email) authUserEmail = decoded.email.toLowerCase();
        if (decoded.name) authUserName = decoded.name;
      } catch (_) {}
    } else {
      const parts = rawToken.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.userId || payload.id) authUserId = payload.userId || payload.id;
          if (payload.email) authUserEmail = payload.email.toLowerCase();
          if (payload.name) authUserName = payload.name;
        } catch (_) {}
      }
    }
  }

  // Check if request is for a specific home ID (e.g., /api/homes/:homeId)
  const pathParts = (event.path || '').split('/').filter(Boolean);
  const requestedHomeId = (pathParts.length > 2 && pathParts[pathParts.length - 1] !== 'homes' && pathParts[pathParts.length - 1] !== 'join')
    ? pathParts[pathParts.length - 1]
    : null;

  // POST: Create Home
  if (event.httpMethod === 'POST') {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
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

      await fetch(`${SUPABASE_REST}/homes`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(newHome)
      });

      const usersRes = await fetch(`${SUPABASE_REST}/users?select=*`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const allUsers = usersRes.ok ? await usersRes.json() : [];
      const populated = await populateHomeMembers(newHome, allUsers);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(populated)
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Error creating room: ' + err.message })
      };
    }
  }

  // GET: Fetch all homes or a single home
  if (event.httpMethod === 'GET') {
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

        // If a specific home was requested by ID
        if (requestedHomeId) {
          const specific = (allHomes || []).find(h => h.id === requestedHomeId || h.inviteCode === requestedHomeId);
          if (specific) {
            const populated = await populateHomeMembers(specific, allUsers);
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(populated)
            };
          }
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Room not found' })
          };
        }

        // Return user's homes
        const matchingHomes = (allHomes || []).filter(h => {
          if (!authUserId || authUserId === 'usr_me') return true;
          return h.adminId === authUserId || 
                 (Array.isArray(h.members) && h.members.includes(authUserId)) ||
                 (authUserEmail && Array.isArray(h.members) && h.members.includes(authUserEmail));
        });

        // Always fallback to all homes so user never gets stuck
        const targets = matchingHomes.length > 0 ? matchingHomes : (allHomes || []);
        const populatedHomes = await Promise.all(targets.map(h => populateHomeMembers(h, allUsers)));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(populatedHomes)
        };
      }
    } catch (err) {
      console.warn('Supabase homes fetch error:', err.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([])
    };
  }

  // DELETE: Delete room (if creator) or Leave room (if joined flatmate)
  if (event.httpMethod === 'DELETE') {
    if (!requestedHomeId) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Room ID required' }) };
    }

    try {
      const getRes = await fetch(`${SUPABASE_REST}/homes?id=eq.${requestedHomeId}&select=*`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const homes = await getRes.json();
      if (!homes || homes.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Room not found' }) };
      }

      const home = homes[0];
      const isCreator = home.adminId === authUserId;

      if (isCreator) {
        // Delete entire room
        await fetch(`${SUPABASE_REST}/homes?id=eq.${requestedHomeId}`, {
          method: 'DELETE',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        try {
          await fetch(`${SUPABASE_REST}/expenses?homeId=eq.${requestedHomeId}`, {
            method: 'DELETE',
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
          });
        } catch (_) {}

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, action: 'deleted', message: 'Room successfully deleted' })
        };
      } else {
        // Leave room
        const currentMembers = Array.isArray(home.members) ? home.members : [];
        const updatedMembers = currentMembers.filter(m => {
          if (!m) return false;
          if (typeof m === 'string') return m !== authUserId;
          return m.id !== authUserId && m._id !== authUserId;
        });

        await fetch(`${SUPABASE_REST}/homes?id=eq.${requestedHomeId}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ members: updatedMembers })
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, action: 'left', message: 'Successfully left the room' })
        };
      }
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: 'Method not allowed' })
  };
};
