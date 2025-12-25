'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface SyncIndicatorProps {
  isSyncing: boolean;
}

export function SyncIndicator({ isSyncing }: SyncIndicatorProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isSyncing && showSuccess === false) {
      // Just finished syncing
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, showSuccess]);

  if (!isSyncing && !showSuccess) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
      {isSyncing ? (
        <>
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-gray-700">Syncing...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Saved</span>
        </>
      )}
    </div>
  );
}
