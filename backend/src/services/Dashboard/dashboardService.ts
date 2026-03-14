import { Enquiry } from "../../models/Orders/Enquiry";
import { Quotation } from "../../models/Orders/Quotation";
import { Order } from "../../models/Orders/Order";
import { Dispatch } from "../../models/Dispatch/Dispatch";
import { WarehouseInward } from "../../models/Warehouses/WarehouseInward";
import StockTransfer from "../../models/Stocktransfer/Stocktransfer";
import { IssueToLabour } from "../../models/Warehouses/IssueToLabour";

import { Category } from "../../models/Masters/Category";
import { SubCategory } from "../../models/Masters/SubCategory";
import { Item } from "../../models/Masters/Item";
import { Customer } from "../../models/Masters/Customer";
import { Supplier } from "../../models/Masters/Supplier";
import { Warehouse } from "../../models/Masters/Warehouse";
import { Labour } from "../../models/Masters/Labour";
import { Unit } from "../../models/Masters/Unit";
import { GST } from "../../models/Masters/GST";
import { HSNCode } from "../../models/Masters/HSNCode";

import { User } from "../../models/User";

type MongoQuery = Record<string, any>;

type DashboardFilters = {
	from?: string;
	to?: string;
	warehouseName?: string;
};

type StatusCount = {
	key: string;
	label: string;
	count: number;
};

type RecentActivityRow = {
	id: string;
	module: string;
	refNo: string;
	date: Date | null;
	status: string;
	partyName: string;
	warehouseName: string;
	createdAt: Date | null;
};

type AggregateCountRow = {
	_id: string | null;
	count: number;
};

const startOfDay = (value: string): Date => {
	const d = new Date(value);
	d.setHours(0, 0, 0, 0);
	return d;
};

const endOfDay = (value: string): Date => {
	const d = new Date(value);
	d.setHours(23, 59, 59, 999);
	return d;
};

const buildDateMatch = (
	field: string,
	filters: DashboardFilters,
): MongoQuery => {
	const match: MongoQuery = {};

	if (filters.from || filters.to) {
		const range: MongoQuery = {};

		if (filters.from) {
			range.$gte = startOfDay(filters.from);
		}
		if (filters.to) {
			range.$lte = endOfDay(filters.to);
		}

		match[field] = range;
	}

	return match;
};

const withWarehouseFilter = (
	base: MongoQuery,
	field: string,
	warehouseName?: string,
): MongoQuery => {
	if (!warehouseName?.trim()) return base;

	return {
		...base,
		[field]: warehouseName.trim(),
	};
};

const statusMap = (
	rows: AggregateCountRow[],
	expected: Array<{ key: string; label: string }>,
): StatusCount[] => {
	return expected.map((s) => ({
		key: s.key,
		label: s.label,
		count: rows.find((r) => r._id === s.key)?.count || 0,
	}));
};

const sumNestedField = async (
	model: any,
	match: MongoQuery,
	arrayField: string,
	numberField: string,
): Promise<number> => {
	const rows = await model.aggregate([
		{ $match: match },
		{ $unwind: `$${arrayField}` },
		{
			$group: {
				_id: null,
				total: {
					$sum: {
						$ifNull: [`$${arrayField}.${numberField}`, 0],
					},
				},
			},
		},
	]);

	return rows?.[0]?.total || 0;
};

const buildTrend = async (
	model: any,
	dateField: string,
	filters: DashboardFilters,
	warehouseField?: string,
): Promise<Array<{ _id: string; count: number }>> => {
	const match = buildDateMatch(dateField, filters);

	const finalMatch =
		warehouseField && filters.warehouseName
			? withWarehouseFilter(match, warehouseField, filters.warehouseName)
			: match;

	return model.aggregate([
		{ $match: finalMatch },
		{
			$group: {
				_id: {
					$dateToString: {
						format: "%Y-%m-%d",
						date: `$${dateField}`,
					},
				},
				count: { $sum: 1 },
			},
		},
		{ $sort: { _id: 1 } },
	]);
};

const getKPISummary = async (filters: DashboardFilters) => {
	const orderMatch = withWarehouseFilter(
		buildDateMatch("orderDate", filters),
		"dispatchFromWarehouseName",
		filters.warehouseName,
	);

	const dispatchMatch = withWarehouseFilter(
		buildDateMatch("dispatchDate", filters),
		"issuedFromWarehouseName",
		filters.warehouseName,
	);	

	const inwardBase = buildDateMatch("inwardDate", filters);
	const inwardMatch: MongoQuery = filters.warehouseName
		? {
				...inwardBase,
				$or: [
					{ warehouseName: filters.warehouseName.trim() },
					{ supplierName: filters.warehouseName.trim() },
				],
			}
		: inwardBase;

	const transferMatch: MongoQuery = filters.warehouseName
		? {
				...buildDateMatch("transferDate", filters),
				$or: [
					{ transferFromWarehouse: filters.warehouseName.trim() },
					{ transferToWarehouse: filters.warehouseName.trim() },
				],
			}
		: buildDateMatch("transferDate", filters);

	const issueMatch = withWarehouseFilter(
		buildDateMatch("issueDate", filters),
		"issueFromWarehouse",
		filters.warehouseName,
	);

	const [
		totalOrders,
		totalDispatches,
		totalInwards,
		totalTransfers,
		totalLabourIssues,
		totalItems,
		totalCustomers,
		totalWarehouses,
		totalUsers,
		pendingDispatchCount,
		pendingTransferCount,
		pendingIssueCount,
		pendingSalesReturnCount,
	] = await Promise.all([
		Order.countDocuments(orderMatch),
		Dispatch.countDocuments(dispatchMatch),
		WarehouseInward.countDocuments(inwardMatch),
		StockTransfer.countDocuments(transferMatch),
		IssueToLabour.countDocuments(issueMatch),
		Item.countDocuments(),
		Customer.countDocuments(),
		Warehouse.countDocuments(),
		User.countDocuments(),
		Dispatch.countDocuments({
			...dispatchMatch,
			dispatchStatus: "PENDING",
		}),
		StockTransfer.countDocuments({
			...transferMatch,
			status: { $in: ["PENDING", "DISPATCHED"] },
		}),
		IssueToLabour.countDocuments({
			...issueMatch,
			status: "ISSUED",
		}),
		Dispatch.countDocuments({
			...dispatchMatch,
			salesReturnInwardStatus: "PENDING",
		}),
	]);

	const pendingActionsCount =
		pendingDispatchCount +
		pendingTransferCount +
		pendingIssueCount +
		pendingSalesReturnCount;

	return {
		totalOrders,
		totalDispatches,
		totalInwards,
		totalTransfers,
		totalLabourIssues,
		totalItems,
		totalCustomers,
		totalWarehouses,
		totalUsers,
		pendingActionsCount,
	};
};

const getSalesPipeline = async (filters: DashboardFilters) => {
	const enquiryRows: AggregateCountRow[] = await Enquiry.aggregate([
		{ $match: buildDateMatch("enquiryDate", filters) },
		{ $group: { _id: "$stage", count: { $sum: 1 } } },
	]);

	const quotationRows: AggregateCountRow[] = await Quotation.aggregate([
		{
			$match: withWarehouseFilter(
				buildDateMatch("quotationDate", filters),
				"warehouseName",
				filters.warehouseName,
			),
		},
		{ $group: { _id: "$status", count: { $sum: 1 } } },
	]);

	const orderRows: AggregateCountRow[] = await Order.aggregate([
		{
			$match: withWarehouseFilter(
				buildDateMatch("orderDate", filters),
				"dispatchFromWarehouseName",
				filters.warehouseName,
			),
		},
		{ $group: { _id: "$orderStatus", count: { $sum: 1 } } },
	]);

	return {
		enquiries: statusMap(enquiryRows, [
			{ key: "PENDING", label: "Pending" },
			{ key: "QUOTATION_CREATED", label: "Quotation Created" },
			{ key: "REQUEST_FOR_QUOTATION", label: "Request For Quotation" },
			{ key: "CLOSED", label: "Closed" },
		]),
		quotations: statusMap(quotationRows, [
			{ key: "PENDING", label: "Pending" },
			{ key: "SEND", label: "Send" },
			{ key: "WON", label: "Won" },
			{ key: "LOST", label: "Lost" },
		]),
		orders: statusMap(orderRows, [
			{ key: "PENDING", label: "Pending" },
			{ key: "REQUESTED_FOR_DISPATCH", label: "Requested For Dispatch" },
			{ key: "DISPATCHED", label: "Dispatched" },
			{ key: "DELIVERED", label: "Delivered" },
			{ key: "CANCELLED", label: "Cancelled" },
		]),
	};
};

const getWarehousePipeline = async (filters: DashboardFilters) => {
	const dispatchMatch = withWarehouseFilter(
		buildDateMatch("dispatchDate", filters),
		"issuedFromWarehouseName",
		filters.warehouseName,
	);

	const orderMatch = withWarehouseFilter(
		buildDateMatch("orderDate", filters),
		"dispatchFromWarehouseName",
		filters.warehouseName,
	);

	const transferMatch: MongoQuery = filters.warehouseName
		? {
				...buildDateMatch("transferDate", filters),
				$or: [
					{ transferFromWarehouse: filters.warehouseName.trim() },
					{ transferToWarehouse: filters.warehouseName.trim() },
				],
			}
		: buildDateMatch("transferDate", filters);

	const issueMatch = withWarehouseFilter(
		buildDateMatch("issueDate", filters),
		"issueFromWarehouse",
		filters.warehouseName,
	);

	const inwardMatch = withWarehouseFilter(
		buildDateMatch("inwardDate", filters),
		"warehouseName",
		filters.warehouseName,
	);

	const [
		ordersReadyForDispatch,
		dispatchPending,
		dispatchDelivered,
		transferPending,
		transferCompleted,
		labourIssued,
		labourCompleted,
		stockTransferInwards,
		labourReturnInwards,
		salesReturnPending,
	] = await Promise.all([
		Order.countDocuments({
			...orderMatch,
			orderStatus: "REQUESTED_FOR_DISPATCH",
		}),
		Dispatch.countDocuments({
			...dispatchMatch,
			dispatchStatus: "PENDING",
		}),
		Dispatch.countDocuments({
			...dispatchMatch,
			dispatchStatus: "DELIVERED",
		}),
		StockTransfer.countDocuments({
			...transferMatch,
			status: { $in: ["PENDING", "DISPATCHED"] },
		}),
		StockTransfer.countDocuments({
			...transferMatch,
			status: "COMPLETED",
		}),
		IssueToLabour.countDocuments({
			...issueMatch,
			status: "ISSUED",
		}),
		IssueToLabour.countDocuments({
			...issueMatch,
			status: "COMPLETED",
		}),
		WarehouseInward.countDocuments({
			...inwardMatch,
			inwardType: "STOCK_TRANSFER",
		}),
		WarehouseInward.countDocuments({
			...inwardMatch,
			inwardType: "LABOUR_RETURN",
		}),
		Dispatch.countDocuments({
			...dispatchMatch,
			salesReturnInwardStatus: "PENDING",
		}),
	]);

	return {
		ordersReadyForDispatch,
		dispatchPending,
		dispatchDelivered,
		transferPending,
		transferCompleted,
		labourIssued,
		labourCompleted,
		stockTransferInwards,
		labourReturnInwards,
		salesReturnPending,
	};
};

const getInventorySummary = async (filters: DashboardFilters) => {
	const inwardMatch = withWarehouseFilter(
		buildDateMatch("inwardDate", filters),
		"warehouseName",
		filters.warehouseName,
	);

	const dispatchMatch = withWarehouseFilter(
		buildDateMatch("dispatchDate", filters),
		"issuedFromWarehouseName",
		filters.warehouseName,
	);

	const transferMatch: MongoQuery = filters.warehouseName
		? {
				...buildDateMatch("transferDate", filters),
				$or: [
					{ transferFromWarehouse: filters.warehouseName.trim() },
					{ transferToWarehouse: filters.warehouseName.trim() },
				],
			}
		: buildDateMatch("transferDate", filters);

	const issueMatch = withWarehouseFilter(
		buildDateMatch("issueDate", filters),
		"issueFromWarehouse",
		filters.warehouseName,
	);

	const [
		totalItems,
		totalInwardEntries,
		totalDispatchEntries,
		totalTransferEntries,
		totalLabourIssueEntries,
		totalInwardQuantity,
		totalDispatchQuantity,
		totalTransferQuantity,
		totalLabourIssueQuantity,
	] = await Promise.all([
		Item.countDocuments(),
		WarehouseInward.countDocuments(inwardMatch),
		Dispatch.countDocuments(dispatchMatch),
		StockTransfer.countDocuments(transferMatch),
		IssueToLabour.countDocuments(issueMatch),
		sumNestedField(WarehouseInward, inwardMatch, "items", "itemsQuantity"),
		sumNestedField(Dispatch, dispatchMatch, "items", "dispatchQuantity"),
		sumNestedField(StockTransfer, transferMatch, "items", "dispatchQuantity"),
		sumNestedField(IssueToLabour, issueMatch, "items", "dispatchQuantity"),
	]);

	return {
		totalItems,
		totalInwardEntries,
		totalDispatchEntries,
		totalTransferEntries,
		totalLabourIssueEntries,
		totalInwardQuantity,
		totalDispatchQuantity,
		totalTransferQuantity,
		totalLabourIssueQuantity,
		netMovementQuantity:
			totalInwardQuantity -
			totalDispatchQuantity -
			totalTransferQuantity -
			totalLabourIssueQuantity,
		note: "This summary is derived from inward/dispatch/transfer/labour movement because the Inventory model file was not shared yet.",
	};
};

const getMastersSummary = async () => {
	const [
		categories,
		subCategories,
		items,
		customers,
		suppliers,
		warehouses,
		labours,
		units,
		gst,
		hsnCodes,
	] = await Promise.all([
		Category.countDocuments(),
		SubCategory.countDocuments(),
		Item.countDocuments(),
		Customer.countDocuments(),
		Supplier.countDocuments(),
		Warehouse.countDocuments(),
		Labour.countDocuments(),
		Unit.countDocuments(),
		GST.countDocuments(),
		HSNCode.countDocuments(),
	]);

	return {
		categories,
		subCategories,
		items,
		customers,
		suppliers,
		warehouses,
		labours,
		units,
		gst,
		hsnCodes,
	};
};

const getUsersSummary = async () => {
	const rows: Array<{ _id: string | null; count: number }> =
		await User.aggregate([
			{
				$group: {
					_id: "$userType",
					count: { $sum: 1 },
				},
			},
		]);

	return {
		totalUsers: rows.reduce((sum, row) => sum + row.count, 0),
		byUserType: rows.map((r) => ({
			userType: r._id || "UNKNOWN",
			count: r.count,
		})),
	};
};

const getPendingActions = async (filters: DashboardFilters) => {
	const dispatchMatch = withWarehouseFilter(
		buildDateMatch("dispatchDate", filters),
		"issuedFromWarehouseName",
		filters.warehouseName,
	);

	const transferMatch: MongoQuery = filters.warehouseName
		? {
				...buildDateMatch("transferDate", filters),
				$or: [
					{ transferFromWarehouse: filters.warehouseName.trim() },
					{ transferToWarehouse: filters.warehouseName.trim() },
				],
			}
		: buildDateMatch("transferDate", filters);

	const issueMatch = withWarehouseFilter(
		buildDateMatch("issueDate", filters),
		"issueFromWarehouse",
		filters.warehouseName,
	);

	const orderMatch = withWarehouseFilter(
		buildDateMatch("orderDate", filters),
		"dispatchFromWarehouseName",
		filters.warehouseName,
	);

	const [
		pendingDispatch,
		pendingTransfers,
		pendingLabourReturn,
		pendingSalesReturnInward,
		ordersRequestedForDispatch,
	] = await Promise.all([
		Dispatch.countDocuments({
			...dispatchMatch,
			dispatchStatus: "PENDING",
		}),
		StockTransfer.countDocuments({
			...transferMatch,
			status: { $in: ["PENDING", "DISPATCHED"] },
		}),
		IssueToLabour.countDocuments({
			...issueMatch,
			status: "ISSUED",
		}),
		Dispatch.countDocuments({
			...dispatchMatch,
			salesReturnInwardStatus: "PENDING",
		}),
		Order.countDocuments({
			...orderMatch,
			orderStatus: "REQUESTED_FOR_DISPATCH",
		}),
	]);

	return [
		{
			key: "PENDING_DISPATCH",
			label: "Pending Dispatch",
			count: pendingDispatch,
		},
		{
			key: "PENDING_TRANSFER",
			label: "Pending Transfer Completion",
			count: pendingTransfers,
		},
		{
			key: "PENDING_LABOUR_RETURN",
			label: "Pending Labour Return",
			count: pendingLabourReturn,
		},
		{
			key: "PENDING_SALES_RETURN_INWARD",
			label: "Pending Sales Return Inward",
			count: pendingSalesReturnInward,
		},
		{
			key: "ORDERS_REQUESTED_FOR_DISPATCH",
			label: "Orders Requested For Dispatch",
			count: ordersRequestedForDispatch,
		},
	].sort((a, b) => b.count - a.count);
};

const getRecentActivity = async (
	filters: DashboardFilters,
): Promise<RecentActivityRow[]> => {
	const [orders, dispatches, inwards, transfers, labours] = await Promise.all([
		Order.find(
			withWarehouseFilter(
				buildDateMatch("orderDate", filters),
				"dispatchFromWarehouseName",
				filters.warehouseName,
			),
		)
			.sort({ createdAt: -1 })
			.limit(5)
			.lean(),
		Dispatch.find(
			withWarehouseFilter(
				buildDateMatch("dispatchDate", filters),
				"issuedFromWarehouseName",
				filters.warehouseName,
			),
		)
			.sort({ createdAt: -1 })
			.limit(5)
			.lean(),
		WarehouseInward.find(
			withWarehouseFilter(
				buildDateMatch("inwardDate", filters),
				"warehouseName",
				filters.warehouseName,
			),
		)
			.sort({ createdAt: -1 })
			.limit(5)
			.lean(),
		StockTransfer.find(
			filters.warehouseName
				? {
						...buildDateMatch("transferDate", filters),
						$or: [
							{ transferFromWarehouse: filters.warehouseName.trim() },
							{ transferToWarehouse: filters.warehouseName.trim() },
						],
					}
				: buildDateMatch("transferDate", filters),
		)
			.sort({ createdAt: -1 })
			.limit(5)
			.lean(),
		IssueToLabour.find(
			withWarehouseFilter(
				buildDateMatch("issueDate", filters),
				"issueFromWarehouse",
				filters.warehouseName,
			),
		)
			.sort({ createdAt: -1 })
			.limit(5)
			.lean(),
	]);

	const rows: RecentActivityRow[] = [
		...orders.map((o: any) => ({
			id: String(o._id),
			module: "ORDER",
			refNo: o.orderNo || "-",
			date: o.orderDate || null,
			status: o.orderStatus || "-",
			partyName: o.customerName || "-",
			warehouseName: o.dispatchFromWarehouseName || "-",
			createdAt: o.createdAt || null,
		})),
		...dispatches.map((d: any) => ({
			id: String(d._id),
			module: "DISPATCH",
			refNo: d.dispatchNo || "-",
			date: d.dispatchDate || null,
			status: d.dispatchStatus || "-",
			partyName: d.customerName || "-",
			warehouseName: d.issuedFromWarehouseName || "-",
			createdAt: d.createdAt || null,
		})),
		...inwards.map((w: any) => ({
			id: String(w._id),
			module: "INWARD",
			refNo: w.grnNo || "-",
			date: w.inwardDate || null,
			status: w.inwardType || "-",
			partyName: w.supplierName || w.receivedBy || "-",
			warehouseName: w.warehouseName || "-",
			createdAt: w.createdAt || null,
		})),
		...transfers.map((t: any) => ({
			id: String(t._id),
			module: "STOCK_TRANSFER",
			refNo: t.transferNo || "-",
			date: t.transferDate || null,
			status: t.status || "-",
			partyName: t.transferToWarehouse || "-",
			warehouseName: t.transferFromWarehouse || "-",
			createdAt: t.createdAt || null,
		})),
		...labours.map((l: any) => ({
			id: String(l._id),
			module: "ISSUE_TO_LABOUR",
			refNo: l.issueNo || "-",
			date: l.issueDate || null,
			status: l.status || "-",
			partyName: l.labourName || "-",
			warehouseName: l.issueFromWarehouse || "-",
			createdAt: l.createdAt || null,
		})),
	];

	return rows
		.sort(
			(a, b) =>
				new Date(b.createdAt || 0).getTime() -
				new Date(a.createdAt || 0).getTime(),
		)
		.slice(0, 10);
};

const getTrendData = async (filters: DashboardFilters) => {
	const [
		ordersTrend,
		dispatchTrend,
		inwardTrend,
		enquiryTrend,
		quotationTrend,
	] = await Promise.all([
		buildTrend(Order, "orderDate", filters, "dispatchFromWarehouseName"),
		buildTrend(Dispatch, "dispatchDate", filters, "issuedFromWarehouseName"),
		buildTrend(WarehouseInward, "inwardDate", filters, "warehouseName"),
		buildTrend(Enquiry, "enquiryDate", filters),
		buildTrend(Quotation, "quotationDate", filters, "warehouseName"),
	]);

	return {
		ordersTrend,
		dispatchTrend,
		inwardTrend,
		enquiryTrend,
		quotationTrend,
	};
};

export const getDashboardSummary = async (filters: DashboardFilters) => {
	const [
		kpis,
		salesPipeline,
		warehousePipeline,
		inventorySummary,
		mastersSummary,
		usersSummary,
		pendingActions,
		recentActivity,
		trends,
	] = await Promise.all([
		getKPISummary(filters),
		getSalesPipeline(filters),
		getWarehousePipeline(filters),
		getInventorySummary(filters),
		getMastersSummary(),
		getUsersSummary(),
		getPendingActions(filters),
		getRecentActivity(filters),
		getTrendData(filters),
	]);

	return {
		filtersApplied: {
			from: filters.from || "",
			to: filters.to || "",
			warehouseName: filters.warehouseName || "",
		},
		kpis,
		salesPipeline,
		warehousePipeline,
		inventorySummary,
		mastersSummary,
		usersSummary,
		pendingActions,
		recentActivity,
		trends,
	};
};
