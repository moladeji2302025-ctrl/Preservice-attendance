import { NextRequest, NextResponse } from 'next/server';
import { addUser, getUserByEmail } from '@/lib/db/indexeddb';
import { hashPassword, generateId, validateUserData } from '@/lib/auth/utils';
import { User } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'executive' } = body;

    // Validate input
    const validation = validateUserData({ email, password, name });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser: User = {
      id: generateId(),
      email,
      name,
      password: hashedPassword,
      role: role as 'admin' | 'executive',
      createdAt: new Date().toISOString(),
    };

    await addUser(newUser);

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
