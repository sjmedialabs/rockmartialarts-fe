import { toast } from "sonner"

// Type definitions for validation
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: any
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
  sanitize?: (value: any) => any
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

// Sanitization utilities
export const sanitizeString = (value: any): string => {
  if (typeof value !== 'string') {
    return String(value || '').trim()
  }
  
  return value
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

export const sanitizeNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  
  const num = Number(value)
  return isNaN(num) ? null : num
}

export const sanitizeBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1'
  }
  return Boolean(value)
}

export const sanitizeArray = (value: any): any[] => {
  if (Array.isArray(value)) {
    return value.filter(item => item !== null && item !== undefined)
  }
  return []
}

export const sanitizeObject = (value: any): object => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value
  }
  return {}
}

// Validation functions
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const validateMinLength = (value: any, minLength: number): boolean => {
  if (typeof value === 'string') return value.length >= minLength
  if (Array.isArray(value)) return value.length >= minLength
  return true
}

export const validateMaxLength = (value: any, maxLength: number): boolean => {
  if (typeof value === 'string') return value.length <= maxLength
  if (Array.isArray(value)) return value.length <= maxLength
  return true
}

export const validatePattern = (value: any, pattern: RegExp): boolean => {
  if (typeof value !== 'string') return false
  return pattern.test(value)
}

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return validatePattern(email, emailPattern)
}

export const validateDate = (date: string): boolean => {
  if (!date) return false
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  if (!validateDate(startDate) || !validateDate(endDate)) return false
  return new Date(startDate) <= new Date(endDate)
}

// Main validation function
export const validateField = (
  value: any, 
  rules: ValidationRule, 
  fieldName: string = 'Field'
): ValidationResult => {
  const errors: string[] = []
  let sanitizedValue = value

  // Apply sanitization if provided
  if (rules.sanitize) {
    sanitizedValue = rules.sanitize(value)
  }

  // Required validation
  if (rules.required && !validateRequired(sanitizedValue)) {
    errors.push(`${fieldName} is required`)
  }

  // Skip other validations if value is empty and not required
  if (!validateRequired(sanitizedValue) && !rules.required) {
    return { isValid: true, errors: [], sanitizedValue }
  }

  // Min length validation
  if (rules.minLength && !validateMinLength(sanitizedValue, rules.minLength)) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters`)
  }

  // Max length validation
  if (rules.maxLength && !validateMaxLength(sanitizedValue, rules.maxLength)) {
    errors.push(`${fieldName} must be no more than ${rules.maxLength} characters`)
  }

  // Pattern validation
  if (rules.pattern && !validatePattern(sanitizedValue, rules.pattern)) {
    errors.push(`${fieldName} format is invalid`)
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(sanitizedValue)
    if (typeof customResult === 'string') {
      errors.push(customResult)
    } else if (!customResult) {
      errors.push(`${fieldName} is invalid`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue
  }
}

// Validate entire object against schema
export const validateObject = (
  data: any, 
  schema: ValidationSchema
): ValidationResult => {
  const errors: string[] = []
  const sanitizedData: any = {}

  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldValue = data?.[fieldName]
    const result = validateField(fieldValue, rules, fieldName)
    
    if (!result.isValid) {
      errors.push(...result.errors)
    }
    
    sanitizedData[fieldName] = result.sanitizedValue
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedData
  }
}

// Report-specific validation schemas
export const reportFiltersSchema: ValidationSchema = {
  session: {
    sanitize: sanitizeString,
    maxLength: 50
  },
  class: {
    sanitize: sanitizeString,
    maxLength: 50
  },
  section: {
    sanitize: sanitizeString,
    maxLength: 50
  },
  fees_type: {
    sanitize: sanitizeString,
    maxLength: 50
  },
  branch_id: {
    sanitize: sanitizeString,
    maxLength: 50
  },
  start_date: {
    sanitize: sanitizeString,
    custom: (value) => !value || validateDate(value) || 'Invalid start date format'
  },
  end_date: {
    sanitize: sanitizeString,
    custom: (value) => !value || validateDate(value) || 'Invalid end date format'
  }
}

export const searchTermSchema: ValidationSchema = {
  searchTerm: {
    sanitize: sanitizeString,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_]*$/ // Allow alphanumeric, spaces, hyphens, underscores
  }
}

// API response validation
export const validateApiResponse = (response: any, expectedFields: string[] = []): ValidationResult => {
  const errors: string[] = []

  if (!response || typeof response !== 'object') {
    errors.push('Invalid API response format')
    return { isValid: false, errors }
  }

  // Check for expected fields
  for (const field of expectedFields) {
    if (!(field in response)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: response
  }
}

// Validation hook for React components
export const useValidation = () => {
  const validateAndShowErrors = (
    data: any, 
    schema: ValidationSchema, 
    showToast: boolean = true
  ): ValidationResult => {
    const result = validateObject(data, schema)
    
    if (!result.isValid && showToast) {
      const errorMessage = result.errors.length === 1 
        ? result.errors[0]
        : `Please fix the following errors: ${result.errors.join(', ')}`
      
      toast.error(errorMessage)
    }
    
    return result
  }

  const validateField = (
    value: any, 
    rules: ValidationRule, 
    fieldName: string = 'Field',
    showToast: boolean = true
  ): ValidationResult => {
    const result = validateField(value, rules, fieldName)
    
    if (!result.isValid && showToast) {
      toast.error(result.errors[0])
    }
    
    return result
  }

  return {
    validateAndShowErrors,
    validateField,
    validateObject,
    validateApiResponse
  }
}

// Type guards for runtime type checking
export const isString = (value: any): value is string => {
  return typeof value === 'string'
}

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean'
}

export const isArray = (value: any): value is any[] => {
  return Array.isArray(value)
}

export const isObject = (value: any): value is object => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const isValidDate = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime())
}

// Safe data access utilities
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  try {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue
      }
      current = current[key]
    }
    
    return current !== undefined ? current : defaultValue
  } catch {
    return defaultValue
  }
}

export const safeParseJSON = <T>(jsonString: string, defaultValue: T): T => {
  try {
    const parsed = JSON.parse(jsonString)
    return parsed !== undefined ? parsed : defaultValue
  } catch {
    return defaultValue
  }
}
