const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure local data dir exists for JSON fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

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
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI found in environment. Falling back to local JSON database storage in server/data/');
    exports.isMongoConnected = false;
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    exports.isMongoConnected = true;
    console.log('🔌 Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.warn('⚠️ Falling back to local JSON database storage.');
    exports.isMongoConnected = false;
  }
}

module.exports = {
  connectDB,
  jsonDb,
  get isMongoConnected() { return isMongoConnected; },
  set isMongoConnected(val) { isMongoConnected = val; }
};
