import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { mapBackendOrderToFrontend } from '../orders/route';
import { mapBackendPackageToFrontend } from '../packages/route';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

export async function GET() {
  try {
    const [ordersRes, mealsRes, packagesRes, customersRes] = await Promise.allSettled([
      fetch(`${BACKEND_BASE}/api/orders`, { cache: 'no-store' }),
      fetch(`${BACKEND_BASE}/api/meals`, { cache: 'no-store' }),
      fetch(`${BACKEND_BASE}/api/packages`, { cache: 'no-store' }),
      fetch(`${BACKEND_BASE}/api/customers`, { cache: 'no-store' }),
    ]);

    let orders: any[] = [];
    if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
      const json = await ordersRes.value.json();
      if (json.success && Array.isArray(json.data)) {
        orders = json.data.map(mapBackendOrderToFrontend);
      }
    }

    let meals: any[] = [];
    if (mealsRes.status === 'fulfilled' && mealsRes.value.ok) {
      const json = await mealsRes.value.json();
      if (json.success && Array.isArray(json.data)) {
        meals = json.data;
      }
    }

    let packages: any[] = [];
    if (packagesRes.status === 'fulfilled' && packagesRes.value.ok) {
      const json = await packagesRes.value.json();
      if (json.success && Array.isArray(json.data)) {
        packages = json.data.map(mapBackendPackageToFrontend);
      }
    }

    let customers: any[] = [];
    if (customersRes.status === 'fulfilled' && customersRes.value.ok) {
      const json = await customersRes.value.json();
      if (json.success && Array.isArray(json.data)) {
        customers = json.data;
      }
    }

    const activeKitchenOrders = orders.filter(
      (o) =>
        o.status !== 'Menunggu Pembayaran' &&
        o.status !== 'Dibatalkan' &&
        (o.paymentStatus === 'Lunas' || o.paymentStatus === 'COD')
    );
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Lunas');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const readyToShip = activeKitchenOrders.filter((o) => o.status === 'Dikirim').length;
    const inProcess = activeKitchenOrders.filter((o) => o.status === 'Diproses').length;
    const morningBoxes = activeKitchenOrders
      .filter((o) => o.deliveryBatch === 'Pagi/Siang')
      .reduce((sum, o) => sum + (Number(o.portionsCount) || 1), 0);
    const eveningBoxes = activeKitchenOrders
      .filter((o) => o.deliveryBatch === 'Sore/Malam')
      .reduce((sum, o) => sum + (Number(o.portionsCount) || 1), 0);
    const personalCustomers = customers.filter((c) => (c.type || 'Personal') === 'Personal').length;
    const corporateCustomers = customers.filter((c) => (c.type || '').includes('Kantor') || (c.type || '').includes('Korporat')).length;

    const revenueDisplay = totalRevenue > 0
      ? (totalRevenue >= 1000000 ? `Rp ${(totalRevenue / 1000000).toFixed(1)}jt` : `Rp ${(totalRevenue / 1000).toFixed(0)}rb`)
      : 'Rp 0';

    const kpi = {
      totalOrdersToday: activeKitchenOrders.length,
      paidOrdersCount: paidOrders.length,
      totalOrdersChange: '0%',
      readyToShip,
      inProcess,
      monthlyRevenue: totalRevenue,
      monthlyRevenueDisplay: revenueDisplay,
      monthlyRevenueChange: '0%',
      dailyRevenueAverage: paidOrders.length > 0
        ? `Rp ${Math.round(totalRevenue / paidOrders.length).toLocaleString('id-ID')}`
        : 'Rp 0',
      activeCustomers: customers.length,
      newCustomersThisMonth: customers.length,
      personalCustomers,
      corporateCustomers,
      activeMenus: meals.length,
      availablePackages: packages.length,
    };

    const daysList = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const dayPrefixMap: Record<string, string> = {
      Senin: 'Sen',
      Selasa: 'Sel',
      Rabu: 'Rab',
      Kamis: 'Kam',
      Jumat: 'Jum',
      Sabtu: 'Sab',
      Minggu: 'Min',
    };
    const weeklySalesMap: Record<string, { day: string; diet: number; kantor: number; family: number; event: number; total: number }> = {};
    for (const d of daysList) {
      weeklySalesMap[d] = { day: d, diet: 0, kantor: 0, family: 0, event: 0, total: 0 };
    }
    for (const o of paidOrders) {
      const shortDay = dayPrefixMap[o.day] || 'Sen';
      const portions = Number(o.portionsCount) || 1;
      const pkgLower = String(o.packageName || '').toLowerCase();
      const target = weeklySalesMap[shortDay];
      if (!target) continue;
      if (pkgLower.includes('kantor') || o.customerType === 'Korporat / Kantor') {
        target.kantor += portions;
      } else if (pkgLower.includes('family') || pkgLower.includes('keluarga') || o.customerType === 'Keluarga') {
        target.family += portions;
      } else if (pkgLower.includes('event') || pkgLower.includes('prasmanan')) {
        target.event += portions;
      } else {
        target.diet += portions;
      }
      target.total += portions;
    }

    const totalSoldPortions = paidOrders.reduce((sum, o) => sum + (Number(o.portionsCount) || 1), 0);
    const palette = ['#047857', '#059669', '#b45309', '#0284c7', '#475569'];
    const breakdownMap = new Map<string, { name: string; portions: number; revenue: number }>();
    for (const o of paidOrders) {
      const key = o.packageName || 'Pesanan Katering';
      const entry = breakdownMap.get(key) || { name: key, portions: 0, revenue: 0 };
      entry.portions += Number(o.portionsCount) || 1;
      entry.revenue += Number(o.totalPrice) || 0;
      breakdownMap.set(key, entry);
    }
    const categories = Array.from(breakdownMap.values())
      .sort((a, b) => b.portions - a.portions)
      .slice(0, 5)
      .map((item, idx) => ({
        name: item.name,
        percent: totalSoldPortions > 0 ? Math.round((item.portions / totalSoldPortions) * 100) : 0,
        portions: item.portions,
        revenue: item.revenue,
        color: palette[idx % palette.length],
      }));

    return NextResponse.json({
      success: true,
      data: {
        kpi,
        weeklySales: daysList.map((d) => weeklySalesMap[d]),
        packageDonut: {
          totalSoldPortions,
          categories,
        },
        deliveryBatches: {
          morning: {
            title: 'Batch Pagi / Siang',
            timeRange: '11:00 - 12:30 WIB',
            countText: `${morningBoxes} Box Terkonfirmasi`,
            boxesCount: morningBoxes,
            status: readyToShip > 0 ? 'Selesai' : 'Siap',
          },
          evening: {
            title: 'Batch Sore / Malam',
            timeRange: '16:00 - 17:30 WIB',
            countText: `${eveningBoxes} Box Terkonfirmasi`,
            boxesCount: eveningBoxes,
            status: inProcess > 0 ? 'Diproses' : 'Siap',
          },
        },
        inventoryNote: {
          content: 'Dapur katering sehat NutriMeal siap memproses pesanan masuk.',
        },
      },
    });
  } catch (error) {
    console.warn('⚠️ Gagal komputasi analitik langsung dari backend Express:', error);
    return NextResponse.json({
      success: true,
      data: db.getAnalytics(),
    });
  }
}
