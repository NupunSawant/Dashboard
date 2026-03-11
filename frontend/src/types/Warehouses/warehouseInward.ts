export type WarehouseInward = {
    id?: string;
    _id?: string;
    srNo?: number;
    grnNo?: string;
    inwardType?: string;
    inwardDate?: Date;
    receivedBy?: string;
    remarks?: string;

    invoiceNo?: string;
    supplierName?: string;
    warehouseName?: string;
    itemsCategory?: string;
    itemsSubCategory?: string;
    itemsName?: string;
    itemsCode?: string;
    itemsQuantity?: number;
    itemsUnit?: string;
    itemsRate?: number;
    itemsAmount?: number;
    itemsRemark?: string;
}