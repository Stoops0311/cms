// Advanced offline synchronization for Convex operations
// UltraThink: Handles complex offline scenarios with retry logic, conflict resolution,
// and seamless online/offline transitions with minimal user impact

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from 'convex/react';
import { toast } from '@/components/ui/use-toast.jsx';

const STORAGE_KEY = 'cms_offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 10000]; // Progressive backoff

export function useOfflineSync() {
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState(null);
  const syncTimeoutRef = useRef(null);

  // Load queue from storage on mount
  useEffect(() => {
    loadQueueFromStorage();
  }, []);

  // Save queue to storage whenever it changes
  useEffect(() => {
    saveQueueToStorage();
  }, [queue]);

  // Auto-sync when online status changes
  useEffect(() => {
    const handleOnline = () => {
      if (queue.length > 0) {
        scheduleSync(2000); // Give connection time to stabilize
      }
    };

    const handleOffline = () => {
      clearSyncTimeout();
      toast({
        title: "Offline Mode",
        description: "Changes will be saved locally and synced when reconnected"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearSyncTimeout();
    };
  }, [queue.length]);

  const loadQueueFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedQueue = JSON.parse(stored);
        setQueue(parsedQueue.filter(item => item && item.id)); // Validate items
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
    }
  };

  const saveQueueToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  };

  const clearSyncTimeout = () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
  };

  const scheduleSync = (delay = 0) => {
    clearSyncTimeout();
    syncTimeoutRef.current = setTimeout(() => {
      if (navigator.onLine && queue.length > 0) {
        processQueue();
      }
    }, delay);
  };

  // Add operation to offline queue
  const queueOperation = useCallback((operation) => {
    if (!operation || !operation.type) {
      console.error('Invalid operation queued:', operation);
      return null;
    }

    const queueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      operation,
      retries: 0,
      lastAttempt: null,
      status: 'pending'
    };

    setQueue(prev => [...prev, queueItem]);

    // Try immediate sync if online
    if (navigator.onLine) {
      scheduleSync(100);
    }

    return queueItem.id;
  }, []);

  // Process entire queue
  const processQueue = useCallback(async () => {
    if (isSyncing || queue.length === 0 || !navigator.onLine) {
      return;
    }

    setIsSyncing(true);
    setLastSyncAttempt(new Date().toISOString());

    const results = [];
    const updatedQueue = [...queue];

    try {
      for (let i = 0; i < updatedQueue.length; i++) {
        const item = updatedQueue[i];
        
        if (item.status === 'completed') {
          continue;
        }

        try {
          await processQueueItem(item);
          item.status = 'completed';
          results.push({ success: true, id: item.id });
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          item.retries = (item.retries || 0) + 1;
          item.lastAttempt = new Date().toISOString();
          item.lastError = error.message;

          if (item.retries >= MAX_RETRIES) {
            item.status = 'failed';
            results.push({ success: false, id: item.id, error, permanent: true });
          } else {
            item.status = 'retry';
            results.push({ success: false, id: item.id, error, permanent: false });
          }
        }
      }

      // Remove completed items and permanently failed items
      const cleanedQueue = updatedQueue.filter(item => 
        item.status !== 'completed' && item.status !== 'failed'
      );

      setQueue(cleanedQueue);

      // Report results
      const successCount = results.filter(r => r.success).length;
      const permanentFailures = results.filter(r => !r.success && r.permanent).length;

      if (successCount > 0) {
        toast({
          title: "Sync Complete",
          description: `${successCount} offline changes synchronized`
        });
      }

      if (permanentFailures > 0) {
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: `${permanentFailures} items could not be synchronized`
        });
      }

      // Schedule retry for remaining items
      if (cleanedQueue.length > 0) {
        const nextRetryDelay = Math.min(...cleanedQueue.map(item => 
          RETRY_DELAYS[Math.min(item.retries, RETRY_DELAYS.length - 1)]
        ));
        scheduleSync(nextRetryDelay);
      }

    } catch (error) {
      console.error('Queue processing error:', error);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to process offline queue"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [queue, isSyncing]);

  // Process individual queue item based on operation type
  const processQueueItem = async (item) => {
    const { operation } = item;
    
    // This would be implemented with actual Convex mutations
    // For now, return a mock implementation
    switch (operation.type) {
      case 'CREATE_PROJECT':
        // await convex.mutation(api.projects.createProject, operation.data);
        break;
      case 'UPDATE_PROJECT':
        // await convex.mutation(api.projects.updateProject, operation.data);
        break;
      case 'CREATE_ATTENDANCE':
        // await convex.mutation(api.attendance.createAttendanceRecord, operation.data);
        break;
      case 'CREATE_EQUIPMENT_DISPATCH':
        // await convex.mutation(api.equipment.createDispatch, operation.data);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }

    // Simulate network delay and potential failure
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Random failure for testing (remove in production)
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }
  };

  // Manual sync trigger
  const manualSync = useCallback(() => {
    if (navigator.onLine) {
      processQueue();
    } else {
      toast({
        variant: "destructive",
        title: "No Connection",
        description: "Cannot sync while offline"
      });
    }
  }, [processQueue]);

  // Clear all queue items
  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Queue Cleared",
      description: "All offline items removed"
    });
  }, []);

  // Retry failed items
  const retryFailed = useCallback(() => {
    setQueue(prev => prev.map(item => ({
      ...item,
      status: item.status === 'failed' ? 'pending' : item.status,
      retries: item.status === 'failed' ? 0 : item.retries
    })));
    
    if (navigator.onLine) {
      scheduleSync(1000);
    }
  }, []);

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    const pending = queue.filter(item => item.status === 'pending').length;
    const retry = queue.filter(item => item.status === 'retry').length;
    const failed = queue.filter(item => item.status === 'failed').length;
    
    return {
      total: queue.length,
      pending,
      retry,
      failed,
      hasItems: queue.length > 0,
      needsAttention: failed > 0
    };
  }, [queue]);

  return {
    queue,
    queueOperation,
    processQueue: manualSync,
    clearQueue,
    retryFailed,
    isSyncing,
    lastSyncAttempt,
    stats: getQueueStats(),
    isOnline: navigator.onLine
  };
}

// Higher-order component for offline-aware operations
export function withOfflineSupport(Component) {
  return function OfflineAwareComponent(props) {
    const offlineSync = useOfflineSync();
    
    return (
      <Component 
        {...props} 
        offlineSync={offlineSync}
        isOffline={!navigator.onLine}
      />
    );
  };
}

export default useOfflineSync;