"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedRoute from "@/components/ProtectedRoute";

type WholesaleRequest = {
  id: string;
  name: string;
  phone: string;
  location: string;
  createdAt?: any;
};

export default function DashboardPage() {
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WholesaleRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "wholesale_requests"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data: WholesaleRequest[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<WholesaleRequest, "id">),
        }));

        setRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredRequests(requests);
      return;
    }

    const filtered = requests.filter((item) => {
      return (
        item.name?.toLowerCase().includes(value) ||
        item.phone?.toLowerCase().includes(value) ||
        item.location?.toLowerCase().includes(value)
      );
    });

    setFilteredRequests(filtered);
  }, [search, requests]);

  return (
        <ProtectedRoute>
            
    <main dir="rtl" className="min-h-screen bg-[#fcfaf8] p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <div className="text-right">
    <h1 className="text-3xl font-bold text-[#5C3A28]">لوحة التحكم</h1>
    <p className="mt-1 text-sm text-muted-foreground">
      إدارة ومتابعة طلبات مبيعات الجملة
    </p>
  </div>

  <div className="flex items-center gap-3">
    <div className="w-full md:w-[320px]">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث بالاسم أو الجوال أو المدينة"
        className="text-right"
      />
    </div>

 
  </div>
</div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#E9DED6]">
            <CardHeader className="pb-2">
              <CardTitle className="text-right text-sm text-muted-foreground">
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-3xl font-bold text-[#5C3A28]">
                {requests.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E9DED6]">
            <CardHeader className="pb-2">
              <CardTitle className="text-right text-sm text-muted-foreground">
                نتائج البحث
              </CardTitle>
            </CardHeader>
            <CardContent className="text-right">
              <div className="text-3xl font-bold text-[#5C3A28]">
                {filteredRequests.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E9DED6]">
            <CardHeader className="pb-2">
              <CardTitle className="text-right text-sm text-muted-foreground">
                حالة النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="text-right">
              <Badge className="bg-[#EB8A3C] text-white hover:bg-[#EB8A3C]">
                متصل
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#E9DED6]">
          <CardHeader>
            <CardTitle className="text-right text-[#5C3A28]">
              طلبات مبيعات الجملة
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-right text-sm text-muted-foreground">
                جاري تحميل الطلبات...
              </p>
            ) : filteredRequests.length === 0 ? (
              <p className="text-right text-sm text-muted-foreground">
                لا توجد طلبات حالياً
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم / الشركة</TableHead>
                      <TableHead className="text-right">رقم الجوال</TableHead>
                      <TableHead className="text-right">الدولة والمدينة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredRequests.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-right font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right" dir="ltr">
                          {item.phone}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.location}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.createdAt?.toDate
                            ? item.createdAt.toDate().toLocaleDateString("ar-SA")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
        </ProtectedRoute>

  );
}