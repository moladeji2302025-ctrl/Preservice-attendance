'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setUser(JSON.parse(userStr));
      setLoading(false);
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
