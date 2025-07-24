import { ref } from 'vue';
import { apiService } from '../api/ApiService';
import { Bill, CreateBillRequest, UpdateBillRequest, BillResponse, BillListResponse } from '../Interfaces/bill.interface';

export function useBills() {
  const bills = ref<Bill[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);

  const fetchBills = async (
    page: number = 1,
    pageSize: number = 10,
    entityType?: string,
    entityId?: number,
    referenceNumber?: string,
    fromDate?: string,
    toDate?: string
  ) => {
    loading.value = true;
    error.value = null;
    try {
      let url = `/api/Bill?pageNumber=${page}&pageSize=${pageSize}`;
      if (entityType) url += `&entityType=${encodeURIComponent(entityType)}`;
      if (entityId) url += `&entityId=${entityId}`;
      if (referenceNumber) url += `&referenceNumber=${encodeURIComponent(referenceNumber)}`;
      if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
      if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;
      const response = await apiService.get<BillListResponse>(url);
      if (response.isError) {
        error.value = response.message;
        bills.value = [];
        totalCount.value = 0;
        return 0;
      }
      bills.value = Array.isArray(response.model) ? response.model : [];
      totalCount.value = response.totalCount || 0;
      return response.totalCount || 0;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch bills';
      bills.value = [];
      totalCount.value = 0;
      return 0;
    } finally {
      loading.value = false;
    }
  };

  const createBill = async (data: CreateBillRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.post<BillResponse>('/api/Bill', data);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      if (response.model) {
        // Optionally, you can refresh the list after creation instead of unshifting
      }
      return response.model;
    } catch (err: any) {
      error.value = err.message || 'Failed to create bill';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBill = async (data: UpdateBillRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.post<BillResponse>('/api/Bill/Update', data);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      return response.model;
    } catch (err: any) {
      error.value = err.message || 'Failed to update bill';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getBillById = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.get<BillResponse>(`/api/Bill/${id}`);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      return response.model;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch bill';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const generateBillPDF = async (billId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.get<any>(`/api/Bills/${billId}/pdf`);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      return response.model?.pdfUrl;
    } catch (err: any) {
      error.value = err.message || 'Failed to generate PDF';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendBillEmail = async (billId: string, email: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.post<any>(`/api/Bills/${billId}/send-email`, { email });
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      return response.model?.success;
    } catch (err: any) {
      error.value = err.message || 'Failed to send bill email';
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBill = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiService.delete<BillResponse>(`/api/Bill/${id}`);
      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }
      bills.value = bills.value.filter(b => b.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete bill';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    bills,
    loading,
    error,
    totalCount,
    fetchBills,
    createBill,
    updateBill,
    getBillById,
    generateBillPDF,
    sendBillEmail,
    deleteBill
  };
} 