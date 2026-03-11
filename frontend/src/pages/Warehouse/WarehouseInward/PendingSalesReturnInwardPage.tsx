import { useEffect } from "react";
import { Card, Button, Alert, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchDispatchByIdThunk } from "../../../slices/Warehouse/Dispatch/thunks";
import { createWarehouseInwardThunk } from "../../../slices/Warehouse/thunks";
import type { DispatchItem } from "../../../types/Warehouses/dispatch";

const theme = "#1a8376";

const fmtDate = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
	} catch {
		return String(val);
	}
};

export default function PendingSalesReturnInwardPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();

	const {
		selected: dispatchData,
		loadingOne,
		error,
	} = useSelector((s: RootState) => (s as any).warehouseDispatch);

	const { saving = false } =
		(useSelector((s: RootState) => (s as any).warehouseInward) as any) || {};

	const authUser = useSelector((s: RootState) => (s as any).auth?.user);

	useEffect(() => {
		if (id) dispatch(fetchDispatchByIdThunk(id));
	}, [dispatch, id]);

	const returnedItems =
		dispatchData?.items?.filter(
			(item: DispatchItem) => Number(item.returnQty || 0) > 0,
		) || [];

	const handleSubmit = async () => {
		if (!dispatchData) return;

		if (!returnedItems.length) {
			toast.error("No returned items found");
			return;
		}

		const sourceDispatchId = String(
			dispatchData.id || dispatchData._id || dispatchData.dispatchId || "",
		).trim();

		if (!sourceDispatchId) {
			toast.error("Source dispatch id is required");
			return;
		}

		const payload = {
			inwardType: "SALES_RETURN",
			inwardDate: new Date(),
			receivedBy:
				authUser?.firstName && authUser?.lastName
					? `${authUser.firstName} ${authUser.lastName}`
					: authUser?.userName || "System",
			remarks: "Sales return inward completed",
			invoiceNo: dispatchData.invoiceNo || "SALES_RETURN",
			supplierName: dispatchData.customerName || "Sales Return Customer",
			warehouseName: dispatchData.issuedFromWarehouseName || "",
			sourceDispatchId,
			dispatchNo: dispatchData.dispatchNo || "",
			items: returnedItems.map((item: DispatchItem) => ({
				itemsCategory: item.itemsCategory,
				itemsSubCategory: item.itemsSubCategory,
				itemsName: item.itemsName,
				itemsCode: item.itemsCode,
				itemsQuantity: Number(item.returnQty || 0),
				itemsUnit: item.itemsUnit,
				itemsRate: Number(item.rate || 0),
				itemsAmount: Number(item.returnQty || 0) * Number(item.rate || 0),
				itemsRemark: item.returnRemark || "",
			})),
		};

		try {
			await dispatch(createWarehouseInwardThunk(payload as any)).unwrap();
			toast.success("Sales return inward completed");
			nav("/warehouses/inward?tab=PENDING_SALE_RETURN");
		} catch (err: any) {
			toast.error(err || "Failed to complete inward");
		}
	};

	if (loadingOne) {
		return (
			<div className='d-flex justify-content-center py-5'>
				<Spinner animation='border' style={{ color: theme }} />
			</div>
		);
	}

	if (!dispatchData) {
		return <Alert variant='danger'>Dispatch not found</Alert>;
	}

	return (
		<Card>
			<Card.Header
				style={{
					background: "#f7f9fa",
					fontWeight: 600,
				}}
			>
				Sales Return Inward
			</Card.Header>

			<Card.Body>
				{error && <Alert variant='danger'>{error}</Alert>}

				<div className='mb-4'>
					<div className='row g-3'>
						<div className='col-md-3'>
							<div className='text-muted small'>Dispatch No</div>
							<div className='fw-semibold'>
								{dispatchData.dispatchNo || dispatchData.dispatchId || "-"}
							</div>
						</div>
						<div className='col-md-3'>
							<div className='text-muted small'>Dispatch Date</div>
							<div className='fw-semibold'>
								{fmtDate(dispatchData.dispatchDate)}
							</div>
						</div>
						<div className='col-md-3'>
							<div className='text-muted small'>Customer</div>
							<div className='fw-semibold'>{dispatchData.customerName || "-"}</div>
						</div>
						<div className='col-md-3'>
							<div className='text-muted small'>Warehouse</div>
							<div className='fw-semibold'>
								{dispatchData.issuedFromWarehouseName || "-"}
							</div>
						</div>
					</div>
				</div>

				<Table bordered hover size='sm'>
					<thead>
						<tr>
							<th>Item</th>
							<th>Code</th>
							<th>Return Qty</th>
							<th>Unit</th>
							<th>Rate</th>
							<th>Amount</th>
							<th>Remark</th>
						</tr>
					</thead>

					<tbody>
						{returnedItems.length ? (
							returnedItems.map((item: DispatchItem, idx: number) => (
								<tr key={`${item.itemId}-${idx}`}>
									<td>{item.itemsName}</td>
									<td>{item.itemsCode}</td>
									<td>{item.returnQty}</td>
									<td>{item.itemsUnit}</td>
									<td>{Number(item.rate || 0).toLocaleString()}</td>
									<td>
										{(
											Number(item.returnQty || 0) * Number(item.rate || 0)
										).toLocaleString()}
									</td>
									<td>{item.returnRemark || "-"}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className='text-center text-muted py-3'>
									No returned items found
								</td>
							</tr>
						)}
					</tbody>
				</Table>

				<div className='d-flex justify-content-end gap-2 mt-3'>
					<Button
						variant='light'
						onClick={() => nav("/warehouses/inward?tab=PENDING_SALE_RETURN")}
					>
						Cancel
					</Button>

					<Button
						style={{
							background: theme,
							border: "none",
						}}
						onClick={handleSubmit}
						disabled={saving || !returnedItems.length}
					>
						{saving ? "Processing..." : "Complete Inward"}
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
}