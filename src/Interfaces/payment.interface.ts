export interface PaymentAllocation {
  id: number;
  paymentId: number;
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
  entityType: string;
  entityId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  isActive: boolean;
  paymentBy?: string;
  paymentAllocations?: PaymentAllocation[];
}

export interface CreatePaymentRequest {
  entityType: string;
  entityId: number;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  id: number;
  amount: number;
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
