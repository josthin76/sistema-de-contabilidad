import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type SyncStatus = 'online' | 'offline' | 'syncing';

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(
    navigator.onLine ? 'online' : 'offline'
  );

  useEffect(() => {
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const channel = supabase
      .channel('sync-status')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        setStatus('syncing');
        setTimeout(() => setStatus(navigator.onLine ? 'online' : 'offline'), 1500);
      })
      .subscribe();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(channel);
    };
  }, []);

  return status;
}
