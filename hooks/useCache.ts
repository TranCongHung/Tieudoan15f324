import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseCacheOptions {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number;
  onEvict?: (key: string, data: any) => void;
}

export const useCache = <T = any>(options: UseCacheOptions = {}) => {
  const {
    defaultTTL = 5 * 60 * 1000, // 5 minutes
    maxSize = 100,
    onEvict
  } = options;

  const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    evictions: 0
  });

  // Clean expired items
  const cleanExpiredItems = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    let evictedCount = 0;

    for (const [key, item] of cache.entries()) {
      if (now > item.expiresAt) {
        cache.delete(key);
        evictedCount++;
        onEvict?.(key, item.data);
      }
    }

    if (evictedCount > 0) {
      setCacheStats(prev => ({ ...prev, evictions: prev.evictions + evictedCount }));
    }
  }, [onEvict]);

  // Evict least recently used items if cache is full
  const evictLRU = useCallback(() => {
    const cache = cacheRef.current;
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        const oldestItem = cache.get(oldestKey);
        cache.delete(oldestKey);
        onEvict?.(oldestKey, oldestItem?.data);
        setCacheStats(prev => ({ ...prev, evictions: prev.evictions + 1 }));
      }
    }
  }, [maxSize, onEvict]);

  // Get item from cache
  const get = useCallback((key: string): T | null => {
    cleanExpiredItems();
    
    const cache = cacheRef.current;
    const item = cache.get(key);
    
    if (item) {
      // Update access order (move to end)
      cache.delete(key);
      cache.set(key, item);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return item.data;
    }
    
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [cleanExpiredItems]);

  // Set item in cache
  const set = useCallback((key: string, data: T, ttl?: number) => {
    cleanExpiredItems();
    evictLRU();
    
    const now = Date.now();
    const expiresAt = now + (ttl || defaultTTL);
    
    cacheRef.current.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }, [cleanExpiredItems, evictLRU, defaultTTL]);

  // Check if item exists and is not expired
  const has = useCallback((key: string): boolean => {
    const item = cacheRef.current.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      cacheRef.current.delete(key);
      return false;
    }
    
    return true;
  }, []);

  // Delete item from cache
  const remove = useCallback((key: string): boolean => {
    const item = cacheRef.current.get(key);
    if (item) {
      cacheRef.current.delete(key);
      onEvict?.(key, item.data);
      return true;
    }
    return false;
  }, [onEvict]);

  // Clear all cache
  const clear = useCallback(() => {
    const cache = cacheRef.current;
    for (const [key, item] of cache.entries()) {
      onEvict?.(key, item.data);
    }
    cache.clear();
    setCacheStats({ hits: 0, misses: 0, evictions: 0 });
  }, [onEvict]);

  // Get cache size
  const size = useCallback(() => cacheRef.current.size, []);

  // Get cache keys
  const keys = useCallback(() => Array.from(cacheRef.current.keys()), []);

  // Clean expired items periodically
  useEffect(() => {
    const interval = setInterval(cleanExpiredItems, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, [cleanExpiredItems]);

  return {
    get,
    set,
    has,
    remove,
    clear,
    size,
    keys,
    stats: cacheStats
  };
};

// Hook for async operations with caching
export const useCachedAsync = <T = any>(
  key: string,
  asyncFn: () => Promise<T>,
  options: UseCacheOptions & { ttl?: number } = {}
) => {
  const cache = useCache<T>(options);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (forceRefresh = false) => {
    // Try to get from cache first
    if (!forceRefresh) {
      const cachedData = cache.get(key);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      cache.set(key, result, options.ttl);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, asyncFn, cache, options.ttl]);

  // Load data on mount
  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refresh: () => execute(true),
    invalidate: () => cache.remove(key)
  };
};

export default useCache;
