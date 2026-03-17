// SupplierList.tsx

import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchSuppliersThunk } from "../../../slices/Masters/suppliers/thunks";
import type { Supplier } from "../../../types/Masters/supplier";
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

export default function SupplierList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { suppliers, loadingList, error } = useSelector(
		(s: RootState) => s.suppliers,
	);

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "masters", "suppliers");
	const allowUpdate = canUpdate(authUser, "masters", "suppliers");

	useEffect(() => {
		dispatch(fetchSuppliersThunk());
	}, [dispatch]);

	const handleExport = () => {
		const rows = (suppliers || []).map((supplier) => [
			supplier.name,
			supplier.code,
			supplier.email,
			supplier.phone,
			supplier.gstNo,
			supplier.address,
			supplier.city,
			supplier.state,
			supplier.pincode,
			supplier.contactPerson,
			supplier.contactPersonPhone,
			fmtDateTime(supplier.createdAt),
			pickUserName(supplier.createdBy),
			fmtDateTime(supplier.updatedAt),
			pickUserName(supplier.updatedBy),
		]);

		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		downloadCsv(
			`suppliers_${yyyy}-${mm}-${dd}.csv`,
			[
				"Supplier Name",
				"Supplier Code",
				"Email",
				"Contact No.",
				"GST No.",
				"Address",
				"City",
				"State",
				"Pincode",
				"Contact Person Name",
				"Contact Person Phone",
				"Created At",
				"Created By",
				"Updated At",
				"Updated By",
			],
			rows,
		);
		if ((suppliers || []).length) {
			toast.success("Suppliers exported successfully");
		}
	};

	const col = createColumnHelper<Supplier>();

	const columns = useMemo(
		() => [
			col.accessor("name", {
				header: "Supplier Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("code", {
				header: "Supplier Code",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("email", {
				header: "Email",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("phone", {
				header: "Contact No.",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("gstNo", {
				header: "GST No.",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("address", {
				header: "Address",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("city", {
				header: "City",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("state", {
				header: "State",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("pincode", {
				header: "Pincode",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("contactPerson", {
				header: "Contact Person Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("contactPersonPhone", {
				header: "Contact Person Phone",
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
					return allowUpdate ? (
						<Button
							size='sm'
							disabled={!id}
							onClick={() => nav(`/masters/suppliers/${id}/edit`)}
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
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : (
				<BasicTable
					columns={columns}
					data={suppliers || []}
					title='Suppliers'
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
									onClick={() => nav("/masters/suppliers/new")}
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
									<i className='ri-add-circle-line' /> Add Supplier
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
