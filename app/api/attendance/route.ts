import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { addAttendance, getAllAttendance, getAttendanceByDate } from '@/lib/db/indexeddb';
import { generateId } from '@/lib/auth/utils';
import { AttendanceRecord } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let records: AttendanceRecord[];
    if (date) {
      records = await getAttendanceByDate(date);
    } else {
      records = await getAllAttendance();
    }

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
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
    const { userId, userName, status, location } = body;

    if (!userId || !userName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();
    const record: AttendanceRecord = {
      id: generateId(),
      userId,
      userName,
      date: now.toISOString().split('T')[0],
      status,
      checkInTime: status === 'present' || status === 'late' ? now.toISOString() : undefined,
      location,
      synced: false,
      createdAt: now.toISOString(),
    };

    await addAttendance(record);

    return NextResponse.json(
      { message: 'Attendance recorded', record },
      { status: 201 }
    );
  } catch (error) {
    console.error('Record attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
}
