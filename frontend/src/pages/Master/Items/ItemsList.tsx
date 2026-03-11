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
				cell: (i) => {
					const v = i.getValue();
					if (!v) return "-";
					return new Date(v).toLocaleDateString();
				},
			}),
			col.accessor("updatedAt", {
				header: "Updated By/Date",
				cell: (i) => {
					const v = i.getValue();
					if (!v) return "-";
					return new Date(v).toLocaleDateString();
				},
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
