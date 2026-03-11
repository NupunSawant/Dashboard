// src/types/customer.ts

export type Customer = {
	id?: string;
	_id?: string;
	srNo?: number;

	customerName: string;
	companyName?: string;
	customerType?: string;

	customerEmail: string;
	customerPhone: number;

	customerAadhar?: string;
	customerGst?: string;

	customerContactPersonName?: string;
	customerContactPersonPhone?: number;

	customerAddress?: string;
	customerState?: string;
	customerCity?: string;
	customerPincode?: string;

	createdAt?: string;
	createdBy?: { id: string; name: string } | null;
	updatedAt?: string;
	updatedBy?: { id: string; name: string } | null;
};
