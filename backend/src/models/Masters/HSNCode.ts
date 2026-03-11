import mongoose from "mongoose";

export interface IHSNCode extends mongoose.Document {
    srNo?: number;
    gstRate?: string;
    hsnCode?: string;
    hsnDescription?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}

const HSNCodeSchema = new mongoose.Schema<IHSNCode>(
    {
        srNo: { type: Number, required: true, unique: true, index: true },
        gstRate: { type: String, required: true },
        hsnCode: { type: String, required: true ,unique: true},
        hsnDescription: { type: String, trim: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }, {timestamps: true}
)

export const HSNCode = mongoose.model<IHSNCode>("HSNCode", HSNCodeSchema);