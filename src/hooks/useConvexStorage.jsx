// Drop-in replacement for useLocalStorage that uses Convex
// UltraThink: This hook bridges localStorage patterns with Convex real-time data
// Provides optimistic updates, offline support, and seamless state management

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { toast } from '@/components/ui/use-toast.jsx';

// Main hook for Convex-based storage with localStorage-compatible API
export function useConvexStorage(queryFunction, mutationFunction, defaultValue, options = {}) {
  const {
    enableOptimistic = true,
    offlineFallback = true,
    localStorageKey = null // For backward compatibility during migration
  } = options;

  // Convex data
  const data = useQuery(queryFunction);
  const mutate = useMutation(mutationFunction);
  
  // Local optimistic state
  const [optimisticData, setOptimisticData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const pendingUpdates = useRef([]);

  // Determine current value (optimistic or server data)
  const currentValue = optimisticData !== null ? optimisticData : (data ?? defaultValue);

  // Handle offline fallback
  useEffect(() => {
    if (offlineFallback && localStorageKey && !data && !navigator.onLine) {
      try {
        const fallbackData = JSON.parse(localStorage.getItem(localStorageKey) || 'null');
        if (fallbackData) {
          setOptimisticData(fallbackData);
        }
      } catch (error) {
        console.warn('Failed to load offline fallback data:', error);
      }
    }
  }, [data, localStorageKey, offlineFallback]);

  // Sync optimistic data with server data when it changes
  useEffect(() => {
    if (data !== undefined && optimisticData !== null) {
      // Server data updated, clear optimistic state
      setOptimisticData(null);
      setIsUpdating(false);
    }
  }, [data, optimisticData]);

  const setValue = useCallback(async (newValue) => {
    const updatedValue = typeof newValue === 'function' ? newValue(currentValue) : newValue;
    
    try {
      setIsUpdating(true);
      
      // Optimistic update
      if (enableOptimistic) {
        setOptimisticData(updatedValue);
      }
      
      // Store offline fallback
      if (offlineFallback && localStorageKey) {
        localStorage.setItem(localStorageKey, JSON.stringify(updatedValue));
      }
      
      // Queue the update
      const updatePromise = mutate(updatedValue);
      pendingUpdates.current.push(updatePromise);
      
      await updatePromise;
      
      // Remove from pending updates
      pendingUpdates.current = pendingUpdates.current.filter(p => p !== updatePromise);
      
    } catch (error) {
      console.error('Failed to update Convex data:', error);
      
      // Revert optimistic update on error
      if (enableOptimistic) {
        setOptimisticData(data);
      }
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Changes could not be saved. Please try again."
      });
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [currentValue, mutate, enableOptimistic, offlineFallback, localStorageKey, data]);

  return [currentValue, setValue, { isUpdating, hasOptimisticData: optimisticData !== null }];
}

// Hook for list-based data (arrays) with common operations
export function useConvexList(listQuery, createMutation, updateMutation, deleteMutation, defaultValue = []) {
  const [data, setData, meta] = useConvexStorage(listQuery, createMutation, defaultValue);
  const updateItem = useMutation(updateMutation);
  const deleteItem = useMutation(deleteMutation);

  const addItem = useCallback(async (item) => {
    const newItem = {
      ...item,
      id: item.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    await setData(prevData => [...prevData, newItem]);
    return newItem;
  }, [setData]);

  const updateItemById = useCallback(async (id, updates) => {
    try {
      await updateItem({ id, ...updates });
    } catch (error) {
      // Fallback to array update if mutation fails
      await setData(prevData => 
        prevData.map(item => item.id === id ? { ...item, ...updates } : item)
      );
    }
  }, [updateItem, setData]);

  const removeItem = useCallback(async (id) => {
    try {
      await deleteItem({ id });
    } catch (error) {
      // Fallback to array filter if mutation fails
      await setData(prevData => prevData.filter(item => item.id !== id));
    }
  }, [deleteItem, setData]);

  const findItem = useCallback((id) => {
    return data.find(item => item.id === id);
  }, [data]);

  return {
    data,
    setData,
    addItem,
    updateItem: updateItemById,
    removeItem,
    findItem,
    ...meta
  };
}

// Hook for offline queue management
export function useOfflineSync(syncMutation) {
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const sync = useMutation(syncMutation);

  // Load offline queue from localStorage on mount
  useEffect(() => {
    try {
      const queue = JSON.parse(localStorage.getItem('convex_offline_queue') || '[]');
      setOfflineQueue(queue);
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('convex_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const addToQueue = useCallback((operation) => {
    const queueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      operation,
      retries: 0
    };
    
    setOfflineQueue(prev => [...prev, queueItem]);
    return queueItem.id;
  }, []);

  const syncQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || isSyncing || !navigator.onLine) {
      return;
    }

    setIsSyncing(true);
    const results = [];
    
    try {
      for (const item of offlineQueue) {
        try {
          const result = await sync(item.operation);
          results.push({ success: true, id: item.id, result });
        } catch (error) {
          console.error('Failed to sync offline item:', error);
          results.push({ success: false, id: item.id, error });
          
          // Increment retry count
          item.retries = (item.retries || 0) + 1;
        }
      }
      
      // Remove successfully synced items
      setOfflineQueue(prev => 
        prev.filter(item => {
          const result = results.find(r => r.id === item.id);
          return !(result?.success) && (item.retries || 0) < 3; // Keep failed items with < 3 retries
        })
      );
      
      const syncedCount = results.filter(r => r.success).length;
      if (syncedCount > 0) {
        toast({
          title: "Offline Data Synced",
          description: `${syncedCount} items synchronized successfully`
        });
      }
      
    } catch (error) {
      console.error('Sync queue error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [offlineQueue, isSyncing, sync]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (offlineQueue.length > 0) {
        setTimeout(syncQueue, 1000); // Delay to ensure connection is stable
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [offlineQueue.length, syncQueue]);

  return {
    offlineQueue,
    addToQueue,
    syncQueue,
    isSyncing,
    hasQueuedItems: offlineQueue.length > 0
  };
}

// Hook for optimistic updates with rollback capability
export function useOptimisticUpdate() {
  const [optimisticOperations, setOptimisticOperations] = useState(new Map());

  const applyOptimistic = useCallback((operationId, data, updateFn) => {
    setOptimisticOperations(prev => {
      const newMap = new Map(prev);
      newMap.set(operationId, { data, updateFn, timestamp: Date.now() });
      return newMap;
    });
  }, []);

  const confirmOptimistic = useCallback((operationId) => {
    setOptimisticOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });
  }, []);

  const rollbackOptimistic = useCallback((operationId) => {
    setOptimisticOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });
  }, []);

  const applyOptimisticUpdates = useCallback((baseData) => {
    let result = baseData;
    
    for (const [id, operation] of optimisticOperations) {
      try {
        result = operation.updateFn(result, operation.data);
      } catch (error) {
        console.warn(`Failed to apply optimistic update ${id}:`, error);
        // Auto-remove failed operations
        setOptimisticOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      }
    }
    
    return result;
  }, [optimisticOperations]);

  return {
    applyOptimistic,
    confirmOptimistic,
    rollbackOptimistic,
    applyOptimisticUpdates,
    hasOptimisticUpdates: optimisticOperations.size > 0
  };
}

export default useConvexStorage;