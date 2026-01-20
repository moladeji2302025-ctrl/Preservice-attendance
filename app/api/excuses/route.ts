import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { addExcuse, getAllExcuses, updateExcuse } from '@/lib/db/indexeddb';
import { generateId } from '@/lib/auth/utils';
import { Excuse } from '@/lib/db/schema';

interface ExtendedUser {
  id: string;
  role: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const excuses = await getAllExcuses();
    return NextResponse.json({ excuses });
  } catch (error) {
    console.error('Get excuses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch excuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, userName, attendanceId, reason, date } = body;

    if (!userId || !userName || !attendanceId || !reason || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const excuse: Excuse = {
      id: generateId(),
      userId,
      userName,
      attendanceId,
      reason,
      date,
      status: 'pending',
      synced: false,
      createdAt: new Date().toISOString(),
    };

    await addExcuse(excuse);

    return NextResponse.json(
      { message: 'Excuse submitted', excuse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit excuse error:', error);
    return NextResponse.json(
      { error: 'Failed to submit excuse' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as ExtendedUser).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const excuses = await getAllExcuses();
    const excuse = excuses.find(e => e.id === id);

    if (!excuse) {
      return NextResponse.json(
        { error: 'Excuse not found' },
        { status: 404 }
      );
    }

    const updatedExcuse: Excuse = {
      ...excuse,
      status,
      synced: false,
    };

    await updateExcuse(updatedExcuse);

    return NextResponse.json(
      { message: 'Excuse updated', excuse: updatedExcuse },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update excuse error:', error);
    return NextResponse.json(
      { error: 'Failed to update excuse' },
      { status: 500 }
    );
  }
}
