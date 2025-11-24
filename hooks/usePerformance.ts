import { useCallback, useRef, useMemo, useEffect, useState } from 'react'

// Debounce hook for search and input handling
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for scroll and resize events
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

// Memoized callback with dependency tracking
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

// Memoized value with deep comparison
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()

  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }

  return ref.current.value
}

// Deep equality check for objects and arrays
function areEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!areEqual(a[i], b[i])) return false
    }
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (const key of keysA) {
      if (!keysB.includes(key) || !areEqual(a[key], b[key])) return false
    }
    return true
  }
  return false
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState<Element | null>(null)

  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null
    
    return new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)
  }, [options.root, options.rootMargin, options.threshold])

  useEffect(() => {
    if (!observer || !element) return

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [observer, element])

  const ref = useCallback((node: Element | null) => {
    setElement(node)
  }, [])

  return [ref, isIntersecting]
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { start, end }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    offsetY: visibleRange.start * itemHeight
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    renderCount.current += 1
  })

  useEffect(() => {
    const endTime = Date.now()
    const renderTime = endTime - startTime.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Renders: ${renderCount.current}, Time: ${renderTime}ms`)
    }
    
    startTime.current = endTime
  })

  return {
    renderCount: renderCount.current,
    logPerformance: (action: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} - ${action} at render ${renderCount.current}`)
      }
    }
  }
}

// Optimized search hook with debouncing and memoization
export function useOptimizedSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items

    const searchLower = debouncedSearchTerm.toLowerCase().trim()
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower)
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchLower)
        }
        return false
      })
    })
  }, [items, searchFields, debouncedSearchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm
  }
}

// Batch state updates hook
export function useBatchedUpdates() {
  const [updates, setUpdates] = useState<(() => void)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchUpdate = useCallback((updateFn: () => void) => {
    setUpdates(prev => [...prev, updateFn])
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setUpdates(currentUpdates => {
        currentUpdates.forEach(fn => fn())
        return []
      })
    }, 0)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return batchUpdate
}

// Optimized event handler hook
export function useOptimizedEventHandler<T extends Event>(
  handler: (event: T) => void,
  deps: React.DependencyList,
  options: { passive?: boolean; capture?: boolean } = {}
) {
  const handlerRef = useRef(handler)
  
  useEffect(() => {
    handlerRef.current = handler
  }, deps)

  return useCallback((event: T) => {
    handlerRef.current(event)
  }, [])
}

// Memory usage monitoring (development only)
export function useMemoryMonitor(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemory = () => {
        const memory = (performance as any).memory
        console.log(`${componentName} Memory:`, {
          used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
        })
      }

      logMemory()
      const interval = setInterval(logMemory, 5000)
      
      return () => clearInterval(interval)
    }
  }, [componentName])
}

// Optimized data fetching with caching
export function useOptimizedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cacheTime?: number
    staleTime?: number
    refetchOnWindowFocus?: boolean
  } = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000,  // 1 minute
    refetchOnWindowFocus = true
  } = options

  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map())
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (force = false) => {
    const cached = cache.current.get(key)
    const now = Date.now()

    // Return cached data if it's still fresh and not forced
    if (!force && cached && (now - cached.timestamp) < staleTime) {
      setData(cached.data)
      return cached.data
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cache.current.set(key, { data: result, timestamp: now })
      setData(result)
      
      // Clean up old cache entries
      for (const [cacheKey, cacheValue] of cache.current.entries()) {
        if (now - cacheValue.timestamp > cacheTime) {
          cache.current.delete(cacheKey)
        }
      }
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, staleTime, cacheTime])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => fetchData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, refetchOnWindowFocus])

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    mutate: (newData: T) => {
      cache.current.set(key, { data: newData, timestamp: Date.now() })
      setData(newData)
    }
  }
}
