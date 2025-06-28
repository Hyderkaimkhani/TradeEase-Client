export interface Supply {
    id: number;
    supplierId: number;
    supplyNumber: string;
    fruitId: number;
    truckId: number | null;
    quantity: number;
    purchasePrice: number;
    totalPrice: number;
    amountPaid: number;
    paymentStatus: string | null;
    supplyDate: string;
    truckAssignmentId: number | null;
    notes: string | null;
    supplierName: string | null;
    fruitName: string | null;
    truckNumber: string | null;
}

export interface CreateSupplyRequest {
    supplierId: number;
    fruitId: number;
    quantity: number;
    purchasePrice: number;
    supplyDate: string;
    truckNumber: string;
    notes: string;
}

export interface UpdateSupplyRequest {
    id: number;
    quantity: number;
    purchasePrice: number;
    supplyDate: string;
    truckNumber: string;
    notes: string;
} 