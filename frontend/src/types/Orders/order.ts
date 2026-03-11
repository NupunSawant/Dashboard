export type OrderStatus =
  | "PENDING"
  | "REQUESTED_FOR_DISPATCH"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItem = {
  srNo?: number;

  itemsCategory: string;
  itemsSubCategory: string;

  itemId: string;
  itemsName: string;
  itemsCode: string;
  itemsUnit: string;

  quantity: number;

  rate?: number;
  discountPercent?: number;
  gstRate?: number;

  remark?: string;
};

export type Order = {
  id?: string;
  _id?: string;

  orderNo: string;
  orderDate: string;

  // Optional links
  quotationId?: string | null;
  quotationNo?: string | null;

  enquiryId?: string | null;
  enquiryNo?: string | null;

  customerName: string;
  dispatchFromWarehouseName: string;

  orderStatus: OrderStatus;

  remarks?: string;

  items: OrderItem[];

  createdAt?: string;
  updatedAt?: string;
};