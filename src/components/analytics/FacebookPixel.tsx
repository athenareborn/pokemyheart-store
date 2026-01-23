'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, Suspense } from 'react'

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

/**
 * Capture and persist Facebook Click ID (fbc) for better attribution
 * fbc is set when users click a Facebook ad (contains fbclid from URL)
 */
function captureFbcFromUrl() {
  if (typeof window === 'undefined') return

  const urlParams = new URLSearchParams(window.location.search)
  const fbclid = urlParams.get('fbclid')

  if (fbclid) {
    // Generate fbc in the correct format: fb.1.timestamp.fbclid
    const timestamp = Date.now()
    const fbc = `fb.1.${timestamp}.${fbclid}`

    // Store in localStorage for persistence across pages
    localStorage.setItem('_fbc', fbc)

    // Also set as cookie for server access
    document.cookie = `_fbc=${fbc}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`
  }
}

/**
 * Capture fbp (Browser ID) from cookie and persist to localStorage
 */
function captureFbpFromCookie() {
  if (typeof document === 'undefined') return

  const match = document.cookie.match(/(^| )_fbp=([^;]+)/)
  if (match && match[2]) {
    localStorage.setItem('_fbp', match[2])
  }
}

/**
 * Fire PageView event via client-side pixel only
 * Note: Server-side CAPI for PageView removed to prevent duplicate events.
 * PageView is low-value for conversion optimization; focus CAPI on high-value events
 * like AddToCart, InitiateCheckout, and Purchase.
 */
function firePageView() {
  if (typeof window === 'undefined') return

  // Fire client-side pixel only (no CAPI for PageView to avoid duplicates)
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
}

function FacebookPixelPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Capture fbc from URL on every page (in case user lands on any page from FB ad)
    captureFbcFromUrl()

    // Capture fbp from cookie (set by pixel)
    setTimeout(() => captureFbpFromCookie(), 1000) // Wait for pixel to set cookie

    // Send PageView (client-side only)
    firePageView()
  }, [pathname, searchParams])

  return null
}

export function FacebookPixel() {
  if (!FB_PIXEL_ID) {
    return null
  }

  return (
    <>
      <Script id="fb-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <FacebookPixelPageView />
      </Suspense>
    </>
  )
}
