"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage("بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#fcfaf8] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#E9DED6] bg-white p-8 shadow-sm">
        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-[#5C3A28]">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-gray-500">
            ادخل إلى لوحة التحكم
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-right text-sm font-medium text-[#5C3A28]">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#E9DED6] px-4 py-3 text-right outline-none focus:border-[#EB8A3C]"
              placeholder="admin@khabt.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-right text-sm font-medium text-[#5C3A28]">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#E9DED6] px-4 py-3 text-right outline-none focus:border-[#EB8A3C]"
              placeholder="••••••••"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-right text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#EB8A3C] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </main>
  );
}