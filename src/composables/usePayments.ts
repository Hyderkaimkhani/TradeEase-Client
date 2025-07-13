import { ref } from 'vue';
import { apiService } from '../api/ApiService';
import { Payment, CreatePaymentRequest, UpdatePaymentRequest } from '../Interfaces/payment.interface';

export function usePayments() {
  const payments = ref<Payment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);

  const fetchPayments = async (page: number = 1, pageSize: number = 10, entityId?: number) => {
    loading.value = true;
    error.value = null;
    try {
      let url = `/api/Payment?page=${page}&pageSize=${pageSize}`;
      if (entityId) url += `&entityId=${entityId}`;
      const response = await apiService.get<any>(url);
      if (response.isError) {
        error.value = response.message;
        return;
      }
      payments.value = response.model || [];
      totalCount.value = response.totalCount || 0;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch payments';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const addPayment = async (data: CreatePaymentRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.post<Payment>('/api/Payment', data);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      if (response.model) {
        payments.value.push(response.model);
      }
      return response.model;
    } catch (err: any) {
      error.value = err.message || 'Failed to add payment';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePayment = async (id: number, data: UpdatePaymentRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.post<Payment>('/api/Payment/Update', data);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      if (response.model) {
        const index = payments.value.findIndex(p => p.id === id);
        if (index !== -1) {
          payments.value[index] = response.model;
        }
      }
      return response.model;
    } catch (err: any) {
      error.value = err.message || 'Failed to update payment';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePayment = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.delete<void>(`/api/Payment/${id}`);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      payments.value = payments.value.filter(p => p.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete payment';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPaymentById = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.get<Payment>(`/api/Payment/${id}`);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      return response.model;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch payment';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    payments,
    loading,
    error,
    totalCount,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentById
  };
} 