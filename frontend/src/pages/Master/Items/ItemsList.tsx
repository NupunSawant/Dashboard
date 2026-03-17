import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchItemsThunk } from "../../../slices/Masters/items/thunks";
import type { Item } from "../../../types/Masters/item";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { canCreate, canUpdate } from "../../../utils/permission";
import { toast } from "react-toastify";

const fmtDateTime = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleString();
	} catch {
		return String(val);
	}
};

const pickUserName = (val: any) => {
	if (!val) return "-";
	if (typeof val === "object") {
		return (
			val.name ||
			`${val.firstName || ""} ${val.lastName || ""}`.trim() ||
			val.email ||
			"-"
		);
	}
	return String(val);
};

const escapeCsvValue = (value: any) => {
	if (value === null || value === undefined) return "";
	const str = String(value).replace(/"/g, '""');
	return `"${str}"`;
};

const downloadCsv = (fileName: string, headers: string[], rows: any[][]) => {
	if (!rows.length) {
		toast.info("No data available to export");
		return;
	}

	const csvContent = [
		headers.map(escapeCsvValue).join(","),
		...rows.map((row) => row.map(escapeCsvValue).join(",")),
	].join("\n");

	const blob = new Blob([csvContent], {
		type: "text/csv;charset=utf-8;",
	});

	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", fileName);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

export default function ItemsList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { items, loadingList, error } = useSelector((s: RootState) => s.items);

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "masters", "item");
	const allowUpdate = canUpdate(authUser, "masters", "item");

	useEffect(() => {
		dispatch(fetchItemsThunk());
	}, [dispatch]);

	const handleExport = () => {
		const rows = (items || []).map((i) => [
			i.itemName,
			i.itemCode,
			i.category,
			i.subCategory,
			i.gst,
			i.unit,
			i.remark,
			fmtDateTime(i.createdAt),
			pickUserName(i.createdBy),
			fmtDateTime(i.updatedAt),
		]);
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		downloadCsv(
			`items_${yyyy}-${mm}-${dd}.csv`,
			[
				"Item Name",
				"Item Code",
				"Category",
				"Sub Category",
				"GST",
				"Unit",
				"Remark",
				"Created At",
				"Created By",
				"Updated At",
				"Updated By",
			],
			rows,
		);

		if ((items || []).length) {
			toast.success("Items exported successfully");
		}
	};

	const col = createColumnHelper<Item>();

	const columns = useMemo(
		() => [
			col.accessor("itemName", {
				header: "Item Name",
				cell: (i) => i.getValue(),
			}),
			col.accessor("itemCode", {
				header: "Item Code",
				cell: (i) => i.getValue(),
			}),
			col.accessor("category", {
				header: "Category",
				cell: (i) => i.getValue(),
			}),
			col.accessor("subCategory", {
				header: "Sub Category",
				cell: (i) => i.getValue(),
			}),
			col.accessor("gst", {
				header: "GST",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("unit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("remark", {
				header: "Remark",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("createdAt", {
				header: "Created By/Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			col.accessor("updatedAt", {
				header: "Updated By/Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			col.accessor("id", {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const id = i.getValue();
					return allowUpdate ? (
						<Button
							size='sm'
							style={{
								background: "#eaf4f2",
								border: "none",
								color: "#1a8376",
								borderRadius: "6px",
								padding: "4px 10px",
							}}
							disabled={!id}
							onClick={() => nav(`/masters/items/${id}/edit`)}
						>
							<i className='ri-pencil-line'></i>
						</Button>
					) : null;
				},
			}),
		],
		[col, nav],
	);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			{loadingList ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: "#1a8376" }} />
				</div>
			) : (
				<BasicTable
					columns={columns}
					data={items || []}
					title='Items'
					rightActions={
						<div className='d-flex gap-2'>
							<Button
								className='export-btn'
								onClick={handleExport}
								style={{
									border: "1px solid #e9ebec",
									color: "#495057",
									background: "#fff",
									fontSize: "13px",
									padding: "6px 14px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
								}}
								variant='light'
							>
								<i className='ri-upload-2-line'></i> Export
							</Button>

							{allowCreate && (
								<Button
									onClick={() => nav("/masters/items/new")}
									style={{
										background: "#1a8376",
										border: "none",
										borderRadius: "6px",
										fontSize: "13px",
										padding: "6px 14px",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<i className='ri-add-circle-line'></i> Add Item
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
