import { useState, useEffect } from 'react'
import { dropdownAPI, DropdownOption, DropdownCategoryType } from '@/lib/dropdownAPI'
import { TokenManager } from '@/lib/tokenManager'

export function useDropdownOptions(category: DropdownCategoryType) {
  const [options, setOptions] = useState<DropdownOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadOptions = async () => {
      try {
        setLoading(true)
        const token = TokenManager.getToken()
        
        let fetchedOptions: DropdownOption[]
        
        if (token) {
          try {
            fetchedOptions = await dropdownAPI.getCategoryOptions(category, token)
          } catch (apiError) {
            // Fallback to default options if API fails
            console.log(`API failed for ${category}, using defaults`)
            fetchedOptions = dropdownAPI.getDefaultOptions(category)
          }
        } else {
          // No token, use default options
          fetchedOptions = dropdownAPI.getDefaultOptions(category)
        }

        if (isMounted) {
          // Filter only active options
          const activeOptions = fetchedOptions.filter(opt => opt.is_active)
          setOptions(activeOptions)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load options'))
          // Still set default options on error
          setOptions(dropdownAPI.getDefaultOptions(category).filter(opt => opt.is_active))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOptions()

    return () => {
      isMounted = false
    }
  }, [category])

  return { options, loading, error }
}

// Hook for getting multiple categories at once
export function useMultipleDropdownOptions(categories: DropdownCategoryType[]) {
  const [optionsMap, setOptionsMap] = useState<Record<DropdownCategoryType, DropdownOption[]>>({} as Record<DropdownCategoryType, DropdownOption[]>)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAllOptions = async () => {
      try {
        setLoading(true)
        const token = TokenManager.getToken()
        const results: Record<string, DropdownOption[]> = {}

        await Promise.all(
          categories.map(async (category) => {
            try {
              let fetchedOptions: DropdownOption[]
              
              if (token) {
                try {
                  fetchedOptions = await dropdownAPI.getCategoryOptions(category, token)
                } catch (apiError) {
                  fetchedOptions = dropdownAPI.getDefaultOptions(category)
                }
              } else {
                fetchedOptions = dropdownAPI.getDefaultOptions(category)
              }

              results[category] = fetchedOptions.filter(opt => opt.is_active)
            } catch (err) {
              console.error(`Error loading ${category}:`, err)
              results[category] = dropdownAPI.getDefaultOptions(category).filter(opt => opt.is_active)
            }
          })
        )

        if (isMounted) {
          setOptionsMap(results as Record<DropdownCategoryType, DropdownOption[]>)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load options'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAllOptions()

    return () => {
      isMounted = false
    }
  }, [categories.join(',')])

  return { optionsMap, loading, error }
}
