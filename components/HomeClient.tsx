"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, getDocs } from "firebase/firestore"

import Hero from "@/components/Hero"
import Map from "@/components/Map"
import Navbar from "@/components/Navbar"
import Footer from "./Footer"
import WholesaleForm from "./WholesaleForm"

import { haversineDistance } from "@/lib/distance"
import { db } from "@/lib/firebase"

type UserLocation = {
  lat: number
  lng: number
}

type LocationItem = {
  id: string
  name: string
  address: string
  city?: string
  lat: number
  lng: number
}

export default function HomeClient() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [error, setError] = useState("")
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loadingLocations, setLoadingLocations] = useState(true)

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
      } catch (err) {
        console.error("Error fetching branches:", err)
        setError("تعذر تحميل نقاط البيع")
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchBranches()
  }, [])

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError("")
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setError("تعذر الحصول على موقعك الحالي")
      }
    )
  }

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

  return (
    <>
      <Navbar onLocate={requestUserLocation} />

      <Hero
        onLocate={requestUserLocation}
        nearestLocation={nearestLocation}
      />

      <section id="map" className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-right">
            <p className="mb-2 text-sm font-medium text-[#8B5A3C]">
              الخريطة التفاعلية
            </p>
            <h2 className="text-3xl font-bold text-[#5C3A28] md:text-4xl">
              شاهد جميع المواقع على الخريطة
            </h2>
            <p className="mt-3 max-w-2xl text-[#6B4B3E]">
              حدد موقعك الحالي لمعرفة أقرب نقطة بيع لك، واستعرض جميع المواقع مع
              إمكانية فتح الاتجاهات مباشرة.
            </p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {loadingLocations && (
              <p className="mt-3 text-sm text-gray-500">جاري تحميل نقاط البيع...</p>
            )}
          </div>

          <Map
            userLocation={userLocation}
            onLocate={requestUserLocation}
          />
        </div>
      </section>

      <WholesaleForm />
      <Footer />
    </>
  )
}