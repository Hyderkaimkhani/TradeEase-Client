import { ref } from 'vue';

// Profile interface
export interface Profile {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  address: string;
  notifications: boolean;
}

// Mock data
const mockProfile: Profile = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  position: 'Logistics Manager',
  company: 'Fast Shipping Inc.',
  address: '123 Main St, Springfield, IL',
  notifications: true
};

export function useProfile() {
  const profile = ref<Profile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Fetch profile
  const fetchProfile = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use mock data for now
      profile.value = { ...mockProfile };
      
      // Try to get from localStorage (for persistence)
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        try {
          profile.value = JSON.parse(storedProfile);
        } catch (e) {
          console.error('Failed to parse stored profile');
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch profile';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };
  
  // Save profile
  const saveProfile = async (data: Partial<Profile>) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile
      if (profile.value) {
        profile.value = { ...profile.value, ...data };
        
        // Save to localStorage for persistence
        localStorage.setItem('profile', JSON.stringify(profile.value));
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save profile';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    profile,
    loading,
    error,
    fetchProfile,
    saveProfile
  };
}