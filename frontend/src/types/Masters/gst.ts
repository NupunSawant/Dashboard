export type GST = { 
    id?: string;
    _id?: string;
    gstRate?: string;
    remark?: string;
    createdAt?: string;
    createdBy?: { id: string; name: string } | null;
    updatedAt?: string;
    updatedBy?: { id: string; name: string } | null;
}