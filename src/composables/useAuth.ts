import { ref } from 'vue';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const currentUser = ref<User | null>(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Simulate loading user from localStorage on init
const init = () => {
  const storedAuth = localStorage.getItem('isAuthenticated');
  const storedUser = localStorage.getItem('user');
  
  if (storedAuth === 'true' && storedUser) {
    isAuthenticated.value = true;
    try {
      currentUser.value = JSON.parse(storedUser);
    } catch (e) {
      console.error('Failed to parse stored user');
    }
  }
};

// Initialize on import
init();

export function useAuth() {
  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // Mock successful login
      const user: User = {
        id: 1,
        name: email.split('@')[0],
        email,
        role: 'admin'
      };
      
      currentUser.value = user;
      isAuthenticated.value = true;
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Mock successful signup and auto-login
      const user: User = {
        id: 1,
        name,
        email,
        role: 'admin'
      };
      
      currentUser.value = user;
      isAuthenticated.value = true;
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Logout function
  const logout = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };
  
  // Get current user
  const getUser = () => currentUser.value;
  
  return {
    user: currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    getUser
  };
}