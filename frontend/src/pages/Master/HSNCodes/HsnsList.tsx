// HsnsList.tsx

import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchHSNCodesThunk } from "../../../slices/Masters/hsnCodes/thunks";
import type { HSNCode } from "../../../types/Masters/hsnCode";
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

export default function HsnsList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { hsnCodes, loadingList, error } = useSelector(
		(s: RootState) => s.hsnCodes,
	);

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "masters", "hsnCode");
	const allowUpdate = canUpdate(authUser, "masters", "hsnCode");

	useEffect(() => {
		dispatch(fetchHSNCodesThunk());
	}, [dispatch]);

	const handleExport = () => {
		const rows = (hsnCodes || []).map((hsn) => [
			hsn.gstRate,
			hsn.hsnCode,
			hsn.hsnDescription,
			fmtDateTime(hsn.createdAt),
			pickUserName(hsn.createdBy),
			fmtDateTime(hsn.updatedAt),
			pickUserName(hsn.updatedBy),
		]);

		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		downloadCsv(
			`hsn_codes_${yyyy}${mm}${dd}.csv`,
			[
				"GST %",
				"HSN Code",
				"HSN Description",
				"Created At",
				"Created By",
				"Updated At",
				"Updated By",
			],
			rows,
		);

		if ((hsnCodes || []).length === 0) {
			toast.success("No data available to export");
		}
	};

	const col = createColumnHelper<HSNCode>();

	const columns = useMemo(
		() => [
			col.accessor("gstRate", {
				header: "GST %",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("hsnCode", {
				header: "HSN Code",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("hsnDescription", {
				header: "HSN Description",
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
							onClick={() => nav(`/masters/hsn-codes/${id}/edit`)}
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
					data={hsnCodes || []}
					title='HSN Codes'
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
									onClick={() => nav("/masters/hsn-codes/new")}
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
									<i className='ri-add-circle-line' /> Add HSN Code
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
