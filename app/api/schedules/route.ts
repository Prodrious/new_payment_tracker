
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const schedules = await db.collection('schedules').find({}).toArray();
    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error("API GET Schedules Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectToDatabase();
    const schedules = await req.json();
    const collection = db.collection('schedules');

    await collection.deleteMany({});
    if (Array.isArray(schedules) && schedules.length > 0) {
      const cleaned = schedules.map(({ _id, ...rest }: any) => rest);
      await collection.insertMany(cleaned);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API POST Schedules Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
