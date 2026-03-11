import { Customer } from "../../models/Masters/Customer";
import { Counter } from "../../models/Counter";
import { customersSeed } from "../data/customers.seed";

export const seedCustomers = async () => {
	for (const c of customersSeed) {
		const exists = await Customer.findOne({
			customerEmail: c.customerEmail,
		});

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "customer_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await Customer.create({
				srNo: counter!.seq,
				...c,
			});
		}
	}
};