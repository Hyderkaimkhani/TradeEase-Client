import { ref } from 'vue';

// Truck interface
export interface Truck {
  id: number;
  truckNumber: string;
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  fuelType: string;
  mileage: number;
  availability: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
  lastMaintenance: string;
}

// Mock data
const mockTrucks: Truck[] = [
  {
    id: 1,
    truckNumber: 'TRK-1001',
    type: 'semi',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    capacity: 25,
    fuelType: 'diesel',
    mileage: 25000,
    availability: 'available',
    lastMaintenance: '2025-01-15'
  },
  {
    id: 2,
    truckNumber: 'TRK-1002',
    type: 'box',
    make: 'Ford',
    model: 'F-650',
    year: 2021,
    capacity: 10,
    fuelType: 'diesel',
    mileage: 45000,
    availability: 'in-use',
    lastMaintenance: '2025-01-10'
  },
  {
    id: 3,
    truckNumber: 'TRK-1003',
    type: 'refrigerated',
    make: 'International',
    model: 'MV Series',
    year: 2023,
    capacity: 15,
    fuelType: 'diesel',
    mileage: 12000,
    availability: 'available',
    lastMaintenance: '2025-02-01'
  },
  {
    id: 4,
    truckNumber: 'TRK-1004',
    type: 'flatbed',
    make: 'Kenworth',
    model: 'T680',
    year: 2020,
    capacity: 20,
    fuelType: 'diesel',
    mileage: 75000,
    availability: 'maintenance',
    lastMaintenance: '2025-02-10'
  },
  {
    id: 5,
    truckNumber: 'TRK-1005',
    type: 'tanker',
    make: 'Peterbilt',
    model: '579',
    year: 2022,
    capacity: 30,
    fuelType: 'diesel',
    mileage: 35000,
    availability: 'available',
    lastMaintenance: '2025-01-25'
  }
];

export function useTrucks() {
  const trucks = ref<Truck[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Fetch trucks
  const fetchTrucks = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Load from localStorage or use mock data
      const storedTrucks = localStorage.getItem('trucks');
      if (storedTrucks) {
        try {
          trucks.value = JSON.parse(storedTrucks);
        } catch (e) {
          console.error('Failed to parse stored trucks');
          trucks.value = [...mockTrucks];
        }
      } else {
        trucks.value = [...mockTrucks];
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch trucks';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };
  
  // Save trucks to localStorage
  const saveTrucksToStorage = () => {
    localStorage.setItem('trucks', JSON.stringify(trucks.value));
  };
  
  // Add truck
  const addTruck = async (data: Omit<Truck, 'id'>) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a new ID
      const newId = trucks.value.length > 0 
        ? Math.max(...trucks.value.map(t => t.id)) + 1 
        : 1;
      
      // Create new truck
      const newTruck: Truck = {
        id: newId,
        ...data as any
      };
      
      // Add to list
      trucks.value.push(newTruck);
      
      // Save to localStorage
      saveTrucksToStorage();
      
      return newTruck;
    } catch (err: any) {
      error.value = err.message || 'Failed to add truck';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // Update truck
  const updateTruck = async (id: number, data: Partial<Truck>) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find truck index
      const index = trucks.value.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error('Truck not found');
      }
      
      // Update truck
      trucks.value[index] = { ...trucks.value[index], ...data };
      
      // Save to localStorage
      saveTrucksToStorage();
      
      return trucks.value[index];
    } catch (err: any) {
      error.value = err.message || 'Failed to update truck';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // Delete truck
  const deleteTruck = async (id: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter out the deleted truck
      trucks.value = trucks.value.filter(t => t.id !== id);
      
      // Save to localStorage
      saveTrucksToStorage();
    } catch (err: any) {
      error.value = err.message || 'Failed to delete truck';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    trucks,
    loading,
    error,
    fetchTrucks,
    addTruck,
    updateTruck,
    deleteTruck
  };
}