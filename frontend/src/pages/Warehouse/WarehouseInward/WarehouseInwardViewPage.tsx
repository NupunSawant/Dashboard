import { useEffect, useMemo } from "react";
import {
	Card,
	Spinner,
	Alert,
	Row,
	Col,
	Button,
	Badge,
	Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../slices/store";

//   adjust if your thunk name differs
import { getWarehouseInwardThunk } from "../../../slices/Warehouse/thunks";

const theme = "#1a8376";

const Field = ({ label, value }: { label: string; value: any }) => (
	<div
		style={{
			border: "1px solid #eef2f6",
			borderRadius: 12,
			padding: "12px 14px",
			background: "#ffffff",
			boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
			height: "100%",
		}}
	>
		<div style={{ fontSize: 12, color: "#6c757d", marginBottom: 6 }}>
			{label}
		</div>
		<div style={{ fontWeight: 700, color: "#212529" }}>{value ?? "-"}</div>
	</div>
);

const Metric = ({
	label,
	value,
	sub,
	icon,
	accentBg = "rgba(26,131,118,0.12)",
}: {
	label: string;
	value: any;
	sub?: string;
	icon: string;
	accentBg?: string;
}) => (
	<div
		style={{
			background: "#fff",
			border: "1px solid #eef2f6",
			borderRadius: 14,
			padding: 14,
			display: "flex",
			alignItems: "center",
			gap: 12,
			minHeight: 78,
		}}
	>
		<div
			style={{
				width: 44,
				height: 44,
				borderRadius: 12,
				background: accentBg,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: theme,
				fontSize: 20,
				flex: "0 0 auto",
			}}
		>
			<i className={icon} />
		</div>
		<div style={{ minWidth: 0 }}>
			<div style={{ fontSize: 12, color: "#6c757d" }}>{label}</div>
			<div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.15 }}>
				{value ?? "-"}{" "}
				{sub ? (
					<span style={{ fontWeight: 600, color: "#6c757d", fontSize: 12 }}>
						{sub}
					</span>
				) : null}
			</div>
		</div>
	</div>
);

function fmtDate(d: any) {
	if (!d) return "-";
	try {
		return new Date(d).toISOString().slice(0, 10);
	} catch {
		return String(d);
	}
}

export default function WarehouseInwardView() {
	const { id } = useParams();
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	//   adapt keys if your slice uses different naming
	const { selected, loadingOne, error } = useSelector(
		(s: RootState) => (s.warehouseInward as any) || {},
	);

	useEffect(() => {
		if (id) dispatch(getWarehouseInwardThunk(id));
	}, [dispatch, id]);

	const items = Array.isArray((selected as any)?.items)
		? (selected as any).items
		: [];

	const totals = useMemo(() => {
		const totalQty = items.reduce(
			(acc: number, it: any) => acc + (Number(it?.itemsQuantity) || 0),
			0,
		);
		const totalAmount = items.reduce(
			(acc: number, it: any) => acc + (Number(it?.itemsAmount) || 0),
			0,
		);
		return { totalQty, totalAmount };
	}, [items]);

	if (loadingOne) {
		return (
			<div
				className='d-flex justify-content-center align-items-center'
				style={{ minHeight: 240 }}
			>
				<Spinner animation='border' style={{ color: theme }} />
			</div>
		);
	}

	if (error) return <Alert variant='danger'>{String(error)}</Alert>;
	if (!selected) return null;

	const inwardBadge = (selected as any)?.inwardType ? (
		<Badge bg='info' style={{ borderRadius: 999, padding: "6px 10px" }}>
			{(selected as any).inwardType}
		</Badge>
	) : (
		<Badge bg='secondary' style={{ borderRadius: 999, padding: "6px 10px" }}>
			-
		</Badge>
	);

	const editId = (selected as any)?.id || (selected as any)?._id || id;

	return (
		<div style={{ maxWidth: 1100, margin: "0 auto" }}>
			<Card
				style={{
					borderRadius: 14,
					border: "1px solid #e9ebec",
					overflow: "hidden",
					boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
				}}
			>
				{/* Header */}
				<div
					style={{
						background: `linear-gradient(90deg, ${theme} 0%, #20a694 100%)`,
						color: "white",
						padding: "18px 20px",
					}}
				>
					<div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
						<div>
							<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
								Warehouse / Inward / Details
							</div>
							<div
								style={{
									fontSize: 20,
									fontWeight: 800,
									letterSpacing: 0.2,
								}}
							>
								GRN: {(selected as any)?.grnNo || "Warehouse Inward"}
							</div>
						</div>

						<div className='d-flex align-items-center gap-2'>
							{inwardBadge}

							<Button
								size='sm'
								onClick={() => nav(-1)}
								style={{
									background: "rgba(255,255,255,0.16)",
									border: "1px solid rgba(255,255,255,0.28)",
									borderRadius: 10,
									fontWeight: 700,
									color: "white",
									display: "inline-flex",
									alignItems: "center",
									gap: 8,
								}}
							>
								<i className='ri-arrow-left-line' /> Back
							</Button>

							<Button
								size='sm'
								onClick={() => nav(`/warehouses/inward/${editId}/edit`)}
								style={{
									background: "rgba(255,255,255,0.16)",
									border: "1px solid rgba(255,255,255,0.28)",
									borderRadius: 10,
									fontWeight: 700,
									color: "white",
									display: "inline-flex",
									alignItems: "center",
									gap: 8,
								}}
							>
								<i className='ri-edit-line' /> Edit
							</Button>
						</div>
					</div>
				</div>

				<Card.Body style={{ background: "#f7fbfa", padding: 18 }}>
					{/* Top Metrics */}
					<Row className='g-3 mb-3'>
						<Col md={6} lg={3}>
							<Metric
								label='GRN No'
								value={(selected as any)?.grnNo ?? "-"}
								icon='ri-hashtag'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Items Count'
								value={items.length}
								icon='ri-box-3-line'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Total Qty'
								value={totals.totalQty}
								icon='ri-inbox-archive-line'
								accentBg='rgba(255,193,7,0.18)'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Total Amount'
								value={
									Number.isFinite(totals.totalAmount)
										? totals.totalAmount.toFixed(2)
										: "0.00"
								}
								icon='ri-money-rupee-circle-line'
								accentBg='rgba(40,167,69,0.16)'
							/>
						</Col>
					</Row>

					{/* Details Grid */}
					<Row className='g-3 mb-3'>
						<Col md={6} lg={4}>
							<Field
								label='Inward Type'
								value={(selected as any)?.inwardType || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Inward Date'
								value={fmtDate((selected as any)?.inwardDate)}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Received By'
								value={(selected as any)?.receivedBy || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Invoice No'
								value={(selected as any)?.invoiceNo || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Supplier Name'
								value={(selected as any)?.supplierName || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Warehouse Name'
								value={(selected as any)?.warehouseName || "-"}
							/>
						</Col>

						<Col md={12}>
							<Field
								label='Remarks'
								value={(selected as any)?.remarks || "-"}
							/>
						</Col>
					</Row>

					{/* Items Table */}
					<div
						style={{
							background: "#ffffff",
							border: "1px solid #eef2f6",
							borderRadius: 14,
							padding: 12,
						}}
					>
						<div className='d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2'>
							<div className='d-flex align-items-center gap-2'>
								<div
									style={{
										width: 36,
										height: 36,
										borderRadius: 10,
										background: "rgba(26,131,118,0.12)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: theme,
										fontSize: 18,
									}}
								>
									<i className='ri-list-check-2' />
								</div>
								<div style={{ fontWeight: 800 }}>Items</div>
							</div>

							<Badge
								bg='secondary'
								style={{ borderRadius: 999, padding: "6px 10px" }}
							>
								{items.length} item(s)
							</Badge>
						</div>

						<div style={{ overflowX: "auto" }}>
							<Table hover responsive className='align-middle mb-0'>
								<thead style={{ background: "#f8fbfa" }}>
									<tr>
										<th>#</th>
										<th>Category</th>
										<th>Sub Category</th>
										<th>Item Name</th>
										<th>Code</th>
										<th className='text-end'>Qty</th>
										<th>Unit</th>
										<th className='text-end'>Rate</th>
										<th className='text-end'>Amount</th>
										<th>Remark</th>
									</tr>
								</thead>
								<tbody>
									{items.length === 0 ? (
										<tr>
											<td
												colSpan={10}
												className='text-center py-4'
												style={{ color: "#6c757d" }}
											>
												No items found.
											</td>
										</tr>
									) : (
										items.map((it: any, idx: number) => (
											<tr key={idx}>
												<td>{idx + 1}</td>
												<td>{it?.itemsCategory || "-"}</td>
												<td>{it?.itemsSubCategory || "-"}</td>
												<td>{it?.itemsName || "-"}</td>
												<td>{it?.itemsCode || "-"}</td>
												<td className='text-end'>
													{Number(it?.itemsQuantity ?? 0)}
												</td>
												<td>{it?.itemsUnit || "-"}</td>
												<td className='text-end'>
													{Number(it?.itemsRate ?? 0).toFixed(2)}
												</td>
												<td className='text-end'>
													{Number(it?.itemsAmount ?? 0).toFixed(2)}
												</td>
												<td style={{ minWidth: 180 }}>
													{it?.itemsRemark || "-"}
												</td>
											</tr>
										))
									)}
								</tbody>
							</Table>
						</div>
					</div>

					{/* Footer Actions */}
					<div
						className='d-flex justify-content-end gap-2 mt-4'
						style={{
							paddingTop: 14,
							borderTop: "1px solid #e9ebec",
						}}
					>
						<Button
							variant='light'
							onClick={() => nav(-1)}
							style={{
								border: "1px solid #e9ebec",
								borderRadius: 10,
								fontWeight: 700,
							}}
						>
							<i className='ri-arrow-left-line' /> Back
						</Button>
					</div>
				</Card.Body>
			</Card>
		</div>
	);
}
