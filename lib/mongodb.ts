
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Robust MongoDB connection handler with pooling and error surfacing.
 */
export async function connectToDatabase(): Promise<Db> {
  // Use cached connection if available for performance
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  if (!uri) {
    console.error("Critical: MONGODB_URI is not defined.");
    throw new Error('MONGODB_URI_MISSING');
  }

  try {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 8000,      // Fail faster if network is blocked
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,             // Efficient for small apps
    });
    
    await client.connect();
    const db = client.db('tutortrack');

    cachedClient = client;
    cachedDb = db;

    console.log("MongoDB instance ready.");
    return db;
  } catch (error: any) {
    console.error("Database Connection Failed:", error.message);
    
    // Check for common Atlas errors to provide better UI hints
    if (error.message.includes('ETIMEDOUT')) {
      throw new Error('NETWORK_TIMEOUT');
    }
    if (error.message.includes('authentication failed')) {
      throw new Error('AUTH_FAILED');
    }
    
    throw error;
  }
}
