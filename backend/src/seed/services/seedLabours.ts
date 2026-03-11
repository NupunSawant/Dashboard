import { Labour } from "../../models/Masters/Labour";
import { Counter } from "../../models/Counter";
import { laboursSeed } from "../data/labours.seed";

export const seedLabours = async () => {
	for (const l of laboursSeed) {
		const exists = await Labour.findOne({
			labourName: l.labourName,
		});

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "labour_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await Labour.create({
				srNo: counter!.seq,
				...l,
			});
		}
	}
};