import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { User, AttendanceRecord, Excuse, SyncQueue } from './schema';

interface AttendanceDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  attendance: {
    key: string;
    value: AttendanceRecord;
    indexes: { 'by-user': string; 'by-date': string; 'by-synced': IDBValidKey };
  };
  excuses: {
    key: string;
    value: Excuse;
    indexes: { 'by-user': string; 'by-attendance': string; 'by-synced': IDBValidKey };
  };
  syncQueue: {
    key: string;
    value: SyncQueue;
    indexes: { 'by-timestamp': string };
  };
}

const DB_NAME = 'preservice-attendance-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<AttendanceDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<AttendanceDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<AttendanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      // Attendance store
      if (!db.objectStoreNames.contains('attendance')) {
        const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' });
        attendanceStore.createIndex('by-user', 'userId');
        attendanceStore.createIndex('by-date', 'date');
        attendanceStore.createIndex('by-synced', 'synced');
      }

      // Excuses store
      if (!db.objectStoreNames.contains('excuses')) {
        const excuseStore = db.createObjectStore('excuses', { keyPath: 'id' });
        excuseStore.createIndex('by-user', 'userId');
        excuseStore.createIndex('by-attendance', 'attendanceId');
        excuseStore.createIndex('by-synced', 'synced');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });

  return dbInstance;
}

// User operations
export async function addUser(user: User): Promise<void> {
  const db = await initDB();
  await db.add('users', user);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await initDB();
  return await db.getFromIndex('users', 'by-email', email);
}

export async function getAllUsers(): Promise<User[]> {
  const db = await initDB();
  return await db.getAll('users');
}

// Attendance operations
export async function addAttendance(attendance: AttendanceRecord): Promise<void> {
  const db = await initDB();
  await db.add('attendance', attendance);
}

export async function updateAttendance(attendance: AttendanceRecord): Promise<void> {
  const db = await initDB();
  await db.put('attendance', attendance);
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const db = await initDB();
  return await db.getAllFromIndex('attendance', 'by-date', date);
}

export async function getAttendanceByUser(userId: string): Promise<AttendanceRecord[]> {
  const db = await initDB();
  return await db.getAllFromIndex('attendance', 'by-user', userId);
}

export async function getUnsyncedAttendance(): Promise<AttendanceRecord[]> {
  const db = await initDB();
  const all = await db.getAll('attendance');
  return all.filter(record => !record.synced);
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  const db = await initDB();
  return await db.getAll('attendance');
}

// Excuse operations
export async function addExcuse(excuse: Excuse): Promise<void> {
  const db = await initDB();
  await db.add('excuses', excuse);
}

export async function updateExcuse(excuse: Excuse): Promise<void> {
  const db = await initDB();
  await db.put('excuses', excuse);
}

export async function getExcusesByUser(userId: string): Promise<Excuse[]> {
  const db = await initDB();
  return await db.getAllFromIndex('excuses', 'by-user', userId);
}

export async function getUnsyncedExcuses(): Promise<Excuse[]> {
  const db = await initDB();
  const all = await db.getAll('excuses');
  return all.filter(excuse => !excuse.synced);
}

export async function getAllExcuses(): Promise<Excuse[]> {
  const db = await initDB();
  return await db.getAll('excuses');
}

// Sync queue operations
export async function addToSyncQueue(item: SyncQueue): Promise<void> {
  const db = await initDB();
  await db.add('syncQueue', item);
}

export async function getSyncQueue(): Promise<SyncQueue[]> {
  const db = await initDB();
  return await db.getAll('syncQueue');
}

export async function clearSyncQueue(): Promise<void> {
  const db = await initDB();
  await db.clear('syncQueue');
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('syncQueue', id);
}
