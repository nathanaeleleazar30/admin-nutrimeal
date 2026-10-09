'use client';

import React, { useState } from 'react';
import { HeaderBanner } from '@/components/dashboard/header-banner';
import { StatCards } from '@/components/dashboard/stat-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SalesDistributionChart } from '@/components/dashboard/sales-distribution-chart';
import { DonutPackageSales } from '@/components/dashboard/donut-package-sales';
import { DeliveryBatches } from '@/components/dashboard/delivery-batches';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { OrderDetailModal } from '@/components/modals/order-detail-modal';
import { NewOrderModal } from '@/components/modals/new-order-modal';
import { PrintReportModal } from '@/components/modals/print-report-modal';
import { CateringOrder, OrderStatus } from '@/lib/data-store';

export function DashboardView() {
  const [selectedOrder, setSelectedOrder] = useState<CateringOrder | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleOrderCreated = (order: CateringOrder) => {
    setIsNewOrderModalOpen(false);
    setSelectedOrder(order);
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch {
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    }
  };

  return (
    <>
      {/* 1. Header Banner */}
      <HeaderBanner
        onPrintReport={() => setIsPrintModalOpen(true)}
        onAddOrder={() => setIsNewOrderModalOpen(true)}
      />

      {/* 2. Top 4 KPI Stat Cards */}
      <StatCards />

      {/* 3. Quick Action Cards */}
      <QuickActions />

      {/* 4. Middle Section: Sales Distribution Chart & Donut/Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Performa Penjualan & Distribusi Porsi */}
        <div className="lg:col-span-8 h-full">
          <SalesDistributionChart />
        </div>

        {/* Right Column (4 cols): Menu Terlaris & Jadwal Kirim */}
        <div className="lg:col-span-4 space-y-4">
          <DonutPackageSales />
          <DeliveryBatches />
        </div>
      </div>

      {/* 5. Bottom Section: Catering Orders Table */}
      <OrdersTable onSelectOrder={(order) => setSelectedOrder(order)} />

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </>
  );
}
