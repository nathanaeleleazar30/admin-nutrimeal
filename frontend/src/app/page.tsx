import React from 'react';
import { Metadata } from 'next';
import { AdminLayout } from '@/components/layout/admin-layout';
import { DashboardView } from '@/components/dashboard/dashboard-view';

// Metadata Halaman Dashboard
export const metadata: Metadata = {
  title: 'Dashboard Operasional Katering | NutriMeal Admin',
  description: 'Dashboard analitik, monitoring pesanan, dan manajemen operasional katering NutriMeal UMKM',
};

// Strategi Render: SSR dinamis untuk data real-time dashboard
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  return (
    <AdminLayout>
      <DashboardView />
    </AdminLayout>
  );
}
