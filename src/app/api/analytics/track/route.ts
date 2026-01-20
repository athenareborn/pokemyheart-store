import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for writing analytics (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TrackEventBody {
  event_type: string
  session_id: string
  visitor_id: string
  page_path?: string
  device_type?: string
  referrer?: string
  event_data?: Record<string, unknown>
  create_session?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackEventBody = await request.json()

    const {
      event_type,
      session_id,
      visitor_id,
      page_path,
      device_type,
      referrer,
      event_data,
      create_session,
    } = body

    if (!event_type || !session_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, session_id' },
        { status: 400 }
      )
    }

    // Insert the event
    const { error: eventError } = await supabase.from('analytics_events').insert({
      event_type,
      session_id,
      visitor_id,
      page_path,
      device_type,
      referrer,
      event_data,
    })

    if (eventError) {
      console.error('Error inserting event:', eventError)
      // Don't return error - analytics shouldn't break the app
    }

    // Create or update session if requested
    if (create_session || event_type === 'session_start') {
      const utmSource = event_data?.utm_source as string | undefined
      const utmMedium = event_data?.utm_medium as string | undefined
      const utmCampaign = event_data?.utm_campaign as string | undefined

      const { error: sessionError } = await supabase
        .from('analytics_sessions')
        .upsert(
          {
            session_id,
            visitor_id,
            device_type,
            referrer,
            landing_page: page_path,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            page_views: 1,
          },
          { onConflict: 'session_id' }
        )

      if (sessionError) {
        console.error('Error upserting session:', sessionError)
      }
    }

    // Update session page views
    if (event_type === 'page_view') {
      try {
        const { data: session } = await supabase
          .from('analytics_sessions')
          .select('page_views')
          .eq('session_id', session_id)
          .single()

        if (session) {
          await supabase
            .from('analytics_sessions')
            .update({ page_views: (session.page_views || 0) + 1 })
            .eq('session_id', session_id)
        }
      } catch {
        // Silently fail - don't break tracking
      }
    }

    // Update funnel flags
    const funnelUpdates: Record<string, boolean> = {}

    switch (event_type) {
      case 'product_view':
        funnelUpdates.viewed_product = true
        break
      case 'add_to_cart':
        funnelUpdates.viewed_product = true
        funnelUpdates.added_to_cart = true
        break
      case 'checkout_start':
        funnelUpdates.viewed_product = true
        funnelUpdates.added_to_cart = true
        funnelUpdates.started_checkout = true
        break
      case 'purchase':
        funnelUpdates.viewed_product = true
        funnelUpdates.added_to_cart = true
        funnelUpdates.started_checkout = true
        funnelUpdates.completed_purchase = true
        break
    }

    if (Object.keys(funnelUpdates).length > 0) {
      const { error: funnelError } = await supabase
        .from('analytics_sessions')
        .update(funnelUpdates)
        .eq('session_id', session_id)

      if (funnelError) {
        console.error('Error updating funnel:', funnelError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics track error:', error)
    // Return success anyway - analytics shouldn't break the app
    return NextResponse.json({ success: true })
  }
}
