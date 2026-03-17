// WarehouseList.tsx

import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";
import type { Warehouse } from "../../../types/Masters/warehouse";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { canCreate, canUpdate } from "../../../utils/permission";
import { toast } from "react-toastify";

const theme = "#1a8376";

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

export default function WarehouseList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { warehouses, loadingList, error } = useSelector(
		(s: RootState) => s.warehouses,
	);

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "masters", "warehouse");
	const allowUpdate = canUpdate(authUser, "masters", "warehouse");

	useEffect(() => {
		dispatch(fetchWarehousesThunk());
	}, [dispatch]);

	const handleExport = () => {
		const rows = (warehouses || []).map((warehouse) => [
			warehouse.warehouseName,

			warehouse.warehouseType,
			warehouse.warehouseAddress,
			warehouse.warehouseCity,
			warehouse.warehouseState,
			warehouse.warehouseCountry,
			warehouse.warehousePincode,
			warehouse.remarks,
			fmtDateTime(warehouse.createdAt),
			pickUserName(warehouse.createdBy),
			fmtDateTime(warehouse.updatedAt),
			pickUserName(warehouse.updatedBy),
		]);

		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		downloadCsv(
			`warehouses_${yyyy}-${mm}-${dd}.csv`,
			[
				"Warehouse Name",
				"Warehouse Type",
				"Address",
				"City",
				"State",
				"Country",
				"Pincode",
				"Remarks",
				"Created At",
				"Created By",
				"Updated At",
				"Updated By",
			],
			rows,
		);

		if ((warehouses || []).length) {
			toast.success("Warehouses exported successfully");
		}
	};

	const col = createColumnHelper<Warehouse>();

	const columns = useMemo(
		() => [
			col.accessor("warehouseName", {
				header: "Warehouse Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("warehouseType", {
				header: "Warehouse Type",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("warehouseAddress", {
				header: "Address",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("warehouseCity", {
				header: "City",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("warehouseState", {
				header: "State",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("warehouseCountry", {
				header: "Country",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("warehousePincode", {
				header: "Pincode",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("remarks", {
				header: "Remarks",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("createdAt", {
				header: "Created At",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			col.accessor("createdBy", {
				header: "Created By",
				cell: (i) => pickUserName(i.getValue()),
			}),
			col.accessor("updatedAt", {
				header: "Updated At",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			col.accessor("updatedBy", {
				header: "Updated By",
				cell: (i) => pickUserName(i.getValue()),
			}),

			//   action column — ALWAYS last
			col.accessor("id", {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const id = i.getValue();
					return (
						allowUpdate && (
							<Button
								size='sm'
								disabled={!id}
								onClick={() => nav(`/masters/warehouses/${id}/edit`)}
								style={{
									background: "#eaf4f2",
									border: "none",
									color: theme,
									borderRadius: "6px",
									padding: "4px 10px",
								}}
							>
								<i className='ri-pencil-line' />
							</Button>
						)
					);
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
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : (
				<BasicTable
					columns={columns}
					data={warehouses || []}
					title='Warehouses'
					rightActions={
						<div className='d-flex gap-2'>
							<Button
								variant='light'
								onClick={handleExport}
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
							{allowCreate && (
								<Button
									onClick={() => nav("/masters/warehouses/new")}
									style={{
										background: theme,
										border: "none",
										borderRadius: "6px",
										fontSize: "13px",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<i className='ri-add-circle-line' /> Add Warehouse
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
