"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { User, Phone, MapPin, Send } from "lucide-react";

export default function WholesaleForm() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!captchaToken) {
      setErrorMessage("يرجى تأكيد reCAPTCHA أولاً");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wholesale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "فشل الإرسال");
      }

      setSuccessMessage("تم إرسال الطلب بنجاح");
      setFormData({
        name: "",
        phone: "",
        location: "",
      });
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "حدث خطأ أثناء الإرسال"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-[#E9DED6] bg-[#F7F4F1] p-8">
          <div className="mb-8 text-right">
            <h2 className="text-3xl font-bold text-[#5C3A28]">
              لمبيعات الجملة تواصل معنا
            </h2>
            <p className="mt-2 text-[#6B4B3E]">
              اترك بياناتك وسيتواصل معك فريق المبيعات
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            <div className="relative">
              <User size={20} className="absolute right-4 top-4 text-[#8B5A3C]" />
              <input
                type="text"
                name="name"
                placeholder="الاسم / الشركة"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E9DED6] bg-white px-12 py-3 text-right outline-none focus:border-[#EB8A3C]"
                required
              />
            </div>

            <div className="relative">
              <Phone size={20} className="absolute right-4 top-4 text-[#8B5A3C]" />
              <input
                type="tel"
                name="phone"
                placeholder="رقم الجوال"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E9DED6] bg-white px-12 py-3 text-right outline-none focus:border-[#EB8A3C]"
                required
              />
            </div>

            <div className="relative">
              <MapPin size={20} className="absolute right-4 top-4 text-[#8B5A3C]" />
              <input
                type="text"
                name="location"
                placeholder="الدولة والمدينة"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E9DED6] bg-white px-12 py-3 text-right outline-none focus:border-[#EB8A3C]"
                required
              />
            </div>

            <div className="flex justify-end">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>

            {successMessage && (
              <p className="text-right text-sm text-green-600">{successMessage}</p>
            )}

            {errorMessage && (
              <p className="text-right text-sm text-red-600">{errorMessage}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#EB8A3C] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "جاري الإرسال..." : "إرسال"}
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}