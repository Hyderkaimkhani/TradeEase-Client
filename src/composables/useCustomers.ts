// src/composables/useCustomers.ts
import { ref } from 'vue';
import { apiService } from '../api/ApiService';
import { Customer } from '../Interfaces/customer.interface';
import { EntityType } from '../Constants/Enums';

export function useCustomers() {
    const customers = ref<Customer[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const entityList = ref()        //<{ label: string; value: number }[]>([])

    const fetchCustomers = async () => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.get<Customer[]>('/api/Customer');
            
            if (response.isError) {
                error.value = response.message;
                return;
            }
            
            customers.value = response.model || [];
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch customers';
            console.error(error.value);
        } finally {
            loading.value = false;
        }
    };
    
    const getCustomerSuppliersList = async (entityType: EntityType) => {
      loading.value = true;
      error.value = null;

      try {
        const url = `/api/${entityType}/dropdown`;
        const response = await apiService.get<
          { label: string; value: number }[]
        >(url);

        if (response.isError) {
          error.value = response.message;
          return;
        }

        entityList.value = response || [];
        console.log('Entity List:', entityList.value);
      } catch (err: any) {
        error.value = err.message || "Failed to fetch data";
        console.error(error.value);
      } finally {
        loading.value = false;
      }
    };

    const addCustomer = async (data: Omit<Customer, 'id'>) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.post<Customer>('/api/Customer', data);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            if (response.model) {
                customers.value.push(response.model);
            }
            
            return response.model;
        } catch (err: any) {
            error.value = err.message || 'Failed to add customer';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    const updateCustomer = async (id: number, data: Partial<Customer>) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.post<Customer>(`/api/Customer/Update`, data);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            if (response.model) {
                const index = customers.value.findIndex(c => c.id === id);
                if (index !== -1) {
                    customers.value[index] = response.model;
                }
            }
            
            return response.model;
        } catch (err: any) {
            error.value = err.message || 'Failed to update customer';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    const deleteCustomer = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await apiService.delete<void>(`/api/Customer/${id}`);
            
            if (response.isError) {
                error.value = response.message;
                throw new Error(response.message);
            }
            
            customers.value = customers.value.filter(c => c.id !== id);
        } catch (err: any) {
            error.value = err.message || 'Failed to delete customer';
            console.error(error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    
    
    return {
        customers,
        loading,
        error,
        entityList,
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerSuppliersList
    };
}