import ProtectedRoute from "@/components/ProtectedRoute";
import {
  DesktopSidebar,
  MobileSidebar,
} from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div dir="rtl" className="min-h-screen bg-[#fcfaf8]">
        <div className="flex min-h-screen">
          <DesktopSidebar />

          <main className="flex-1 p-4 md:p-8">
            <div className="mb-4 flex justify-end md:hidden">
              <MobileSidebar />
            </div>

            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}