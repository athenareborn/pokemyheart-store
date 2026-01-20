import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderEmailData {
  orderNumber: string
  customerEmail: string
  customerName: string | null
  items: Array<{
    bundle_name: string
    design_name: string
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

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.bundle_name}</strong><br>
        <span style="color: #666;">${item.design_name}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.price)}</td>
    </tr>
  `).join('')

  const addressHtml = shippingAddress ? `
    <p style="margin: 0; color: #374151;">
      ${shippingAddress.name}<br>
      ${shippingAddress.line1}<br>
      ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br>
      ${shippingAddress.country}
    </p>
  ` : '<p style="color: #666;">Address not available</p>'

  const { data: result, error } = await resend.emails.send({
    from: 'PokeMyHeart <orders@pokemyheart.com>',
    to: customerEmail,
    subject: `Order Confirmed - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ec4899, #f43f5e); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">❤️</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; color: #111827;">Thank you for your order!</h1>
          </div>

          <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; color: #6b7280;">Order number</p>
            <p style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">${orderNumber}</p>
          </div>

          <p style="margin-bottom: 24px;">
            Hi${customerName ? ` ${customerName}` : ''},<br><br>
            We've received your order and are preparing your holographic Valentine's cards with love!
            You'll receive another email when your order ships.
          </p>

          <h2 style="font-size: 16px; margin: 24px 0 16px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e5e5;">
                <th style="text-align: left; padding-bottom: 8px; font-weight: 600;">Item</th>
                <th style="text-align: center; padding-bottom: 8px; font-weight: 600;">Qty</th>
                <th style="text-align: right; padding-bottom: 8px; font-weight: 600;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right;">Subtotal</td>
                <td style="padding: 8px 0; text-align: right;">${formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right;">Shipping</td>
                <td style="padding: 8px 0; text-align: right;">${shipping === 0 ? 'Free' : formatPrice(shipping)}</td>
              </tr>
              <tr style="font-weight: 600; font-size: 18px;">
                <td colspan="2" style="padding: 16px 0 0; text-align: right;">Total</td>
                <td style="padding: 16px 0 0; text-align: right;">${formatPrice(total)}</td>
              </tr>
            </tfoot>
          </table>

          <h2 style="font-size: 16px; margin: 32px 0 16px;">Shipping Address</h2>
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px;">
            ${addressHtml}
          </div>

          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Questions? Reply to this email or contact us at hello@pokemyheart.com</p>
            <p style="margin-top: 16px;">Made with ❤️ by PokeMyHeart</p>
          </div>
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
}) {
  const { orderNumber, customerEmail, customerName, trackingNumber, carrier = 'USPS' } = data

  const { data: result, error } = await resend.emails.send({
    from: 'PokeMyHeart <orders@pokemyheart.com>',
    to: customerEmail,
    subject: `Your order ${orderNumber} has shipped!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">📦</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; color: #111827;">Your order is on its way!</h1>
          </div>

          <p>
            Hi${customerName ? ` ${customerName}` : ''},<br><br>
            Great news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.
          </p>

          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 8px; color: #166534; font-weight: 600;">${carrier} Tracking Number</p>
            <p style="margin: 0; font-size: 20px; font-weight: 600; color: #111827; font-family: monospace;">${trackingNumber}</p>
          </div>

          <p style="text-align: center;">
            <a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}"
               style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Track Your Package
            </a>
          </p>

          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Questions? Reply to this email or contact us at hello@pokemyheart.com</p>
            <p style="margin-top: 16px;">Made with ❤️ by PokeMyHeart</p>
          </div>
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
