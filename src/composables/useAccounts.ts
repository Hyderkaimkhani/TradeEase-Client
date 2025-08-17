// src/composables/useAccounts.ts
import { ref } from "vue";
import { apiService } from "../api/ApiService";
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "../Interfaces/account.interface";

export function useAccounts() {
  const accounts = ref<Account[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const accountList = ref();

  const fetchAccounts = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    referenceNumber?: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      let url = `/api/Account?PageNumber=${pageNumber}&PageSize=${pageSize}`;
      if (referenceNumber)
        url += `&ReferenceNumber=${encodeURIComponent(referenceNumber)}`;

      const response = await apiService.get<Account[]>(url);

      if (response.isError) {
        error.value = response.message;
        accounts.value = [];
        totalCount.value = 0;
        return 0;
      }

      accounts.value = response.model || [];
      totalCount.value = response.totalCount || accounts.value.length;
      return totalCount.value;
    } catch (err: any) {
      error.value = err.message || "Failed to fetch accounts";
      console.error(error.value);
      return 0;
    } finally {
      loading.value = false;
    }
  };

  const addAccount = async (data: CreateAccountRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiService.post<Account>("/api/Account", data);

      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.model) {
        accounts.value.unshift(response.model);
        totalCount.value += 1;
      }

      return response.model;
    } catch (err: any) {
      error.value = err.message || "Failed to add account";
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAccount = async (id: number, data: UpdateAccountRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiService.post<Account>(
        "/api/Account/Update",
        data
      );

      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.model) {
        const index = accounts.value.findIndex((a) => a.id === id);
        if (index !== -1) {
          accounts.value[index] = response.model;
        }
      }

      return response.model;
    } catch (err: any) {
      debugger;
      error.value = err.message || "Failed to update account";
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAccount = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiService.delete<void>(`/api/Account/${id}`);

      if (response.isError) {
        error.value = response.message;
        throw new Error(response.message);
      }

      accounts.value = accounts.value.filter((a) => a.id !== id);
      totalCount.value = Math.max(0, totalCount.value - 1);
    } catch (err: any) {
      error.value = err.message || "Failed to delete account";
      console.error(error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAccountsDropdown = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Backend provides /api/Account/dropdown
      const response = await apiService.get<{ label: string; value: number }[]>(
        `/api/Account/dropdown`
      );

      if ((response as any).isError) {
        error.value = (response as any).message;
        return [] as { label: string; value: number }[];
      }
      accountList.value = response;
      return (response as any).model || [];
    } catch (err: any) {
      error.value = err.message || "Failed to load accounts dropdown";
      console.error(error.value);
      return [] as { label: string; value: number }[];
    } finally {
      loading.value = false;
    }
  };

  return {
    accounts,
    accountList,
    loading,
    error,
    totalCount,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountsDropdown,
  };
}
