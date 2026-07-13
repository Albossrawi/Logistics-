// ---- Delivery Label Extractor ----

/** A single scanned/entered label row within a batch. */
export interface LabelEntry {
  id: string;
  /** Consignment / delivery number, e.g. "NAKD1-8FL64". */
  deliveryNumber: string;
  /** Reference number, e.g. "SRV010001". */
  referenceNumber: string;
  /** SSCC / long serial barcode number at the bottom of the label (unique per box). */
  sscc?: string;
  /** Number of colli (CLL / packages) for this row. Manual mode only. */
  quantity: string;
  /** Optional photo of the label (data URL). Not persisted to storage. */
  photo?: string;
  createdAt: string;
}

/** A printable sheet: one title + one date containing many label rows. */
export interface LabelBatch {
  id: string;
  /** Sheet header, e.g. "RETUR BEDRE NÆTTER/SENGEFABRIKKEN". */
  title: string;
  /** Sheet date (ISO yyyy-mm-dd), fully editable. */
  date: string;
  /** Optional pallet note, e.g. "2". */
  pallet: string;
  entries: LabelEntry[];
  createdAt: string;
}

export type ShipmentStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed' | 'exception';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'delay' | 'low_stock' | 'route_change' | 'weather' | 'cost_spike' | 'customs';

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: { city: string; country: string; lat: number; lng: number; };
  destination: { city: string; country: string; lat: number; lng: number; };
  status: ShipmentStatus;
  carrier: string;
  eta: string;
  actualArrival?: string;
  weight: number;
  value: number;
  category: string;
  priority: Priority;
  progress: number;
  currentLocation: { city: string; lat: number; lng: number; };
  events: ShipmentEvent[];
  customer: string;
  poNumber: string;
}

export interface ShipmentEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  turnoverRate: number;
  daysOfStock: number;
  trend: 'up' | 'down' | 'stable';
  forecast7d: number;
  forecast30d: number;
  supplier: string;
  lastRestocked: string;
}

export interface Carrier {
  id: string;
  name: string;
  logo: string;
  onTimeRate: number;
  avgTransitDays: number;
  costPerKg: number;
  totalShipments: number;
  activeShipments: number;
  incidents: number;
  rating: number;
  coverage: string[];
  modes: ('air' | 'sea' | 'road' | 'rail')[];
  trend: number;
}

export interface KPI {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down' | 'stable';
  positive: boolean;
  sparkline: number[];
  icon: string;
  color: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  actionable: boolean;
  relatedId?: string;
}

export interface SupplyChainNode {
  id: string;
  name: string;
  type: 'supplier' | 'warehouse' | 'distribution_center' | 'port' | 'customer';
  lat: number;
  lng: number;
  city: string;
  country: string;
  capacity?: number;
  utilization?: number;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  throughput: number;
}

export interface RouteOptimization {
  id: string;
  name: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercent: number;
  currentTransitDays: number;
  optimizedTransitDays: number;
  recommendation: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AppState {
  theme: 'dark' | 'light';
  activePage: string;
  sidebarCollapsed: boolean;
  alerts: Alert[];
  selectedShipment: string | null;
  dateRange: '7d' | '30d' | '90d' | '1y';
}
