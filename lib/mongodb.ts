
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  if (!uri) {
    console.error("MONGODB_URI is missing from environment variables.");
    throw new Error('MONGODB_URI_MISSING');
  }

  try {
    // Setting a timeout so the UI doesn't hang forever on IP whitelist issues
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    
    await client.connect();
    const db = client.db('tutortrack');

    cachedClient = client;
    cachedDb = db;

    console.log("Successfully connected to MongoDB");
    return db;
  } catch (error: any) {
    console.error("MongoDB Connection Error Details:", error.message);
    // If it's an IP whitelist error, the message usually contains 'ETIMEDOUT' or 'Could not connect'
    throw error;
  }
}
