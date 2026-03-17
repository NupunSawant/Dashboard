// LaboursList.tsx

import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchLaboursThunk } from "../../../slices/Masters/labours/thunks";
import type { Labour } from "../../../types/Masters/labour";
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

export default function LaboursList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { labours, loadingList, error } = useSelector(
		(s: RootState) => s.labours,
	);
	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "masters", "labour");
	const allowUpdate = canUpdate(authUser, "masters", "labour");

	useEffect(() => {
		dispatch(fetchLaboursThunk());
	}, [dispatch]);

	const handleExport = () => {
		const rows = (labours || []).map((labour) => [
			labour.labourName,
			labour.contactNumber,
			labour.remark,
			labour.address,
			labour.state,
			labour.city,
			labour.country,
			labour.pincode,
			fmtDateTime(labour.createdAt),
			pickUserName(labour.createdBy),
			fmtDateTime(labour.updatedAt),
			pickUserName(labour.updatedBy),
		]);

		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		downloadCsv(
			`labours_${yyyy}-${mm}-${dd}.csv`,
			[
				"Labour Name",
				"Contact No.",
				"Remark",
				"Address",
				"State",
				"City",
				"Country",
				"Pincode",
				"Created At",
				"Created By",
				"Updated At",
				"Updated By",
			],
			rows,
		);

		if ((labours || []).length) {
			toast.success("Labours exported successfully");
		}
	};

	const col = createColumnHelper<Labour>();

	const columns = useMemo(
		() => [
			col.accessor("labourName", {
				header: "Labour Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("contactNumber", {
				header: "Contact No.",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("remark", {
				header: "Remark",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("address", {
				header: "Address",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("state", {
				header: "State",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("city", {
				header: "City",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("country", {
				header: "Country",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("pincode", {
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
							onClick={() => nav(`/masters/labours/${id}/edit`)}
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
					data={labours || []}
					title='Labours'
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
									onClick={() => nav("/masters/labours/new")}
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
									<i className='ri-add-circle-line' /> Add Labour
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
