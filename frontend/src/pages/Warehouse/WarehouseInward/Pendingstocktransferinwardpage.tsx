import { useEffect, useState } from "react";
import {
	Card,
	Button,
	Form,
	Alert,
	Row,
	Col,
	Spinner,
	Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
	getStockTransferThunk,
	completeStockTransferThunk,
} from "../../../slices/Warehouse/Stocktransfer/thunks";
import { createWarehouseInwardThunk } from "../../../slices/Warehouse/thunks";
import { fetchUsersThunk } from "../../../slices/users/thunks";
import { fetchInventoriesThunk } from "../../../slices/Inventory/thunks";
import type { StockTransfer } from "../../../types/Warehouses/stocktransfer";

const theme = "#1a8376";

export default function PendingStockTransferInwardPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const [sp] = useSearchParams();
	const toWarehouse = sp.get("toWarehouse") || "";

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	const [transfer, setTransfer] = useState<StockTransfer | null>(null);
	const [receivedBy, setReceivedBy] = useState("");

	const { users, loadingList: usersLoading } =
		useSelector((s: RootState) => (s as any).users) || {};

	useEffect(() => {
		dispatch(fetchUsersThunk());
		dispatch(fetchInventoriesThunk());
	}, [dispatch]);

	useEffect(() => {
		if (!id) return;

		(async () => {
			setLoading(true);
			const res = await dispatch(getStockTransferThunk(id));

			if (getStockTransferThunk.fulfilled.match(res)) {
				setTransfer(res.payload as StockTransfer);
			} else {
				setApiError(
					String((res as any).payload || "Failed to load stock transfer"),
				);
			}

			setLoading(false);
		})();
	}, [dispatch, id]);

	const userOptions: Array<{ key: string; name: string }> = (() => {
		const list = users?.users || users?.list || users?.data || users || [];

		return Array.isArray(list)
			? list
					.map((u: any, idx: number) => {
						const name = String(
							u?.name ||
								u?.fullName ||
								[u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
								u?.userName ||
								"",
						).trim();

						const idPart = String(u?.id || u?._id || u?.email || idx).trim();
						return { key: `${idPart}-${idx}`, name };
					})
					.filter((u) => !!u.name)
					.filter(Boolean)
			: [];
	})();

	const handleCreateGrn = async () => {
		setApiError(null);

		if (!receivedBy) {
			const msg = "Received By is required";
			setApiError(msg);
			toast.error(msg);
			return;
		}

		if (!transfer) return;

		setSaving(true);

		try {
			/* -------------------------
			   FIXED FIELD MAPPING
			-------------------------- */

			const grnItems = (transfer.items || []).map((it) => ({
				itemsCategory: it.itemsCategory || "",
				itemsSubCategory: it.itemsSubCategory || "",
				itemsName: it.itemsName || "",
				itemsCode: it.itemsCode || "",
				itemsQuantity: Number(it.dispatchQuantity || 0),
				itemsUnit: it.itemsUnit || "",
				itemsRate: 0,
				itemsAmount: 0,
				itemsRemark:
					it.remark || `Stock transfer from ${transfer.transferFromWarehouse}`,
			}));

			const grnPayload = {
				inwardType: "STOCK_TRANSFER",
				inwardDate: new Date(),
				receivedBy,
				remarks: `Stock transfer ${transfer.transferNo} from ${transfer.transferFromWarehouse}`,
				invoiceNo: transfer.transferNo || "",
				supplierName: transfer.transferFromWarehouse || "",
				warehouseName: transfer.transferToWarehouse || toWarehouse,
				items: grnItems,
				stockTransferId: id,
				transferFromWarehouse: transfer.transferFromWarehouse,
			};

			const grnRes = await dispatch(
				createWarehouseInwardThunk(grnPayload as any),
			);

			if (!createWarehouseInwardThunk.fulfilled.match(grnRes)) {
				const msg = String((grnRes as any).payload || "Failed to create GRN");
				setApiError(msg);
				toast.error(msg);
				setSaving(false);
				return;
			}

			const completeRes = await dispatch(completeStockTransferThunk(id!));

			if (!completeStockTransferThunk.fulfilled.match(completeRes)) {
				const msg = String(
					(completeRes as any).payload ||
						"Failed to mark stock transfer as completed",
				);

				if (/already|only\s+dispatched/i.test(msg)) {
					toast.info("GRN created successfully. Transfer is already completed.");
				} else {
					toast.warn(`GRN created, but completion failed: ${msg}`);
				}
			} else {
				toast.success("GRN created and stock transfer completed successfully");
			}

			dispatch(fetchInventoriesThunk());
			nav("/warehouses/inward", { replace: true });
		} catch (e: any) {
			setApiError(e?.message || "Operation failed");
			toast.error(e?.message || "Operation failed");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card
			className='p-3'
			style={{ border: "1px solid #e9ebec", borderRadius: "10px" }}
		>
			{/* Header */}
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<h5 className='m-0'>Inward Stock Transfer</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						Create GRN for pending stock transfer — this will add items to{" "}
						<strong>{transfer?.transferToWarehouse || toWarehouse}</strong>
					</div>
				</div>
				<Button
					variant='light'
					size='sm'
					onClick={() => nav("/warehouses/inward")}
					style={{
						border: "1px solid #e9ebec",
						fontSize: "13px",
						borderRadius: "6px",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
					}}
				>
					<i className='ri-arrow-left-line' /> Back
				</Button>
			</div>

			{apiError && (
				<Alert variant='danger' className='mb-3'>
					{apiError}
				</Alert>
			)}

			{loading ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : transfer ? (
				<>
					{/* Transfer Details — read only */}
					<div
						className='p-3 mb-3'
						style={{
							background: "#f8fbfa",
							border: "1px solid #eef2f1",
							borderRadius: 10,
						}}
					>
						<div className='d-flex align-items-center gap-2 mb-2'>
							<i className='ri-exchange-line' style={{ color: theme }} />
							<div style={{ fontWeight: 700 }}>Transfer Information</div>
						</div>
						<Row className='g-3'>
							<Col md={3}>
								<Form.Label style={{ fontWeight: "bold" }}>
									Transfer No
								</Form.Label>
								<Form.Control
									value={transfer.transferNo || "-"}
									readOnly
									disabled
									style={{ borderRadius: 8 }}
								/>
							</Col>
							<Col md={3}>
								<Form.Label style={{ fontWeight: "bold" }}>
									Transfer Date
								</Form.Label>
								<Form.Control
									value={
										transfer.transferDate
											? new Date(transfer.transferDate).toLocaleDateString()
											: "-"
									}
									readOnly
									disabled
									style={{ borderRadius: 8 }}
								/>
							</Col>
							<Col md={3}>
								<Form.Label style={{ fontWeight: "bold" }}>
									Transfer From
								</Form.Label>
								<Form.Control
									value={transfer.transferFromWarehouse || "-"}
									readOnly
									disabled
									style={{ borderRadius: 8 }}
								/>
							</Col>
							<Col md={3}>
								<Form.Label style={{ fontWeight: "bold" }}>
									Transfer To
								</Form.Label>
								<Form.Control
									value={transfer.transferToWarehouse || "-"}
									readOnly
									disabled
									style={{ borderRadius: 8 }}
								/>
							</Col>
						</Row>
					</div>

					{/* Received By */}
					<div
						className='p-3 mb-3'
						style={{
							background: "#ffffff",
							border: "1px solid #eef2f1",
							borderRadius: 10,
						}}
					>
						<div className='d-flex align-items-center gap-2 mb-2'>
							<i className='ri-user-3-line' style={{ color: theme }} />
							<div style={{ fontWeight: 700 }}>GRN Details</div>
						</div>
						<Row className='g-3'>
							<Col md={6}>
								<Form.Label style={{ fontWeight: "bold" }}>
									Received By <span style={{ color: "red" }}>*</span>
								</Form.Label>
								<Form.Select
									value={receivedBy}
									onChange={(e) => setReceivedBy(e.target.value)}
									style={{ borderRadius: 8 }}
								>
									<option value='' disabled>
										{usersLoading ? "Loading users..." : "Select user"}
									</option>
									{userOptions.map((user) => (
										<option key={user.key} value={user.name}>
											{user.name}
										</option>
									))}
								</Form.Select>
							</Col>
						</Row>
					</div>

					{/* Items — read only */}
					<div
						className='p-3 mb-3'
						style={{
							background: "#ffffff",
							border: "1px solid #eef2f1",
							borderRadius: 10,
						}}
					>
						<div className='d-flex align-items-center gap-2 mb-3'>
							<i className='ri-box-3-line' style={{ color: theme }} />
							<div style={{ fontWeight: 700 }}>Items to be Inwarded</div>
						</div>

						<div className='table-responsive'>
							<Table bordered hover size='sm' className='align-middle'>
								<thead style={{ background: "#f8fbfa" }}>
									<tr>
										<th style={{ width: 60 }}>Sr No</th>
										<th>Category</th>
										<th>Sub Category</th>
										<th>Item Name</th>
										<th>Item Code</th>
										<th>Unit</th>
										<th style={{ minWidth: 120 }}>Dispatch Qty</th>
										<th>Remark</th>
									</tr>
								</thead>
								<tbody>
									{(transfer.items || []).map((item, idx) => (
										<tr key={idx}>
											<td className='text-center'>{idx + 1}</td>
											<td>{item.itemsCategory || "-"}</td>
											<td>{item.itemsSubCategory || "-"}</td>
											<td>{item.itemsName || "-"}</td>
											<td>{item.itemsCode || "-"}</td>
											<td>{item.itemsUnit || "-"}</td>
											<td>
												<strong style={{ color: theme }}>
													{item.dispatchQuantity}
												</strong>
											</td>
											<td>{item.remark || "-"}</td>
										</tr>
									))}
								</tbody>
							</Table>
						</div>
					</div>

					{/* Action buttons */}
					<div className='mt-3 d-flex gap-2'>
						<Button
							onClick={handleCreateGrn}
							disabled={saving || !receivedBy}
							style={{
								background: theme,
								border: "none",
								borderRadius: "6px",
								fontSize: "13px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 16px",
							}}
						>
							<i className='ri-file-add-line' />
							{saving ? "Creating GRN..." : "Create GRN"}
						</Button>

						<Button
							variant='light'
							onClick={() => nav("/warehouses/inward")}
							style={{
								border: "1px solid #e9ebec",
								fontSize: "13px",
								borderRadius: "6px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 14px",
							}}
						>
							<i className='ri-close-line' /> Cancel
						</Button>
					</div>
				</>
			) : (
				!loading && (
					<Alert variant='warning'>
						Stock transfer not found or already processed.
					</Alert>
				)
			)}
		</Card>
	);
}
