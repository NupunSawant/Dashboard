export type HSNCode = {
    id?: string;
    _id?: string;
    srNo?: number;
    gstRate?: string;
    hsnCode?: string;
    hsnDescription?: string;
    createdAt?: string;
    createdBy?: { id: string; name: string } | null;
    updatedAt?: string;
    updatedBy?: { id: string; name: string } | null;
}