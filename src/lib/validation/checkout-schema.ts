import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Accepts email OR phone number in a single field
export const contactFieldSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => {
    if (val === '') return true
    // Check if it's a valid email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    // Check if it's a valid phone (10+ digits, allows formatting)
    const digitsOnly = val.replace(/\D/g, '')
    const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 15
    return isEmail || isPhone
  }, {
    message: 'Please enter a valid email or phone number',
  })

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .refine(
      (val) => {
        // US: 5 digits or 5+4
        const usPattern = /^\d{5}(-\d{4})?$/
        // CA: A1A 1A1
        const caPattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
        // UK: Various formats
        const ukPattern = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/
        // AU: 4 digits
        const auPattern = /^\d{4}$/

        return (
          usPattern.test(val) ||
          caPattern.test(val) ||
          ukPattern.test(val) ||
          auPattern.test(val)
        )
      },
      { message: 'Please enter a valid postal code' }
    ),
  country: z.enum(['US', 'CA', 'GB', 'AU'], {
    message: 'Please select a country',
  }),
  phone: z.string().optional(),
})

export const contactSchema = z.object({
  email: emailSchema,
  newsletterOptIn: z.boolean().optional(),
})

export const checkoutFormSchema = z.object({
  email: contactFieldSchema.refine((val) => val.length > 0, {
    message: 'Email or phone is required',
  }),
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(['standard', 'express']),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>

// Validation helper functions
export function validateEmail(email: string) {
  const result = emailSchema.safeParse(email)
  return {
    valid: result.success,
    error: result.success ? null : result.error.issues[0]?.message,
  }
}

export function validateShippingAddress(address: unknown) {
  const result = shippingAddressSchema.safeParse(address)
  if (result.success) {
    return { valid: true, errors: {} }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0] as string] = err.message
    }
  })

  return { valid: false, errors }
}

export function validateCheckoutForm(data: unknown) {
  const result = checkoutFormSchema.safeParse(data)
  if (result.success) {
    return { valid: true, errors: {} }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((err) => {
    const path = err.path.join('.')
    errors[path] = err.message
  })

  return { valid: false, errors }
}
