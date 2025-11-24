import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface ApiOptions {
  maxRetries?: number
  retryDelay?: number
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
  errorMessage?: string
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  retryCount: number
  isRetrying: boolean
}

interface ApiReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  retry: () => Promise<T | null>
  reset: () => void
  cancel: () => void
}

export function useApiWithRetry<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
): ApiReturn<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    errorMessage
  } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0,
    isRetrying: false
  })

  const lastArgsRef = useRef<any[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState(prev => ({ ...prev, loading: false, isRetrying: false }))
  }, [])

  const reset = useCallback(() => {
    cancel()
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    })
  }, [cancel])

  const executeWithRetry = useCallback(async (
    args: any[],
    currentRetry: number = 0
  ): Promise<T | null> => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        isRetrying: currentRetry > 0,
        retryCount: currentRetry
      }))

      // Execute the API function
      const result = await apiFunction(...args)

      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return null
      }

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        isRetrying: false
      }))

      if (showSuccessToast && successMessage) {
        toast.success(successMessage)
      }

      return result

    } catch (error: any) {
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return null
      }

      const errorMsg = error?.message || 'An unexpected error occurred'
      
      // If we haven't reached max retries, attempt retry
      if (currentRetry < maxRetries) {
        console.warn(`API call failed (attempt ${currentRetry + 1}/${maxRetries + 1}):`, errorMsg)
        
        // Wait before retrying (exponential backoff)
        const delay = retryDelay * Math.pow(2, currentRetry)
        
        setState(prev => ({
          ...prev,
          loading: false,
          isRetrying: true,
          retryCount: currentRetry + 1
        }))

        // Show retry toast
        toast.info(`Retrying in ${delay / 1000} seconds... (${currentRetry + 1}/${maxRetries})`)

        await sleep(delay)

        // Check if cancelled during delay
        if (abortControllerRef.current?.signal.aborted) {
          return null
        }

        return executeWithRetry(args, currentRetry + 1)
      }

      // Max retries reached, set error state
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMsg,
        isRetrying: false,
        retryCount: currentRetry
      }))

      if (showErrorToast) {
        const finalErrorMessage = errorMessage || `Failed after ${maxRetries + 1} attempts: ${errorMsg}`
        toast.error(finalErrorMessage)
      }

      console.error('API call failed after all retries:', error)
      return null
    }
  }, [apiFunction, maxRetries, retryDelay, showErrorToast, showSuccessToast, successMessage, errorMessage])

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    lastArgsRef.current = args
    return executeWithRetry(args, 0)
  }, [executeWithRetry])

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastArgsRef.current.length === 0) {
      console.warn('No previous arguments found for retry')
      return null
    }
    return executeWithRetry(lastArgsRef.current, 0)
  }, [executeWithRetry])

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel
  }
}

// Specialized hook for reports API
export function useReportsApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
) {
  return useApiWithRetry(apiFunction, {
    maxRetries: 2,
    retryDelay: 1500,
    showErrorToast: true,
    errorMessage: 'Failed to load report data. Please try again.',
    ...options
  })
}

// Hook for handling multiple concurrent API calls
export function useMultipleApiCalls() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const activeCallsRef = useRef(new Set<string>())

  const executeMultiple = useCallback(async <T>(
    calls: Array<{
      id: string
      apiCall: () => Promise<T>
      onSuccess?: (data: T) => void
      onError?: (error: Error) => void
    }>
  ) => {
    setLoading(true)
    setErrors([])

    const results: Array<{ id: string; data?: T; error?: Error }> = []

    try {
      const promises = calls.map(async ({ id, apiCall, onSuccess, onError }) => {
        activeCallsRef.current.add(id)
        
        try {
          const data = await apiCall()
          activeCallsRef.current.delete(id)
          
          if (onSuccess) onSuccess(data)
          return { id, data }
        } catch (error: any) {
          activeCallsRef.current.delete(id)
          
          if (onError) onError(error)
          setErrors(prev => [...prev, `${id}: ${error.message}`])
          return { id, error }
        }
      })

      const settled = await Promise.allSettled(promises)
      
      settled.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({ id: calls[index].id, error: result.reason })
        }
      })

    } finally {
      setLoading(false)
      activeCallsRef.current.clear()
    }

    return results
  }, [])

  const cancelAll = useCallback(() => {
    activeCallsRef.current.clear()
    setLoading(false)
  }, [])

  return {
    loading,
    errors,
    executeMultiple,
    cancelAll,
    activeCallsCount: activeCallsRef.current.size
  }
}
