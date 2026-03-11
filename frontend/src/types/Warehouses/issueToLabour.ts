export interface IssueToLabourItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	dispatchQuantity: number;
	itemsRemark?: string;
}

export interface IssueToLabour {
	id?: string;
	_id?: string;
	srNo?: number;
	issueNo: string;
	issueDate: string;
	issueFromWarehouse: string;
	labourName: string;
	remarks?: string;
	status: "ISSUED" | "COMPLETED" | "REVERTED";
	items: IssueToLabourItem[];
	createdBy?: string;
	updatedBy?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface LabourReturnedItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	dispatchQuantity: number;
	returnQuantity: number;
	itemsRemark?: string;
}

export interface LabourProducedItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	itemsQuantity: number;
	itemsRate: number;
	itemsAmount: number;
	itemsRemark?: string;
}

export interface CompleteIssueToLabourPayload {
	inwardDate: string;
	receivedByWarehouseName: string;
	receivedBy: string;
	remarks?: string;
	itemsDetails: LabourProducedItem[];
	labourReturnedItems: LabourReturnedItem[];
}
