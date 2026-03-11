// types/enquiry.ts

export type EnquiryStage =
	| "PENDING"
	| "QUOTATION_CREATED"
	| "REQUEST_FOR_QUOTATION"
	| "CLOSED";

export type EnquiryItem = {
	itemsCategory?: string;
	itemsSubCategory?: string;
	itemsName?: string;
	itemsCode?: string;
	itemsUnit?: string;
	itemsRemark?: string;
};

export type Enquiry = {
	id?: string;
	_id?: string;

	srNo?: number;
	enquiryNo?: string;

	enquiryDate?: Date | string;
	sourceOfEnquiry?: string;

	customerName?: string;
	contactPersonName?: string;
	contactPersonPhone?: number;

	staffName?: string;
	stage?: EnquiryStage;

	remarks?: string;

	items?: EnquiryItem[];

	createdAt?: Date | string;
	updatedAt?: Date | string;

	createdBy?: any;
	updatedBy?: any;
};

/* =========================================================
     STRICT TYPE FOR STAGE UPDATE
   Used in changeEnquiryStageThunk
========================================================= */

export type ChangeEnquiryStagePayload = {
	id: string;
	stage: EnquiryStage;
};
