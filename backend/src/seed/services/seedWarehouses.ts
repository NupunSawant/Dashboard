import { Warehouse } from "../../models/Masters/Warehouse";
import { Counter } from "../../models/Counter";
import { warehousesSeed } from "../data/warehouses.seed";

export const seedWarehouses = async () => {
	for (const w of warehousesSeed) {
		const exists = await Warehouse.findOne({
			warehouseName: w.warehouseName,
		});

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "warehouse_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await Warehouse.create({
				srNo: counter!.seq,
				...w,
			});
		}
	}
};