"use client"

import React, { createContext, useContext, useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface ReCaptchaContextType {
  recaptchaRef: React.RefObject<ReCAPTCHA>
  getToken: () => string | null
  resetRecaptcha: () => void
  isEnabled: boolean
}

const ReCaptchaContext = createContext<ReCaptchaContextType | null>(null)

interface ReCaptchaWrapperProps {
  children: React.ReactNode
}

export function ReCaptchaWrapper({ children }: ReCaptchaWrapperProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const isEnabled = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === 'true'

  const getToken = (): string | null => {
    if (!isEnabled || !recaptchaRef.current) {
      return null
    }
    return recaptchaRef.current.getValue()
  }

  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const contextValue: ReCaptchaContextType = {
    recaptchaRef,
    getToken,
    resetRecaptcha,
    isEnabled
  }

  return (
    <ReCaptchaContext.Provider value={contextValue}>
      {children}
    </ReCaptchaContext.Provider>
  )
}

export function useReCaptcha() {
  const context = useContext(ReCaptchaContext)
  if (!context) {
    throw new Error('useReCaptcha must be used within ReCaptchaWrapper')
  }
  return context
}

// ReCAPTCHA Component
export function ReCaptchaComponent() {
  const { recaptchaRef, isEnabled } = useReCaptcha()
  const [recaptchaError, setRecaptchaError] = useState('')
  
  if (!isEnabled || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY === 'your_site_key_here') {
    return null
  }

  const handleRecaptchaChange = (value: string | null) => {
    if (value) {
      setRecaptchaError('')
    }
  }

  const handleRecaptchaError = () => {
    setRecaptchaError('reCAPTCHA verification failed. Please try again.')
  }

  return (
    <div className="mb-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        onChange={handleRecaptchaChange}
        onErrored={handleRecaptchaError}
        onExpired={() => setRecaptchaError('reCAPTCHA expired. Please verify again.')}
      />
      {recaptchaError && (
        <div className="text-red-500 text-sm mt-2">{recaptchaError}</div>
      )}
    </div>
  )
}
