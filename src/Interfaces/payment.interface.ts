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