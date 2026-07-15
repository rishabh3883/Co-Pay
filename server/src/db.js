const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure local data dir exists for JSON fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isSupabaseConnected = false;
let supabase = null;

// Custom simple file database client for fallback
class JsonDb {
  getPath(collection) {
    return path.join(DATA_DIR, `${collection}.json`);
  }

  read(collection) {
    const filePath = this.getPath(collection);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return [];
    }
  }

  write(collection, data) {
    const filePath = this.getPath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}

const jsonDb = new JsonDb();

async function connectDB() {
  let supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ No SUPABASE_URL or SUPABASE_KEY found in environment. Falling back to local JSON database storage in server/data/');
    isSupabaseConnected = false;
    return;
  }

  // Auto-convert postgresql:// connection string to API HTTPS URL if input as database URI
  if (supabaseUrl.startsWith('postgresql://')) {
    const match = supabaseUrl.find || supabaseUrl.match(/postgres\.([^:@]+)/);
    if (match && match[1]) {
      console.log(`🔌 Detected postgresql:// URI scheme in SUPABASE_URL. Automatically converting to HTTPS API REST endpoint: https://${match[1]}.supabase.co`);
      supabaseUrl = `https://${match[1]}.supabase.co`;
    }
  }

  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    // Simple test query to check connectivity
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is empty table or table not found (handled gracefully)
      throw error;
    }
    isSupabaseConnected = true;
    console.log('🔌 Connected to Supabase successfully.');
  } catch (error) {
    console.error('❌ Supabase Connection/Config Error:', error.message);
    console.warn('⚠️ Falling back to local JSON database storage. Make sure you run the setup SQL migrations in Supabase.');
    isSupabaseConnected = false;
  }
}

module.exports = {
  connectDB,
  jsonDb,
  get isSupabaseConnected() { return isSupabaseConnected; },
  get supabase() { return supabase; }
};

