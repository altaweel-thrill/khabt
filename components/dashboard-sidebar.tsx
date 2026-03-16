"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MapPinned, Menu, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "إدارة الفروع",
    href: "/dashboard/branches",
    icon: MapPinned,
  },
];

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex flex-row-reverse items-center justify-between rounded-xl px-4 py-3 transition ${
              isActive
                ? "bg-[#EB8A3C] text-white"
                : "text-[#5C3A28] hover:bg-[#f3ece6]"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.title}</span>
          </Link>
        );
      })}

      <button
        onClick={async () => {
          await signOut(auth);
          onNavigate?.();
          router.push("/login");
        }}
        className="flex w-full flex-row-reverse items-center justify-between rounded-xl px-4 py-3 text-[#5C3A28] transition hover:bg-[#f3ece6]"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">تسجيل الخروج</span>
      </button>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside
      dir="rtl"
      className="hidden w-72 shrink-0 border-l border-[#E9DED6] bg-white p-6 md:block"
    >
      <div className="mb-8 text-right">
        <h2 className="text-2xl font-bold text-[#5C3A28]">لوحة التحكم</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          إدارة الموقع والبيانات
        </p>
      </div>

      <SidebarLinks />
    </aside>
  );
}

export function MobileSidebar() {
  return (
    <div dir="rtl" className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border-[#E9DED6] bg-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          dir="rtl"
          className="w-[300px] border-l border-[#E9DED6] bg-white p-6"
        >
          <SheetHeader className="mb-8 text-right">
            <SheetTitle className="text-2xl font-bold text-[#5C3A28]">
              لوحة التحكم
            </SheetTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة الموقع والبيانات
            </p>
          </SheetHeader>

          <SidebarLinks />
        </SheetContent>
      </Sheet>
    </div>
  );
}