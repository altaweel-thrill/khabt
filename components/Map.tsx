"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

// أيقونة "موقعي" بنفس شكل أيقونة جوجل ماب
const LOCATE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#666666"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`

// أيقونة تحميل تدور أثناء تحديد الموقع
const SPINNER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>`

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

  // refs عشان الـ click handler حق الزر يقرأ أحدث القيم دائماً
  const userLocationRef = useRef(userLocation)
  const onLocateRef = useRef(onLocate)
  const locateButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])

  useEffect(() => {
    onLocateRef.current = onLocate
  }, [onLocate])

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

  // إنشاء زر "موقعي" كعنصر تحكم أصلي داخل الخريطة (مثل أزرار جوجل)
  useEffect(() => {
    if (!map) return

    const button = document.createElement("button")
    button.type = "button"
    button.title = "إظهار موقعي"
    button.setAttribute("aria-label", "توسيط الخريطة على موقعي")
    button.style.cssText = [
      "background: #fff",
      "border: none",
      "border-radius: 2px",
      "box-shadow: 0 1px 4px rgba(0,0,0,.3)",
      "cursor: pointer",
      "width: 40px",
      "height: 40px",
      "margin: 0 10px 10px 10px",
      "padding: 0",
      "display: flex",
      "align-items: center",
      "justify-content: center",
    ].join(";")
    button.innerHTML = LOCATE_ICON

    button.addEventListener("click", () => {
      const loc = userLocationRef.current

      if (!loc) {
        onLocateRef.current()
        return
      }

      map.panTo(loc)
      map.setZoom(Math.max(map.getZoom() ?? 10, 15))
    })

    locateButtonRef.current = button
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(button)

    return () => {
      const controls = map.controls[google.maps.ControlPosition.RIGHT_BOTTOM]

      for (let i = controls.getLength() - 1; i >= 0; i--) {
        if (controls.getAt(i) === button) {
          controls.removeAt(i)
          break
        }
      }

      locateButtonRef.current = null
    }
  }, [map])

  // تبديل الأيقونة أثناء تحديد الموقع
  useEffect(() => {
    const button = locateButtonRef.current
    if (!button) return

    button.innerHTML = isLocating ? SPINNER_ICON : LOCATE_ICON
    button.disabled = isLocating
    button.style.cursor = isLocating ? "wait" : "pointer"
    button.title = isLocating ? "جاري تحديد موقعك" : "إظهار موقعي"
  }, [isLocating, map])

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
                          {location.city || location.address || "بدون عنوان"}
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