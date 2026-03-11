import mongoose,{Schema,Document} from "mongoose";

export interface ICustomer extends Document{
    srNo?:number;
    customerName?:string;
    companyName?:string;
    customerType?:string;
    customerEmail:string;
    customerPhone:number;
    customerAadhar?:string;
    customerGst?:string;
    customerContactPersonName?:string;
    customerContactPersonPhone?:number;
    customerAddress?:string;
    customerState?:string;
    customerCity?:string;
    customerPincode?:string;

    createdBy?:mongoose.Types.ObjectId;
    updatedBy?:mongoose.Types.ObjectId;

    createdAt?:Date;
    updatedAt?:Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        srNo:{type:Number, required:true, unique:true, index:true},
        customerName:{type:String, required:true, trim:true},
        companyName:{type:String, trim:true},
        customerType:{type:String, trim:true},
        customerEmail:{type:String, required:true, trim:true},
        customerPhone:{type:Number, required:true},
        customerAadhar:{type:String, trim:true},
        customerGst:{type:String, trim:true},
        customerContactPersonName:{type:String, trim:true},
        customerContactPersonPhone:{type:Number, trim:true},
        customerAddress:{type:String, trim:true},
        customerState:{type:String, trim:true},
        customerCity:{type:String, trim:true},
        customerPincode:{type:String, trim:true},
        createdBy:{type:Schema.Types.ObjectId, ref:"User"},
        updatedBy:{type:Schema.Types.ObjectId, ref:"User"},
    },{timestamps:true}
)

export const Customer = mongoose.model<ICustomer>("Customer",CustomerSchema);