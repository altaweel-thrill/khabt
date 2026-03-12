export type Coordinates = {
  lat: number
  lng: number
}

export function haversineDistance(point1: Coordinates, point2: Coordinates) {
  const toRad = (value: number) => (value * Math.PI) / 180

  const earthRadiusKm = 6371

  const dLat = toRad(point2.lat - point1.lat)
  const dLng = toRad(point2.lng - point1.lng)

  const lat1 = toRad(point1.lat)
  const lat2 = toRad(point2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}