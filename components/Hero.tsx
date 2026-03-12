type NearestLocation = {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  distance: number
} | null

type HeroProps = {
  onLocate: () => void
  nearestLocation: NearestLocation
}

export default function Hero({ onLocate, nearestLocation }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#F7F4F1]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="mb-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-[#8B5A3C] shadow-sm">
            اكتشف جميع نقاط البيع بسهولة
          </span>

          <h1 className="text-4xl font-extrabold leading-tight text-[#5C3A28] md:text-5xl lg:text-6xl">
            اعثر على
           أقرب نقطة بيع
            لك خلال ثوانٍ
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-[#6B4B3E]">
            استعرض جميع نقاط البيع على الخريطة، وحدد موقعك الحالي، واحصل على
            أقرب نقطة بيع مع إمكانية فتح الاتجاهات مباشرة.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={onLocate}
              className="rounded-2xl bg-[#EB8A3C] px-6 py-3 font-semibold text-white shadow-md transition hover:opacity-90"
            >
              حدد موقعي الآن
            </button>

            <a
              href="#map"
              className="rounded-2xl border border-[#8B5A3C] px-6 py-3 font-semibold text-[#8B5A3C] transition hover:bg-white"
            >
              عرض جميع المواقع
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[28px] border border-[#E9DED6] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B5A3C]">أقرب نقطة بيع لك</p>
                <h3 className="text-xl font-bold text-[#5C3A28]">
                  {nearestLocation ? nearestLocation.name : "لم يتم تحديد موقعك بعد"}
                </h3>
              </div>

              <div className="rounded-full bg-[#FFF2E8] px-4 py-2 text-sm font-semibold text-[#EB8A3C]">
                {nearestLocation ? `${nearestLocation.distance.toFixed(2)} كم` : "--"}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F4F1] p-4">
              <p className="text-sm text-[#6B4B3E]">
                {nearestLocation ? nearestLocation.address : "اضغط على زر تحديد موقعي لمعرفة أقرب فرع"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={onLocate}
                  className="rounded-xl bg-[#EB8A3C] px-4 py-3 text-sm font-semibold text-white"
                >
                  حدد موقعي
                </button>

                {nearestLocation ? (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearestLocation.lat},${nearestLocation.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-[#8B5A3C] px-4 py-3 text-center text-sm font-semibold text-[#8B5A3C]"
                  >
                    الاتجاهات
                  </a>
                ) : (
                  <button
                    disabled
                    className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-400"
                  >
                    الاتجاهات
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[#EB8A3C]/10 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-[#8B5A3C]/10 blur-3xl" />
        </div>
      </div>
    </section>
  )
}