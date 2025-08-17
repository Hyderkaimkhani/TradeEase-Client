export enum EntityType {
  Customer = "Customer",
  Supplier = "Supplier",
}

export enum OperationType {
  Supply = "Supply",
  Order = "Order",
}

export enum PaymentStatus {
  Unpaid = "Unpaid",
  Partial = "Partial",
  Paid = "Paid",
}

export enum OrderStatus {
  Pending = "Pending",
  Dispatched = "Dispatched",
  Delivered = "Delivered",
  Canceled = "Canceled",
}

export enum PaymentMethod {
  Cash = "Cash",
  Cheque = "Cheque",
  BankTransfer = "Bank Transfer",
  MobilePayment = "Mobile Payment"
}

export enum TransactionDirection  {
  Debit  = "Received",
  Credit = "Paid"
}