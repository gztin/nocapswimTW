export function formatVerifiedDate(lastVerified?: string) {
  return lastVerified ? lastVerified.replace('-', '/') : '待重新確認'
}

export function getGoogleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}
