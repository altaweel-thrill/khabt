"use client";

import { useState } from "react";

export default function WholesaleForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Wholesale Form Data:", formData);

    alert("تم إرسال الطلب بنجاح");

    setFormData({
      name: "",
      phone: "",
      location: "",
    });
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl border border-[#E9DED6] bg-[#F7F4F1] p-8 shadow-sm md:p-10">
          <div className="mb-8 text-right">
            <h2 className="text-3xl font-bold text-[#5C3A28]">
              لمبيعات الجملة تواصل معنا
            </h2>
            <p className="mt-3 text-[#6B4B3E]">
              اترك بياناتك وسيتواصل معك فريق المبيعات في أقرب وقت.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-right text-sm font-semibold text-[#5C3A28]"
              >
                الاسم / الشركة
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="اكتب الاسم أو اسم الشركة"
                className="w-full rounded-2xl border border-[#E9DED6] bg-white px-4 py-3 text-right text-[#5C3A28] outline-none transition focus:border-[#EB8A3C]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-right text-sm font-semibold text-[#5C3A28]"
              >
                رقم الجوال
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="05xxxxxxxx"
                className="w-full rounded-2xl border border-[#E9DED6] bg-white px-4 py-3 text-right text-[#5C3A28] outline-none transition focus:border-[#EB8A3C]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-right text-sm font-semibold text-[#5C3A28]"
              >
                الدولة والمدينة
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="مثال: السعودية - الدمام"
                className="w-full rounded-2xl border border-[#E9DED6] bg-white px-4 py-3 text-right text-[#5C3A28] outline-none transition focus:border-[#EB8A3C]"
                required
              />
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                className="rounded-2xl bg-[#EB8A3C] px-8 py-3 font-semibold text-white transition hover:opacity-90"
              >
                إرسال
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}