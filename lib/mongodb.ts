
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  if (!uri) {
    throw new Error('Database connection string (MONGODB_URI) is not configured.');
  }

  try {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 1, 
    });
    
    await client.connect();
    const db = client.db('tutortrack');

    cachedClient = client;
    cachedDb = db;

    console.log("Connected to MongoDB.");
    return db;
  } catch (error: any) {
    console.error("MongoDB Connection Error:", error.message);
    throw new Error(error.message || 'Failed to reach Database Server.');
  }
}
