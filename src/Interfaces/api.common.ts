export interface Fruit {
  id: number;
  name: string;
  unitType: string;
}

export interface FilterModel {
  EntityId: number|null; // e.g., CustomerId, SupplierId
  AccountId: number|null; // e.g., AccountId for transactions
  ReferenceNumber: string|null; // e.g., SupplyNumber, OrderNumber, Account Number
  FruitId: number|null; // e.g., FruitId for Order and Supply
  FromDate: Date|null;
  ToDate: Date|null;
  PageNumber: number;
  PageSize: number;
}