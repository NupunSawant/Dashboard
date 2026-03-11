// types/orders/quotation.ts

export type QuotationStatus = "PENDING" | "SEND" | "WON" | "LOST";

/**
 * One row in quotation items table.
 * Notes:
 * - category/subCategory/item are stored as IDs (string) to match DB.
 * - code/unit/gstRate are auto-filled from selected item master.
 * - all calculated fields are kept for UI + server payload consistency.
 */
export interface QuotationItem {
	// dropdown ids
	itemsCategory: string; // categoryId
	itemsSubCategory: string; // subCategoryId
	itemsName: string; // itemId

	// auto-filled from item master
	itemsCode: string;
	itemsUnit: string;
	gstRate: number;

	// user inputs
	quantity: number;
	rate: number;
	discountPercent: number;
	itemsRemark?: string;

	// calculated (frontend)
	amount: number; // quantity * rate
	discountPrice: number; // (discountPercent/100) * amount
	discountedAmount: number; // amount - discountPrice
	gstAmount: number; // (gstRate/100) * discountedAmount
	totalAmount: number; // discountedAmount + gstAmount
}

export interface QuotationTotals {
	subtotal: number; // sum(amount)
	totalDiscount: number; // sum(discountPrice)
	totalGst: number; // sum(gstAmount)
	grandTotal: number; // sum(totalAmount)
}

/**
 * Quotation entity used across list/view/edit.
 * Keep fields aligned with your backend response format.
 */
export interface Quotation {
	_id: string;

	quotationNo: string;

	// relations
	enquiryId?: string;
	enquiryNo?: string;

	quotationDate: string; // ISO string or yyyy-mm-dd from input[type="date"]
	warehouseName: string; // warehouseId (dropdown)

	customerName: string;
	contactPersonName: string;
	contactPersonPhone: number;

	remarks?: string;

	status: QuotationStatus;

	items: QuotationItem[];

	totals?: QuotationTotals;

	// audit
	createdAt?: string;
	updatedAt?: string;
	createdBy?: { _id: string; name: string } | string;
	updatedBy?: { _id: string; name: string } | string;

	// optional extras (future)
	enquiryStage?: string;
}

/**
 * Payloads (create/update)
 * - In your project you usually send a payload without _id and audit fields.
 */
export type CreateQuotationPayload = Omit<
	Quotation,
	| "_id"
	| "quotationNo"
	| "status"
	| "createdAt"
	| "updatedAt"
	| "createdBy"
	| "updatedBy"
>;

export type UpdateQuotationPayload = Partial<CreateQuotationPayload>;