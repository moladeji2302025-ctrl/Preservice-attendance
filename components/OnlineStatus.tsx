'use client';

import { useEffect, useState } from 'react';
import { isOnline, syncAll } from '@/lib/sync/sync';

export default function OnlineStatus() {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = async () => {
      setOnline(true);
      setSyncing(true);
      try {
        await syncAll();
        setLastSync(new Date());
      } catch (error) {
        console.error('Sync error:', error);
      } finally {
        setSyncing(false);
      }
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncAll();
      setLastSync(new Date());
    } catch (error) {
      console.error('Manual sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-sm text-gray-600">
          {online ? 'Online' : 'Offline'}
        </span>
      </div>
      {online && (
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
        >
          {syncing ? 'Syncing...' : 'Sync'}
        </button>
      )}
      {lastSync && (
        <span className="text-xs text-gray-500">
          Last sync: {lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
