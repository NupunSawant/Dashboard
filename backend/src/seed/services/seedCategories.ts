import { Category } from "../../models/Masters/Category";
import { Counter } from "../../models/Counter";
import { categoriesSeed } from "../data/categories.seed";

export const seedCategories = async () => {
	for (const c of categoriesSeed) {
		const exists = await Category.findOne({ name: c.name });

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "category_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await Category.create({
				srNo: counter!.seq,
				name: c.name,
				remark: c.remark,
			});
		}
	}
};