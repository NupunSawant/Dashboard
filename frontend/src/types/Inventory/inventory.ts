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

export type StockOverviewRow = {
	id?: string;
	itemId?: string;
	srNo?: number;
	itemName?: string;
	category?: string;
	subCategory?: string;
	unit?: string;
	receivedQuantity?: number;
	reservedQuantity?: number;
	availableQuantity?: number;
};

export type WarehouseStockRow = {
	id?: string;
	itemId?: string;
	srNo?: number;
	itemName?: string;
	category?: string;
	subCategory?: string;
	unit?: string;
	availableQuantity?: number;
};

export type WarehouseStockItemRow = {
	id?: string;
	srNo?: number;
	warehouseName?: string;
	receivedQuantity?: number;
	reservedQuantity?: number;
	availableQuantity?: number;
};

export type WarehouseStockItemDetail = {
	item: {
		id?: string;
		itemName?: string;
		category?: string;
		subCategory?: string;
		unit?: string;
	};
	warehouses: WarehouseStockItemRow[];
};
