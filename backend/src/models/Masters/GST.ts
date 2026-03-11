import mongoose,{Document,Schema} from "mongoose";

export interface IGST extends Document {
    srNo?: number;
    gstRate?: string;
    remark?: string;
    createdAt?: Date;
    updatedAt?: Date;

    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}

const GSTSchema = new Schema<IGST>(
    {
        srNo: { type: Number, required: true, unique: true, index: true },
        gstRate: { type: String, required: true ,unique: true},
        remark: { type: String, trim: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {timestamps: true}
)

export const GST = mongoose.model<IGST>("GST", GSTSchema);