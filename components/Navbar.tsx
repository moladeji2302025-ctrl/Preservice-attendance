'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import OnlineStatus from './OnlineStatus';

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Preservice Attendance
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/attendance"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/attendance')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mark Attendance
              </Link>
              <Link
                href="/excuses"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/excuses')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Excuses
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <OnlineStatus />
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
