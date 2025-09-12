export function decodeJwtPayload(accessToken) {
  try {
    if (!accessToken || typeof accessToken !== 'string') return null
    const parts = accessToken.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = Buffer.from(padded, 'base64').toString('utf8')
    const obj = JSON.parse(json)
    return obj || null
  } catch {
    return null
  }
}
