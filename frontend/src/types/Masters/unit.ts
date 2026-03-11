export type Unit = {
    id?: string;
    _id?: string;
    unitName?: string;
    unitSymbol?: string;
    createdAt?: string;
    createdBy?: { id: string; name: string } | null;
    updatedAt?: string;
    updatedBy?: { id: string; name: string } | null;
}