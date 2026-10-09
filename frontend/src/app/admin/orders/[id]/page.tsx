import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { OrderDetailView } from '@/components/orders/order-detail-view';
import { getOrderById } from '@/lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate Dynamic Metadata untuk halaman detail pesanan
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return {
      title: 'Pesanan Tidak Ditemukan | NutriMeal Admin',
    };
  }

  return {
    title: `Detail Pesanan #${order.id} - ${order.customer_name} | NutriMeal Admin`,
    description: `Rincian lengkap pesanan katering #${order.id} untuk ${order.customer_name}`,
  };
}

// Server Component (RSC) dengan async data fetching
export default async function OrderDetailPage({ params }: PageProps) {
  // Aturan Next.js 15+: params wajib di-await
  const { id } = await params;
  
  // Data fetching aman di server dari Express API
  const order = await getOrderById(id);

  // Jika data tidak ditemukan, panggil notFound() sesuai rubrik UTS
  if (!order) {
    notFound();
  }

  return (
    <AdminLayout>
      <OrderDetailView initialOrder={order} />
    </AdminLayout>
  );
}
