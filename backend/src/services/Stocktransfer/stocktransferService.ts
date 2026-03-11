import StockTransfer from "../../models/Stocktransfer/Stocktransfer";
import { Inventory } from "../../models/Inventory/Inventory";
import { Counter } from "../../models/Counter";

const getNextSequence = async (key: string): Promise<number> => {
const doc = await Counter.findOneAndUpdate(
{ key },
{ $inc: { seq: 1 } },
{ new: true, upsert: true },
).lean();

return doc!.seq;
};

// ----------- helpers -----------
const norm = (v: string) =>
String(v || "")
.trim()
.toLowerCase();

const itemKeys = (warehouseName: string, item: any) => {
const warehouseKey = norm(warehouseName);
const itemName = String(item?.itemsName || "").trim();
const category = String(item?.itemsCategory || "").trim();
const subCategory = String(item?.itemsSubCategory || "").trim();
const unit = String(item?.itemsUnit || "").trim();

return {
warehouseKey,
itemName,
category,
subCategory,
unit,
itemKey: norm(itemName),
categoryKey: norm(category),
subCategoryKey: norm(subCategory),
unitKey: norm(unit),
};
};

// Reduce availableQty and increase reservedQty in FROM warehouse
async function reserveInventory(
warehouseName: string,
items: Array<{
itemsName: string;
itemsCategory?: string;
itemsSubCategory?: string;
itemsUnit?: string;
dispatchQuantity: number;
}>,
) {
for (const item of items) {
const qty = Number(item.dispatchQuantity) || 0;
if (qty <= 0) continue;

const keys = itemKeys(warehouseName, item);

const updated = await Inventory.findOneAndUpdate(
{
warehouseKey: keys.warehouseKey,
itemKey: keys.itemKey,
categoryKey: keys.categoryKey,
subCategoryKey: keys.subCategoryKey,
unitKey: keys.unitKey,
availableQuantity: { $gte: qty },
},
{
$inc: {
availableQuantity: -qty,
reservedQuantity: qty,
},
},
{ new: true },
).lean();

if (!updated) {
throw new Error(
`Insufficient inventory for item "${keys.itemName}" in warehouse "${warehouseName}"`,
);
}
}
}

// Reverse the reservation (on revert)
async function unreserveInventory(
warehouseName: string,
items: Array<{
itemsName: string;
itemsCategory?: string;
itemsSubCategory?: string;
itemsUnit?: string;
dispatchQuantity: number;
}>,
) {
for (const item of items) {
const qty = Number(item.dispatchQuantity) || 0;
if (qty <= 0) continue;

const keys = itemKeys(warehouseName, item);
const inv = await Inventory.findOne({
warehouseKey: keys.warehouseKey,
itemKey: keys.itemKey,
categoryKey: keys.categoryKey,
subCategoryKey: keys.subCategoryKey,
unitKey: keys.unitKey,
});

if (!inv) continue;

const releasable = Math.min(Number(inv.reservedQuantity || 0), qty);
if (releasable <= 0) continue;

inv.reservedQuantity = Number(inv.reservedQuantity || 0) - releasable;
inv.availableQuantity = Number(inv.availableQuantity || 0) + releasable;
await inv.save();
}
}

// Deduct from FROM warehouse reserved and add to TO warehouse available+received
async function completeTransferInventory(
fromWarehouse: string,
toWarehouse: string,
items: Array<{
itemsName: string;
itemsCode: string;
itemsCategory: string;
itemsSubCategory: string;
itemsUnit: string;
dispatchQuantity: number;
}>,
) {
const fromKey = norm(fromWarehouse);
const toKey = norm(toWarehouse);

for (const item of items) {
const qty = Number(item.dispatchQuantity) || 0;
if (qty <= 0) continue;

// Deduct reserved from FROM using composite inventory keys.
const fromKeys = itemKeys(fromWarehouse, item);
const fromInv = await Inventory.findOne({
warehouseKey: fromKey,
itemKey: fromKeys.itemKey,
categoryKey: fromKeys.categoryKey,
subCategoryKey: fromKeys.subCategoryKey,
unitKey: fromKeys.unitKey,
});

if (!fromInv) {
throw new Error(
`Source inventory not found for item "${fromKeys.itemName}" in warehouse "${fromWarehouse}"`,
);
}

if (Number(fromInv.reservedQuantity || 0) < qty) {
throw new Error(
`Reserved quantity is not enough for item "${fromKeys.itemName}" in warehouse "${fromWarehouse}"`,
);
}

fromInv.reservedQuantity = Number(fromInv.reservedQuantity || 0) - qty;
await fromInv.save();

// Add to TO warehouse with atomic upsert on unique inventory keys.
const toKeys = itemKeys(toWarehouse, item);
await Inventory.findOneAndUpdate(
{
warehouseKey: toKey,
itemKey: toKeys.itemKey,
categoryKey: toKeys.categoryKey,
subCategoryKey: toKeys.subCategoryKey,
unitKey: toKeys.unitKey,
},
{
$inc: {
availableQuantity: qty,
receivedQuantity: qty,
},
$set: {
warehouseName: toWarehouse,
itemName: toKeys.itemName,
category: toKeys.category,
subCategory: toKeys.subCategory,
unit: toKeys.unit,
warehouseKey: toKey,
itemKey: toKeys.itemKey,
categoryKey: toKeys.categoryKey,
subCategoryKey: toKeys.subCategoryKey,
unitKey: toKeys.unitKey,
},
$setOnInsert: {
srNo: await getNextSequence("inventory_srno"),
reservedQuantity: 0,
},
},
{ new: true, upsert: true },
).lean();
}
}

// ============ SERVICE FUNCTIONS ============

export async function getAllStockTransfers() {
return StockTransfer.find().sort({ createdAt: -1 }).lean();
}

export async function getStockTransferById(id: string) {
return StockTransfer.findById(id).lean();
}

export async function createStockTransfer(body: any, createdBy?: string) {
const transfer = new StockTransfer({
transferDate: body.transferDate ? new Date(body.transferDate) : new Date(),
transferFromWarehouse: body.transferFromWarehouse,
transferToWarehouse: body.transferToWarehouse,
remarks: body.remarks || "",
status: "DISPATCHED",
items: body.items,
createdBy: createdBy || body.createdBy || "",
});

await transfer.save();

// Impact inventory: reduce available, increase reserved in FROM warehouse
await reserveInventory(transfer.transferFromWarehouse, transfer.items as any);

return transfer;
}

export async function updateStockTransfer(
id: string,
body: any,
updatedBy?: string,
) {
const transfer = await StockTransfer.findById(id);
if (!transfer) throw new Error("Stock transfer not found");
if (transfer.status !== "DISPATCHED")
throw new Error("Only DISPATCHED transfers can be edited");

// Unreserve old quantities
await unreserveInventory(transfer.transferFromWarehouse, transfer.items as any);

// Update fields
if (body.transferDate) transfer.transferDate = new Date(body.transferDate);
if (body.transferFromWarehouse)
transfer.transferFromWarehouse = body.transferFromWarehouse;
if (body.transferToWarehouse)
transfer.transferToWarehouse = body.transferToWarehouse;
if (body.remarks !== undefined) transfer.remarks = body.remarks;
if (body.items) transfer.items = body.items;
transfer.updatedBy = updatedBy || body.updatedBy || "";

await transfer.save();

// Re-reserve new quantities
await reserveInventory(transfer.transferFromWarehouse, transfer.items as any);

return transfer;
}

export async function revertStockTransfer(id: string, updatedBy?: string) {
const transfer = await StockTransfer.findById(id);
if (!transfer) throw new Error("Stock transfer not found");
if (transfer.status !== "DISPATCHED")
throw new Error("Only DISPATCHED transfers can be reverted");

// Unreserve inventory
await unreserveInventory(transfer.transferFromWarehouse, transfer.items as any);

transfer.status = "REVERTED";
transfer.updatedBy = updatedBy || "";
await transfer.save();

return transfer;
}

export async function completeStockTransfer(id: string, updatedBy?: string) {
const transfer = await StockTransfer.findById(id);
if (!transfer) throw new Error("Stock transfer not found");

// Idempotent completion: if another step already completed it, return success.
if (transfer.status === "COMPLETED") return transfer;

if (transfer.status !== "DISPATCHED") {
throw new Error("Only DISPATCHED transfers can be completed");
}

// Move inventory from reserved(FROM) to available(TO)
await completeTransferInventory(
transfer.transferFromWarehouse,
transfer.transferToWarehouse,
transfer.items as any,
);

transfer.status = "COMPLETED";
transfer.updatedBy = updatedBy || "";
await transfer.save();

return transfer;
}

export async function getPendingStockTransfers() {
return StockTransfer.find({ status: "DISPATCHED" })
.sort({ createdAt: -1 })
.lean();
}
