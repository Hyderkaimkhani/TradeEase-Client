export interface AccountTransactionRequest {
  accountId: number;
  transactionType: 'Expense' | 'Income' | 'Transfer';
  amount: number;
  transactionDate: string;
  paymentMethod: string;
  notes?: string;
  entityId?: number;
  category?: string;
  party?: string;
  toAccountId?: number;
}

export interface AccountTransactionResponseModel {
  id: number;
  accountId: number;
  accountName: string;
  transactionType: 'Expense' | 'Income' | 'Transfer';
  amount: number;
  transactionDate: string;
  paymentMethod: string;
  notes?: string;
  entityId?: number | null;
  entityName?: string;
  category?: string;
  party?: string;
  toAccountId?: number | null;
  toAccountName?: string;
}

export interface AccountTransactionListResponse {
  model: AccountTransactionResponseModel[];
  totalCount: number;
  isError: boolean;
  message: string;
}

export interface AccountTransactionSingleResponse {
  isError: boolean;
  message: string;
  model: AccountTransactionResponseModel;
}
