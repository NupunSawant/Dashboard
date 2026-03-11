// types/Dispatch/dispatch.ts

export type DispatchStatus =
	| "CREATED"
	| "DISPATCHED"
	| "DELIVERED"
	| "CANCELLED";

export type ReturnedItemStatus =
	| "NOT_RETURNED"
	| "PARTIALLY_RETURNED"
	| "FULLY_RETURNED";

export type SalesReturnInwardStatus = "NONE" | "PENDING" | "COMPLETED";

//  Ready To Dispatch list row
export type ReadyToDispatchOrder = {
	id?: string;
	_id?: string;

	orderId?: string;
	orderNo: string;
	orderDate: string;

	quotationId?: string | null;
	quotationNo?: string | null;

	customerName: string;
	dispatchFromWarehouseName: string;

	orderStatus: "REQUESTED_FOR_DISPATCH";

	createdAt?: string;
	updatedAt?: string;

	createdBy?: string;
	updatedBy?: string;
};

//  Dispatch Item
export type DispatchItem = {
	srNo?: number;

	itemsCategory: string;
	itemsSubCategory: string;

	itemId: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;

	orderQuantity: number;
	dispatchQuantity: number;

	rate?: number;
	discountPercent?: number;
	gstRate?: number;

	remark?: string;

	// SALES RETURN
	returnQty?: number;
	returnRemark?: string;
	returnInwardedQty?: number;
};

//  Dispatch record
export type Dispatch = {
	id?: string;
	_id?: string;

	dispatchNo?: string;
	dispatchId?: string;

	dispatchDate: string;

	orderId: string;
	orderNo: string;

	quotationId?: string | null;
	quotationNo?: string | null;

	dispatchType: "ORDER" | string;

	invoiceNo?: string;

	issuedFromWarehouseName: string;

	customerName: string;

	dispatchStatus: DispatchStatus;

	remark?: string;

	// SALES RETURN STATUS
	returnedItemStatus?: ReturnedItemStatus;
	salesReturnInwardStatus?: SalesReturnInwardStatus;

	returnProcessedAt?: string;
	returnProcessedBy?: string;

	returnInwardedAt?: string;
	returnInwardedBy?: string;

	customerNameForTransport?: string;
	transporterName?: string;

	contactPerson?: string;
	contactNumber?: number;

	address?: string;
	city?: string;
	state?: string;
	country?: string;
	pincode?: string;

	items: DispatchItem[];

	createdAt?: string;
	updatedAt?: string;

	createdBy?: string;
	updatedBy?: string;
};

//  Payload for create dispatch
export type CreateDispatchPayload = {
	orderId: string;

	dispatchDate: string;

	invoiceNo?: string;

	dispatchType: "ORDER" | string;

	issuedFromWarehouseName: string;

	dispatchedBy?: string;

	remark?: string;

	customerName: string;
	customerNameForTransport?: string;

	transporterName?: string;

	contactPerson?: string;
	contactNumber?: number;

	address?: string;
	city?: string;
	state?: string;
	country?: string;
	pincode?: string;

	items: DispatchItem[];
};
