import { 
  getUnsyncedAttendance, 
  getUnsyncedExcuses,
  updateAttendance,
  updateExcuse,
  getSyncQueue,
  removeFromSyncQueue,
} from '@/lib/db/indexeddb';
import { AttendanceRecord, Excuse } from '@/lib/db/schema';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

// Check if online
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// Sync attendance records
export async function syncAttendance(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  if (!isOnline()) {
    result.success = false;
    result.errors.push('No internet connection');
    return result;
  }

  try {
    const unsyncedRecords = await getUnsyncedAttendance();

    for (const record of unsyncedRecords) {
      try {
        // In a real application, this would send data to a server
        // For now, we'll just mark it as synced
        const syncedRecord: AttendanceRecord = {
          ...record,
          synced: true,
        };
        await updateAttendance(syncedRecord);
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to sync attendance ${record.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Sync failed: ${error}`);
  }

  return result;
}

// Sync excuses
export async function syncExcuses(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  if (!isOnline()) {
    result.success = false;
    result.errors.push('No internet connection');
    return result;
  }

  try {
    const unsyncedExcuses = await getUnsyncedExcuses();

    for (const excuse of unsyncedExcuses) {
      try {
        // In a real application, this would send data to a server
        // For now, we'll just mark it as synced
        const syncedExcuse: Excuse = {
          ...excuse,
          synced: true,
        };
        await updateExcuse(syncedExcuse);
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to sync excuse ${excuse.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Sync failed: ${error}`);
  }

  return result;
}

// Sync all pending data
export async function syncAll(): Promise<SyncResult> {
  const attendanceResult = await syncAttendance();
  const excusesResult = await syncExcuses();

  // Process sync queue
  const queue = await getSyncQueue();
  for (const item of queue) {
    await removeFromSyncQueue(item.id);
  }

  return {
    success: attendanceResult.success && excusesResult.success,
    synced: attendanceResult.synced + excusesResult.synced,
    failed: attendanceResult.failed + excusesResult.failed,
    errors: [...attendanceResult.errors, ...excusesResult.errors],
  };
}

// Auto sync when coming online
export function setupAutoSync() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', async () => {
    console.log('Connection restored, syncing data...');
    const result = await syncAll();
    console.log('Sync result:', result);
  });

  window.addEventListener('offline', () => {
    console.log('Connection lost, working offline...');
  });
}
