
// Fix: Import connectToDatabase from the valid mongodb utility in the lib directory
import { connectToDatabase } from '../lib/mongodb';

export default async function handler(req: any, res: any) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('schedules');

    if (req.method === 'GET') {
      const schedules = await collection.find({}).toArray();
      return res.status(200).json(schedules);
    }

    if (req.method === 'POST') {
      const schedules = req.body;
      await collection.deleteMany({});
      if (Array.isArray(schedules) && schedules.length > 0) {
        const cleaned = schedules.map(s => {
          const { _id, ...rest } = s;
          return rest;
        });
        await collection.insertMany(cleaned);
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}