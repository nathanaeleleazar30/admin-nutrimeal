'use client';

import React, { useState, useEffect } from 'react';
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
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [orders, setOrders] = useState<CateringOrder[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/orders'),
      ]);

      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        if (json.success && json.data) {
          setAnalyticsData(json.data);
        }
      }

      if (ordersRes.ok) {
        const json = await ordersRes.json();
        if (json.success && Array.isArray(json.data)) {
          setOrders(json.data);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data dashboard real-time:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOrderCreated = (order: CateringOrder) => {
    setIsNewOrderModalOpen(false);
    setSelectedOrder(order);
    fetchDashboardData();
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
      fetchDashboardData();
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
      <StatCards stats={analyticsData?.kpi} />

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
          <DonutPackageSales 
            totalPortions={analyticsData?.packageDonut?.totalSoldPortions}
            categories={analyticsData?.packageDonut?.categories}
          />
          <DeliveryBatches />
        </div>
      </div>

      {/* 5. Bottom Section: Catering Orders Table */}
      <OrdersTable 
        initialOrders={orders.length > 0 ? orders : undefined}
        onSelectOrder={(order) => setSelectedOrder(order)} 
      />

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
