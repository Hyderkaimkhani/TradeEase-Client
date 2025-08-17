export interface PaymentAllocation {
  id: number;
  trnsactionId: number;
  referenceType: string;
  referenceId: number;
  allocatedAmount: number;
  number: string;   //Supply / Order Number
  operationDate: Date; // Supply / Order Date
  truckNumber: string;
  paymentStatus: string;
  quantity: number;
  price: number;
  totalPrice: number;
}
export interface Payment {
  id: number;
  accountId: number;  
  transactionType: string;
  entityId: number;
  customerName: string | null;
  amount: number;
  accountName: string;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  isActive: boolean;
  // paymentBy?: string;
  paymentAllocations?: PaymentAllocation[];
}

export interface CreatePaymentRequest {
  transactionDirection: string;
  accountId: number;
  entityId: number;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  id: number;
  //amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
}

export interface PaymentResponse {
  model: Payment[];
  totalCount: number;
  isError: boolean;
  message: string;
}

export interface SinglePaymentResponse {
  model: Payment;
  isError: boolean;
  message: string;
}
