import { NextResponse } from 'next/server';
import BlackList from '@/models/blacklist';
import dbConnect from '@/lib/db';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Token is missing' }, { status: 400 });
    }

    await BlackList.create({ token });

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Logout failed' }, { status: 500 });
  }
}