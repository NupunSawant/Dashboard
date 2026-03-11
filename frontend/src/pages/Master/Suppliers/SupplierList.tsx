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

const theme = "#1a8376";

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
				cell: (i) => {
					const v = i.getValue();
					if (!v) return "-";
					return new Date(v).toLocaleString();
				},
			}),
			col.accessor("createdBy", {
				header: "Created By",
				cell: (i) => {
					const v = i.getValue();
					return v && typeof v === "object" ? (v as any).name : "-";
				},
			}),
			col.accessor("updatedAt", {
				header: "Updated At",
				cell: (i) => {
					const v = i.getValue();
					if (!v) return "-";
					return new Date(v).toLocaleString();
				},
			}),
			col.accessor("updatedBy", {
				header: "Updated By",
				cell: (i) => {
					const v = i.getValue();
					return v && typeof v === "object" ? (v as any).name : "-";
				},
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
