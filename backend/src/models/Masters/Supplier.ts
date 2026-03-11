import mongoose,{Document,Schema} from "mongoose";

export interface ISupplier extends Document{
    srNo?:number;
    supplierName?:String;
    supplierCode?:String;
    supplierEmail?:String;
    supplierPhone?:String;
    supplierGstNo?: String;
    supplierAddress?:String;
    supplierCity?: String;
    supplierState?: String;
    supplierPincode?: String;
    supplierContactPerson?: String;
    supplierContactPersonPhone?: String;
    supplierCountry?: String;
    supplierTransporterName1?: String;
    supplierTransporterPhone1?: String;
    supplierTransporterContactPerson1?: String;
    supplierTransporterContactPerson1Phone?: String;
    supplierTransporterName2?: String;
    supplierTransporterContactPerson2?: String;
    supplierTransporterPhone2?: String;
    supplierTransporterContactPerson2Phone?: String;
    


    createdBy?:mongoose.Types.ObjectId;
    updatedBy?:mongoose.Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

const SupplierSchema = new Schema<ISupplier>(
    {
        srNo: { type: Number, required: true, unique: true, index: true },
        supplierName: { type: String, required: true, trim: true },
        supplierCode: { type: String, required: true, trim: true },
        supplierEmail: { type: String, trim: true },
        supplierPhone: { type: String, trim: true },
        supplierGstNo: { type: String, trim: true },
        supplierAddress: { type: String, trim: true },
        supplierCity: { type: String, trim: true },
        supplierState: { type: String, trim: true },
        supplierPincode: { type: String, trim: true },
        supplierContactPerson: { type: String, trim: true },
        supplierContactPersonPhone: { type: String, trim: true },
        supplierCountry: { type: String, trim: true },
        supplierTransporterName1: { type: String, trim: true },
        supplierTransporterPhone1: { type: String, trim: true },
        supplierTransporterContactPerson1: { type: String, trim: true },
        supplierTransporterContactPerson1Phone: { type: String, trim: true },
        supplierTransporterName2: { type: String, trim: true },
        supplierTransporterPhone2: { type: String, trim: true },
        supplierTransporterContactPerson2: { type: String, trim: true },
        supplierTransporterContactPerson2Phone: { type: String, trim: true },

        createdBy: {type:Schema.Types.ObjectId, ref:"User"},
        updatedBy: {type:Schema.Types.ObjectId, ref:"User"},


    },{timestamps:true},
);

export const Supplier = mongoose.model<ISupplier>("Supplier", SupplierSchema);