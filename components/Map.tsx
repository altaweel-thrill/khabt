"use client"

import { useMemo, useState } from "react"
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api"

import { locations, type LocationItem } from "@/data/locations"
import { haversineDistance } from "@/lib/distance"
import { defaultCenter, mapContainerStyle } from "@/lib/googleMaps"

type UserLocation = {
  lat: number
  lng: number
}

type MapProps = {
  userLocation: UserLocation | null
  onLocate: () => void
}

export default function Map({ userLocation, onLocate }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  })

  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null)

  const nearestLocation = useMemo(() => {
    if (!userLocation) return null

    let nearest = locations[0]
    let shortestDistance = haversineDistance(userLocation, {
      lat: nearest.lat,
      lng: nearest.lng,
    })

    for (const location of locations) {
      const distance = haversineDistance(userLocation, {
        lat: location.lat,
        lng: location.lng,
      })

      if (distance < shortestDistance) {
        shortestDistance = distance
        nearest = location
      }
    }

    return {
      ...nearest,
      distance: shortestDistance,
    }
  }, [userLocation])

  const sortedLocations = useMemo(() => {
    if (!userLocation) return locations

    return [...locations].sort((a, b) => {
      const distanceA = haversineDistance(userLocation, { lat: a.lat, lng: a.lng })
      const distanceB = haversineDistance(userLocation, { lat: b.lat, lng: b.lng })
      return distanceA - distanceB
    })
  }, [userLocation])

  const mapCenter = userLocation || defaultCenter

  if (!isLoaded) {
    return <div className="text-lg">جاري تحميل الخريطة...</div>
  }

  return (
    <div className="space-y-6">
   

     

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={10}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedLocation(location)}

            icon={{
    url: "/khabt-marker.jpeg",
     scaledSize: new window.google.maps.Size(30, 30),
    anchor: new window.google.maps.Point(15, 15),
  }}
          />
        ))}

        {userLocation && <Marker position={userLocation} label="أنت" />}

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="max-w-[220px]">
              <h3 className="mb-1 text-base font-bold">{selectedLocation.name}</h3>
              <p className="mb-3 text-sm">{selectedLocation.address}</p>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-[#EB8A3C] px-3 py-2 text-sm text-white"
              >
                الاتجاهات
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div id="locations" className="rounded-2xl border border-[#eadfd7] bg-white p-5">
        <h3 className="mb-4 text-xl font-bold text-[#5C3A28]">جميع نقاط البيع</h3>

        <div className="space-y-3">
          {sortedLocations.map((location) => {
            const distance = userLocation
              ? haversineDistance(userLocation, { lat: location.lat, lng: location.lng })
              : null

            const isNearest = nearestLocation?.id === location.id

            return (
              <div
                key={location.id}
                className={`rounded-xl border p-4 ${
                  isNearest ? "border-[#EB8A3C] bg-[#FFF7F1]" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-[#5C3A28]">{location.name}</h4>
                    <p className="text-sm text-gray-600">{location.address}</p>
                    {distance !== null && (
                      <p className="mt-1 text-sm font-medium text-[#EB8A3C]">
                        {distance.toFixed(2)} كم
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedLocation(location)}
                      className="rounded-lg border border-[#8B5A3C] px-3 py-2 text-[#8B5A3C]"
                    >
                      عرض
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-[#EB8A3C] px-3 py-2 text-white"
                    >
                      الاتجاهات
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}