"use client"

import { useEffect } from 'react'
import { SkipLink } from '@/components/accessibility-components'

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export default function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  useEffect(() => {
    // Create screen reader announcer if it doesn't exist
    if (!document.getElementById('screen-reader-announcer')) {
      const announcer = document.createElement('div')
      announcer.id = 'screen-reader-announcer'
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      document.body.appendChild(announcer)
    }

    // Add focus-visible polyfill styles if needed
    const style = document.createElement('style')
    style.textContent = `
      /* Focus visible styles for better accessibility */
      .focus-visible:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .bg-gray-50 { background-color: white; }
        .bg-gray-100 { background-color: white; }
        .text-gray-600 { color: black; }
        .text-gray-500 { color: black; }
        .border-gray-200 { border-color: black; }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Screen reader only utility */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .sr-only:focus,
      .focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `
    document.head.appendChild(style)

    // Keyboard navigation improvements
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt + 1: Skip to main content
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        const main = document.querySelector('main')
        if (main) {
          main.focus()
          main.scrollIntoView({ behavior: 'smooth' })
        }
      }
      
      // Alt + 2: Skip to navigation
      if (e.altKey && e.key === '2') {
        e.preventDefault()
        const nav = document.querySelector('nav')
        if (nav) {
          nav.focus()
          nav.scrollIntoView({ behavior: 'smooth' })
        }
      }
      
      // Escape key: Close any open modals/dropdowns
      if (e.key === 'Escape') {
        const openDropdowns = document.querySelectorAll('[data-state="open"]')
        openDropdowns.forEach(dropdown => {
          const closeButton = dropdown.querySelector('[aria-label*="close"], [aria-label*="Close"]')
          if (closeButton instanceof HTMLElement) {
            closeButton.click()
          }
        })
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [])

  return (
    <>
      {/* Skip Links */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      
      {/* Main Content */}
      {children}
      
      {/* Screen Reader Announcements */}
      <div
        id="screen-reader-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Keyboard Shortcuts Help */}
      <div className="sr-only">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Alt + 1: Skip to main content</li>
          <li>Alt + 2: Skip to navigation</li>
          <li>Escape: Close open menus or dialogs</li>
          <li>Tab: Navigate forward through interactive elements</li>
          <li>Shift + Tab: Navigate backward through interactive elements</li>
          <li>Enter or Space: Activate buttons and links</li>
          <li>Arrow keys: Navigate through menu items and lists</li>
        </ul>
      </div>
    </>
  )
}
