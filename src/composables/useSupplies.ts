import { ref } from 'vue';
import { apiService } from '../api/ApiService';
import { Supply, CreateSupplyRequest, UpdateSupplyRequest } from '../Interfaces/supply.interface';

export function useSupplies() {
    const supplies = ref<Supply[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    
    const fetchSupplies = async (page: number = 1, pageSize: number = 10, fruitId?: number, supplierId?: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            let url = `/api/Supplies?page=${page}&pageSize=${pageSize}`;
            if (fruitId) url += `&fruitId=${fruitId}`;
            if (supplierId) url += `&supplierId=${supplierId}`;
            
            const response = await apiService.get<Supply[]>(url);
            
            if (response.isError) {
                error.value = response.message;
                return 0;
            }
            
            supplies.value = response.model || [];
            return response.totalCount || 0;
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch supplies';
            console.error(error.value);
            return 0;
        } finally {
            loading.value = false;
        }
    };
    
    const addSupply = async (data: CreateSupplyRequest) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.post<Supply>('/api/Supplies', data);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            if (response.model) {
                supplies.value.push(response.model);
            }
            
            return response.model;
        } catch (err: any) {
            error.value = err.message || 'Failed to add supply';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    const updateSupply = async (id: number, data: UpdateSupplyRequest) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.post<Supply>('/api/Supplies/Update', data);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            if (response.model) {
                const index = supplies.value.findIndex(s => s.id === id);
                if (index !== -1) {
                    supplies.value[index] = response.model;
                }
            }
            
            return response.model;
        } catch (err: any) {
            error.value = err.message || 'Failed to update supply';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    const deleteSupply = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.delete<void>(`/api/Supplies/${id}`);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            supplies.value = supplies.value.filter(s => s.id !== id);
        } catch (err: any) {
            error.value = err.message || 'Failed to delete supply';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    return {
        supplies,
        loading,
        error,
        fetchSupplies,
        addSupply,
        updateSupply,
        deleteSupply
    };
} 