import { SubCategory } from "../../models/Masters/SubCategory";
import { Counter } from "../../models/Counter";
import { subCategoriesSeed } from "../data/subcategories.seed";

export const seedSubCategories = async () => {
	for (const s of subCategoriesSeed) {
		const exists = await SubCategory.findOne({
			name: s.name,
			category: s.category,
		});

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "subcategory_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await SubCategory.create({
				srNo: counter!.seq,
				name: s.name,
				category: s.category,
				remark: s.remark,
			});
		}
	}
};