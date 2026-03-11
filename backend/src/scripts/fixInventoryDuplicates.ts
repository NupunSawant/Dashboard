import mongoose from "mongoose";
import { Inventory } from "../models/Inventory/Inventory";

const norm = (v: unknown) =>
	String(v ?? "")
		.trim()
		.toLowerCase();

async function main() {
	//   use your existing MONGO_URI env
	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("MONGO_URI (or DATABASE_URL) not found in env");

	await mongoose.connect(uri);
	console.log("  Connected");

	const all = await Inventory.find({}).lean();
	console.log("Total docs:", all.length);

	// 1) Backfill key fields for all docs
	for (const d of all) {
		const itemName = String((d as any).itemName ?? "").trim();
		const warehouseName = String((d as any).warehouseName ?? "").trim();
		const category = String((d as any).category ?? "").trim();
		const subCategory = String((d as any).subCategory ?? "").trim();
		const unit = String((d as any).unit ?? "").trim();

		const warehouseKey = norm(warehouseName);
		const itemKey = norm(itemName);
		const categoryKey = norm(category);
		const subCategoryKey = norm(subCategory);
		const unitKey = norm(unit);

		await Inventory.updateOne(
			{ _id: (d as any)._id },
			{
				$set: {
					itemName,
					warehouseName,
					category,
					subCategory,
					unit,
					warehouseKey,
					itemKey,
					categoryKey,
					subCategoryKey,
					unitKey,
				},
			},
		);
	}
	console.log("  Keys backfilled");

	// 2) Merge duplicates by key (sum quantities)
	const grouped = await Inventory.aggregate([
		{
			$group: {
				_id: {
					warehouseKey: "$warehouseKey",
					itemKey: "$itemKey",
					categoryKey: "$categoryKey",
					subCategoryKey: "$subCategoryKey",
					unitKey: "$unitKey",
				},
				ids: { $push: "$_id" },
				srNos: { $push: "$srNo" },
				totalQty: { $sum: { $ifNull: ["$availableQuantity", 0] } },
				minSrNo: { $min: "$srNo" },
			},
		},
		{ $match: { "ids.1": { $exists: true } } }, // only duplicates
	]);

	console.log("Duplicate groups:", grouped.length);

	for (const g of grouped) {
		const ids: mongoose.Types.ObjectId[] = g.ids;
		// keep the doc with smallest srNo (or first)
		const keep = ids[0];
		const remove = ids.slice(1);

		await Inventory.updateOne(
			{ _id: keep },
			{ $set: { availableQuantity: g.totalQty, srNo: g.minSrNo } },
		);

		await Inventory.deleteMany({ _id: { $in: remove } });
	}

	console.log("  Duplicates merged");

	// 3) Create correct unique index
	await Inventory.collection.createIndex(
		{
			warehouseKey: 1,
			itemKey: 1,
			categoryKey: 1,
			subCategoryKey: 1,
			unitKey: 1,
		},
		{ unique: true, name: "inv_compound_unique" },
	);

	console.log("  Unique index ensured: inv_compound_unique");

	await mongoose.disconnect();
	console.log("  Done");
}

main().catch(async (e) => {
	console.error(e);
	try {
		await mongoose.disconnect();
	} catch {}
	process.exit(1);
});
