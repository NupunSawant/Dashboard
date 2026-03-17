// customerList.tsx

import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchCustomersThunk } from "../../../slices/Masters/customers/thunks";
import type { Customer } from "../../../types/Masters/customer";
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

export default function CustomersList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { customers, loadingList, error } = useSelector(
		(s: RootState) => s.customers,
	);

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "masters", "customer");
	const allowUpdate = canUpdate(authUser, "masters", "customer");

	useEffect(() => {
		dispatch(fetchCustomersThunk());
	}, [dispatch]);

	const handleExport = () => {
		const rows = (customers || []).map((c) => [
			c.customerName,
			c.companyName,
			c.customerType,
			c.customerEmail,
			c.customerPhone,
			c.customerAadhar,
			c.customerGst,
			c.customerContactPersonName,
			c.customerContactPersonPhone,
			c.customerAddress,
			c.customerState,
			c.customerCity,
			c.customerPincode,
			fmtDateTime(c.createdAt),
			pickUserName(c.createdBy),
			fmtDateTime(c.updatedAt),
			pickUserName(c.updatedBy),
		]);

		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		downloadCsv(
			`customers_${yyyy}-${mm}-${dd}.csv`,
			[
				"Customer",
				"Type",
				"Email",
				"Phone",
				"Aadhar",
				"GST",
				"Contact Person",
				"Contact Person Phone",
				"Address",
				"State",
				"City",
				"Pincode",
				"Created At",
				"Created By",
				"Updated At",
				"Updated By",
			],
			rows,
		);
		if ((customers || []).length) {
			toast.success("Customers exported successfully");
		}
	};

	const col = createColumnHelper<Customer>();

	const columns = useMemo(
		() => [
			col.accessor("customerName", {
				header: "Customer",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("companyName", {
				header: "Company",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerType", {
				header: "Type",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerEmail", {
				header: "Email",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerPhone", {
				header: "Phone",
				cell: (i) => {
					const v = i.getValue();
					return v !== undefined && v !== null ? String(v) : "-";
				},
			}),
			col.accessor("customerAadhar", {
				header: "Aadhar",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerGst", {
				header: "GST",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerContactPersonName", {
				header: "Contact Person",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerContactPersonPhone", {
				header: "Contact Person Phone",
				cell: (i) => {
					const v = i.getValue();
					return v !== undefined && v !== null ? String(v) : "-";
				},
			}),
			col.accessor("customerAddress", {
				header: "Address",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerState", {
				header: "State",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerCity", {
				header: "City",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerPincode", {
				header: "Pincode",
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
							onClick={() => nav(`/masters/customers/${id}/edit`)}
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
		[col, nav, allowUpdate],
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
					data={customers || []}
					columns={columns}
					title='Customers'
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
									onClick={() => nav("/masters/customers/new")}
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
									<i className='ri-add-circle-line' /> Add Customer
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
