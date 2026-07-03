'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Customer,
  Service,
  Order,
  Payment,
  Expense,
  User,
  BusinessSettings,
  OrderStatus,
  PaymentStatus,
} from '@/lib/types';
import {
  mockCustomers,
  mockServices,
  mockOrders,
  mockPayments,
  mockExpenses,
  mockUsers,
  defaultSettings,
} from '@/lib/mock-data';
import { generateId, generateInvoiceNumber } from '@/lib/utils/format';
import { supabase } from '@/lib/supabase';

interface AppState {
  initialize: () => Promise<void>;
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'joinedAt' | 'totalOrders' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Services
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => Order;
  updateOrder: (id: string, data: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void;
  deleteOrder: (id: string) => void;

  // Payments
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Settings
  settings: BusinessSettings;
  updateSettings: (data: Partial<BusinessSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      initialize: async () => {
        try {
          const [
            { data: customers },
            { data: services },
            { data: orders },
            { data: payments },
            { data: expenses },
            { data: users },
            { data: settings },
          ] = await Promise.all([
            supabase.from('customers').select('*').order('joined_at', { ascending: false }),
            supabase.from('services').select('*').order('name'),
            supabase.from('orders').select('*').order('order_date', { ascending: false }),
            supabase.from('payments').select('*').order('date', { ascending: false }),
            supabase.from('expenses').select('*').order('date', { ascending: false }),
            supabase.from('users').select('*'),
            supabase.from('settings').select('*').limit(1).maybeSingle(),
          ]);

          if (customers) {
            set({ customers: customers.map((c: any) => ({
              id: c.id, name: c.name, whatsapp: c.whatsapp, address: c.address || '',
              joinedAt: c.joined_at, totalOrders: c.total_orders, totalSpent: c.total_spent
            })) });
          }
          if (services) {
            set({ services: services.map((s: any) => ({
              id: s.id, name: s.name, description: s.description || '', price: s.price,
              category: s.category, estimationDays: s.estimation_days, isActive: s.is_active
            })) });
          }
          if (orders) {
            set({ orders: orders.map((o: any) => ({
              id: o.id, invoiceNumber: o.invoice_number, customerId: o.customer_id,
              customerName: o.customer_name, customerWhatsapp: o.customer_whatsapp,
              customerAddress: o.customer_address, shoeType: o.shoe_type,
              brand: o.brand, color: o.color, size: o.size || '', condition: o.condition,
              items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, 
              subtotal: o.subtotal, discount: o.discount, tax: o.tax,
              total: o.total, amountPaid: o.amount_paid, remaining: o.remaining,
              paymentMethod: o.payment_method, paymentStatus: o.payment_status,
              orderStatus: o.order_status, statusHistory: typeof o.status_history === 'string' ? JSON.parse(o.status_history) : o.status_history || [],
              orderDate: o.order_date, estimatedDate: o.estimated_date,
              createdAt: o.created_at, updatedAt: o.updated_at
            })) });
          }
          if (payments) {
            set({ payments: payments.map((p: any) => ({
              id: p.id, orderId: p.order_id, invoiceNumber: p.invoice_number,
              customerName: p.customer_name, amount: p.amount, method: p.method,
              status: p.status, date: p.date
            })) });
          }
          if (expenses) {
            set({ expenses: expenses.map((e: any) => ({
              id: e.id, name: e.description || e.name || 'Expense', amount: e.amount,
              category: e.category, date: e.date, note: e.notes || e.note || ''
            })) });
          }
          if (users) {
            set({ users: users.map((u: any) => ({
              id: u.id, name: u.name, email: u.email, role: u.role,
              isActive: u.status === 'active' || u.status === 'Aktif', createdAt: u.joined_at || new Date().toISOString()
            })) });
          }
          if (settings) {
            set({ settings: {
              businessName: settings.business_name || '', address: settings.address || '',
              whatsapp: settings.whatsapp || '', taxRate: settings.tax_rate || 0,
              invoiceFooter: settings.invoice_note || '',
              operatingHours: '08:00 - 20:00', invoicePrefix: 'INV'
            } });
          }
        } catch (error) {
          console.error('Error initializing store:', error);
        }
      },
      // Auth
      isAuthenticated: false,
      currentUser: null,
      login: (email: string, password: string) => {
        // Dummy login — accept any valid email with password "admin123" or "kasir123"
        const user = get().users.find((u) => u.email === email && u.isActive);
        if (user && (password === 'admin123' || password === 'kasir123')) {
          set({ isAuthenticated: true, currentUser: user });
          return true;
        }
        // Also accept demo credentials
        if (email === 'admin@shoecleanpro.com' && password === 'admin123') {
          const adminUser = get().users[0] || {
            id: 'admin-fallback',
            name: 'Admin Utama',
            email: 'admin@shoecleanpro.com',
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
          };
          set({ isAuthenticated: true, currentUser: adminUser });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, currentUser: null }),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Customers
      customers: [],
      addCustomer: (data) => {
        const newCustomer: Customer = {
          ...data,
          id: generateId(),
          joinedAt: new Date().toISOString(),
          totalOrders: 0,
          totalSpent: 0,
        };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
        
        // Sync to Supabase
        supabase.from('customers').insert({
          id: newCustomer.id,
          name: newCustomer.name,
          whatsapp: newCustomer.whatsapp,
          address: newCustomer.address,
          joined_at: newCustomer.joinedAt,
          total_orders: newCustomer.totalOrders,
          total_spent: newCustomer.totalSpent
        }).then(({ error }) => { if (error) console.error('Supabase Error:', error); });
        
        return newCustomer;
      },
      updateCustomer: (id, data) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      // Services
      services: [],
      addService: (data) =>
        set((state) => ({
          services: [{ ...data, id: generateId() }, ...state.services],
        })),
      updateService: (id, data) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),

      // Orders
      orders: [],
      addOrder: (data) => {
        const now = new Date().toISOString();
        const newOrder: Order = {
          ...data,
          id: generateId(),
          invoiceNumber: generateInvoiceNumber(),
          statusHistory: [{ status: data.orderStatus, timestamp: now }],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        
        // Sync to Supabase
        supabase.from('orders').insert({
          id: newOrder.id,
          invoice_number: newOrder.invoiceNumber,
          customer_id: newOrder.customerId,
          customer_name: newOrder.customerName,
          customer_whatsapp: newOrder.customerWhatsapp,
          customer_address: newOrder.customerAddress,
          shoe_type: newOrder.shoeType,
          brand: newOrder.brand,
          color: newOrder.color,
          size: newOrder.size,
          condition: newOrder.condition,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          tax: newOrder.tax,
          total: newOrder.total,
          amount_paid: newOrder.amountPaid,
          remaining: newOrder.remaining,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          order_status: newOrder.orderStatus,
          status_history: newOrder.statusHistory,
          order_date: newOrder.orderDate,
          estimated_date: newOrder.estimatedDate,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt
        }).then(({ error }) => { if (error) console.error('Supabase Error (addOrder):', error); });

        return newOrder;
      },
      updateOrder: (id, data) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o
          ),
        })),
      updateOrderStatus: (id, status, note) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== id) return o;
            return {
              ...o,
              orderStatus: status,
              statusHistory: [
                ...o.statusHistory,
                { status, timestamp: new Date().toISOString(), note },
              ],
              completedDate: ['selesai', 'sudah_diambil'].includes(status)
                ? new Date().toISOString()
                : o.completedDate,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        })),

      // Payments
      payments: [],
      addPayment: (data) => {
        const newPayment = { ...data, id: generateId() };
        set((state) => ({ payments: [newPayment, ...state.payments] }));
        
        // Sync to Supabase
        supabase.from('payments').insert({
          id: newPayment.id,
          order_id: newPayment.orderId,
          invoice_number: newPayment.invoiceNumber,
          customer_name: newPayment.customerName,
          amount: newPayment.amount,
          method: newPayment.method,
          status: newPayment.status,
          date: newPayment.date
        }).then(({ error }) => { if (error) console.error('Supabase Error (addPayment):', error); });
      },

      // Expenses
      expenses: [],
      addExpense: (data) =>
        set((state) => ({
          expenses: [{ ...data, id: generateId() }, ...state.expenses],
        })),
      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      // Users
      users: [],
      addUser: (data) =>
        set((state) => ({
          users: [{ ...data, id: generateId(), createdAt: new Date().toISOString() }, ...state.users],
        })),
      updateUser: (id, data) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),

      // Settings
      settings: defaultSettings,
      updateSettings: (data) =>
        set((state) => ({
          settings: { ...state.settings, ...data },
        })),
    }),
    {
      name: 'shoe-laundry-pos-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      }),
    }
  )
);
