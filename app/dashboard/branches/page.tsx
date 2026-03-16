"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Branch = {
  id: string;
  name: string;
  city: string;
  address?: string;
  lat: number;
  lng: number;
};

type FormState = {
  name: string;
  city: string;
  address: string;
  lat: string;
  lng: string;
};

const initialFormState: FormState = {
  name: "",
  city: "",
  address: "",
  lat: "",
  lng: "",
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [form, setForm] = useState<FormState>(initialFormState);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, "branches"), orderBy("name", "asc"));
      const snapshot = await getDocs(q);

      const data: Branch[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Branch, "id">),
      }));

      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredBranches = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return branches;

    return branches.filter((branch) => {
      return (
        branch.name?.toLowerCase().includes(value) ||
        branch.city?.toLowerCase().includes(value) ||
        branch.address?.toLowerCase().includes(value)
      );
    });
  }, [search, branches]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingBranch(null);
  };

  const handleAddBranch = async () => {
    if (!form.name || !form.city || !form.lat || !form.lng) return;

    try {
      setSubmitting(true);

      await addDoc(collection(db, "branches"), {
        name: form.name,
        city: form.city,
        address: form.address,
        lat: Number(form.lat),
        lng: Number(form.lng),
      });

      resetForm();
      setOpenAddDialog(false);
      fetchBranches();
    } catch (error) {
      console.error("Error adding branch:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name || "",
      city: branch.city || "",
      address: branch.address || "",
      lat: String(branch.lat ?? ""),
      lng: String(branch.lng ?? ""),
    });
    setOpenEditDialog(true);
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch) return;
    if (!form.name || !form.city || !form.lat || !form.lng) return;

    try {
      setSubmitting(true);

      await updateDoc(doc(db, "branches", editingBranch.id), {
        name: form.name,
        city: form.city,
        address: form.address,
        lat: Number(form.lat),
        lng: Number(form.lng),
      });

      resetForm();
      setOpenEditDialog(false);
      fetchBranches();
    } catch (error) {
      console.error("Error updating branch:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف الفرع؟");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "branches", branchId));
      fetchBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
    }
  };

  return (
    <ProtectedRoute>
      <main dir="rtl" className="min-h-screen bg-[#fcfaf8] p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-right">
              <h1 className="text-3xl font-bold text-[#5C3A28]">إدارة الفروع</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                إضافة وتعديل وحذف نقاط البيع الظاهرة في الخريطة
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-[320px]">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث باسم الفرع أو المدينة"
                  className="pr-10 text-right"
                />
              </div>

              <Dialog
                open={openAddDialog}
                onOpenChange={(open) => {
                  setOpenAddDialog(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#EB8A3C] text-white hover:bg-[#d97732]">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة فرع
                  </Button>
                </DialogTrigger>

                <DialogContent dir="rtl" className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة فرع جديد</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <label className="text-right text-sm font-medium">
                        اسم الفرع
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="مثال: فرع الدمام"
                        className="text-right"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-right text-sm font-medium">
                        المدينة
                      </label>
                      <Input
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="مثال: الدمام"
                        className="text-right"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-right text-sm font-medium">
                        العنوان
                      </label>
                      <Input
                        value={form.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="العنوان الكامل"
                        className="text-right"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-right text-sm font-medium">
                          Latitude
                        </label>
                        <Input
                          value={form.lat}
                          onChange={(e) => handleChange("lat", e.target.value)}
                          placeholder="26.4344"
                          dir="ltr"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-right text-sm font-medium">
                          Longitude
                        </label>
                        <Input
                          value={form.lng}
                          onChange={(e) => handleChange("lng", e.target.value)}
                          placeholder="50.1033"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpenAddDialog(false);
                          resetForm();
                        }}
                      >
                        إلغاء
                      </Button>

                      <Button
                        onClick={handleAddBranch}
                        disabled={submitting}
                        className="bg-[#EB8A3C] text-white hover:bg-[#d97732]"
                      >
                        {submitting ? "جاري الإضافة..." : "حفظ الفرع"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-[#E9DED6]">
              <CardHeader className="pb-2">
                <CardTitle className="text-right text-sm text-muted-foreground">
                  إجمالي الفروع
                </CardTitle>
              </CardHeader>
              <CardContent className="text-right">
                <div className="text-3xl font-bold text-[#5C3A28]">
                  {branches.length}
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
                  {filteredBranches.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E9DED6]">
              <CardHeader className="pb-2">
                <CardTitle className="text-right text-sm text-muted-foreground">
                  حالة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="text-right">
                <Badge className="bg-[#EB8A3C] text-white hover:bg-[#EB8A3C]">
                  متصلة
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#E9DED6]">
            <CardHeader>
              <CardTitle className="text-right text-[#5C3A28]">
                قائمة الفروع
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-right text-sm text-muted-foreground">
                  جاري تحميل الفروع...
                </p>
              ) : filteredBranches.length === 0 ? (
                <p className="text-right text-sm text-muted-foreground">
                  لا توجد فروع حالياً
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">اسم الفرع</TableHead>
                        <TableHead className="text-right">المدينة</TableHead>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">Latitude</TableHead>
                        <TableHead className="text-right">Longitude</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredBranches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell className="text-right font-medium">
                            {branch.name}
                          </TableCell>
                          <TableCell className="text-right">{branch.city}</TableCell>
                          <TableCell className="text-right">
                            {branch.address || "-"}
                          </TableCell>
                          <TableCell className="text-right" dir="ltr">
                            {branch.lat}
                          </TableCell>
                          <TableCell className="text-right" dir="ltr">
                            {branch.lng}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEdit(branch)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteBranch(branch.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog
            open={openEditDialog}
            onOpenChange={(open) => {
              setOpenEditDialog(open);
              if (!open) resetForm();
            }}
          >
            <DialogContent dir="rtl" className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل الفرع</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <label className="text-right text-sm font-medium">
                    اسم الفرع
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-right text-sm font-medium">
                    المدينة
                  </label>
                  <Input
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-right text-sm font-medium">
                    العنوان
                  </label>
                  <Input
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-right text-sm font-medium">
                      Latitude
                    </label>
                    <Input
                      value={form.lat}
                      onChange={(e) => handleChange("lat", e.target.value)}
                      dir="ltr"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-right text-sm font-medium">
                      Longitude
                    </label>
                    <Input
                      value={form.lng}
                      onChange={(e) => handleChange("lng", e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenEditDialog(false);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>

                  <Button
                    onClick={handleUpdateBranch}
                    disabled={submitting}
                    className="bg-[#EB8A3C] text-white hover:bg-[#d97732]"
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </ProtectedRoute>
  );
}