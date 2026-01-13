import { ref } from "vue";
import { apiService } from "../api/ApiService";
import {
  AccountTransactionRequest,
  AccountTransactionResponseModel,
  AccountTransactionListResponse,
  AccountTransactionSingleResponse,
} from "../Interfaces/transaction.interface";

export function useAccountTransactions() {
  const transactions = ref<AccountTransactionResponseModel[]>([]);
  const loading = ref(false);
  const totalCount = ref(0);
  const error = ref<string | null>(null);

  async function fetchTransactions({
    accountId,
    fromDate,
    toDate,
    transactionType,
    pageNumber = 1,
    pageSize = 10,
  }: {
    accountId?: number;
    fromDate?: string;
    toDate?: string;
    transactionType?: string;
    pageNumber?: number;
    pageSize?: number;
  }) {
    loading.value = true;
    try {

      let url = `/api/AccountTransaction?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (transactionType) url += `&transactionType=${encodeURIComponent(transactionType)}`;
      if (accountId) url += `&accountId=${accountId}`;
      if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
      if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;

      const response = await apiService.get<AccountTransactionListResponse>(url);
      if (response.isError) {
        error.value = response.message;
        return 0;
      }
      transactions.value = Array.isArray(response.model) ? response.model : [];
      totalCount.value = response.totalCount || 0;
    } finally {
      loading.value = false;
    }
  }

  async function addTransaction(payload: AccountTransactionRequest) {
    loading.value = true;
    try {
      const response = await apiService.post<AccountTransactionSingleResponse>(
        "/api/AccountTransaction",
        payload
      );
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTransaction(id: number) {
    loading.value = true;
    try {
      const response =
        await apiService.delete<AccountTransactionSingleResponse>(
          `/api/AccountTransaction/${id}`
        );
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function getTransactionById(id: number) {
    loading.value = true;
    try {
      const response = await apiService.get<AccountTransactionSingleResponse>(
        `/api/AccountTransaction/${id}`
      );
      return response.model;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStatement({
    accountId,
    entityId,
    fromDate,
    toDate,
  }: {
    accountId?: number | null;
    entityId?: number | null;
    fromDate: string;
    toDate: string;
  }) {
    loading.value = true;
    try {
      const response = await apiService.post<any>(
        "/api/AccountTransaction/statement",
        {
          accountId: accountId || null,
          entityId: entityId || null,
          fromDate,
          toDate,
        }
      );
      return response;
    } finally {
      loading.value = false;
    }
  }

    async function exportStatement({accountId, entityId, fromDate, toDate,}: {
      accountId?: number | null;
      entityId?: number | null;
      fromDate: string;
      toDate: string;
    }) {
      loading.value = true;
      try {
        await apiService.downloadFile(
          "/api/AccountTransaction/export-statement",
          {
            accountId: accountId || null,
            entityId: entityId || null,
            fromDate,
            toDate,
          },
          "Statement.pdf"
        );
      } catch (error) {
        console.error("Export failed:", error);
        // Show error message to user
      } finally {
        loading.value = false;
      }
    }

  return {
    transactions,
    loading,
    totalCount,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    getTransactionById,
    fetchStatement,
    exportStatement,
  };
}
