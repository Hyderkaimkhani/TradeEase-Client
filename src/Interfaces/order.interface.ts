export interface Order {
    id: number;
    customerId: number;
    truckId: number;
    fruitId: number;
    orderNumber: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    totalPurchasePrice: number;
    totalSellingPrice: number;
    profitLoss: number;
    amountRecieved: number;
    orderDate: string;
    deliveryDate: string;
    status: string;
    paymentStatus: string;
    amountReceived: number;
    truckAssignmentId: number;
    notes: string | null;
    customerName: string | null;
    truckNumber: string | null;
    fruitName: string | null;
}

export interface CreateOrderRequest {
    customerId: number;
    fruitId: number;
    truckNumber: string;
    quantity: number;
    sellingPrice: number;
    orderDate: string;
    deliveryDate?: string;
    status?: string;
    notes?: string;
}

export interface UpdateOrderRequest {
    id: number;
    fruitId: number;
    truckNumber: string;
    quantity: number;
    sellingPrice: number;
    deliveryDate?: string;
    status?: string;
    notes?: string;
} 