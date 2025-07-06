import { ref } from 'vue';
import { apiService } from '../api/ApiService';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '../Interfaces/order.interface';

export function useOrders() {
    const orders = ref<Order[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    
    const fetchOrders = async (page: number = 1, pageSize: number = 10, fruitId?: number, customerId?: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            let url = `/api/Orders?page=${page}&pageSize=${pageSize}`;
            if (fruitId) url += `&fruitId=${fruitId}`;
            if (customerId) url += `&customerId=${customerId}`;
            
            const response = await apiService.get<Order[]>(url);
            
            if (response.isError) {
                error.value = response.message;
                return;
            }
            
            orders.value = response.model || [];
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch orders';
            console.error(error.value);
        } finally {
            loading.value = false;
        }
    };
    
    const addOrder = async (data: CreateOrderRequest) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.post<Order>('/api/Orders', data);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            if (response.model) {
                orders.value.push(response.model);
            }
            
            return response.model;
        } catch (err: any) {
            error.value = err.message || 'Failed to add order';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    const updateOrder = async (id: number, data: UpdateOrderRequest) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.post<Order>('/api/Orders/Update', data);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            if (response.model) {
                const index = orders.value.findIndex(o => o.id === id);
                if (index !== -1) {
                    orders.value[index] = response.model;
                }
            }
            
            return response.model;
        } catch (err: any) {
            error.value = err.message || 'Failed to update order';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    const deleteOrder = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.delete<void>(`/api/Orders/${id}`);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            orders.value = orders.value.filter(o => o.id !== id);
        } catch (err: any) {
            error.value = err.message || 'Failed to delete order';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    const getOrderById = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.get<Order>(`/api/Orders/${id}`);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            return response.model;
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch order';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    return {
        orders,
        loading,
        error,
        fetchOrders,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById
    };
} 