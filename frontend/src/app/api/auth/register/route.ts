import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import dbConnect from '@/lib/db';
import { sendRegistrationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password, name } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User account already exists with this email.', status: 'Failed' },
        { status: 422 }
      );
    }

    const user = await User.create({
      email,
      password,
      name,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '3d' }
    );

    try {
      await sendRegistrationEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}