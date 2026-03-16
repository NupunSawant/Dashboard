// pages/inventory/reorder-level/ReorderLevelPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../../slices/store";
import BasicTable from "../../../components/Table/BasicTable";

import {
	fetchItemWiseReorderLevelsThunk,
	createItemWiseReorderLevelThunk,
	updateItemWiseReorderLevelThunk,
	deleteItemWiseReorderLevelThunk,
	fetchWarehouseWiseReorderLevelsThunk,
	createWarehouseWiseReorderLevelThunk,
	updateWarehouseWiseReorderLevelThunk,
	deleteWarehouseWiseReorderLevelThunk,
} from "../../../slices/Inventory/ReorderLevel/thunks";

import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { fetchSubCategoriesThunk } from "../../../slices/Masters/subCategories/thunks";
import { fetchItemsThunk } from "../../../slices/Masters/items/thunks";
import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";

import type {
	ItemWiseReorderLevel,
	WarehouseWiseReorderLevel,
} from "../../../types/Inventory/reorderLevel";
import { canCreate, canUpdate } from "../../../utils/permission";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

const theme = "#1a8376";

type TabKey = "ITEM_WISE" | "WAREHOUSE_WISE";

type ItemWiseForm = {
	id?: string;
	category: string;
	subCategory: string;
	itemName: string;
	itemCode: string;
	unit: string;
	reorderLevel: string;
};

type WarehouseWiseForm = {
	id?: string;
	warehouseName: string;
	category: string;
	subCategory: string;
	itemName: string;
	itemCode: string;
	unit: string;
	reorderLevel: string;
};

const emptyItemWiseForm: ItemWiseForm = {
	category: "",
	subCategory: "",
	itemName: "",
	itemCode: "",
	unit: "",
	reorderLevel: "",
};

const emptyWarehouseWiseForm: WarehouseWiseForm = {
	warehouseName: "",
	category: "",
	subCategory: "",
	itemName: "",
	itemCode: "",
	unit: "",
	reorderLevel: "",
};

const fmtDateTime = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return isNaN(d.getTime()) ? String(val) : d.toLocaleString();
	} catch {
		return String(val);
	}
};

const asText = (v: any) => String(v ?? "").trim();

const statusBadge = (status?: string) => {
	const s = String(status || "OUT_OF_STOCK");

	const map: Record<string, { bg: string; text: string; label: string }> = {
		IN_STOCK: { bg: "#f6ffed", text: "#389e0d", label: "In Stock" },
		LOW_STOCK: { bg: "#fff7e6", text: "#ad6800", label: "Low Stock" },
		OUT_OF_STOCK: { bg: "#fff1f0", text: "#cf1322", label: "Out of Stock" },
	};

	const cfg = map[s] || map.OUT_OF_STOCK;

	return (
		<span
			className='badge'
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 600,
				padding: "6px 10px",
				borderRadius: 999,
			}}
		>
			{cfg.label}
		</span>
	);
};

const getUserLabel = (user: any) => {
	if (!user) return "-";
	if (typeof user === "string") return user;
	return user?.name || user?.fullName || user?.userName || user?.email || "-";
};

const itemNameOf = (x: any) =>
	asText(x?.itemName ?? x?.itemsName ?? x?.name ?? x?.label ?? x?.title ?? "");
const itemCodeOf = (x: any) =>
	asText(x?.itemCode ?? x?.itemsCode ?? x?.code ?? x?.itemNo ?? "");
const itemUnitOf = (x: any) =>
	asText(x?.unit ?? x?.itemsUnit ?? x?.unitName ?? "");
const itemCategoryOf = (x: any) =>
	asText(
		x?.category ?? x?.itemsCategory ?? x?.categoryName ?? x?.itemCategory ?? "",
	);
const itemSubCategoryOf = (x: any) =>
	asText(
		x?.subCategory ??
			x?.itemsSubCategory ??
			x?.subCategoryName ??
			x?.itemSubCategory ??
			"",
	);
const warehouseNameOf = (x: any) =>
	asText(x?.warehouseName ?? x?.name ?? x?.warehouse ?? x?.label ?? "");

const csvEscape = (v: any) => {
	const s = String(v ?? "");
	if (s.includes(",") || s.includes('"') || s.includes("\n")) {
		return `"${s.replace(/"/g, '""')}"`;
	}
	return s;
};

const downloadCsv = (filename: string, rows: Record<string, any>[]) => {
	if (!rows.length) {
		toast.info("No rows to export");
		return;
	}

	const headers = Object.keys(rows[0]);
	const lines = [
		headers.join(","),
		...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
	];

	const blob = new Blob([lines.join("\n")], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};

export default function ReorderLevelPage() {
	const dispatch = useDispatch<AppDispatch>();

	const reorderState = useSelector(
		(s: RootState) => (s as any).reorderLevel,
	) as any;
	const categoriesState = useSelector(
		(s: RootState) => (s as any).categories,
	) as any;
	const subCategoriesState = useSelector(
		(s: RootState) => (s as any).subCategories,
	) as any;
	const itemsState = useSelector((s: RootState) => (s as any).items) as any;
	const warehousesState = useSelector(
		(s: RootState) => (s as any).warehouses,
	) as any;

	const {
		itemWiseRows = [],
		warehouseWiseRows = [],
		loadingItemWiseList = false,
		loadingWarehouseWiseList = false,
		saving = false,
		error = null,
	} = reorderState || {};

	const categories: any[] =
		categoriesState?.categories ||
		categoriesState?.list ||
		categoriesState?.data ||
		[];
	const subCategories: any[] =
		subCategoriesState?.subCategories ||
		subCategoriesState?.list ||
		subCategoriesState?.data ||
		[];
	const items: any[] =
		itemsState?.items || itemsState?.list || itemsState?.data || [];
	const warehouses: any[] =
		warehousesState?.warehouses ||
		warehousesState?.list ||
		warehousesState?.data ||
		[];

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "inventory", "reorderLevel");
	const allowUpdate = canUpdate(authUser, "inventory", "reorderLevel");

	const [activeTab, setActiveTab] = useState<TabKey>("ITEM_WISE");

	const [search, setSearch] = useState("");
	const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("");

	const [showItemWiseModal, setShowItemWiseModal] = useState(false);
	const [showWarehouseWiseModal, setShowWarehouseWiseModal] = useState(false);

	const [itemWiseForm, setItemWiseForm] =
		useState<ItemWiseForm>(emptyItemWiseForm);
	const [warehouseWiseForm, setWarehouseWiseForm] = useState<WarehouseWiseForm>(
		emptyWarehouseWiseForm,
	);

	const [deletingId, setDeletingId] = useState("");

	useEffect(() => {
		dispatch(fetchItemWiseReorderLevelsThunk());
		dispatch(fetchWarehouseWiseReorderLevelsThunk(""));
		dispatch(fetchCategoriesThunk() as any);
		dispatch(fetchSubCategoriesThunk() as any);
		dispatch(fetchItemsThunk() as any);
		dispatch(fetchWarehousesThunk() as any);
	}, [dispatch]);

	useEffect(() => {
		dispatch(fetchWarehouseWiseReorderLevelsThunk(selectedWarehouseFilter));
	}, [dispatch, selectedWarehouseFilter]);

	const categoryOptions = useMemo(() => {
		const seen = new Set<string>();
		return (categories || [])
			.map((c) => asText(c?.name ?? c?.categoryName ?? c?.label ?? c))
			.filter(Boolean)
			.filter((x) => {
				const k = x.toLowerCase();
				if (seen.has(k)) return false;
				seen.add(k);
				return true;
			});
	}, [categories]);

	const warehouseOptions = useMemo(() => {
		const seen = new Set<string>();
		return (warehouses || [])
			.map((w) => warehouseNameOf(w))
			.filter(Boolean)
			.filter((x) => {
				const k = x.toLowerCase();
				if (seen.has(k)) return false;
				seen.add(k);
				return true;
			});
	}, [warehouses]);

	const itemWiseSubCategoryOptions = useMemo(() => {
		const selectedCategory = asText(itemWiseForm.category).toLowerCase();
		const seen = new Set<string>();

		return (subCategories || [])
			.filter((sc) => {
				if (!selectedCategory) return true;
				const c = asText(
					sc?.category ?? sc?.categoryName ?? sc?.parentCategory ?? "",
				).toLowerCase();
				return c === selectedCategory;
			})
			.map((sc) => asText(sc?.name ?? sc?.subCategoryName ?? sc?.label ?? sc))
			.filter(Boolean)
			.filter((x) => {
				const k = x.toLowerCase();
				if (seen.has(k)) return false;
				seen.add(k);
				return true;
			});
	}, [subCategories, itemWiseForm.category]);

	const warehouseWiseSubCategoryOptions = useMemo(() => {
		const selectedCategory = asText(warehouseWiseForm.category).toLowerCase();
		const seen = new Set<string>();

		return (subCategories || [])
			.filter((sc) => {
				if (!selectedCategory) return true;
				const c = asText(
					sc?.category ?? sc?.categoryName ?? sc?.parentCategory ?? "",
				).toLowerCase();
				return c === selectedCategory;
			})
			.map((sc) => asText(sc?.name ?? sc?.subCategoryName ?? sc?.label ?? sc))
			.filter(Boolean)
			.filter((x) => {
				const k = x.toLowerCase();
				if (seen.has(k)) return false;
				seen.add(k);
				return true;
			});
	}, [subCategories, warehouseWiseForm.category]);

	const itemWiseItemOptions = useMemo(() => {
		const selectedCategory = asText(itemWiseForm.category).toLowerCase();
		const selectedSubCategory = asText(itemWiseForm.subCategory).toLowerCase();

		return (items || []).filter((it) => {
			const cat = itemCategoryOf(it).toLowerCase();
			const sub = itemSubCategoryOf(it).toLowerCase();

			if (selectedCategory && cat !== selectedCategory) return false;
			if (selectedSubCategory && sub !== selectedSubCategory) return false;

			return true;
		});
	}, [items, itemWiseForm.category, itemWiseForm.subCategory]);

	const warehouseWiseItemOptions = useMemo(() => {
		const selectedCategory = asText(warehouseWiseForm.category).toLowerCase();
		const selectedSubCategory = asText(
			warehouseWiseForm.subCategory,
		).toLowerCase();

		return (items || []).filter((it) => {
			const cat = itemCategoryOf(it).toLowerCase();
			const sub = itemSubCategoryOf(it).toLowerCase();

			if (selectedCategory && cat !== selectedCategory) return false;
			if (selectedSubCategory && sub !== selectedSubCategory) return false;

			return true;
		});
	}, [items, warehouseWiseForm.category, warehouseWiseForm.subCategory]);

	const filteredItemWiseRows = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return itemWiseRows as ItemWiseReorderLevel[];

		return (itemWiseRows as ItemWiseReorderLevel[]).filter((row) => {
			const text = [
				row?.itemName,
				row?.itemCode,
				row?.category,
				row?.subCategory,
				row?.unit,
				row?.status,
			]
				.map((x) => String(x ?? "").toLowerCase())
				.join(" ");

			return text.includes(q);
		});
	}, [itemWiseRows, search]);

	const openCreateItemWise = () => {
		setItemWiseForm(emptyItemWiseForm);
		setShowItemWiseModal(true);
	};

	const openEditItemWise = (row: ItemWiseReorderLevel) => {
		setItemWiseForm({
			id: String(row?.id || ""),
			category: asText(row?.category),
			subCategory: asText(row?.subCategory),
			itemName: asText(row?.itemName),
			itemCode: asText(row?.itemCode),
			unit: asText(row?.unit),
			reorderLevel: String(row?.reorderLevel ?? ""),
		});
		setShowItemWiseModal(true);
	};

	const openCreateWarehouseWise = () => {
		setWarehouseWiseForm({
			...emptyWarehouseWiseForm,
			warehouseName: selectedWarehouseFilter || "",
		});
		setShowWarehouseWiseModal(true);
	};

	const openEditWarehouseWise = (row: WarehouseWiseReorderLevel) => {
		setWarehouseWiseForm({
			id: String(row?.id || ""),
			warehouseName: asText(row?.warehouseName),
			category: asText(row?.category),
			subCategory: asText(row?.subCategory),
			itemName: asText(row?.itemName),
			itemCode: asText(row?.itemCode),
			unit: asText(row?.unit),
			reorderLevel: String(row?.reorderLevel ?? ""),
		});
		setShowWarehouseWiseModal(true);
	};

	const handleItemWiseItemSelect = (name: string) => {
		const picked = itemWiseItemOptions.find(
			(it) => itemNameOf(it).toLowerCase() === name.toLowerCase(),
		);

		setItemWiseForm((prev) => ({
			...prev,
			itemName: name,
			itemCode: itemCodeOf(picked),
			unit: itemUnitOf(picked),
		}));
	};

	const handleWarehouseWiseItemSelect = (name: string) => {
		const picked = warehouseWiseItemOptions.find(
			(it) => itemNameOf(it).toLowerCase() === name.toLowerCase(),
		);

		setWarehouseWiseForm((prev) => ({
			...prev,
			itemName: name,
			itemCode: itemCodeOf(picked),
			unit: itemUnitOf(picked),
		}));
	};

	const handleSaveItemWise = async () => {
		const payload = {
			category: itemWiseForm.category.trim(),
			subCategory: itemWiseForm.subCategory.trim(),
			itemName: itemWiseForm.itemName.trim(),
			itemCode: itemWiseForm.itemCode.trim(),
			unit: itemWiseForm.unit.trim(),
			reorderLevel: Number(itemWiseForm.reorderLevel || 0),
		};

		if (!payload.category) return toast.error("Category is required");
		if (!payload.subCategory) return toast.error("Sub Category is required");
		if (!payload.itemName) return toast.error("Item is required");
		if (!payload.itemCode) return toast.error("Item Code is required");
		if (!payload.unit) return toast.error("Unit is required");
		if (!Number.isFinite(payload.reorderLevel) || payload.reorderLevel < 0) {
			return toast.error("Valid reorder level is required");
		}

		try {
			if (itemWiseForm.id) {
				await dispatch(
					updateItemWiseReorderLevelThunk({
						id: itemWiseForm.id,
						payload,
					}) as any,
				).unwrap();
				toast.success("Item-wise reorder level updated");
			} else {
				await dispatch(
					createItemWiseReorderLevelThunk(payload) as any,
				).unwrap();
				toast.success("Item-wise reorder level created");
			}

			setShowItemWiseModal(false);
			setItemWiseForm(emptyItemWiseForm);
			dispatch(fetchItemWiseReorderLevelsThunk());
		} catch (e: any) {
			toast.error(e || "Failed to save item-wise reorder level");
		}
	};

	const handleSaveWarehouseWise = async () => {
		const payload = {
			warehouseName: warehouseWiseForm.warehouseName.trim(),
			category: warehouseWiseForm.category.trim(),
			subCategory: warehouseWiseForm.subCategory.trim(),
			itemName: warehouseWiseForm.itemName.trim(),
			itemCode: warehouseWiseForm.itemCode.trim(),
			unit: warehouseWiseForm.unit.trim(),
			reorderLevel: Number(warehouseWiseForm.reorderLevel || 0),
		};

		if (!payload.warehouseName)
			return toast.error("Warehouse Name is required");
		if (!payload.category) return toast.error("Category is required");
		if (!payload.subCategory) return toast.error("Sub Category is required");
		if (!payload.itemName) return toast.error("Item is required");
		if (!payload.itemCode) return toast.error("Item Code is required");
		if (!payload.unit) return toast.error("Unit is required");
		if (!Number.isFinite(payload.reorderLevel) || payload.reorderLevel < 0) {
			return toast.error("Valid reorder level is required");
		}

		try {
			if (warehouseWiseForm.id) {
				await dispatch(
					updateWarehouseWiseReorderLevelThunk({
						id: warehouseWiseForm.id,
						payload,
					}) as any,
				).unwrap();
				toast.success("Warehouse-wise reorder level updated");
			} else {
				await dispatch(
					createWarehouseWiseReorderLevelThunk(payload) as any,
				).unwrap();
				toast.success("Warehouse-wise reorder level created");
			}

			setShowWarehouseWiseModal(false);
			setWarehouseWiseForm(emptyWarehouseWiseForm);
			dispatch(fetchWarehouseWiseReorderLevelsThunk(selectedWarehouseFilter));
		} catch (e: any) {
			toast.error(e || "Failed to save warehouse-wise reorder level");
		}
	};

	const handleDeleteItemWise = async (row: ItemWiseReorderLevel) => {
		const id = String(row?.id || "");
		if (!id) return;

		const ok = window.confirm("Delete this item-wise reorder level?");
		if (!ok) return;

		try {
			setDeletingId(id);
			await dispatch(deleteItemWiseReorderLevelThunk(id) as any).unwrap();
			toast.success("Item-wise reorder level deleted");
			dispatch(fetchItemWiseReorderLevelsThunk());
		} catch (e: any) {
			toast.error(e || "Failed to delete item-wise reorder level");
		} finally {
			setDeletingId("");
		}
	};

	const handleDeleteWarehouseWise = async (row: WarehouseWiseReorderLevel) => {
		const id = String(row?.id || "");
		if (!id) return;

		const ok = window.confirm("Delete this warehouse-wise reorder level?");
		if (!ok) return;

		try {
			setDeletingId(id);
			await dispatch(deleteWarehouseWiseReorderLevelThunk(id) as any).unwrap();
			toast.success("Warehouse-wise reorder level deleted");
			dispatch(fetchWarehouseWiseReorderLevelsThunk(selectedWarehouseFilter));
		} catch (e: any) {
			toast.error(e || "Failed to delete warehouse-wise reorder level");
		} finally {
			setDeletingId("");
		}
	};

	const exportItemWise = () => {
		downloadCsv(
			"item-wise-reorder-level.csv",
			filteredItemWiseRows.map((row) => ({
				"Sr No": row?.srNo ?? "",
				"Item Name": row?.itemName ?? "",
				"Item Code": row?.itemCode ?? "",
				Category: row?.category ?? "",
				"Sub Category": row?.subCategory ?? "",
				Unit: row?.unit ?? "",
				"Total Stock": row?.totalStock ?? 0,
				"Reorder Level": row?.reorderLevel ?? 0,
				Status: row?.status ?? "",
				"Created By": getUserLabel(row?.createdBy),
				"Created At": fmtDateTime(row?.createdAt),
				"Updated By": getUserLabel(row?.updatedBy),
				"Updated At": fmtDateTime(row?.updatedAt),
			})),
		);
	};

	const exportWarehouseWise = () => {
		downloadCsv(
			"warehouse-wise-reorder-level.csv",
			(warehouseWiseRows as WarehouseWiseReorderLevel[]).map((row) => ({
				"Sr No": row?.srNo ?? "",
				"Warehouse Name": row?.warehouseName ?? "",
				"Item Name": row?.itemName ?? "",
				"Item Code": row?.itemCode ?? "",
				Category: row?.category ?? "",
				"Sub Category": row?.subCategory ?? "",
				Unit: row?.unit ?? "",
				"Warehouse Stock": row?.warehouseStock ?? 0,
				"Reorder Level": row?.reorderLevel ?? 0,
				Status: row?.status ?? "",
				"Created By": getUserLabel(row?.createdBy),
				"Created At": fmtDateTime(row?.createdAt),
				"Updated By": getUserLabel(row?.updatedBy),
				"Updated At": fmtDateTime(row?.updatedAt),
			})),
		);
	};

	const itemCol = createColumnHelper<ItemWiseReorderLevel>();
	const warehouseCol = createColumnHelper<WarehouseWiseReorderLevel>();

	const itemWiseColumns = useMemo(
		() => [
			itemCol.accessor((row, idx) => row?.srNo || idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			itemCol.accessor("itemName", {
				header: "Item Name",
				cell: (i) => i.getValue() || "-",
			}),
			itemCol.accessor("itemCode", {
				header: "Item Code",
				cell: (i) => i.getValue() || "-",
			}),
			itemCol.accessor("category", {
				header: "Category",
				cell: (i) => i.getValue() || "-",
			}),
			itemCol.accessor("subCategory", {
				header: "Sub Category",
				cell: (i) => i.getValue() || "-",
			}),
			itemCol.accessor("unit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			itemCol.accessor("totalStock", {
				header: "Total Stock",
				cell: (i) => String(i.getValue() ?? 0),
			}),
			itemCol.accessor("reorderLevel", {
				header: "Reorder Level",
				cell: (i) => String(i.getValue() ?? 0),
			}),
			itemCol.accessor("status", {
				header: "Status",
				cell: (i) => statusBadge(i.getValue()),
			}),
			itemCol.accessor(
				(row) =>
					row?.createdBy && row?.createdAt
						? `${getUserLabel(row.createdBy)} - ${fmtDateTime(row.createdAt)}`
						: getUserLabel(row?.createdBy) !== "-"
							? getUserLabel(row?.createdBy)
							: fmtDateTime(row?.createdAt),
				{
					id: "createdByDate",
					header: "Created By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			itemCol.accessor(
				(row) =>
					row?.updatedBy && row?.updatedAt
						? `${getUserLabel(row.updatedBy)} - ${fmtDateTime(row.updatedAt)}`
						: getUserLabel(row?.updatedBy) !== "-"
							? getUserLabel(row?.updatedBy)
							: fmtDateTime(row?.updatedAt),
				{
					id: "updatedByDate",
					header: "Updated By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			itemCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const original = row.original;
					const rowId = String(original?.id || "");
					const busy = deletingId === rowId;

					const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

					const open = Boolean(anchorEl);
					const menuItemStyle = {
						fontSize: "14px",
						borderRadius: "6px",
						display: "flex",
						alignItems: "center",
						gap: "10px",
						padding: "8px 12px",
						minHeight: "36px",
						fontWeight: 500,

						"& i": {
							fontSize: "18px",
							width: "18px",
							textAlign: "center",
						},

						"&:hover": {
							background: "#f5f7f9",
						},

						"&.Mui-disabled": {
							opacity: 0.5,
						},
					};

					return (
						<>
							<IconButton
								size='small'
								onClick={(e) => setAnchorEl(e.currentTarget)}
								sx={{
									color: theme,
									background: "#edf6f5",
									borderRadius: "8px",
									width: 32,
									height: 32,
									transition: "all .15s ease",
									"&:hover": {
										background: "#dff1ef",
									},
								}}
							>
								<i className='ri-more-2-fill' style={{ fontSize: 18 }} />
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								open={open}
								disableScrollLock
								onClose={() => setAnchorEl(null)}
								anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
								transformOrigin={{ vertical: "top", horizontal: "right" }}
								PaperProps={{
									sx: {
										borderRadius: "10px",
										boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
										minWidth: 200,
										padding: "4px",
										border: "1px solid #f1f1f1",
									},
								}}
							>
								{allowUpdate && (
									<MenuItem
										sx={{ ...menuItemStyle, color: theme }}
										onClick={() => openEditItemWise(original)}
										title='Edit'
									>
										<i className='ri-pencil-line' />
										Edit
									</MenuItem>
								)}
								<Divider variant='middle' component='li' flexItem={true} />

								{allowUpdate && (
									<MenuItem
										sx={{ ...menuItemStyle, color: "#cf1322" }}
										disabled={busy}
										onClick={() => handleDeleteItemWise(original)}
										title='Delete'
									>
										<i className='ri-delete-bin-line' />
										Delete
									</MenuItem>
								)}
							</Menu>
						</>
					);
				},
			}),
		],
		[deletingId],
	);

	const warehouseWiseColumns = useMemo(
		() => [
			warehouseCol.accessor((row, idx) => row?.srNo || idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			warehouseCol.accessor("itemName", {
				header: "Item Name",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("itemCode", {
				header: "Item Code",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("category", {
				header: "Category",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("subCategory", {
				header: "Sub Category",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("unit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("warehouseName", {
				header: "Warehouse Name",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("warehouseStock", {
				header: "Warehouse Stock",
				cell: (i) => String(i.getValue() ?? 0),
			}),
			warehouseCol.accessor("reorderLevel", {
				header: "Reorder Level",
				cell: (i) => String(i.getValue() ?? 0),
			}),
			warehouseCol.accessor("status", {
				header: "Status",
				cell: (i) => statusBadge(i.getValue()),
			}),
			warehouseCol.accessor(
				(row) =>
					row?.createdBy && row?.createdAt
						? `${getUserLabel(row.createdBy)} - ${fmtDateTime(row.createdAt)}`
						: getUserLabel(row?.createdBy) !== "-"
							? getUserLabel(row?.createdBy)
							: fmtDateTime(row?.createdAt),
				{
					id: "createdByDate",
					header: "Created By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			warehouseCol.accessor(
				(row) =>
					row?.updatedBy && row?.updatedAt
						? `${getUserLabel(row.updatedBy)} - ${fmtDateTime(row.updatedAt)}`
						: getUserLabel(row?.updatedBy) !== "-"
							? getUserLabel(row?.updatedBy)
							: fmtDateTime(row?.updatedAt),
				{
					id: "updatedByDate",
					header: "Updated By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			warehouseCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const original = row.original;
					const rowId = String(original?.id || "");
					const busy = deletingId === rowId;

					const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

					const open = Boolean(anchorEl);
					const menuItemStyle = {
						fontSize: "14px",
						borderRadius: "6px",
						display: "flex",
						alignItems: "center",
						gap: "10px",
						padding: "8px 12px",
						minHeight: "36px",
						fontWeight: 500,

						"& i": {
							fontSize: "18px",
							width: "18px",
							textAlign: "center",
						},

						"&:hover": {
							background: "#f5f7f9",
						},

						"&.Mui-disabled": {
							opacity: 0.5,
						},
					};

					return (
						<>
							<IconButton
								size='small'
								onClick={(e) => setAnchorEl(e.currentTarget)}
								sx={{
									color: theme,
									background: "#edf6f5",
									borderRadius: "8px",
									width: 32,
									height: 32,
									transition: "all .15s ease",
									"&:hover": {
										background: "#dff1ef",
									},
								}}
							>
								<i className='ri-more-2-fill' style={{ fontSize: 18 }} />
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								open={open}
								disableScrollLock
								onClose={() => setAnchorEl(null)}
								anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
								transformOrigin={{ vertical: "top", horizontal: "right" }}
								PaperProps={{
									sx: {
										borderRadius: "10px",
										boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
										minWidth: 200,
										padding: "4px",
										border: "1px solid #f1f1f1",
									},
								}}
							>
								{allowUpdate && (
									<MenuItem
										sx={{ ...menuItemStyle, color: theme }}
										onClick={() => openEditWarehouseWise(original)}
										title='Edit'
									>
										<i className='ri-pencil-line' />
										Edit
									</MenuItem>
								)}

								<Divider variant='middle' component='li' flexItem={true} />
								{allowUpdate && (
									<MenuItem
										sx={{ ...menuItemStyle, color: "#cf1322" }}
										disabled={busy}
										onClick={() => handleDeleteWarehouseWise(original)}
										title='Delete'
									>
										<i className='ri-delete-bin-line' />
										Delete
									</MenuItem>
								)}
							</Menu>
						</>
					);
				},
			}),
		],
		[deletingId],
	);

	return (
		<>
			<style>{`
				.reorder-tabs {
					display: flex;
					gap: 22px;
					align-items: center;
					border-bottom: 1px solid #e9ebec;
					padding: 6px 2px 0 2px;
					margin-bottom: 14px;
				}

				.reorder-tab-btn {
					border: none;
					background: transparent;
					padding: 10px 0;
					font-weight: 700;
					font-size: 14px;
					color: #495057;
					position: relative;
				}

				.reorder-tab-btn.active {
					color: ${theme};
				}

				.reorder-tab-btn.active::after {
					content: "";
					position: absolute;
					left: 0;
					right: 0;
					bottom: -1px;
					height: 3px;
					background: ${theme};
					border-radius: 6px;
				}
			`}</style>

			<div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2'>
				<h4 className='mb-0 fw-bold' style={{ color: "#111" }}>
					Reorder Level
				</h4>

				<div className='d-flex gap-2 align-items-center'>
					<Button
						variant='light'
						onClick={() => {
							dispatch(fetchItemWiseReorderLevelsThunk());
							dispatch(
								fetchWarehouseWiseReorderLevelsThunk(selectedWarehouseFilter),
							);
						}}
						style={{
							border: "1px solid #e9ebec",
							fontSize: "13px",
							borderRadius: "6px",
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
						}}
					>
						<i className='ri-refresh-line' /> Refresh
					</Button>
				</div>
			</div>

			<div className='reorder-tabs'>
				<button
					className={`reorder-tab-btn ${
						activeTab === "ITEM_WISE" ? "active" : ""
					}`}
					onClick={() => setActiveTab("ITEM_WISE")}
					type='button'
				>
					Item Wise
				</button>

				<button
					className={`reorder-tab-btn ${
						activeTab === "WAREHOUSE_WISE" ? "active" : ""
					}`}
					onClick={() => setActiveTab("WAREHOUSE_WISE")}
					type='button'
				>
					Warehouse Wise
				</button>
			</div>

			{error && <Alert variant='danger'>{error}</Alert>}

			{activeTab === "ITEM_WISE" ? (
				<>
					<div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3'>
						<div style={{ minWidth: 260, maxWidth: 320 }}>
							<Form.Control
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder='Search item / code / category / sub category'
							/>
						</div>

						<div className='d-flex gap-2 align-items-center'>
							{allowCreate && (
								<Button
									onClick={openCreateItemWise}
									style={{
										background: theme,
										border: "none",
										fontSize: "13px",
										borderRadius: "6px",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<i className='ri-add-line' /> Define Reorder Level
								</Button>
							)}

							<Button
								variant='light'
								onClick={exportItemWise}
								style={{
									border: "1px solid #e9ebec",
									fontSize: "13px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								<i className='ri-upload-2-line' /> Export
							</Button>
						</div>
					</div>

					{loadingItemWiseList ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<BasicTable
							data={filteredItemWiseRows}
							columns={itemWiseColumns}
							title='Item Wise Reorder Level'
						/>
					)}
				</>
			) : (
				<>
					<div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3'>
						<div style={{ minWidth: 260, maxWidth: 320 }}>
							<Form.Select
								value={selectedWarehouseFilter}
								onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
							>
								<option value=''>All Warehouses</option>
								{warehouseOptions.map((w) => (
									<option key={w} value={w}>
										{w}
									</option>
								))}
							</Form.Select>
						</div>

						<div className='d-flex gap-2 align-items-center'>
							{allowCreate && (
								<Button
									onClick={openCreateWarehouseWise}
									style={{
										background: theme,
										border: "none",
										fontSize: "13px",
										borderRadius: "6px",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<i className='ri-add-line' /> Define Reorder Level
								</Button>
							)}

							<Button
								variant='light'
								onClick={exportWarehouseWise}
								style={{
									border: "1px solid #e9ebec",
									fontSize: "13px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								<i className='ri-upload-2-line' /> Export
							</Button>
						</div>
					</div>

					{loadingWarehouseWiseList ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<BasicTable
							data={warehouseWiseRows || []}
							columns={warehouseWiseColumns}
							title='Warehouse Wise Reorder Level'
						/>
					)}
				</>
			)}

			{/* Item Wise Modal */}
			<Modal
				show={showItemWiseModal}
				onHide={() => !saving && setShowItemWiseModal(false)}
				centered
				backdrop='static'
				size='lg'
			>
				<Modal.Header closeButton={!saving}>
					<Modal.Title>
						{itemWiseForm.id
							? "Edit Item Wise Reorder Level"
							: "Define Reorder Level"}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Row className='g-3'>
						<Col md={6}>
							<Form.Label>Category</Form.Label>
							<Form.Select
								value={itemWiseForm.category}
								onChange={(e) =>
									setItemWiseForm((prev) => ({
										...prev,
										category: e.target.value,
										subCategory: "",
										itemName: "",
										itemCode: "",
										unit: "",
									}))
								}
							>
								<option value=''>Select Category</option>
								{categoryOptions.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</Form.Select>
						</Col>

						<Col md={6}>
							<Form.Label>Sub Category</Form.Label>
							<Form.Select
								value={itemWiseForm.subCategory}
								onChange={(e) =>
									setItemWiseForm((prev) => ({
										...prev,
										subCategory: e.target.value,
										itemName: "",
										itemCode: "",
										unit: "",
									}))
								}
							>
								<option value=''>Select Sub Category</option>
								{itemWiseSubCategoryOptions.map((sc) => (
									<option key={sc} value={sc}>
										{sc}
									</option>
								))}
							</Form.Select>
						</Col>

						<Col md={6}>
							<Form.Label>Item</Form.Label>
							<Form.Select
								value={itemWiseForm.itemName}
								onChange={(e) => handleItemWiseItemSelect(e.target.value)}
							>
								<option value=''>Select Item</option>
								{itemWiseItemOptions.map((it, idx) => {
									const name = itemNameOf(it);
									return (
										<option key={`${name}-${idx}`} value={name}>
											{name}
										</option>
									);
								})}
							</Form.Select>
						</Col>

						<Col md={3}>
							<Form.Label>Item Code</Form.Label>
							<Form.Control value={itemWiseForm.itemCode} readOnly />
						</Col>

						<Col md={3}>
							<Form.Label>Unit</Form.Label>
							<Form.Control value={itemWiseForm.unit} readOnly />
						</Col>

						<Col md={6}>
							<Form.Label>Reorder Level</Form.Label>
							<Form.Control
								type='number'
								min={0}
								value={itemWiseForm.reorderLevel}
								onChange={(e) =>
									setItemWiseForm((prev) => ({
										...prev,
										reorderLevel: e.target.value,
									}))
								}
								placeholder='Enter reorder level'
							/>
						</Col>
					</Row>
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant='light'
						disabled={saving}
						onClick={() => setShowItemWiseModal(false)}
					>
						Cancel
					</Button>
					<Button
						disabled={saving}
						onClick={handleSaveItemWise}
						style={{ background: theme, border: "none" }}
					>
						{saving ? "Saving..." : itemWiseForm.id ? "Update" : "Create"}
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Warehouse Wise Modal */}
			<Modal
				show={showWarehouseWiseModal}
				onHide={() => !saving && setShowWarehouseWiseModal(false)}
				centered
				backdrop='static'
				size='lg'
			>
				<Modal.Header closeButton={!saving}>
					<Modal.Title>
						{warehouseWiseForm.id
							? "Edit Warehouse Wise Reorder Level"
							: "Define Reorder Level"}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Row className='g-3'>
						<Col md={6}>
							<Form.Label>Warehouse Name</Form.Label>
							<Form.Select
								value={warehouseWiseForm.warehouseName}
								onChange={(e) =>
									setWarehouseWiseForm((prev) => ({
										...prev,
										warehouseName: e.target.value,
									}))
								}
							>
								<option value=''>Select Warehouse</option>
								{warehouseOptions.map((w) => (
									<option key={w} value={w}>
										{w}
									</option>
								))}
							</Form.Select>
						</Col>

						<Col md={6}>
							<Form.Label>Category</Form.Label>
							<Form.Select
								value={warehouseWiseForm.category}
								onChange={(e) =>
									setWarehouseWiseForm((prev) => ({
										...prev,
										category: e.target.value,
										subCategory: "",
										itemName: "",
										itemCode: "",
										unit: "",
									}))
								}
							>
								<option value=''>Select Category</option>
								{categoryOptions.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</Form.Select>
						</Col>

						<Col md={6}>
							<Form.Label>Sub Category</Form.Label>
							<Form.Select
								value={warehouseWiseForm.subCategory}
								onChange={(e) =>
									setWarehouseWiseForm((prev) => ({
										...prev,
										subCategory: e.target.value,
										itemName: "",
										itemCode: "",
										unit: "",
									}))
								}
							>
								<option value=''>Select Sub Category</option>
								{warehouseWiseSubCategoryOptions.map((sc) => (
									<option key={sc} value={sc}>
										{sc}
									</option>
								))}
							</Form.Select>
						</Col>

						<Col md={6}>
							<Form.Label>Item</Form.Label>
							<Form.Select
								value={warehouseWiseForm.itemName}
								onChange={(e) => handleWarehouseWiseItemSelect(e.target.value)}
							>
								<option value=''>Select Item</option>
								{warehouseWiseItemOptions.map((it, idx) => {
									const name = itemNameOf(it);
									return (
										<option key={`${name}-${idx}`} value={name}>
											{name}
										</option>
									);
								})}
							</Form.Select>
						</Col>

						<Col md={3}>
							<Form.Label>Item Code</Form.Label>
							<Form.Control value={warehouseWiseForm.itemCode} readOnly />
						</Col>

						<Col md={3}>
							<Form.Label>Unit</Form.Label>
							<Form.Control value={warehouseWiseForm.unit} readOnly />
						</Col>

						<Col md={6}>
							<Form.Label>Reorder Level</Form.Label>
							<Form.Control
								type='number'
								min={0}
								value={warehouseWiseForm.reorderLevel}
								onChange={(e) =>
									setWarehouseWiseForm((prev) => ({
										...prev,
										reorderLevel: e.target.value,
									}))
								}
								placeholder='Enter reorder level'
							/>
						</Col>
					</Row>
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant='light'
						disabled={saving}
						onClick={() => setShowWarehouseWiseModal(false)}
					>
						Cancel
					</Button>
					<Button
						disabled={saving}
						onClick={handleSaveWarehouseWise}
						style={{ background: theme, border: "none" }}
					>
						{saving ? "Saving..." : warehouseWiseForm.id ? "Update" : "Create"}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
