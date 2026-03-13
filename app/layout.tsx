import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Cairo } from "next/font/google"

const cairo = Cairo({
  subsets: ["arabic"],
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Khabt Tea",
  description: "Find the nearest Khabt Tea location",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-white text-[#5C3A28] cairo.className">
        {children}
      </body>
    </html>
  )
}
