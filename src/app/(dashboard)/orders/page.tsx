'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/types';
import { DataTable } from '@/components/shared/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Eye, Plus, MoreHorizontal, Printer, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const orders = useAppStore((s) => s.orders);
  const deleteOrder = useAppStore((s) => s.deleteOrder);
  const router = useRouter();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteOrder(deleteId);
      toast.success('Order berhasil dihapus');
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'No. Invoice',
      cell: ({ row }) => <span className="font-medium">{row.getValue('invoiceNumber')}</span>,
    },
    {
      accessorKey: 'customerName',
      header: 'Pelanggan',
    },
    {
      accessorKey: 'items',
      header: 'Layanan',
      cell: ({ row }) => {
        const items = row.original.items;
        return (
          <div className="flex flex-wrap gap-1">
            {items.map((item, i) => (
              <Badge variant="secondary" key={i} className="text-[10px]">
                {item.serviceName}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'orderStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.orderStatus;
        return (
          <Badge variant="outline" className={ORDER_STATUS_COLORS[status]}>
            {ORDER_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Pembayaran',
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        return (
          <Badge variant="outline" className={PAYMENT_STATUS_COLORS[status]}>
            {PAYMENT_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.getValue('total'))}</span>,
    },
    {
      accessorKey: 'orderDate',
      header: 'Tanggal Masuk',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateTime(row.getValue('orderDate'))}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                <Eye className="w-4 h-4 mr-2" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Fitur cetak akan segera tersedia')}>
                <Printer className="w-4 h-4 mr-2" />
                Cetak Invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteId(order.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Order</h2>
          <p className="text-muted-foreground">
            Kelola semua pesanan cuci sepatu pelanggan Anda.
          </p>
        </div>
        <Link href="/cashier" className={buttonVariants()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Order
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKey="customerName"
        searchPlaceholder="Cari nama pelanggan..."
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Order akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
