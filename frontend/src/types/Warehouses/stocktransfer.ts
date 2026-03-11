export interface StockTransferItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	dispatchQuantity: number;
	remark?: string;
}

export interface StockTransfer {
	id?: string;
	_id?: string;
	transferNo: string;
	transferDate: string;
	transferFromWarehouse: string;
	transferToWarehouse: string;
	remarks?: string;
	status: "PENDING" | "DISPATCHED" | "COMPLETED" | "REVERTED";
	items: StockTransferItem[];
	createdBy?: string;
	updatedBy?: string;
	createdAt?: string;
	updatedAt?: string;
}