
// Fix: Import connectToDatabase from the valid mongodb utility in the lib directory
import { connectToDatabase } from '../lib/mongodb';

export default async function handler(req: any, res: any) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('students');

    if (req.method === 'GET') {
      const students = await collection.find({}).toArray();
      return res.status(200).json(students);
    }

    if (req.method === 'POST') {
      const students = req.body;
      // Replace whole collection to keep sync simple for this app scale
      await collection.deleteMany({});
      if (Array.isArray(students) && students.length > 0) {
        // Clean IDs for Mongo if they were generated on frontend
        const cleaned = students.map(s => {
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