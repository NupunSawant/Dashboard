// types/Inventory/warehouseOverview.ts

export type DailyLogRow = {
	srNo: number;
	itemName: string;
	itemCode: string;
	category: string;
	subCategory: string;
	unit: string;
	todayIn: number;
	todayOut: number;
	closingStock: number;
};

export type InStockRow = {
	srNo: number;
	itemName: string;
	itemCode: string;
	category: string;
	subCategory: string;
	unit: string;
	totalQuantity: number;
	inventoryIds: string[];
};