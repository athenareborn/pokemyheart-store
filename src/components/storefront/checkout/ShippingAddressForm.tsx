'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCheckoutStore } from '@/lib/store/checkout'
import { cn } from '@/lib/utils'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

export function ShippingAddressForm() {
  const { shippingAddress, setShippingAddress, errors, setError, clearError } =
    useCheckoutStore()
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (field: string, value: string) => {
    setShippingAddress({ [field]: value })
    if (touched[field] && !value.trim()) {
      setError(`shippingAddress.${field}`, `${getFieldLabel(field)} is required`)
    } else {
      clearError(`shippingAddress.${field}`)
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const value = shippingAddress[field as keyof typeof shippingAddress]
    if (!value?.trim() && isRequired(field)) {
      setError(`shippingAddress.${field}`, `${getFieldLabel(field)} is required`)
    }
  }

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      address1: 'Address',
      address2: 'Apartment',
      city: 'City',
      state: 'State',
      postalCode: 'Postal code',
      country: 'Country',
      phone: 'Phone',
    }
    return labels[field] || field
  }

  const isRequired = (field: string): boolean => {
    return !['address2', 'phone'].includes(field)
  }

  const getError = (field: string) => errors[`shippingAddress.${field}`]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>

      <div className="space-y-2">
        <Label htmlFor="country">Country/Region</Label>
        <Select
          value={shippingAddress.country}
          onValueChange={(value) => handleChange('country', value)}
        >
          <SelectTrigger
            id="country"
            className={cn(getError('country') && 'border-red-500')}
          >
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getError('country') && (
          <p className="text-sm text-red-500">{getError('country')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={shippingAddress.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            autoComplete="given-name"
            className={cn(getError('firstName') && 'border-red-500')}
          />
          {getError('firstName') && (
            <p className="text-sm text-red-500">{getError('firstName')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={shippingAddress.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            autoComplete="family-name"
            className={cn(getError('lastName') && 'border-red-500')}
          />
          {getError('lastName') && (
            <p className="text-sm text-red-500">{getError('lastName')}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address1">Address</Label>
        <Input
          id="address1"
          value={shippingAddress.address1}
          onChange={(e) => handleChange('address1', e.target.value)}
          onBlur={() => handleBlur('address1')}
          autoComplete="address-line1"
          placeholder="Street address"
          className={cn(getError('address1') && 'border-red-500')}
        />
        {getError('address1') && (
          <p className="text-sm text-red-500">{getError('address1')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
        <Input
          id="address2"
          value={shippingAddress.address2}
          onChange={(e) => handleChange('address2', e.target.value)}
          autoComplete="address-line2"
          placeholder="Apartment, suite, unit, etc."
        />
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={shippingAddress.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            autoComplete="address-level2"
            className={cn(getError('city') && 'border-red-500')}
          />
          {getError('city') && (
            <p className="text-sm text-red-500">{getError('city')}</p>
          )}
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="state">State</Label>
          {shippingAddress.country === 'US' ? (
            <Select
              value={shippingAddress.state}
              onValueChange={(value) => handleChange('state', value)}
            >
              <SelectTrigger
                id="state"
                className={cn(getError('state') && 'border-red-500')}
              >
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="state"
              value={shippingAddress.state}
              onChange={(e) => handleChange('state', e.target.value)}
              onBlur={() => handleBlur('state')}
              autoComplete="address-level1"
              className={cn(getError('state') && 'border-red-500')}
            />
          )}
          {getError('state') && (
            <p className="text-sm text-red-500">{getError('state')}</p>
          )}
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="postalCode">ZIP code</Label>
          <Input
            id="postalCode"
            value={shippingAddress.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            onBlur={() => handleBlur('postalCode')}
            autoComplete="postal-code"
            inputMode="numeric"
            className={cn(getError('postalCode') && 'border-red-500')}
          />
          {getError('postalCode') && (
            <p className="text-sm text-red-500">{getError('postalCode')}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={shippingAddress.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          autoComplete="tel"
          placeholder="For delivery updates"
        />
      </div>
    </div>
  )
}
