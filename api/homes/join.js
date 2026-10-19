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
    const code = (body.inviteCode || '').trim().toUpperCase();

    if (!code) {
      return res.status(400).json({ message: 'Room invite code is required.' });
    }

    // Extract joining user details from token or body
    let joiningUserId = body.userId;
    let joiningUserName = body.userName || 'Roommate';
    let joiningUserEmail = body.userEmail?.toLowerCase() || '';
    let joiningUserPhone = body.phone || '';
    let joiningUserUpi = body.upiId || '';

    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.userId || payload.id) joiningUserId = payload.userId || payload.id;
          if (payload.email) joiningUserEmail = payload.email.toLowerCase();
          if (payload.name) joiningUserName = payload.name;
        }
      } catch (_) {}
    }

    if (!joiningUserId) {
      joiningUserId = 'usr_' + Math.random().toString(36).substring(2, 9);
    }

    try {
      // 1. Find the home in Supabase by inviteCode
      const homeQuery = await fetch(`${SUPABASE_REST}/homes?inviteCode=eq.${encodeURIComponent(code)}&select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!homeQuery.ok) {
        throw new Error('Database query failed while searching for room');
      }

      const matchingHomes = await homeQuery.json();
      if (!matchingHomes || matchingHomes.length === 0) {
        return res.status(404).json({ message: `No room found with invite code "${code}". Please check the code with your admin.` });
      }

      const targetHome = matchingHomes[0];
      const existingMembers = Array.isArray(targetHome.members) ? targetHome.members : [];

      // 2. Ensure joining user is registered in Supabase users table
      if (joiningUserEmail) {
        const userCheck = await fetch(`${SUPABASE_REST}/users?email=eq.${encodeURIComponent(joiningUserEmail)}&select=*`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        if (userCheck.ok) {
          const foundUsers = await userCheck.json();
          if (foundUsers && foundUsers.length > 0) {
            joiningUserId = foundUsers[0].id;
            joiningUserName = foundUsers[0].name || joiningUserName;
            joiningUserPhone = foundUsers[0].phone || joiningUserPhone;
            joiningUserUpi = foundUsers[0].upiId || joiningUserUpi;
          } else {
            // Insert user profile into Supabase
            await fetch(`${SUPABASE_REST}/users`, {
              method: 'POST',
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
              },
              body: JSON.stringify({
                id: joiningUserId,
                name: joiningUserName,
                email: joiningUserEmail,
                passwordHash: 'joined_via_code',
                personalBudget: 15000,
                phone: joiningUserPhone,
                upiId: joiningUserUpi,
                streaks: 1,
                badges: ['Roommate'],
                createdAt: new Date().toISOString()
              })
            }).catch(() => {});
          }
        }
      }

      // 3. Add user ID to members array if not already present
      let updatedMemberIds = [...existingMembers];
      if (!updatedMemberIds.includes(joiningUserId)) {
        updatedMemberIds.push(joiningUserId);
      }

      // Also ensure targetHome.adminId is in members
      if (targetHome.adminId && !updatedMemberIds.includes(targetHome.adminId)) {
        updatedMemberIds.unshift(targetHome.adminId);
      }

      // 4. Update the room in Supabase
      const updateRes = await fetch(`${SUPABASE_REST}/homes?id=eq.${targetHome.id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ members: updatedMemberIds })
      });

      // 5. Populate full member objects for ALL members
      const usersQuery = await fetch(`${SUPABASE_REST}/users?select=*`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const allUsers = usersQuery.ok ? await usersQuery.json() : [];

      const populatedMembers = updatedMemberIds.map(mId => {
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
            badges: found.id === targetHome.adminId ? ['Creator'] : (found.badges || ['Roommate'])
          };
        }
        if (mId === joiningUserId) {
          return {
            id: joiningUserId,
            name: joiningUserName,
            email: joiningUserEmail,
            phone: joiningUserPhone,
            whatsapp: joiningUserPhone,
            upiId: joiningUserUpi,
            streaks: 1,
            badges: ['Roommate']
          };
        }
        return {
          id: mId,
          name: mId === targetHome.adminId ? 'Roommate (Admin)' : 'Roommate',
          email: '',
          phone: '',
          whatsapp: '',
          upiId: '',
          streaks: 1,
          badges: mId === targetHome.adminId ? ['Creator'] : ['Roommate']
        };
      });

      return res.status(200).json({
        ...targetHome,
        members: populatedMembers
      });

    } catch (err) {
      console.error('Error in /api/homes/join:', err);
      return res.status(500).json({ message: 'Error joining room: ' + err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
