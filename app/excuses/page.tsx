'use client';

import { useState, useEffect, useCallback } from 'react';

import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { addExcuse, getAllExcuses, getAttendanceByUser } from '@/lib/db/indexeddb';
import { generateId } from '@/lib/auth/utils';
import { Excuse, AttendanceRecord } from '@/lib/db/schema';

function ExcusesContent() {
  const [user, setUser] = useState<{id: string; name: string} | null>(null);
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [absences, setAbsences] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    attendanceId: '',
    reason: '',
    date: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      const allExcuses = await getAllExcuses();
      const userId = user?.id;
      const userExcuses = allExcuses.filter(e => e.userId === userId);
      setExcuses(userExcuses);

      if (userId) {
        const userAttendance = await getAttendanceByUser(userId);
        const userAbsences = userAttendance.filter(a => a.status === 'absent');
        setAbsences(userAbsences);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const selectedAbsence = absences.find(a => a.id === formData.attendanceId);
      if (!selectedAbsence) {
        setError('Please select an absence');
        return;
      }

      const excuse: Excuse = {
        id: generateId(),
        userId: user?.id || '',
        userName: user?.name || '',
        attendanceId: formData.attendanceId,
        reason: formData.reason,
        date: selectedAbsence.date,
        status: 'pending',
        synced: false,
        createdAt: new Date().toISOString(),
      };

      await addExcuse(excuse);
      setSuccess('Excuse submitted successfully!');
      setFormData({ attendanceId: '', reason: '', date: '' });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError('Failed to submit excuse. Please try again.');
      console.error('Excuse submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const availableAbsences = absences.filter(
    a => !excuses.some(e => e.attendanceId === a.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Excuses</h1>
            <p className="text-gray-600 mt-2">Submit and track excuses for absences</p>
          </div>
          {!showForm && availableAbsences.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Excuse
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Submit New Excuse</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="attendanceId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Absence
                </label>
                <select
                  id="attendanceId"
                  value={formData.attendanceId}
                  onChange={(e) => setFormData({ ...formData, attendanceId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an absence...</option>
                  {availableAbsences.map((absence) => (
                    <option key={absence.id} value={absence.id}>
                      {absence.date} - {absence.userName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Absence
                </label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide a detailed reason for your absence..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Excuse'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {availableAbsences.length === 0 && !showForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-blue-700">
                <p className="font-medium">No absences available</p>
                <p className="text-sm mt-1">You don&apos;t have any absences that need excuses.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Excuses</h2>
          </div>
          <div className="p-6">
            {excuses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No excuses submitted yet</p>
            ) : (
              <div className="space-y-4">
                {excuses.map((excuse) => (
                  <div key={excuse.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{excuse.date}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(excuse.status)}`}>
                            {excuse.status.charAt(0).toUpperCase() + excuse.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Submitted: {new Date(excuse.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-4">
                      <p className="text-sm text-gray-700">{excuse.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExcusesPage() {
  return (
    <AuthProvider>
      <ExcusesContent />
    </AuthProvider>
  );
}
