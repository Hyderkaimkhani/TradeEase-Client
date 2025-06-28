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
