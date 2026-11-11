export type BarProductCategory =
  | 'all'
  | 'beers'
  | 'cocktails'
  | 'spirits'
  | 'wines'
  | 'soft_drinks'
  | 'snacks';

export interface BarCategoryOption {
  id: BarProductCategory;
  label: string;
  count?: number;
}

export interface BarProduct {
  id: string;
  name: string;
  category: Exclude<BarProductCategory, 'all'>;
  price: number;
  inStock: number;
  unit: string;
  volume?: string;
  description?: string;
  badge?: 'Popular' | 'Low Stock' | 'Special' | 'Out of Stock';
  sku: string;
}

export interface BarCartItem {
  product: BarProduct;
  quantity: number;
  notes?: string;
}

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'card'
  | 'charge_to_room';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export type SaleStatus = 'completed' | 'pending_void' | 'voided';

export interface BarSaleItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
}

export interface BarSale {
  id: string;
  reference: string;
  items: BarSaleItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  saleStatus: SaleStatus;
  createdAt: string;
  staffName: string;
  roomNumber?: string;
  bookingRef?: string;
  guestName?: string;
  voidReason?: string;
  voidRequestedAt?: string;
  voidRequestedBy?: string;
  notes?: string;
}

export interface BarShiftInfo {
  id: string;
  status: 'OPEN' | 'CLOSED';
  staffName: string;
  openedAt: string;
  openingCash: number;
  cashPaymentsReceived: number;
  expectedCash: number;
  totalSalesCount: number;
  totalSalesVolume: number;
  cardPaymentsReceived?: number;
  transferPaymentsReceived?: number;
  roomChargesReceived?: number;
}

export interface BarOverviewMetrics {
  todaySales: number;
  totalRevenue: number;
  completedSales: number;
  outstandingRoomCharges: number;
  salesGrowthPercent: number;
  pendingRoomChargesCount: number;
}
