export type Supplier = {
  id?: string;
  _id?: string;

  srNo: number;
  name: string;
  code: string;

  email?: string;
  phone?: string;
  gstNo?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  contactPerson?: string;
  contactPersonPhone?: string;

  transporterName1?: string;
  transporterPhone1?: string;
  transporterContactPerson1?: string;
  transporterContactPerson1Phone?: string;

  transporterName2?: string;
  transporterPhone2?: string;
  transporterContactPerson2?: string;
  transporterContactPerson2Phone?: string;

  createdBy?: {
    _id?: string;
    name?: string;
  };

  updatedBy?: {
    _id?: string;
    name?: string;
  };

  createdAt?: string;
  updatedAt?: string;
};