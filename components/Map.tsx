"use client"

import { useEffect, useMemo, useState } from "react"
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api"
import { collection, getDocs } from "firebase/firestore"
import { LoaderCircle, LocateFixed } from "lucide-react"

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
  isLocating?: boolean
}

type LocationItem = {
  id: string
  name: string
  address?: string
  city?: string
  lat: number
  lng: number
}

export default function Map({ userLocation, onLocate, isLocating = false }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  })

  const [locations, setLocations] = useState<LocationItem[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null)
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  const totalPages = Math.ceil(sortedLocations.length / itemsPerPage)

  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedLocations.slice(startIndex, endIndex)
  }, [sortedLocations, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [userLocation, locations.length])

  const mapCenter = userLocation || defaultCenter

  const centerOnUser = () => {
    if (!userLocation || !map) {
      onLocate()
      return
    }

    map.panTo(userLocation)
    map.setZoom(Math.max(map.getZoom() ?? 10, 15))
  }

  useEffect(() => {
    if (!userLocation || !map) return

    map.panTo(userLocation)
    map.setZoom(15)
  }, [map, userLocation])

  if (!isLoaded) {
    return <div className="text-lg">جاري تحميل الخريطة...</div>
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[#eadfd7] bg-[#f7f2ee]">
        <button
          type="button"
          onClick={centerOnUser}
          disabled={isLocating}
          aria-label={isLocating ? "جاري تحديد موقعك" : "توسيط الخريطة على موقعي"}
          className="absolute right-3 top-3 z-10 flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#dcc9bb] bg-white px-4 py-2.5 font-semibold text-[#5C3A28] shadow-sm transition-colors duration-200 hover:bg-[#FFF7F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EB8A3C] disabled:cursor-wait disabled:opacity-70 md:right-4 md:top-4"
        >
          {isLocating ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-[#EB8A3C]" />
          ) : (
            <LocateFixed aria-hidden="true" className="size-5 text-[#EB8A3C]" />
          )}
          <span>{isLocating ? "جاري التحديد..." : "توسيط موقعي"}</span>
        </button>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={10}
          onLoad={setMap}
          onUnmount={() => setMap(null)}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setSelectedLocation(location)}
              icon={{
                url: "/logo-marker.png",
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
      </div>

      <div id="locations" className="rounded-2xl border border-[#eadfd7] bg-white p-5">
        <h3 className="mb-4 text-right text-xl font-bold text-[#5C3A28]">
          جميع نقاط البيع
        </h3>

        {loadingBranches ? (
          <p className="text-right text-sm text-gray-500">جاري تحميل الفروع...</p>
        ) : sortedLocations.length === 0 ? (
          <p className="text-right text-sm text-gray-500">لا توجد فروع حالياً</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedLocations.map((location) => {
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
                          {location.city || location.city || "بدون عنوان"}
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

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm text-[#5C3A28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  السابق
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-4 py-2 text-sm ${
                        currentPage === page
                          ? "bg-[#EB8A3C] text-white"
                          : "border border-[#d9c9bd] text-[#5C3A28]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm text-[#5C3A28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
