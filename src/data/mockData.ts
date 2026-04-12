import type { Shipment, InventoryItem, Carrier, KPI, Alert, SupplyChainNode, RouteOptimization } from '../types';

export const shipments: Shipment[] = [
  {
    id: 'SHP001',
    trackingNumber: 'TRK-2024-88421',
    origin: { city: 'Shanghai', country: 'CN', lat: 31.2304, lng: 121.4737 },
    destination: { city: 'Los Angeles', country: 'US', lat: 34.0522, lng: -118.2437 },
    status: 'in_transit',
    carrier: 'Maersk',
    eta: '2026-04-18',
    weight: 2400,
    value: 185000,
    category: 'Electronics',
    priority: 'high',
    progress: 68,
    currentLocation: { city: 'Pacific Ocean', lat: 32.5, lng: -158.0 },
    customer: 'TechCorp Inc.',
    poNumber: 'PO-78234',
    events: [
      { timestamp: '2026-04-01T08:00:00Z', location: 'Shanghai, CN', status: 'departed', description: 'Shipment departed origin port' },
      { timestamp: '2026-04-03T14:30:00Z', location: 'Shanghai, CN', status: 'customs_cleared', description: 'Export customs cleared' },
      { timestamp: '2026-04-07T09:15:00Z', location: 'Pacific Ocean', status: 'in_transit', description: 'Vessel at sea - on schedule' },
      { timestamp: '2026-04-12T06:00:00Z', location: 'Pacific Ocean', status: 'in_transit', description: 'Mid-Pacific checkpoint passed' },
    ]
  },
  {
    id: 'SHP002',
    trackingNumber: 'TRK-2024-88422',
    origin: { city: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821 },
    destination: { city: 'New York', country: 'US', lat: 40.7128, lng: -74.0060 },
    status: 'delayed',
    carrier: 'DHL Express',
    eta: '2026-04-15',
    weight: 340,
    value: 52000,
    category: 'Automotive Parts',
    priority: 'critical',
    progress: 45,
    currentLocation: { city: 'London Heathrow', lat: 51.4775, lng: -0.4614 },
    customer: 'AutoGroup Ltd.',
    poNumber: 'PO-78235',
    events: [
      { timestamp: '2026-04-08T10:00:00Z', location: 'Frankfurt, DE', status: 'picked_up', description: 'Package picked up from sender' },
      { timestamp: '2026-04-09T03:00:00Z', location: 'Frankfurt Hub, DE', status: 'processed', description: 'Processed at hub facility' },
      { timestamp: '2026-04-10T07:30:00Z', location: 'London Heathrow, UK', status: 'delayed', description: 'Weather delay - flight cancelled' },
      { timestamp: '2026-04-11T09:00:00Z', location: 'London Heathrow, UK', status: 'delayed', description: 'Awaiting next available flight' },
    ]
  },
  {
    id: 'SHP003',
    trackingNumber: 'TRK-2024-88423',
    origin: { city: 'Mumbai', country: 'IN', lat: 19.0760, lng: 72.8777 },
    destination: { city: 'Dubai', country: 'AE', lat: 25.2048, lng: 55.2708 },
    status: 'out_for_delivery',
    carrier: 'FedEx',
    eta: '2026-04-12',
    weight: 890,
    value: 34000,
    category: 'Textiles',
    priority: 'medium',
    progress: 92,
    currentLocation: { city: 'Dubai', lat: 25.2048, lng: 55.2708 },
    customer: 'Fashion House ME',
    poNumber: 'PO-78236',
    events: [
      { timestamp: '2026-04-09T08:00:00Z', location: 'Mumbai, IN', status: 'departed', description: 'Air freight departed Mumbai' },
      { timestamp: '2026-04-10T14:00:00Z', location: 'Dubai, AE', status: 'arrived', description: 'Arrived at Dubai hub' },
      { timestamp: '2026-04-11T06:00:00Z', location: 'Dubai, AE', status: 'customs_cleared', description: 'Import customs cleared' },
      { timestamp: '2026-04-12T07:30:00Z', location: 'Dubai, AE', status: 'out_for_delivery', description: 'Out for delivery' },
    ]
  },
  {
    id: 'SHP004',
    trackingNumber: 'TRK-2024-88424',
    origin: { city: 'Chicago', country: 'US', lat: 41.8781, lng: -87.6298 },
    destination: { city: 'Toronto', country: 'CA', lat: 43.6532, lng: -79.3832 },
    status: 'delivered',
    carrier: 'UPS',
    eta: '2026-04-10',
    actualArrival: '2026-04-10',
    weight: 125,
    value: 8500,
    category: 'Medical Supplies',
    priority: 'high',
    progress: 100,
    currentLocation: { city: 'Toronto', lat: 43.6532, lng: -79.3832 },
    customer: 'HealthCare Plus',
    poNumber: 'PO-78237',
    events: [
      { timestamp: '2026-04-08T11:00:00Z', location: 'Chicago, US', status: 'picked_up', description: 'Shipment collected' },
      { timestamp: '2026-04-09T04:00:00Z', location: 'Detroit, US', status: 'in_transit', description: 'In transit - on schedule' },
      { timestamp: '2026-04-10T09:30:00Z', location: 'Toronto, CA', status: 'delivered', description: 'Delivered - signed by J. Smith' },
    ]
  },
  {
    id: 'SHP005',
    trackingNumber: 'TRK-2024-88425',
    origin: { city: 'Rotterdam', country: 'NL', lat: 51.9244, lng: 4.4777 },
    destination: { city: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198 },
    status: 'in_transit',
    carrier: 'MSC',
    eta: '2026-04-28',
    weight: 18000,
    value: 420000,
    category: 'Industrial Equipment',
    priority: 'medium',
    progress: 28,
    currentLocation: { city: 'Suez Canal', lat: 30.5234, lng: 32.3484 },
    customer: 'Pacific Industrial',
    poNumber: 'PO-78238',
    events: [
      { timestamp: '2026-04-04T06:00:00Z', location: 'Rotterdam, NL', status: 'departed', description: 'Vessel departed Rotterdam' },
      { timestamp: '2026-04-07T12:00:00Z', location: 'Mediterranean Sea', status: 'in_transit', description: 'Passing through Mediterranean' },
      { timestamp: '2026-04-11T18:00:00Z', location: 'Suez Canal', status: 'in_transit', description: 'Transiting Suez Canal' },
    ]
  },
  {
    id: 'SHP006',
    trackingNumber: 'TRK-2024-88426',
    origin: { city: 'Seoul', country: 'KR', lat: 37.5665, lng: 126.9780 },
    destination: { city: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093 },
    status: 'pending',
    carrier: 'Korean Air Cargo',
    eta: '2026-04-14',
    weight: 560,
    value: 95000,
    category: 'Semiconductors',
    priority: 'critical',
    progress: 5,
    currentLocation: { city: 'Seoul', lat: 37.5665, lng: 126.9780 },
    customer: 'Tech Solutions AU',
    poNumber: 'PO-78239',
    events: [
      { timestamp: '2026-04-12T05:00:00Z', location: 'Seoul, KR', status: 'pending', description: 'Awaiting pickup - export docs in review' },
    ]
  },
];

export const inventoryItems: InventoryItem[] = [
  {
    id: 'INV001', sku: 'ELEC-MB-001', name: 'Motherboard X570', category: 'Electronics',
    warehouse: 'LA-WH01', quantity: 145, minStock: 50, maxStock: 500, reorderPoint: 100,
    unitCost: 320, totalValue: 46400, turnoverRate: 4.2, daysOfStock: 32,
    trend: 'down', forecast7d: 128, forecast30d: 85, supplier: 'TechSource Asia',
    lastRestocked: '2026-03-28'
  },
  {
    id: 'INV002', sku: 'AUTO-BRK-042', name: 'Brake Assembly Kit', category: 'Automotive',
    warehouse: 'CHI-WH02', quantity: 38, minStock: 80, maxStock: 400, reorderPoint: 100,
    unitCost: 145, totalValue: 5510, turnoverRate: 8.1, daysOfStock: 7,
    trend: 'down', forecast7d: 22, forecast30d: 0, supplier: 'AutoParts DE',
    lastRestocked: '2026-04-01'
  },
  {
    id: 'INV003', sku: 'MED-SYRG-100', name: 'Syringes 10ml (Box/100)', category: 'Medical',
    warehouse: 'NYC-WH01', quantity: 2840, minStock: 500, maxStock: 5000, reorderPoint: 800,
    unitCost: 28, totalValue: 79520, turnoverRate: 6.4, daysOfStock: 65,
    trend: 'stable', forecast7d: 2760, forecast30d: 2500, supplier: 'MedSupply Corp',
    lastRestocked: '2026-04-05'
  },
  {
    id: 'INV004', sku: 'TEXT-COT-220', name: 'Cotton Fabric (meters)', category: 'Textiles',
    warehouse: 'MUM-WH01', quantity: 12500, minStock: 2000, maxStock: 30000, reorderPoint: 4000,
    unitCost: 4.5, totalValue: 56250, turnoverRate: 11.2, daysOfStock: 45,
    trend: 'up', forecast7d: 12800, forecast30d: 14200, supplier: 'Fabric Masters IN',
    lastRestocked: '2026-04-08'
  },
  {
    id: 'INV005', sku: 'CHEM-SOL-005', name: 'Industrial Solvent A', category: 'Chemicals',
    warehouse: 'HOU-WH03', quantity: 320, minStock: 100, maxStock: 1000, reorderPoint: 200,
    unitCost: 85, totalValue: 27200, turnoverRate: 3.8, daysOfStock: 28,
    trend: 'stable', forecast7d: 305, forecast30d: 280, supplier: 'ChemCo USA',
    lastRestocked: '2026-03-20'
  },
  {
    id: 'INV006', sku: 'FOOD-GRN-001', name: 'Premium Grain (tonnes)', category: 'Food',
    warehouse: 'CHI-WH01', quantity: 850, minStock: 200, maxStock: 2000, reorderPoint: 400,
    unitCost: 420, totalValue: 357000, turnoverRate: 9.6, daysOfStock: 22,
    trend: 'down', forecast7d: 780, forecast30d: 600, supplier: 'AgriWorld',
    lastRestocked: '2026-04-03'
  },
  {
    id: 'INV007', sku: 'ELEC-GPU-009', name: 'GPU RTX 4090', category: 'Electronics',
    warehouse: 'LA-WH01', quantity: 24, minStock: 30, maxStock: 200, reorderPoint: 50,
    unitCost: 1850, totalValue: 44400, turnoverRate: 15.2, daysOfStock: 4,
    trend: 'down', forecast7d: 10, forecast30d: 0, supplier: 'NvidiaDistrib',
    lastRestocked: '2026-04-06'
  },
];

export const carriers: Carrier[] = [
  {
    id: 'CAR001', name: 'Maersk', logo: 'M',
    onTimeRate: 94.2, avgTransitDays: 18.5, costPerKg: 0.45,
    totalShipments: 1240, activeShipments: 87, incidents: 12, rating: 4.6,
    coverage: ['Asia', 'Europe', 'Americas'], modes: ['sea'], trend: 2.1
  },
  {
    id: 'CAR002', name: 'DHL Express', logo: 'D',
    onTimeRate: 97.8, avgTransitDays: 2.3, costPerKg: 8.20,
    totalShipments: 3420, activeShipments: 234, incidents: 8, rating: 4.8,
    coverage: ['Global'], modes: ['air', 'road'], trend: 1.4
  },
  {
    id: 'CAR003', name: 'FedEx', logo: 'F',
    onTimeRate: 96.1, avgTransitDays: 3.1, costPerKg: 7.80,
    totalShipments: 2890, activeShipments: 198, incidents: 15, rating: 4.7,
    coverage: ['Global'], modes: ['air', 'road'], trend: -0.8
  },
  {
    id: 'CAR004', name: 'UPS', logo: 'U',
    onTimeRate: 95.4, avgTransitDays: 3.4, costPerKg: 7.20,
    totalShipments: 2560, activeShipments: 167, incidents: 18, rating: 4.5,
    coverage: ['Americas', 'Europe'], modes: ['air', 'road'], trend: 0.5
  },
  {
    id: 'CAR005', name: 'MSC', logo: 'S',
    onTimeRate: 88.6, avgTransitDays: 22.1, costPerKg: 0.32,
    totalShipments: 890, activeShipments: 56, incidents: 24, rating: 4.1,
    coverage: ['Global'], modes: ['sea'], trend: -2.4
  },
  {
    id: 'CAR006', name: 'Korean Air Cargo', logo: 'K',
    onTimeRate: 92.3, avgTransitDays: 4.2, costPerKg: 6.90,
    totalShipments: 645, activeShipments: 42, incidents: 7, rating: 4.4,
    coverage: ['Asia', 'Americas'], modes: ['air'], trend: 3.2
  },
];

export const kpis: KPI[] = [
  {
    id: 'kpi1', label: 'Active Shipments', value: 842, unit: '',
    change: 12.4, changeLabel: 'vs last month', trend: 'up', positive: true,
    sparkline: [680, 710, 695, 740, 760, 790, 820, 842],
    icon: 'Package', color: 'blue'
  },
  {
    id: 'kpi2', label: 'On-Time Delivery', value: 94.8, unit: '%',
    change: 2.1, changeLabel: 'vs last month', trend: 'up', positive: true,
    sparkline: [88, 90, 91, 92, 93, 93.5, 94.2, 94.8],
    icon: 'CheckCircle', color: 'emerald'
  },
  {
    id: 'kpi3', label: 'Freight Cost', value: '$2.4M', unit: '',
    change: -3.2, changeLabel: 'vs last month', trend: 'down', positive: true,
    sparkline: [2.8, 2.75, 2.7, 2.65, 2.6, 2.55, 2.45, 2.4],
    icon: 'DollarSign', color: 'amber'
  },
  {
    id: 'kpi4', label: 'Delayed Shipments', value: 43, unit: '',
    change: -18.5, changeLabel: 'vs last month', trend: 'down', positive: true,
    sparkline: [72, 68, 65, 60, 58, 52, 47, 43],
    icon: 'AlertTriangle', color: 'rose'
  },
  {
    id: 'kpi5', label: 'Inventory Turnover', value: 7.4, unit: 'x',
    change: 0.8, changeLabel: 'vs last month', trend: 'up', positive: true,
    sparkline: [6.1, 6.3, 6.5, 6.7, 6.9, 7.0, 7.2, 7.4],
    icon: 'RefreshCw', color: 'violet'
  },
  {
    id: 'kpi6', label: 'Warehouse Utilization', value: 78.3, unit: '%',
    change: 4.1, changeLabel: 'vs last month', trend: 'up', positive: false,
    sparkline: [68, 70, 71, 73, 74, 76, 77, 78.3],
    icon: 'Warehouse', color: 'cyan'
  },
];

export const alerts: Alert[] = [
  {
    id: 'ALT001', type: 'delay', title: 'Critical Delay Alert',
    message: 'Shipment TRK-2024-88422 delayed 36h at London Heathrow due to weather conditions.',
    severity: 'error', timestamp: '2026-04-12T09:15:00Z', read: false, actionable: true, relatedId: 'SHP002'
  },
  {
    id: 'ALT002', type: 'low_stock', title: 'Low Stock Warning',
    message: 'GPU RTX 4090 (ELEC-GPU-009) at 4 days of stock. Reorder point breach imminent.',
    severity: 'error', timestamp: '2026-04-12T08:30:00Z', read: false, actionable: true, relatedId: 'INV007'
  },
  {
    id: 'ALT003', type: 'low_stock', title: 'Critical Stock Level',
    message: 'Brake Assembly Kit (AUTO-BRK-042) below minimum stock threshold. 7 days remaining.',
    severity: 'warning', timestamp: '2026-04-12T07:45:00Z', read: false, actionable: true, relatedId: 'INV002'
  },
  {
    id: 'ALT004', type: 'customs', title: 'Customs Documentation Required',
    message: 'Shipment TRK-2024-88426 export documents pending review. Departure at risk.',
    severity: 'warning', timestamp: '2026-04-12T06:00:00Z', read: false, actionable: true, relatedId: 'SHP006'
  },
  {
    id: 'ALT005', type: 'cost_spike', title: 'Freight Cost Spike Detected',
    message: 'Shanghai-LA sea freight rates up 22% this week. AI recommends pre-booking next quarter.',
    severity: 'info', timestamp: '2026-04-11T14:00:00Z', read: true, actionable: true
  },
  {
    id: 'ALT006', type: 'weather', title: 'Weather Advisory',
    message: 'Typhoon Mia forming near Philippines. 3 active shipments may be rerouted.',
    severity: 'warning', timestamp: '2026-04-11T10:30:00Z', read: true, actionable: false
  },
];

export const supplyChainNodes: SupplyChainNode[] = [
  { id: 'N001', name: 'Shanghai Supplier Hub', type: 'supplier', lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'CN', capacity: 5000, utilization: 82, status: 'operational', throughput: 4100 },
  { id: 'N002', name: 'Shenzhen Electronics', type: 'supplier', lat: 22.5431, lng: 114.0579, city: 'Shenzhen', country: 'CN', capacity: 3000, utilization: 91, status: 'warning', throughput: 2730 },
  { id: 'N003', name: 'Rotterdam Distribution', type: 'distribution_center', lat: 51.9244, lng: 4.4777, city: 'Rotterdam', country: 'NL', capacity: 8000, utilization: 67, status: 'operational', throughput: 5360 },
  { id: 'N004', name: 'LA Port Warehouse', type: 'warehouse', lat: 33.7392, lng: -118.2618, city: 'Los Angeles', country: 'US', capacity: 12000, utilization: 78, status: 'operational', throughput: 9360 },
  { id: 'N005', name: 'Chicago Hub', type: 'distribution_center', lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'US', capacity: 10000, utilization: 55, status: 'operational', throughput: 5500 },
  { id: 'N006', name: 'Frankfurt Air Hub', type: 'port', lat: 50.0379, lng: 8.5622, city: 'Frankfurt', country: 'DE', capacity: 6000, utilization: 72, status: 'operational', throughput: 4320 },
  { id: 'N007', name: 'Dubai Logistics Park', type: 'distribution_center', lat: 25.1972, lng: 55.2744, city: 'Dubai', country: 'AE', capacity: 7500, utilization: 88, status: 'warning', throughput: 6600 },
  { id: 'N008', name: 'Singapore Port', type: 'port', lat: 1.2644, lng: 103.8222, city: 'Singapore', country: 'SG', capacity: 15000, utilization: 71, status: 'operational', throughput: 10650 },
  { id: 'N009', name: 'Mumbai Gateway', type: 'port', lat: 18.9543, lng: 72.8456, city: 'Mumbai', country: 'IN', capacity: 5500, utilization: 84, status: 'operational', throughput: 4620 },
  { id: 'N010', name: 'New York DC', type: 'distribution_center', lat: 40.6501, lng: -73.9496, city: 'New York', country: 'US', capacity: 9000, utilization: 63, status: 'operational', throughput: 5670 },
];

export const routeOptimizations: RouteOptimization[] = [
  {
    id: 'RO001', name: 'Shanghai → LA (Sea)',
    currentCost: 185000, optimizedCost: 158000, savings: 27000, savingsPercent: 14.6,
    currentTransitDays: 22, optimizedTransitDays: 19,
    recommendation: 'Switch to direct vessel route via Panama Canal instead of transhipment via Busan. Combine with 2 pending POs to fill container.',
    confidence: 91
  },
  {
    id: 'RO002', name: 'Frankfurt → New York (Air)',
    currentCost: 52000, optimizedCost: 38500, savings: 13500, savingsPercent: 26.0,
    currentTransitDays: 3, optimizedTransitDays: 4,
    recommendation: 'Switch to priority sea freight. Non-critical parts can tolerate +1 day transit. Book 30 days ahead for 26% cost reduction.',
    confidence: 87
  },
  {
    id: 'RO003', name: 'Rotterdam → Singapore (Sea)',
    currentCost: 420000, optimizedCost: 368000, savings: 52000, savingsPercent: 12.4,
    currentTransitDays: 24, optimizedTransitDays: 22,
    recommendation: 'Reroute via Cape of Good Hope to avoid Suez surcharges. Bundle with 3 other shipments for volume discount.',
    confidence: 78
  },
];

export const monthlyShipmentData = [
  { month: 'Jan', shipments: 680, onTime: 625, delayed: 55, cost: 2.8 },
  { month: 'Feb', shipments: 720, onTime: 668, delayed: 52, cost: 2.75 },
  { month: 'Mar', shipments: 695, onTime: 641, delayed: 54, cost: 2.70 },
  { month: 'Apr (so far)', shipments: 842, onTime: 799, delayed: 43, cost: 2.40 },
];

export const weeklyVolumeData = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  volume: Math.floor(150 + Math.random() * 80 + i * 8),
  cost: parseFloat((1.8 + Math.random() * 0.8 + i * 0.02).toFixed(2)),
  efficiency: parseFloat((88 + Math.random() * 8 + i * 0.3).toFixed(1)),
}));

export const costBreakdownData = [
  { name: 'Sea Freight', value: 38, color: '#3b82f6' },
  { name: 'Air Freight', value: 31, color: '#06b6d4' },
  { name: 'Ground', value: 18, color: '#10b981' },
  { name: 'Warehousing', value: 8, color: '#8b5cf6' },
  { name: 'Customs & Duties', value: 5, color: '#f59e0b' },
];

export const demandForecastData = Array.from({ length: 30 }, (_, i) => ({
  day: `Apr ${i + 1}`,
  actual: i < 12 ? Math.floor(85 + Math.random() * 30) : null,
  forecast: Math.floor(90 + Math.sin(i * 0.4) * 20 + i * 0.5),
  lower: Math.floor(75 + Math.sin(i * 0.4) * 15 + i * 0.4),
  upper: Math.floor(105 + Math.sin(i * 0.4) * 25 + i * 0.6),
}));
