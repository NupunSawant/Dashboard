import mongoose from "mongoose";
import { Unit } from "../../models/Masters/Unit";
import { Counter } from "../../models/Counter";
import { unitsSeed } from "../data/units.seed";

export const seedUnits = async () => {
	for (const u of unitsSeed) {
		const exists = await Unit.findOne({ unitName: u.unitName });

		if (!exists) {
			const counter = await Counter.findOneAndUpdate(
				{ key: "unit_srno" },
				{ $inc: { seq: 1 } },
				{ returnDocument: "after", upsert: true }
			);

			await Unit.create({
				srNo: counter.seq,
				unitName: u.unitName,
				unitSymbol: u.unitSymbol,
			});
		}
	}
};