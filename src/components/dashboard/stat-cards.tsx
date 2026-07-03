'use client';

import { useAppStore } from '@/lib/store';
import { getDashboardStats } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils/format';
import {
  Users,
  ShoppingBag,
  Calendar,
  Loader,
  Package,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function StatCards() {
  const [stats, setStats] = useState<ReturnType<typeof getDashboardStats> | null>(null);

  // Use useEffect to prevent hydration mismatch since we rely on current date for stats
  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-4 flex flex-col justify-center h-24">
              <div className="w-full h-4 skeleton mb-2" />
              <div className="w-2/3 h-6 skeleton" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    },
    {
      title: 'Order Hari Ini',
      value: stats.ordersToday,
      icon: ShoppingBag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    },
    {
      title: 'Order Bulan Ini',
      value: stats.ordersThisMonth,
      icon: Calendar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    },
    {
      title: 'Dalam Proses',
      value: stats.ordersInProgress,
      icon: Loader,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    },
    {
      title: 'Siap Diambil',
      value: stats.ordersReadyForPickup,
      icon: Package,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    },
    {
      title: 'Order Selesai',
      value: stats.ordersCompleted,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatCurrency(stats.revenueToday),
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10 dark:bg-success/20',
    },
    {
      title: 'Pendapatan (Bln)',
      value: formatCurrency(stats.revenueThisMonth),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
    },
    {
      title: 'Pengeluaran (Bln)',
      value: formatCurrency(stats.expensesThisMonth),
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10 dark:bg-destructive/20',
    },
    {
      title: 'Laba Bersih',
      value: formatCurrency(stats.netProfit),
      icon: Wallet,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                card.bgColor
              )}
            >
              <card.icon className={cn('w-6 h-6', card.color)} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-muted-foreground truncate">
                {card.title}
              </p>
              <h3 className="text-xl font-bold truncate mt-0.5">{card.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
