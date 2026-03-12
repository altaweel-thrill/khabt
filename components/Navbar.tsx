type NavbarProps = {
  onLocate: () => void
}

export default function Navbar({ onLocate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E9DED6] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex   justify-center rounded-full  text-lg font-bold text-white">
            <img src="/logo.png" alt="Logo" width={50} height={50} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#5C3A28]">شاي خبت</h2>
            <p className="text-xs text-[#8B5A3C]">نقاط البيع</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-[#5C3A28] transition hover:text-[#EB8A3C]">
            الرئيسية
          </a>
          <a href="#locations" className="text-sm font-medium text-[#5C3A28] transition hover:text-[#EB8A3C]">
            المواقع
          </a>
          <a href="#map" className="text-sm font-medium text-[#5C3A28] transition hover:text-[#EB8A3C]">
            الخريطة
          </a>
          <a href="#contact" className="text-sm font-medium text-[#5C3A28] transition hover:text-[#EB8A3C]">
            تواصل
          </a>
        </nav>

        <button
          onClick={onLocate}
          className="rounded-xl bg-[#EB8A3C] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          حدد موقعي
        </button>
      </div>
    </header>
  )
}