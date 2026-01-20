import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email presence
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', trimmedEmail)
      .single()

    if (existingSubscriber) {
      // Return success even for duplicates (don't reveal if email exists)
      return NextResponse.json(
        { message: 'Thanks for subscribing!' },
        { status: 200 }
      )
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: trimmedEmail,
        subscribed_at: new Date().toISOString(),
        status: 'active',
      })

    if (insertError) {
      console.error('Newsletter signup error:', insertError)

      // Handle unique constraint violation gracefully
      if (insertError.code === '23505') {
        return NextResponse.json(
          { message: 'Thanks for subscribing!' },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Thanks for subscribing!' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
