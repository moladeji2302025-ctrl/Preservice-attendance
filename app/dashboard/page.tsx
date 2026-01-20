'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { getAllAttendance, getAllExcuses } from '@/lib/db/indexeddb';
import { AttendanceRecord } from '@/lib/db/schema';

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

function DashboardContent() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    present: 0,
    absent: 0,
    late: 0,
    pendingExcuses: 0,
  });

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const attendanceData = await getAllAttendance();
      const excusesData = await getAllExcuses();

      setAttendance(attendanceData);

      setStats({
        totalAttendance: attendanceData.length,
        present: attendanceData.filter(a => a.status === 'present').length,
        absent: attendanceData.filter(a => a.status === 'absent').length,
        late: attendanceData.filter(a => a.status === 'late').length,
        pendingExcuses: excusesData.filter(e => e.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const recentAttendance = attendance.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">Track and manage attendance for your preservice community</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttendance}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600">{stats.present}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Excuses</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingExcuses}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/attendance"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <h3 className="text-xl font-bold mb-2">Mark Attendance</h3>
            <p className="text-blue-100">Record your attendance for today</p>
          </Link>

          <Link
            href="/excuses"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-8 hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <h3 className="text-xl font-bold mb-2">Submit Excuse</h3>
            <p className="text-purple-100">Submit an excuse for absence</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Attendance</h2>
          </div>
          <div className="p-6">
            {recentAttendance.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No attendance records yet</p>
            ) : (
              <div className="space-y-4">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.status === 'present' ? 'bg-green-100' :
                        record.status === 'absent' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <span className={`text-lg font-bold ${
                          record.status === 'present' ? 'text-green-600' :
                          record.status === 'absent' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {record.userName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.userName}</p>
                        <p className="text-sm text-gray-500">{record.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                      {record.checkInTime && (
                        <span className="text-sm text-gray-500">
                          {new Date(record.checkInTime).toLocaleTimeString()}
                        </span>
                      )}
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

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
