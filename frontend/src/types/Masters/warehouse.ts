export type Warehouse = {
    id?: string;
    _id?: string;
    warehouseName: string;
    warehouseType?: string;
    warehouseAddress?: string;
    warehouseCity?: string;
    warehouseState?: string;
    warehouseCountry?: string;
    warehousePincode?: string;
    remarks?: string;
    createdAt?: string;
    createdBy?: { id: string; name: string } | null;
    updatedAt?: string;
    updatedBy?: { id: string; name: string } | null;
}