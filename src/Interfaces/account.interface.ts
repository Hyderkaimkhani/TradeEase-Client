export interface Account {
  id: number;
  companyId: number;
  name: string;
  type: string;
  accountNumber?: string | null;
  bankName?: string | null;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdDate: string;
}

export interface CreateAccountRequest {
  name: string;
  type: string;
  accountNumber?: string | null;
  bankName?: string | null;
  openingBalance: number;
  currentBalance?: number; // Optional for creation, will be set by backend
}

export interface UpdateAccountRequest {
  id: number;
  name: string;
  type: string;
  accountNumber?: string | null;
  bankName?: string | null;
}


