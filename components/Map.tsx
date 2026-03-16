"use client"

import { useEffect, useMemo, useState } from "react"
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api"
import { collection, getDocs } from "firebase/firestore"

import { db } from "@/lib/firebase"
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

type LocationItem = {
  id: string
  name: string
  address?: string
  city?: string
  lat: number
  lng: number
}

export default function Map({ userLocation, onLocate }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  })

  const [locations, setLocations] = useState<LocationItem[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null)
  const [loadingBranches, setLoadingBranches] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const snapshot = await getDocs(collection(db, "branches"))

        const data: LocationItem[] = snapshot.docs.map((doc) => {
          const branch = doc.data()

          return {
            id: doc.id,
            name: branch.name || "بدون اسم",
            address: branch.address || branch.city || "",
            city: branch.city || "",
            lat: Number(branch.lat),
            lng: Number(branch.lng),
          }
        })

        setLocations(data)
      } catch (error) {
        console.error("Error fetching branches:", error)
      } finally {
        setLoadingBranches(false)
      }
    }

    fetchBranches()
  }, [])

  const nearestLocation = useMemo(() => {
    if (!userLocation || locations.length === 0) return null

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
  }, [userLocation, locations])

  const sortedLocations = useMemo(() => {
    if (locations.length === 0) return []

    if (!userLocation) return locations

    return [...locations].sort((a, b) => {
      const distanceA = haversineDistance(userLocation, {
        lat: a.lat,
        lng: a.lng,
      })
      const distanceB = haversineDistance(userLocation, {
        lat: b.lat,
        lng: b.lng,
      })
      return distanceA - distanceB
    })
  }, [userLocation, locations])

  const mapCenter = userLocation || defaultCenter

  if (!isLoaded) {
    return <div className="text-lg">جاري تحميل الخريطة...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onLocate}
          className="rounded-xl bg-[#EB8A3C] px-5 py-3 font-semibold text-white transition hover:opacity-90"
        >
          حدد موقعي
        </button>
      </div>

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

        {userLocation && (
          <Marker
            position={userLocation}
            label="أنت"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#2563EB",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            }}
          />
        )}

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="max-w-[220px] text-right">
              <h3 className="mb-1 text-base font-bold">{selectedLocation.name}</h3>

              <p className="mb-3 text-sm">
                {selectedLocation.address || selectedLocation.city || "بدون عنوان"}
              </p>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-lg bg-[#EB8A3C] px-3 py-2 text-sm text-white"
              >
                الاتجاهات
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div id="locations" className="rounded-2xl border border-[#eadfd7] bg-white p-5">
        <h3 className="mb-4 text-right text-xl font-bold text-[#5C3A28]">
          جميع نقاط البيع
        </h3>

        {loadingBranches ? (
          <p className="text-right text-sm text-gray-500">جاري تحميل الفروع...</p>
        ) : sortedLocations.length === 0 ? (
          <p className="text-right text-sm text-gray-500">لا توجد فروع حالياً</p>
        ) : (
          <div className="space-y-3">
            {sortedLocations.map((location) => {
              const distance = userLocation
                ? haversineDistance(userLocation, {
                    lat: location.lat,
                    lng: location.lng,
                  })
                : null

              const isNearest = nearestLocation?.id === location.id

              return (
                <div
                  key={location.id}
                  className={`rounded-xl border p-4 ${
                    isNearest
                      ? "border-[#EB8A3C] bg-[#FFF7F1]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-right">
                      <h4 className="font-bold text-[#5C3A28]">{location.name}</h4>
                      <p className="text-sm text-gray-600">
                        {location.address || location.city || "بدون عنوان"}
                      </p>

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
        )}
      </div>
    </div>
  )
}