import { NextRequest, NextResponse } from 'next/server'
import { sendServerEvent, type EventName } from '@/lib/analytics/facebook-capi'

/**
 * Generic Facebook Conversions API endpoint
 * Handles all FB events server-side for improved Event Match Quality
 *
 * This endpoint should be called alongside client-side pixel events
 * with the SAME eventId for proper deduplication
 */

interface FBEventRequest {
  eventName: EventName
  eventId: string
  eventSourceUrl: string
  userData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    externalId?: string // Customer ID for improved EMQ (~12% improvement)
    fbc?: string
    fbp?: string
  }
  customData?: {
    value?: number
    currency?: string
    content_ids?: string[]
    content_name?: string
    content_type?: string
    content_category?: string
    num_items?: number
    // Dynamic Ads: detailed product info with id, quantity, item_price
    contents?: Array<{
      id: string
      quantity: number
      item_price?: number
    }>
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: FBEventRequest = await req.json()

    // Validate required fields
    if (!body.eventName || !body.eventId || !body.eventSourceUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: eventName, eventId, eventSourceUrl' },
        { status: 400 }
      )
    }

    // Get IP and User Agent from request headers
    // Vercel/Next.js provides these via standard headers
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               undefined

    const userAgent = req.headers.get('user-agent') || undefined

    const result = await sendServerEvent({
      eventName: body.eventName,
      eventId: body.eventId,
      eventSourceUrl: body.eventSourceUrl,
      userData: {
        email: body.userData?.email,
        firstName: body.userData?.firstName,
        lastName: body.userData?.lastName,
        phone: body.userData?.phone,
        city: body.userData?.city,
        state: body.userData?.state,
        postalCode: body.userData?.postalCode,
        country: body.userData?.country,
        externalId: body.userData?.externalId,
        fbc: body.userData?.fbc,
        fbp: body.userData?.fbp,
        ip,
        userAgent,
      },
      customData: body.customData,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('FB Event API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
