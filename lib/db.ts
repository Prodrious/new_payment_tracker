
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  if (!uri) {
    throw new Error('Please add your MONGODB_URI to environment variables');
  }

  const client = await MongoClient.connect(uri);
  const db = client.db('tutortrack');

  cachedClient = client;
  cachedDb = db;

  return db;
}
