/** Indian mobile: national part must match /^[6-9]\d{9}$/; API uses E.164 +91XXXXXXXXXX */

const INDIAN_MOBILE_NATIONAL = /^[6-9]\d{9}$/

/**
 * Strip non-digits, remove leading country code 91 when 12 digits, optional leading 0.
 * Returns up to 10 digits (caller may slice for input caps).
 */
export function extractIndianMobileDigits(input: string): string {
  let phone = input.replace(/\D/g, "")
  if (phone.startsWith("91") && phone.length === 12) {
    phone = phone.slice(2)
  }
  if (phone.length === 11 && phone.startsWith("0")) {
    phone = phone.slice(1)
  }
  if (phone.length > 10) {
    phone = phone.slice(-10)
  }
  return phone
}

export function isValidIndianMobileNational(digits10: string): boolean {
  return INDIAN_MOBILE_NATIONAL.test(digits10)
}

/** Canonical form for reg-checkout / OTP APIs */
export function toIndianE164FromNational(digits10: string): string {
  return `+91${digits10}`
}

export function normalizeToIndianE164(input: string): string | null {
  const digits = extractIndianMobileDigits(input)
  if (!isValidIndianMobileNational(digits)) return null
  return toIndianE164FromNational(digits)
}
