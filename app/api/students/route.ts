
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const students = await db.collection('students').find({}).toArray();
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectToDatabase();
    const students = await req.json();
    const collection = db.collection('students');

    await collection.deleteMany({});
    if (Array.isArray(students) && students.length > 0) {
      const cleaned = students.map(({ _id, ...rest }: any) => rest);
      await collection.insertMany(cleaned);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
