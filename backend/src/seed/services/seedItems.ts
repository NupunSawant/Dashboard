import { Item } from "../../models/Masters/Item";
import { Counter } from "../../models/Counter";
import { itemsSeed } from "../data/items.seed";

export const seedItems = async () => {
	for (const i of itemsSeed) {
		const exists = await Item.findOne({
			itemName: i.itemName,
			itemCode: i.itemCode,
		});

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "item_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await Item.create({
				srNo: counter!.seq,
				...i,
			});
		}
	}
};