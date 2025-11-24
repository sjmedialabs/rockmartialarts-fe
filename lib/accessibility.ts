/**
 * Accessibility utilities and helpers for the student dashboard
 */

import { useEffect, useRef, useState } from 'react'

// ARIA live region announcer
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return

  const announcer = document.getElementById('screen-reader-announcer')
  if (announcer) {
    announcer.setAttribute('aria-live', priority)
    announcer.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }
}

// Hook for managing focus
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null)
  
  const setFocus = (element?: HTMLElement | null) => {
    if (element) {
      focusRef.current = element
      element.focus()
    } else if (focusRef.current) {
      focusRef.current.focus()
    }
  }
  
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  }
  
  return { setFocus, trapFocus, focusRef }
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  items: any[],
  onSelect?: (item: any, index: number) => void
) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev < items.length - 1 ? prev + 1 : 0
          itemRefs.current[next]?.focus()
          return next
        })
        break
        
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev > 0 ? prev - 1 : items.length - 1
          itemRefs.current[next]?.focus()
          return next
        })
        break
        
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0 && onSelect) {
          onSelect(items[activeIndex], activeIndex)
        }
        break
        
      case 'Escape':
        setActiveIndex(-1)
        break
    }
  }
  
  const setItemRef = (index: number) => (ref: HTMLElement | null) => {
    itemRefs.current[index] = ref
  }
  
  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    setItemRef,
    itemRefs: itemRefs.current
  }
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersReducedMotion
}

// Hook for high contrast preference
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersHighContrast
}

// Utility to generate accessible IDs
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

// Utility to check color contrast
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd want a more robust color parsing library
  const getLuminance = (color: string): number => {
    // This is a simplified version - you'd want proper color parsing
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }
  
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// ARIA attributes helpers
export const ariaAttributes = {
  button: (label: string, pressed?: boolean, expanded?: boolean) => ({
    'aria-label': label,
    ...(pressed !== undefined && { 'aria-pressed': pressed }),
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    role: 'button',
    tabIndex: 0
  }),
  
  link: (label: string, current?: boolean) => ({
    'aria-label': label,
    ...(current && { 'aria-current': 'page' }),
    role: 'link'
  }),
  
  navigation: (label: string) => ({
    'aria-label': label,
    role: 'navigation'
  }),
  
  region: (label: string) => ({
    'aria-label': label,
    role: 'region'
  }),
  
  status: (label: string, live: 'polite' | 'assertive' = 'polite') => ({
    'aria-label': label,
    'aria-live': live,
    role: 'status'
  }),
  
  alert: (label: string) => ({
    'aria-label': label,
    role: 'alert'
  })
}

// These components are moved to accessibility-components.tsx to avoid JSX in .ts files

// Focus visible utility classes
export const focusClasses = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  button: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white',
  input: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  card: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50'
}
