import { seedUnits } from "./services/seedUnits";
import { seedGST } from "./services/seedGST";
import { seedHSN } from "./services/seedHSN";
import { seedCategories } from "./services/seedCategories";
import { seedSubCategories } from "./services/seedSubCategories";
import { seedSuppliers } from "./services/seedSuppliers";
import { seedWarehouses } from "./services/seedWarehouses";
import { seedLabours } from "./services/seedLabours";
import { seedCustomers } from "./services/seedCustomers";
import { seedItems } from "./services/seedItems";

export const seedMasters = async () => {
	console.log("Seeding Units...");
	await seedUnits();

	console.log("Seeding GST...");
	await seedGST();

	console.log("Seeding HSN...");
	await seedHSN();

	console.log("Seeding Categories...");
	await seedCategories();

	console.log("Seeding SubCategories...");
	await seedSubCategories();

	console.log("Seeding Suppliers...");
	await seedSuppliers();

	console.log("Seeding Warehouses...");
	await seedWarehouses();

	console.log("Seeding Labours...");
	await seedLabours();

	console.log("Seeding Customers...");
	await seedCustomers();

	console.log("Seeding Items...");
	await seedItems();
};
