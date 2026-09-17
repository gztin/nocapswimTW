export function formatVerifiedDate(lastVerified?: string) {
  return lastVerified ? lastVerified.replace(/-/g, '/') : '待重新確認'
}

export function formatPhone(phone: string) {
  return phone.trim().replace(/^\+886[-\s]?/, '0')
}

export function getGoogleMapsUrl(latitude: number | null, longitude: number | null, address: string) {
  const query = latitude !== null && longitude !== null ? `${latitude},${longitude}` : address
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
