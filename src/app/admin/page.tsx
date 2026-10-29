"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  TrendingUp,
  Package,
  TreePine,
  Download,
  Plus,
  Trash2,
  Edit,
  X,
  ArrowLeft,
  CheckCircle2,
  LogOut,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "trees">(
    "overview"
  );

  const [productsList, setProductsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [treeDonations, setTreeDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Modal State for Product CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    categoryId: "cat-1",
    co2SavedKg: "2.5",
    plasticSavedPcs: "50",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    origin: "Indonesia",
    materials: "Bahan Ramah Lingkungan",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, ordRes, treeRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/orders"),
        fetch("/api/trees"),
      ]);

      if (prodRes.ok) setProductsList(await prodRes.json());
      if (catRes.ok) setCategoriesList(await catRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (treeRes.ok) setTreeDonations(await treeRes.json());
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "JH-" + Math.floor(1000 + Math.random() * 9000),
      price: "125000",
      stock: "25",
      categoryId: categoriesList[0]?.id || "cat-1",
      co2SavedKg: "5.0",
      plasticSavedPcs: "100",
      description: "Produk ramah lingkungan kurasi JejakHijau untuk masa depan berkelanjutan.",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
      origin: "Jawa Barat, Indonesia",
      materials: "100% Organik & Dapat Didaur Ulang",
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId || categoriesList[0]?.id || "cat-1",
      co2SavedKg: product.co2SavedKg?.toString() || "0",
      plasticSavedPcs: product.plasticSavedPcs?.toString() || "0",
      description: product.description,
      imageUrl: product.images?.[0] || "",
      origin: product.origin || "Indonesia",
      materials: product.materials || "Material Alami",
    });
    setIsModalOpen(true);
  };

  // Save product (POST or PATCH)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            price: Number(formData.price),
            stock: Number(formData.stock),
            description: formData.description,
            co2SavedKg: Number(formData.co2SavedKg),
            plasticSavedPcs: Number(formData.plasticSavedPcs),
            origin: formData.origin,
            materials: formData.materials,
          }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await loadData();
        } else {
          alert("Gagal memperbarui produk.");
        }
      } else {
        // Create new product
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            sku: formData.sku,
            price: Number(formData.price),
            stock: Number(formData.stock),
            categoryId: formData.categoryId,
            description: formData.description,
            co2SavedKg: Number(formData.co2SavedKg),
            plasticSavedPcs: Number(formData.plasticSavedPcs),
            origin: formData.origin,
            materials: formData.materials,
            images: [formData.imageUrl],
            sdgIds: [12, 13],
          }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          await loadData();
        } else {
          alert("Gagal membuat produk baru.");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat menyimpan produk.");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" dari database SQLite?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadData();
      } else {
        alert("Gagal menghapus produk.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat menghapus produk.");
    }
  };

  // Order status transition
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const tracking =
        nextStatus === "SHIPPED"
          ? "JH-EXP-" + Math.floor(100000 + Math.random() * 900000)
          : undefined;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          trackingNumber: tracking,
        }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Gagal memperbarui status pesanan.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Tree verification
  const handleMarkTreePlanted = async (treeId: string) => {
    try {
      const res = await fetch("/api/trees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: treeId,
          status: "PLANTED",
          location: "Tahura Juanda, Bandung (GPS: -6.8524, 107.6321)",
        }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Gagal memverifikasi donasi pohon.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCsv = (type: "orders" | "products" | "trees" = "orders") => {
    let filename = "laporan-penjualan-jejakhijau.csv";
    let csvRows: string[] = [];

    if (type === "orders") {
      filename = `laporan-transaksi-jejakhijau-${new Date().toISOString().slice(0, 10)}.csv`;
      csvRows = [
        "Nomor Pesanan,Tanggal,Nama Pelanggan,Email,Status,Kurir,Kemasan Bebas Plastik,Subtotal (Rp),Ongkir (Rp),Diskon (Rp),Total (Rp),Reduksi CO2 (kg),Plastik Dihemat (pcs),No Resi",
        ...orders.map((o) =>
          [
            `"${o.orderNumber}"`,
            `"${o.date}"`,
            `"${(o.customer || "").replace(/"/g, '""')}"`,
            `"${(o.customerEmail || "").replace(/"/g, '""')}"`,
            `"${o.status}"`,
            `"${o.courier || "-"}"`,
            `"${o.plasticFree ? "Ya" : "Standar"}"`,
            o.subtotal || 0,
            o.shippingCost || 0,
            o.discount || 0,
            o.total || 0,
            o.co2Saved || 0,
            o.plasticSaved || 0,
            `"${o.trackingNumber || "-"}"`,
          ].join(",")
        ),
      ];
    } else if (type === "products") {
      filename = `laporan-inventaris-produk-${new Date().toISOString().slice(0, 10)}.csv`;
      csvRows = [
        "SKU,Nama Produk,Kategori,Harga (Rp),Stok,Terjual,Rating,Reduksi CO2 (kg),Plastik Dihemat (pcs),Status",
        ...productsList.map((p) =>
          [
            `"${p.sku}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.categoryName || "-"}"`,
            p.price,
            p.stock,
            p.soldCount || 0,
            p.avgRating || 0,
            p.co2SavedKg || 0,
            p.plasticSavedPcs || 0,
            `"${p.status}"`,
          ].join(",")
        ),
      ];
    }

    // UTF-8 BOM (\uFEFF) ensures Excel opens Indonesian characters cleanly
    const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate live KPIs
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status === "PAID" || o.status === "PROCESSING").length;
  const totalCo2Saved = orders.reduce((acc, o) => acc + (o.co2Saved || 0), 0);
  const plantedTreesCount = treeDonations.filter((t) => t.status === "PLANTED").length;

  // Security Guard Check
  if (hydrated && (!isAuthenticated || user?.role !== "ADMIN")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4 sm:p-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-7 w-7" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Keamanan Terproteksi • 403 Terlarang
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Akses Dibatasi Pengawas
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Panel backoffice ini hanya diperuntukkan bagi personel Administrator resmi JejakHijau. Pengguna umum tidak memiliki izin untuk mengaudit atau mengubah data sistem.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-left space-y-1 text-xs">
            <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span>Apakah Anda Pengelola Sistem?</span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Silakan lakukan otorisasi kredensial melalui kanal masuk khusus administrator.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/admin/login"
              className="flex w-full h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
            >
              <span>Masuk ke Portal Administrator</span>
            </Link>
            <Link
              href="/"
              className="flex w-full h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              <span>Kembali ke Beranda Toko</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Admin Header Bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mr-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ke Toko</span>
            </Link>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                Backoffice JejakHijau (SQLite Server)
                <span className="rounded-sm bg-[var(--secondary)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--primary)] border border-[var(--border)] uppercase">
                  Admin: {user?.name?.split(" ")[0] || "Otoritas"}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => handleExportCsv("orders")}
                className="flex items-center gap-1.5 h-9 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shadow-xs"
                title="Unduh data transaksi & reduksi CO2"
              >
                <Download className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>CSV Transaksi</span>
              </button>
              <button
                onClick={() => handleExportCsv("products")}
                className="flex items-center gap-1.5 h-9 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shadow-xs"
                title="Unduh inventaris 20 produk"
              >
                <Download className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <span>CSV Produk</span>
              </button>
            </div>
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
              className="flex items-center gap-1.5 h-9 rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Keluar dari sesi administrator"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "overview"
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Ringkasan & KPI
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "products"
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Katalog Produk ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "orders"
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Pesanan Masuk ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("trees")}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "trees"
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Donasi Pohon ({treeDonations.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards 4 Cols: Dynamic values from SQLite database */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Total Pendapatan (Database)
                  </span>
                  <div className="mt-1 text-2xl font-bold text-[var(--foreground)] tabular-nums">
                    {formatRupiah(totalRevenue)}
                  </div>
                  <span className="mt-1 text-[11px] font-medium text-[var(--primary)] flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Berdasarkan {orders.length} pesanan SQLite
                  </span>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Pesanan Aktif Diproses
                  </span>
                  <div className="mt-1 text-2xl font-bold text-[var(--foreground)] tabular-nums">
                    {activeOrdersCount} Pesanan
                  </div>
                  <span className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                    Menunggu pengiriman kurir
                  </span>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Total Emisi CO₂ Dihemat
                  </span>
                  <div className="mt-1 text-2xl font-bold text-[var(--primary)] tabular-nums">
                    {totalCo2Saved.toFixed(1)} kg
                  </div>
                  <span className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                    Akumulasi transaksi tersimpan
                  </span>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Pohon Asuh Tervalidasi
                  </span>
                  <div className="mt-1 text-2xl font-bold text-[var(--foreground)] tabular-nums">
                    {plantedTreesCount} / {treeDonations.length} Pohon
                  </div>
                  <span className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                    Tersimpan di tabel TreeDonation
                  </span>
                </div>
              </div>

              {/* Quick Table: Pesanan Terbaru */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      Pesanan Terbaru dari Database
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Daftar transaksi pesanan live di SQLite lokal.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    Buka Semua Pesanan
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[var(--border)] text-[var(--muted-foreground)] uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">No. Pesanan</th>
                        <th className="py-2.5 px-3">Pelanggan</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Kurir</th>
                        <th className="py-2.5 px-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id}>
                          <td className="py-3 px-3 font-semibold text-[var(--foreground)] font-mono">
                            {o.orderNumber}
                          </td>
                          <td className="py-3 px-3 text-[var(--foreground)]">{o.customer}</td>
                          <td className="py-3 px-3 text-[var(--foreground)] font-semibold tabular-nums">
                            {formatRupiah(o.total)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-sm bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--foreground)] border border-[var(--border)]">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[var(--muted-foreground)]">
                            {o.courier}
                          </td>
                          <td className="py-3 px-3">
                            {o.status === "PAID" && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(o.id, "PROCESSING")
                                }
                                className="h-7 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-2.5 text-[11px] font-medium hover:bg-[var(--primary-hover)] transition-colors"
                              >
                                Proses
                              </button>
                            )}
                            {o.status === "PROCESSING" && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(o.id, "SHIPPED")
                                }
                                className="h-7 rounded-md bg-[var(--foreground)] text-[var(--background)] px-2.5 text-[11px] font-medium hover:opacity-90 transition-opacity"
                              >
                                Input Resi & Kirim
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT (CRUD) */}
          {activeTab === "products" && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Katalog {productsList.length} Produk (SQLite Database)
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Kelola harga, stok, data dampak CO₂, dan CRUD inventaris langsung ke database.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-1.5 h-9 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--border)] text-[var(--muted-foreground)] uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Produk</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Harga</th>
                      <th className="py-2.5 px-3">Stok</th>
                      <th className="py-2.5 px-3">Eco Impact</th>
                      <th className="py-2.5 px-3">Aksi CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {productsList.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.images?.[0] || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=100&q=80"}
                              alt={p.name}
                              className="h-8 w-8 rounded-md object-cover border border-[var(--border)]"
                            />
                            <span className="font-semibold text-[var(--foreground)] truncate max-w-[200px]">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[var(--muted-foreground)] font-mono text-[11px]">
                          {p.sku}
                        </td>
                        <td className="py-3 px-3 text-[var(--foreground)] font-semibold tabular-nums">
                          {formatRupiah(p.price)}
                        </td>
                        <td className="py-3 px-3 tabular-nums">
                          <span
                            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                              p.stock <= 15
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                                : "bg-[var(--secondary)] text-[var(--foreground)]"
                            }`}
                          >
                            {p.stock} unit
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[var(--primary)] font-medium tabular-nums">
                          {p.co2SavedKg > 0 && `-${p.co2SavedKg} kg CO₂`}
                          {p.plasticSavedPcs > 0 && ` • -${p.plasticSavedPcs} plastik`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="flex items-center gap-1 h-7 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                              title="Edit Produk"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="flex items-center gap-1 h-7 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-[11px] font-medium text-[var(--accent)] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  Manajemen Pesanan & Resi Pengiriman
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Ubah status pesanan pelanggan dan masukkan nomor resi pelacakan.
                </p>
              </div>

              <div className="space-y-2.5">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-[var(--border)] p-4 bg-[var(--secondary)]/30"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[var(--foreground)] font-mono">
                          {o.orderNumber}
                        </span>
                        <span className="rounded-sm bg-[var(--secondary)] border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--foreground)]">
                          {o.status}
                        </span>
                        {o.plasticFree && (
                          <span className="rounded-sm bg-[var(--primary)] text-[var(--primary-foreground)] px-1.5 py-0.5 text-[10px] font-bold">
                            Bebas Plastik
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] tabular-nums">
                        {o.customer} ({o.customerEmail || "-"}) • {o.courier} • {o.date}
                      </div>
                      {o.trackingNumber && (
                        <div className="text-xs font-mono text-[var(--primary)]">
                          No. Resi: {o.trackingNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">
                        {formatRupiah(o.total)}
                      </span>

                      {o.status === "PAID" && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(o.id, "PROCESSING")
                          }
                          className="h-8 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-3 text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                        >
                          Proses Pesanan
                        </button>
                      )}

                      {o.status === "PROCESSING" && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(o.id, "SHIPPED")
                          }
                          className="h-8 rounded-md bg-[var(--foreground)] text-[var(--background)] px-3 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Input Resi & Kirim
                        </button>
                      )}

                      {o.status === "SHIPPED" && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(o.id, "COMPLETED")
                          }
                          className="h-8 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                        >
                          Tandai Selesai
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TREE DONATIONS */}
          {activeTab === "trees" && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  Verifikasi Donasi Pohon Komunitas
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Bibit pohon yang diadopsi dari Eco Points. Tandai saat bibit telah tertanam di kawasan mitra.
                </p>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {treeDonations.map((tree) => (
                  <div
                    key={tree.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                          {tree.quantity}x Pohon {tree.type} ({tree.user})
                        </span>
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                            tree.status === "PLANTED"
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {tree.status}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        Lokasi: {tree.location} • Diajukan: {tree.requestedAt} {tree.plantedAt && `• Selesai: ${tree.plantedAt}`}
                      </div>
                    </div>

                    {tree.status === "PENDING" && (
                      <button
                        onClick={() => handleMarkTreePlanted(tree.id)}
                        className="h-8 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-3 text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                      >
                        Verifikasi Ditanam (PLANTED)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CRUD Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {editingProduct ? "Edit Produk Katalog" : "Tambah Produk Ramah Lingkungan Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Tumbler Stainless 500ml"
                  className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--foreground)] mb-1">
                    SKU Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-mono text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--foreground)] mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs text-[var(--foreground)]"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--foreground)] mb-1">
                    Harga (Rupiah)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="125000"
                    className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--foreground)] mb-1">
                    Stok Unit
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--foreground)] mb-1">
                    CO₂ Dihemat (kg/thn)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.co2SavedKg}
                    onChange={(e) => setFormData({ ...formData, co2SavedKg: e.target.value })}
                    className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--foreground)] mb-1">
                    Plastik Dicegah (pcs/thn)
                  </label>
                  <input
                    type="number"
                    value={formData.plasticSavedPcs}
                    onChange={(e) => setFormData({ ...formData, plasticSavedPcs: e.target.value })}
                    className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--foreground)] mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5 text-xs text-[var(--foreground)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-md bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
                >
                  {editingProduct ? "Simpan Perubahan" : "Simpan Produk Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
