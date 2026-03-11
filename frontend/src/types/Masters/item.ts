export type Item = {
    id?: string;
    _id?: string;
    itemName: string;
    itemCode: string;
    category: string;
    subCategory?: string;
    gst?: string;
    unit: string;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: { id: string; name: string } | null;
    updatedBy?: { id: string; name: string } | null;
}