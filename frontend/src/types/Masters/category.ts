export type Category = {
	id?: string;
	_id?: string;
	name: string;
	remark?: string;
	createdAt?: string;
	createdBy?: { id: string; name: string } | null;
	updatedAt?: string;
	updatedBy?: { id: string; name: string } | null;
};
