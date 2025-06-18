import { ref } from 'vue';

// Dashboard stats interface
interface DashboardStats {
  customers: number;
  trucks: number;
  activeShipments: number;
  revenue: number;
}

// Shipment interface
interface Shipment {
  id: number;
  customer: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  date: string;
}

// Mock data
const mockStats: DashboardStats = {
  customers: 156,
  trucks: 48,
  activeShipments: 23,
  revenue: 158400
};

const mockShipments: Shipment[] = [
  {
    id: 1001,
    customer: 'Acme Corp',
    origin: 'New York, NY',
    destination: 'Boston, MA',
    status: 'in-transit',
    date: '2025-02-15'
  },
  {
    id: 1002,
    customer: 'Widget Inc',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    status: 'delivered',
    date: '2025-02-14'
  },
  {
    id: 1003,
    customer: 'Global Logistics',
    origin: 'Miami, FL',
    destination: 'Atlanta, GA',
    status: 'pending',
    date: '2025-02-16'
  },
  {
    id: 1004,
    customer: 'Tech Systems',
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    status: 'in-transit',
    date: '2025-02-15'
  },
  {
    id: 1005,
    customer: 'Best Distributors',
    origin: 'San Francisco, CA',
    destination: 'Los Angeles, CA',
    status: 'delivered',
    date: '2025-02-13'
  },
  {
    id: 1006,
    customer: 'Quick Shipping',
    origin: 'Dallas, TX',
    destination: 'Houston, TX',
    status: 'cancelled',
    date: '2025-02-12'
  },
  {
    id: 1007,
    customer: 'Mega Industries',
    origin: 'Denver, CO',
    destination: 'Phoenix, AZ',
    status: 'in-transit',
    date: '2025-02-15'
  }
];

export function useDashboard() {
  const stats = ref<DashboardStats>({
    customers: 0,
    trucks: 0,
    activeShipments: 0,
    revenue: 0
  });
  
  const recentShipments = ref<Shipment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock data
      stats.value = { ...mockStats };
      recentShipments.value = [...mockShipments];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard data';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };
  
  return {
    stats,
    recentShipments,
    loading,
    error,
    fetchDashboardData
  };
}