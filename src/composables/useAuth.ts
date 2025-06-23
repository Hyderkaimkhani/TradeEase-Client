import { ref, computed, onMounted } from 'vue';
import { apiService } from '../api/ApiService';
import type { LoginRequest, ApiResponse, LoginResponse } from '../Interfaces/api.interface';

export interface User {
  id: string;
  userName: string;
  email: string;
  role?: string;
  // Add more user properties as they become available from the API
}

// Global reactive state
const currentUser = ref<User | null>(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const accessToken = ref<string | null>(null);
const refreshToken = ref<string | null>(null);
const tokenExpiry = ref<number | null>(null);

// Initialize authentication state from sessionStorage
const initializeAuth = () => {
  const storedAuth = sessionStorage.getItem('isAuthenticated');
  const storedToken = sessionStorage.getItem('accessToken');
  const storedRefreshToken = sessionStorage.getItem('refreshToken');
  const storedExpiry = sessionStorage.getItem('accessTokenExpiry');
  const storedExpiryTime = sessionStorage.getItem('tokenExpiryTime');
  
  if (storedAuth === 'true' && storedToken) {
    isAuthenticated.value = true;
    accessToken.value = storedToken;
    refreshToken.value = storedRefreshToken;
    tokenExpiry.value = storedExpiry ? parseInt(storedExpiry) : null;
    
    // Check if token is expired
    if (storedExpiryTime && Date.now() > parseInt(storedExpiryTime)) {
      // Token expired, clear session
      isAuthenticated.value = false;
      currentUser.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      tokenExpiry.value = null;
      sessionStorage.clear();
    } else {
      // TODO: In the future, decode JWT token to get user info
      // For now, create a basic user object
      currentUser.value = {
        id: '1', // Will be extracted from JWT in the future
        userName: 'user', // Will be extracted from JWT in the future
        email: 'user@example.com', // Will be extracted from JWT in the future
      };
    }
  }
};

export function useAuth() {
  // Computed properties
  const isTokenExpired = computed(() => {
    const expiryTime = sessionStorage.getItem('tokenExpiryTime');
    return expiryTime ? Date.now() > parseInt(expiryTime) : true;
  });

  const timeUntilExpiry = computed(() => {
    const expiryTime = sessionStorage.getItem('tokenExpiryTime');
    if (!expiryTime) return 0;
    return Math.max(0, parseInt(expiryTime) - Date.now());
  });

  // Login function
  const login = async (userName: string, password: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const credentials: LoginRequest = { userName, password };
      const response: ApiResponse<LoginResponse> = await apiService.login(credentials);
      
      if (response.isError || !response.model) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Update reactive state
      isAuthenticated.value = true;
      accessToken.value = response.model.accessToken;
      refreshToken.value = response.model.refreshToken;
      tokenExpiry.value = response.model.accessTokenExpiry;
      
      // TODO: Decode JWT token to extract user information
      // For now, create a basic user object with the userName
      currentUser.value = {
        id: '1', // Will be extracted from JWT
        userName,
        email: `${userName}@example.com`, // Will be extracted from JWT
      };
      
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      isAuthenticated.value = false;
      currentUser.value = null;
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
      // TODO: Implement actual signup API call when signup endpoint is available
      // For now, simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Mock successful signup - in the future this will be a real API call
      // const signupData = { name, email, password };
      // const response = await apiService.post('/api/Users/Register', signupData);
      
      // For now, just show success message
      // When real API is implemented, this will auto-login the user like the login function
      
    } catch (err: any) {
      error.value = err.message || 'Signup failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Logout function
  const logout = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    accessToken.value = null;
    refreshToken.value = null;
    tokenExpiry.value = null;
    error.value = null;
    
    // Clear sessionStorage
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessTokenExpiry');
    sessionStorage.removeItem('tokenExpiryTime');
  };

  // Check authentication status
  const checkAuth = (): boolean => {
    if (!isAuthenticated.value || isTokenExpired.value) {
      logout();
      return false;
    }
    return true;
  };

  // Refresh token (placeholder for future implementation)
  const refreshAuthToken = async (): Promise<boolean> => {
    // TODO: Implement token refresh logic when refresh endpoint is available
    try {
      // This would call the refresh token API endpoint
      console.log('Token refresh not yet implemented');
      return false;
    } catch (error) {
      logout();
      return false;
    }
  };

  // Get current user info
  const getUser = () => currentUser.value;

  // Get token for manual API calls
  const getToken = () => accessToken.value;

  // Check if user has specific role (placeholder)
  const hasRole = (role: string): boolean => {
    return currentUser.value?.role === role;
  };

  // Auto-logout before token expires (5 minutes before)
  const setupAutoLogout = () => {
    const expiryTime = sessionStorage.getItem('tokenExpiryTime');
    if (expiryTime) {
      const timeUntilExpiry = parseInt(expiryTime) - Date.now();
      const logoutTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000); // 5 minutes before expiry
      
      if (logoutTime > 0) {
        setTimeout(() => {
          logout();
          // Redirect to login or show session expired message
          window.location.href = '/login';
        }, logoutTime);
      }
    }
  };

  // Initialize on composable creation
  onMounted(() => {
    initializeAuth();
    setupAutoLogout();
  });

      return {
      // State
      user: currentUser,
      isAuthenticated,
      isLoading,
      error,
      accessToken,
      refreshToken,
      tokenExpiry,
      
      // Computed
      isTokenExpired,
      timeUntilExpiry,
      
      // Methods
      login,
      signup,
      logout,
      checkAuth,
      refreshAuthToken,
      getUser,
      getToken,
      hasRole,
      setupAutoLogout
    };
}

// Initialize auth state when module is imported
initializeAuth();