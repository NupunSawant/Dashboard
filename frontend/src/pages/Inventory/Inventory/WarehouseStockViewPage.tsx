import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button, Card, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import BasicTable from "../../../components/Table/BasicTable";
import type { AppDispatch, RootState } from "../../../slices/store";
import { clearWarehouseStockItem } from "../../../slices/Inventory/reducer";
import { fetchWarehouseStockItemThunk } from "../../../slices/Inventory/thunks";
import type { WarehouseStockItemRow } from "../../../types/Inventory/inventory";

const theme = "#1a8376";

export default function WarehouseStockViewPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { itemId } = useParams();

	const { warehouseStockItem, loadingWarehouseStockItem, error } = useSelector(
		(s: RootState) => s.inventory,
	);

	useEffect(() => {
		if (itemId) {
			dispatch(fetchWarehouseStockItemThunk(itemId));
		}

		return () => {
			dispatch(clearWarehouseStockItem());
		};
	}, [dispatch, itemId]);

	const col = createColumnHelper<WarehouseStockItemRow>();

	const columns = useMemo(
		() => [
			col.accessor("srNo", {
				header: "Sr. No",
				cell: (i) => i.getValue() ?? "-",
			}),
			col.accessor("warehouseName", {
				header: "Warehouse Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("receivedQuantity", {
				header: "Received",
				cell: (i) => i.getValue() ?? 0,
			}),
			col.accessor("availableQuantity", {
				header: "Available",
				cell: (i) => i.getValue() ?? 0,
			}),
			col.accessor("reservedQuantity", {
				header: "Reserved",
				cell: (i) => i.getValue() ?? 0,
			}),
		],
		[col],
	);

	return (
		<>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<h5 className='mb-0' style={{ color: "#495057", fontWeight: 600 }}>
					Warehouse-wise Stock Detail
				</h5>

				<Button
					onClick={() => nav("/inventory/stock")}
					style={{
						background: "#eaf4f2",
						border: "none",
						color: theme,
						borderRadius: "6px",
						fontSize: "13px",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
					}}
				>
					<i className='ri-arrow-left-line' /> Back
				</Button>
			</div>

			{error && <Alert variant='danger'>{error}</Alert>}

			{loadingWarehouseStockItem ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : (
				<>
					<Card className='border-0 shadow-sm mb-3'>
						<Card.Body>
							<Row className='g-3'>
								<Col md={3}>
									<div className='text-muted small'>Item Name</div>
									<div className='fw-semibold'>
										{warehouseStockItem?.item?.itemName || "-"}
									</div>
								</Col>
								<Col md={3}>
									<div className='text-muted small'>Category</div>
									<div className='fw-semibold'>
										{warehouseStockItem?.item?.category || "-"}
									</div>
								</Col>
								<Col md={3}>
									<div className='text-muted small'>Sub Category</div>
									<div className='fw-semibold'>
										{warehouseStockItem?.item?.subCategory || "-"}
									</div>
								</Col>
								<Col md={3}>
									<div className='text-muted small'>Unit</div>
									<div className='fw-semibold'>
										{warehouseStockItem?.item?.unit || "-"}
									</div>
								</Col>
							</Row>
						</Card.Body>
					</Card>

					<BasicTable
						columns={columns}
						data={warehouseStockItem?.warehouses || []}
						title='Warehouse Distribution'
					/>
				</>
			)}
		</>
	);
}
