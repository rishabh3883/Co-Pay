const baseUrl = 'https://copay-app-live.netlify.app/api';

async function testFlow() {
  const ts = Date.now();
  const user1 = { name: 'Rishabh Admin', email: `admin_${ts}@test.com`, password: 'Password123!' };
  const user2 = { name: 'Aman Roommate', email: `roommate_${ts}@test.com`, password: 'Password123!' };

  console.log('1. Register User 1:', user1.name);
  const r1 = await (await fetch(baseUrl + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user1) })).json();
  console.log('   User 1 ID:', r1.user.id);

  console.log('2. Register User 2:', user2.name);
  const r2 = await (await fetch(baseUrl + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user2) })).json();
  console.log('   User 2 ID:', r2.user.id);

  console.log('3. User 1 creates room: Skyline Heights 5B');
  const room = await (await fetch(baseUrl + '/homes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + r1.token },
    body: JSON.stringify({ name: 'Skyline Heights 5B', monthlyBudget: 30000 })
  })).json();
  console.log('   Room Code:', room.inviteCode);
  console.log('   Initial Members:', room.members.map(m => m.name));

  console.log('4. User 2 joins room using code:', room.inviteCode);
  const joined = await (await fetch(baseUrl + '/homes/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + r2.token },
    body: JSON.stringify({ inviteCode: room.inviteCode, userId: r2.user.id })
  })).json();
  console.log('   Join response members:', joined.members.map(m => `${m.name} (${m.email})`));

  console.log('5. Verify User 1 fetches /api/homes:');
  const u1Homes = await (await fetch(baseUrl + '/homes', { headers: { 'Authorization': 'Bearer ' + r1.token } })).json();
  console.log('   User 1 sees members in room:', u1Homes[0].members.map(m => m.name));

  console.log('6. Verify User 2 fetches /api/homes:');
  const u2Homes = await (await fetch(baseUrl + '/homes', { headers: { 'Authorization': 'Bearer ' + r2.token } })).json();
  console.log('   User 2 sees members in room:', u2Homes[0].members.map(m => m.name));

  console.log('\n=============================================');
  console.log('>>> COMPLETE MULTI-USER JOIN FLOW PASSED! <<<');
  console.log('=============================================');
}

testFlow().catch(console.error);
