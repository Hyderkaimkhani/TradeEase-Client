export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  logo?: string;
}

export interface BillItem {
  id: number;
  referenceType: string;
  referenceId: number;
  referenceNumber: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

export interface BillDetail {
  id: number;
  billId: number;
  referenceType: string;
  orderId?: number | null;
  supplyId?: number | null;
  referenceNumber: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unit?: string | null;
  recordDate?: string;
  status?: string;
  paymentStatus?: string;
  truckNumber?: string;
  fruitName?: string;
}

export interface Bill {
  id: number;
  billNumber: string;
  entityType: string;
  entityId: number;
  entityName: string;
  fromDate: string;
  toDate: string;
  dueDate: string;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  paymentStatus: string;
  paidDate?: string | null;
  billDate: string;
  pdfPath?: string | null;
  notes: string;
  isActive: boolean;
  billDetails: BillDetail[];
}

export interface CreateBillRequest {
  entityType: string;
  entityId: number;
  dueDate: string;
  notes: string;
}

export interface UpdateBillRequest {
  Id: number;
  dueDate: string;
  notes: string;
}

export interface BillResponse {
  isError: boolean;
  message: string;
  model: Bill;
}

export interface BillListResponse {
  model: Bill[];
  totalCount: number;
  isError: boolean;
  message: string;
} 