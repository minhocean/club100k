import dotenv from 'dotenv'

// Load env from .env.local first if present, fallback to .env
try {
  dotenv.config({ path: '.env.local', debug: true })
} catch {}
try {
  dotenv.config()
} catch {}

const isDev = process.env.NODE_ENV !== 'production'
const safeLog = (label, value, { mask = false } = {}) => {
  const out = mask && value ? `${String(value).slice(0, 4)}...${String(value).slice(-4)}` : value
  console.log(`[STRAVA_ENV] ${label} =`, out)
}

// Resolve a stable public base URL for OAuth/webhooks
function resolveBaseUrl() {
  const fromNextPublic = process.env.NEXT_PUBLIC_APP_BASE_URL
  if (fromNextPublic) {
    safeLog('NEXT_PUBLIC_APP_BASE_URL', fromNextPublic)
    return fromNextPublic
  }
  const fromVercel = process.env.VERCEL_URL
  if (fromVercel) {
    const url = fromVercel.startsWith('http') ? fromVercel : `https://${fromVercel}`
    safeLog('VERCEL_URL->BASE_URL', url)
    return url
  }
  // Fallback to localhost (dev)
  const local = 'http://localhost:3000'
  safeLog('FALLBACK_BASE_URL', local)
  return local
}

function computeRedirectUri() {
  const explicit = process.env.STRAVA_REDIRECT_URI
  if (explicit) {
    safeLog('STRAVA_REDIRECT_URI', explicit)
    return explicit
  }
  const base = resolveBaseUrl()
  const derived = `${base}/api/strava/callback`
  safeLog('DERIVED_STRAVA_REDIRECT_URI', derived)
  return derived
}

export const STRAVA = {
  get CLIENT_ID() {
    const v = process.env.STRAVA_CLIENT_ID
    safeLog('STRAVA_CLIENT_ID', v)
    return v
  },
  get CLIENT_SECRET() {
    const v = process.env.STRAVA_CLIENT_SECRET
    safeLog('STRAVA_CLIENT_SECRET', v, { mask: true })
    return v
  },
  get REDIRECT_URI() {
    return computeRedirectUri()
  },
  get STATE_SECRET() {
    const v = process.env.STRAVA_STATE_SECRET
    safeLog('STRAVA_STATE_SECRET', v, { mask: true })
    return v
  },
  get WEBHOOK_VERIFY_TOKEN() {
    const v = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
    safeLog('STRAVA_WEBHOOK_VERIFY_TOKEN', v, { mask: true })
    return v
  },
  get NEXT_PUBLIC_APP_BASE_URL() {
    return resolveBaseUrl()
  },
  get WEBHOOK_CALLBACK_URL() {
    const base = resolveBaseUrl()
    const url = `${base}/api/strava/webhook`
    safeLog('WEBHOOK_CALLBACK_URL', url)
    return url
  }
}
