import { GST } from "../../models/Masters/GST";
import { Counter } from "../../models/Counter";
import { gstSeed } from "../data/gst.seed";

export const seedGST = async () => {
	for (const g of gstSeed) {
		const exists = await GST.findOne({ gstRate: g.gstRate });

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "gst_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await GST.create({
				srNo: counter.seq,
				gstRate: g.gstRate,
				remark: g.remark,
			});
		}
	}
};