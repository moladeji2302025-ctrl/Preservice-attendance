// Database schema types

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'executive';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
  location?: string;
  synced: boolean;
  createdAt: string;
}

export interface Excuse {
  id: string;
  userId: string;
  userName: string;
  attendanceId: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  synced: boolean;
  createdAt: string;
}

export interface SyncQueue {
  id: string;
  type: 'attendance' | 'excuse';
  data: AttendanceRecord | Excuse;
  action: 'create' | 'update' | 'delete';
  timestamp: string;
}
