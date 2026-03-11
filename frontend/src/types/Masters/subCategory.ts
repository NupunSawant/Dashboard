export type SubCategory = {
	id?: string;
	_id?: string;
	name: string;
	category: string;
	remark?: string;
	createdAt?: string;
	createdBy?: { id: string; name: string } | null;
	updatedAt?: string;
	updatedBy?: { id: string; name: string } | null;
};
