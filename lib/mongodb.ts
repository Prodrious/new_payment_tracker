
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined. Please add it to your environment.');
  }

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db('tutortrack');

    cachedClient = client;
    cachedDb = db;

    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
