import { Resend } from 'resend'

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    US: 'United States',
    AU: 'Australia',
    CA: 'Canada',
    GB: 'United Kingdom',
    NZ: 'New Zealand',
  }
  return countries[code] || code
}

function getTrackingUrl(trackingNumber: string, carrier: string): string {
  const urls: Record<string, string> = {
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    FEDEX: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  }
  return urls[carrier.toUpperCase()] || urls.USPS
}

// Map design IDs to images
function getDesignImage(designId: string): string {
  const images: Record<string, string> = {
    'design-1': 'https://ultrararelove.com/images/cards/cardd1.png',
    'design-2': 'https://ultrararelove.com/images/cards/cardd2.png',
    'design-3': 'https://ultrararelove.com/images/cards/cardd3.png',
    'design-4': 'https://ultrararelove.com/images/cards/cardd4.png',
    'design-5': 'https://ultrararelove.com/images/cards/cardd5.png',
  }
  return images[designId] || images['design-1']
}

interface OrderEmailData {
  orderNumber: string
  customerEmail: string
  customerName: string | null
  items: Array<{
    bundle_name: string
    bundle_id?: string
    design_name: string
    design_id?: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping: number
  total: number
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  } | null
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const { orderNumber, customerEmail, customerName, items, subtotal, shipping, total, shippingAddress } = data

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const siteUrl = 'https://ultrararelove.com'

  const itemsHtml = items.map(item => {
    const imageUrl = item.design_id ? getDesignImage(item.design_id) : `${siteUrl}/images/cards/cardd1.png`
    return `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="80" style="vertical-align: top;">
              <img src="${imageUrl}" alt="${item.design_name}" width="70" height="70" style="border-radius: 8px; object-fit: cover; display: block;">
            </td>
            <td style="vertical-align: top; padding-left: 16px;">
              <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #1a1a1a;">${item.bundle_name}</p>
              <p style="margin: 0; font-size: 14px; color: #666;">${item.design_name}</p>
            </td>
            <td width="80" style="vertical-align: top; text-align: right;">
              <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #1a1a1a;">${formatPrice(item.price)}</p>
              <p style="margin: 0; font-size: 13px; color: #999;">Qty: ${item.quantity}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `}).join('')

  const addressHtml = shippingAddress ? `
    <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
      ${shippingAddress.name}<br>
      ${shippingAddress.line1}<br>
      ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br>
      ${getCountryName(shippingAddress.country)}
    </p>
  ` : '<p style="color: #999;">Address not available</p>'

  const { data: result, error } = await getResend().emails.send({
    from: 'UltraRareLove <hello@ultrararelove.com>',
    to: customerEmail,
    subject: `Order Confirmed! #${orderNumber}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Order Confirmed - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7f7f7;">
    <tr>
      <td style="padding: 40px 16px;">

        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <img src="${siteUrl}/images/logo.png" alt="UltraRareLove" width="160" style="max-width: 160px; height: auto;">
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px; border-bottom: 1px solid #f0f0f0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; font-size: 14px; color: #16a34a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">✓ Order Confirmed</p>
                          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1a1a1a;">Thanks for your order!</h1>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                          <p style="margin: 0; font-size: 13px; color: #999;">${orderNumber}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 24px 32px 0;">
                    <p style="margin: 0; font-size: 15px; color: #444; line-height: 1.6;">
                      Hi${customerName ? ` ${customerName.split(' ')[0]}` : ''}! We're preparing your holographic Valentine's cards. You'll receive tracking info once they ship.
                    </p>
                  </td>
                </tr>

                <!-- Season Notice -->
                <tr>
                  <td style="padding: 20px 32px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 10px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <p style="margin: 0; font-size: 14px; color: #854d0e;">
                            💛 <strong>Valentine's Season:</strong> High demand right now! Your order is confirmed and on track.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items -->
                <tr>
                  <td style="padding: 28px 32px 0;">
                    <p style="margin: 0 0 16px; font-size: 13px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Your Items</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${itemsHtml}
                    </table>
                  </td>
                </tr>

                <!-- Totals -->
                <tr>
                  <td style="padding: 20px 32px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Subtotal</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">${formatPrice(subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Shipping</td>
                        <td style="padding: 8px 0; font-size: 14px; text-align: right; ${shipping === 0 ? 'color: #16a34a; font-weight: 600;' : 'color: #333;'}">${shipping === 0 ? 'FREE' : formatPrice(shipping)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 12px; border-top: 2px solid #1a1a1a;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">Total</td>
                        <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a; text-align: right;">${formatPrice(total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Shipping Address -->
                <tr>
                  <td style="padding: 28px 32px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fafafa; border-radius: 10px;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Shipping To</p>
                          ${addressHtml}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Help -->
                <tr>
                  <td style="padding: 28px 32px 32px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top: 1px solid #f0f0f0;">
                      <tr>
                        <td style="padding-top: 20px;">
                          <p style="margin: 0 0 6px; font-size: 14px; color: #333;">
                            <strong>Need to change something?</strong> Reply to this email before it ships.
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #333;">
                            <strong>Questions?</strong> <a href="${siteUrl}/faq" style="color: #ec4899; text-decoration: none;">Check our FAQ</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 16px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #999;">
                <a href="${siteUrl}" style="color: #999; text-decoration: none;">UltraRareLove</a> · Premium Valentine's Cards
              </p>
              <p style="margin: 0; font-size: 12px; color: #ccc;">
                Made with love 💕
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  })

  if (error) {
    console.error('Error sending order confirmation:', error)
    return { success: false, error }
  }

  return { success: true, data: result }
}

export async function sendShippingNotification(data: {
  orderNumber: string
  customerEmail: string
  customerName: string | null
  trackingNumber: string
  carrier?: string
  items?: Array<{
    bundle_name: string
    design_name: string
    design_id?: string
    quantity: number
  }>
}) {
  const { orderNumber, customerEmail, customerName, trackingNumber, carrier = 'USPS', items } = data

  const trackingUrl = getTrackingUrl(trackingNumber, carrier)
  const siteUrl = 'https://ultrararelove.com'

  const itemsHtml = items && items.length > 0
    ? items.map(item => {
        const imageUrl = item.design_id ? getDesignImage(item.design_id) : `${siteUrl}/images/cards/cardd1.png`
        return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="60" style="vertical-align: middle;">
                  <img src="${imageUrl}" alt="${item.design_name}" width="50" height="50" style="border-radius: 6px; object-fit: cover; display: block;">
                </td>
                <td style="vertical-align: middle; padding-left: 12px;">
                  <p style="margin: 0; font-size: 14px; color: #333;"><strong>${item.bundle_name}</strong> · ${item.design_name}</p>
                </td>
                <td width="40" style="vertical-align: middle; text-align: right;">
                  <p style="margin: 0; font-size: 13px; color: #999;">×${item.quantity}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `}).join('')
    : ''

  const { data: result, error } = await getResend().emails.send({
    from: 'UltraRareLove <hello@ultrararelove.com>',
    to: customerEmail,
    subject: `Your order is on the way! #${orderNumber}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Order Shipped - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7f7f7;">
    <tr>
      <td style="padding: 40px 16px;">

        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <img src="${siteUrl}/images/logo.png" alt="UltraRareLove" width="160" style="max-width: 160px; height: auto;">
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px; border-bottom: 1px solid #f0f0f0;">
                    <p style="margin: 0 0 4px; font-size: 14px; color: #16a34a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📦 Shipped</p>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1a1a1a;">Your order is on the way!</h1>
                    <p style="margin: 8px 0 0; font-size: 13px; color: #999;">${orderNumber}</p>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 24px 32px 0;">
                    <p style="margin: 0; font-size: 15px; color: #444; line-height: 1.6;">
                      Hi${customerName ? ` ${customerName.split(' ')[0]}` : ''}! Great news — your Valentine's cards are on their way to you.
                    </p>
                  </td>
                </tr>

                <!-- Tracking -->
                <tr>
                  <td style="padding: 24px 32px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px;">
                      <tr>
                        <td style="padding: 24px; text-align: center;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${carrier} Tracking</p>
                          <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700; font-family: 'SF Mono', Monaco, monospace; color: #1a1a1a; letter-spacing: 1px;">${trackingNumber}</p>
                          <a href="${trackingUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Track Package</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items -->
                ${itemsHtml ? `
                <tr>
                  <td style="padding: 28px 32px 0;">
                    <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">What's in the box</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${itemsHtml}
                    </table>
                  </td>
                </tr>
                ` : ''}

                <!-- Help -->
                <tr>
                  <td style="padding: 28px 32px 32px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top: 1px solid #f0f0f0;">
                      <tr>
                        <td style="padding-top: 20px;">
                          <p style="margin: 0; font-size: 14px; color: #333;">
                            Questions? Reply to this email or <a href="${siteUrl}/faq" style="color: #ec4899; text-decoration: none;">check our FAQ</a>.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 16px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #999;">
                <a href="${siteUrl}" style="color: #999; text-decoration: none;">UltraRareLove</a> · Premium Valentine's Cards
              </p>
              <p style="margin: 0; font-size: 12px; color: #ccc;">
                Made with love 💕
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  })

  if (error) {
    console.error('Error sending shipping notification:', error)
    return { success: false, error }
  }

  return { success: true, data: result }
}
