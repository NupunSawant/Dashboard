import { HSNCode } from "../../models/Masters/HSNCode";
import { Counter } from "../../models/Counter";
import { hsnSeed } from "../data/hsn.seed";

export const seedHSN = async () => {
	for (const h of hsnSeed) {
		const exists = await HSNCode.findOne({ hsnCode: h.hsnCode });

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "hsncode_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await HSNCode.create({
				srNo: counter.seq,
				hsnCode: h.hsnCode,
				gstRate: h.gstRate,
				hsnDescription: h.hsnDescription,
			});
		}
	}
};