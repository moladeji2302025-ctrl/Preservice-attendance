'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { addAttendance } from '@/lib/db/indexeddb';
import { generateId } from '@/lib/auth/utils';
import { AttendanceRecord } from '@/lib/db/schema';

function AttendanceContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const now = new Date();
      const userId = (session?.user as { id?: string })?.id;
      const record: AttendanceRecord = {
        id: generateId(),
        userId: userId || '',
        userName: session?.user?.name || '',
        date: now.toISOString().split('T')[0],
        status,
        checkInTime: status === 'present' || status === 'late' ? now.toISOString() : undefined,
        location: location || undefined,
        synced: false,
        createdAt: now.toISOString(),
      };

      await addAttendance(record);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to record attendance. Please try again.');
      console.error('Attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">Record your attendance for today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">Attendance recorded successfully!</p>
              <p className="text-sm">Redirecting to dashboard...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Status
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setStatus('present')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    status === 'present'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      status === 'present' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <svg
                        className={`w-8 h-8 ${status === 'present' ? 'text-green-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`font-medium ${status === 'present' ? 'text-green-700' : 'text-gray-700'}`}>
                      Present
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('late')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    status === 'late'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      status === 'late' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <svg
                        className={`w-8 h-8 ${status === 'late' ? 'text-yellow-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`font-medium ${status === 'late' ? 'text-yellow-700' : 'text-gray-700'}`}>
                      Late
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('absent')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    status === 'absent'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      status === 'absent' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <svg
                        className={`w-8 h-8 ${status === 'absent' ? 'text-red-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className={`font-medium ${status === 'absent' ? 'text-red-700' : 'text-gray-700'}`}>
                      Absent
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Main Hall, Online, etc."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Offline Mode Enabled</p>
                  <p>Your attendance will be saved locally and synced when you&apos;re back online.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Recording...' : 'Record Attendance'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <AuthProvider>
      <AttendanceContent />
    </AuthProvider>
  );
}
