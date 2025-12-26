
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  if (!uri) {
    console.warn("MONGODB_URI not found. App will fail to persist data.");
    throw new Error('Please add your MONGODB_URI to environment variables');
  }

  const client = await MongoClient.connect(uri);
  const db = client.db('tutortrack');

  cachedClient = client;
  cachedDb = db;

  return db;
}
