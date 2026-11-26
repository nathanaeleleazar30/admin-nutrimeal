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

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const readyToShip = orders.filter((o) => o.status === 'Dikirim').length;
    const inProcess = orders.filter((o) => o.status === 'Diproses').length;
    const personalCustomers = customers.filter((c) => (c.type || 'Personal') === 'Personal').length;
    const corporateCustomers = customers.filter((c) => (c.type || '').includes('Kantor') || (c.type || '').includes('Korporat')).length;

    const revenueDisplay = totalRevenue > 0
      ? (totalRevenue >= 1000000 ? `Rp ${(totalRevenue / 1000000).toFixed(1)}jt` : `Rp ${(totalRevenue / 1000).toFixed(0)}rb`)
      : 'Rp 0';

    const kpi = {
      totalOrdersToday: orders.length,
      totalOrdersChange: '0%',
      readyToShip,
      inProcess,
      monthlyRevenue: totalRevenue,
      monthlyRevenueDisplay: revenueDisplay,
      monthlyRevenueChange: '0%',
      dailyRevenueAverage: 'Rp 0',
      activeCustomers: customers.length,
      newCustomersThisMonth: customers.length,
      personalCustomers,
      corporateCustomers,
      activeMenus: meals.length,
      availablePackages: packages.length,
    };

    const categories = packages.map((pkg) => ({
      name: pkg.name,
      percent: pkg.percentage || 25,
      portions: pkg.salesCount || 100,
      color: pkg.color || '#059669',
    }));

    const totalSoldPortions = categories.reduce((sum, c) => sum + c.portions, 0);

    return NextResponse.json({
      success: true,
      data: {
        kpi,
        weeklySales: [
          { day: 'Sen', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
          { day: 'Sel', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
          { day: 'Rab', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
          { day: 'Kam', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
          { day: 'Jum', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
          { day: 'Sab', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
          { day: 'Min', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
        ],
        packageDonut: {
          totalSoldPortions,
          categories,
        },
        deliveryBatches: {
          morning: {
            title: 'Batch Pagi / Siang',
            timeRange: '11:00 - 12:30 WIB',
            countText: `${readyToShip} Box Siap & Terkirim`,
            status: readyToShip > 0 ? 'Selesai' : 'Siap',
          },
          evening: {
            title: 'Batch Sore / Malam',
            timeRange: '16:00 - 17:30 WIB',
            countText: `${inProcess} Box Sedang Dimasak`,
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
