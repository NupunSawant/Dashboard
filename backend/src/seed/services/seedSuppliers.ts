import { Supplier } from "../../models/Masters/Supplier";
import { Counter } from "../../models/Counter";
import { suppliersSeed } from "../data/suppliers.seed";

export const seedSuppliers = async () => {
	for (const s of suppliersSeed) {
		const exists = await Supplier.findOne({
			supplierName: s.supplierName,
			supplierCode: s.supplierCode,
		});

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "supplier_srNo" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await Supplier.create({
				srNo: counter!.seq,
				...s,
			});
		}
	}
};