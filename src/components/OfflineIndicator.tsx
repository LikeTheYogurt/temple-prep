import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl border border-[#EAD9B7] bg-[#FFFBF0] px-4 py-2.5 text-sm font-medium text-[#92400E] shadow-md"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Offline mode — All lessons and notes work on this device.</span>
    </div>
  );
};
