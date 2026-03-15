"use client"

import { useMemo, useState } from "react"
import Hero from "@/components/Hero"
import Map from "@/components/Map"
import Navbar from "@/components/Navbar"
import { locations } from "@/data/locations"
import { haversineDistance } from "@/lib/distance"
import Footer from "./Footer"
import WholesaleForm from "./WholesaleForm"

type UserLocation = {
  lat: number
  lng: number
}

export default function HomeClient() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [error, setError] = useState("")

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

        const mapSection = document.getElementById("map")
        if (mapSection) {
        //   mapSection.scrollIntoView({ behavior: "smooth" })
        }
      },
      () => {
        setError("تعذر الحصول على موقعك الحالي")
      }
    )
  }

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

  return (
    <>
      <Navbar onLocate={requestUserLocation} />
      <Hero onLocate={requestUserLocation} nearestLocation={nearestLocation} />

      <section id="map" className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-[#8B5A3C]">الخريطة التفاعلية</p>
            <h2 className="text-3xl font-bold text-[#5C3A28] md:text-4xl">
              شاهد جميع المواقع على الخريطة
            </h2>
            <p className="mt-3 max-w-2xl text-[#6B4B3E]">
              حدد موقعك الحالي لمعرفة أقرب نقطة بيع لك، واستعرض جميع المواقع مع
              إمكانية فتح الاتجاهات مباشرة.
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <Map userLocation={userLocation} onLocate={requestUserLocation} />
        </div>
      </section>

      <WholesaleForm />
    

      <Footer />

       </>
  )
}