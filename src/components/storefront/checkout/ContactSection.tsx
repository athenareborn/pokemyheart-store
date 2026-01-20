'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useCheckoutStore } from '@/lib/store/checkout'
import { validateEmail } from '@/lib/validation/checkout-schema'
import { cn } from '@/lib/utils'

export function ContactSection() {
  const { email, setEmail, newsletterOptIn, setNewsletterOptIn, errors, setError, clearError } =
    useCheckoutStore()
  const [touched, setTouched] = useState(false)

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched) {
      const result = validateEmail(value)
      if (result.error) {
        setError('email', result.error)
      } else {
        clearError('email')
      }
    }
  }

  const handleBlur = () => {
    setTouched(true)
    const result = validateEmail(email)
    if (result.error) {
      setError('email', result.error)
    } else {
      clearError('email')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Lock className="h-3 w-3" />
          Secure
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleBlur}
          autoComplete="email"
          className={cn(
            errors.email && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="newsletter"
          checked={newsletterOptIn}
          onCheckedChange={(checked) => setNewsletterOptIn(checked === true)}
        />
        <Label
          htmlFor="newsletter"
          className="text-sm text-gray-600 font-normal cursor-pointer"
        >
          Email me with news and offers
        </Label>
      </div>
    </div>
  )
}
