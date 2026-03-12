export type LocationItem = {
  id: number
  name: string
  address: string
  lat: number
  lng: number
}

export const locations: LocationItem[] = [
  {
    id: 1,
    name: "فرع الدمام",
    address: "حي الشاطئ - الدمام",
    lat: 26.4344,
    lng: 50.1033,
  },
  {
    id: 2,
    name: "فرع الخبر",
    address: "طريق الملك فهد - الخبر",
    lat: 26.2172,
    lng: 50.1971,
  },
  {
    id: 3,
    name: "فرع الظهران",
    address: "الظهران مول - الظهران",
    lat: 26.2886,
    lng: 50.1138,
  },
]