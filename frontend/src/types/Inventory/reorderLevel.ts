export type Inventory = {
	id?: string;
	_id?: string;
	srNo?: number;
	itemName?: string;
	warehouseName?: string;
	category?: string;
	subCategory?: string;
	unit?: string;
	receivedQuantity?: number;
	reservedQuantity?: number;
	availableQuantity?: number;
};

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
};

// ======================================================
// REORDER LEVEL TYPES
// ======================================================

export type ReorderStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type ItemWiseReorderLevel = {
	id?: string;
	srNo?: number;

	itemName?: string;
	itemCode?: string;

	category?: string;
	subCategory?: string;
	unit?: string;

	totalStock?: number;
	reorderLevel?: number;

	status?: ReorderStatus;

	createdAt?: string;
	updatedAt?: string;

	createdBy?: any;
	updatedBy?: any;
};

export type WarehouseWiseReorderLevel = {
	id?: string;
	srNo?: number;

	itemName?: string;
	itemCode?: string;

	category?: string;
	subCategory?: string;
	unit?: string;

	warehouseName?: string;

	warehouseStock?: number;
	reorderLevel?: number;

	status?: ReorderStatus;

	createdAt?: string;
	updatedAt?: string;

	createdBy?: any;
	updatedBy?: any;
};

// ======================================================
// CREATE / UPDATE PAYLOAD TYPES
// ======================================================

export type CreateItemWiseReorderPayload = {
	category?: string;
	subCategory?: string;

	itemName: string;
	itemCode: string;

	unit?: string;

	reorderLevel: number;
};

export type CreateWarehouseWiseReorderPayload = {
	warehouseName: string;

	category?: string;
	subCategory?: string;

	itemName: string;
	itemCode: string;

	unit?: string;

	reorderLevel: number;
};
