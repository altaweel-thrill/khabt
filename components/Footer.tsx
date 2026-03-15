import { Phone, Mail,  Smartphone, Instagram, Music, Ticket } from "lucide-react"
import Image from "next/image"
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6"

export default function Footer() {
  return (
    <footer dir="rtl" className="bg-[#F7F4F1] border-t border-[#E9DED6] py-16">

      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-14 items-center">

       

        {/* معلومات الشركة */}
        <div className="text-right space-y-7">

          <div className="flex justify-start">
            <Image
              src="/logo.png"
              alt="Khabt"
              width={140}
              height={60}
            />
          </div>

          <p className="text-lg leading-8 text-[#6B4B3E] max-w-lg">
            معنى الخبت هو تلك المنحنيات الرملية والكثبان المتصل بعضها ببعض،
            ومن الخبت استوحينا هويتنا اسماً ليعبر عن أصالتنا العريقة.
          </p>

          <div className="flex justify-start gap-4">

            <a
              href="https://www.tiktok.com/@khabt_tea"
               target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl border border-[#E9DED6] flex items-center justify-center bg-white hover:bg-[#EB8A3C] hover:text-white transition"
            >
             <FaTiktok size={20} />
            </a>

            <a
              href="https://www.instagram.com/khabt_tea/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl border border-[#E9DED6] flex items-center justify-center bg-white hover:bg-[#EB8A3C] hover:text-white transition"
            >
              <FaInstagram size={20} />
            </a>

          </div>

        </div>

         {/* معلومات التواصل */}
        <div className="space-y-8 text-right">

          <h3 className="text-3xl font-bold text-[#5C3A28]">
            تواصل معنا
          </h3>

          <div className="space-y-5 text-lg text-[#5C3A28]">

           

            <div className="flex items-center justify-start gap-4">
              

              <div className="w-12 h-12 rounded-xl border border-[#E9DED6] flex items-center justify-center bg-white">
               <FaWhatsapp size={22} />
              </div>
              <span dir="ltr">+966505988896</span>
            </div>


            <div className="flex items-center justify-start gap-4">
             

              <div className="w-12 h-12 rounded-xl border border-[#E9DED6] flex items-center justify-center bg-white">
                <Mail size={20} />
              </div>
               <span>info@khabt-tea.com</span>
            </div>

          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="text-center mt-16 text-[#8B5A3C] text-sm">
        © 2026 Khabt Tea — جميع الحقوق محفوظة
      </div>

    </footer>
  )
}