'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#252E5D] via-[#1a2347] to-[#0230F5]">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 h-16 w-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
          </div>
          <p className="mt-6 text-white/80 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
