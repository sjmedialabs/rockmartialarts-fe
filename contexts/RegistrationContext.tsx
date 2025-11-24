"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface RegistrationData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  mobile: string
  gender: string
  dob: string
  
  // Course Information (IDs)
  category_id: string
  course_id: string
  duration: string
  
  // Branch Information (IDs)
  location_id: string
  branch_id: string
  
  // Payment Information
  paymentMethod: string
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
  
  // Additional fields
  password?: string
  biometric_id?: string
}

interface RegistrationContextType {
  registrationData: RegistrationData
  updateRegistrationData: (data: Partial<RegistrationData>) => void
  clearRegistrationData: () => void
  getApiPayload: () => any
}

const defaultRegistrationData: RegistrationData = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  gender: '',
  dob: '',
  category_id: '',
  course_id: '',
  duration: '',
  location_id: '',
  branch_id: '',
  paymentMethod: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  nameOnCard: '',
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined)

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registrationData, setRegistrationData] = useState<RegistrationData>(defaultRegistrationData)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('registrationData')
    if (savedData) {
      try {
        setRegistrationData(JSON.parse(savedData))
      } catch (error) {
        console.error('Error parsing saved registration data:', error)
      }
    }
  }, [])

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    const updatedData = { ...registrationData, ...data }
    setRegistrationData(updatedData)
    localStorage.setItem('registrationData', JSON.stringify(updatedData))
  }

  const clearRegistrationData = () => {
    setRegistrationData(defaultRegistrationData)
    localStorage.removeItem('registrationData')
  }

  const getApiPayload = () => {
    // Separate user data from course enrollment data
    return {
      email: registrationData.email,
      password: registrationData.password || undefined,
      phone: registrationData.mobile,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      full_name: `${registrationData.firstName} ${registrationData.lastName}`,
      role: "student",
      biometric_id: registrationData.biometric_id || undefined,
      is_active: true,
      date_of_birth: registrationData.dob || undefined,
      gender: registrationData.gender || undefined,
      // DEPRECATED: Keep for backward compatibility during migration
      course: registrationData.category_id && registrationData.course_id && registrationData.duration ? {
        category_id: String(registrationData.category_id),
        course_id: String(registrationData.course_id),
        duration: String(registrationData.duration)
      } : undefined,
      branch: registrationData.location_id && registrationData.branch_id ? {
        location_id: String(registrationData.location_id),
        branch_id: String(registrationData.branch_id)
      } : undefined
    }
  }

  // Get enrollment data separately for payment processing
  const getEnrollmentData = () => {
    if (!registrationData.category_id || !registrationData.course_id || !registrationData.branch_id) {
      return null
    }

    return {
      course_id: String(registrationData.course_id),
      branch_id: String(registrationData.branch_id),
      category_id: String(registrationData.category_id),
      duration: String(registrationData.duration)
    }
  }

  return (
    <RegistrationContext.Provider value={{
      registrationData,
      updateRegistrationData,
      clearRegistrationData,
      getApiPayload,
      getEnrollmentData
    }}>
      {children}
    </RegistrationContext.Provider>
  )
}

export const useRegistration = () => {
  const context = useContext(RegistrationContext)
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider')
  }
  return context
}
