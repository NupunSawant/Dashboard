// InventoryView.tsx

import { useEffect } from "react";
import { Card, Spinner, Alert, Row, Col, Button, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../slices/store";
import { getInventoryThunk } from "../../../slices/Inventory/thunks";
import { clearSelected } from "../../../slices/Inventory/reducer";

const theme = "#1a8376";

const Field = ({
	label,
	value,
}: {
	label: string;
	value: any;
}) => (
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

export default function InventoryView() {
	const { id } = useParams();
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { selected, loadingOne, error } = useSelector(
		(s: RootState) => s.inventory,
	);

	useEffect(() => {
		if (id) dispatch(getInventoryThunk(id));
		return () => {
			dispatch(clearSelected());
		};
	}, [dispatch, id]);

	const received = Number((selected as any)?.receivedQuantity ?? 0);
	const reserved = Number((selected as any)?.reservedQuantity ?? 0);
	const available = Number((selected as any)?.availableQuantity ?? 0);

	if (loadingOne) {
		return (
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ minHeight: 240 }}
			>
				<Spinner animation="border" style={{ color: theme }} />
			</div>
		);
	}

	if (error) return <Alert variant="danger">{error}</Alert>;
	if (!selected) return null;

	const stockBadge =
		available <= 0 ? (
			<Badge bg="danger" style={{ borderRadius: 999, padding: "6px 10px" }}>
				Out of Stock
			</Badge>
		) : available <= 5 ? (
			<Badge
				bg="warning"
				text="dark"
				style={{ borderRadius: 999, padding: "6px 10px" }}
			>
				Low Stock
			</Badge>
		) : (
			<Badge bg="success" style={{ borderRadius: 999, padding: "6px 10px" }}>
				In Stock
			</Badge>
		);

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
				<div
					style={{
						background: `linear-gradient(90deg, ${theme} 0%, #20a694 100%)`,
						color: "white",
						padding: "18px 20px",
					}}
				>
					<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
						<div>
							<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
								Inventory / Details
							</div>
							<div
								style={{
									fontSize: 20,
									fontWeight: 800,
									letterSpacing: 0.2,
								}}
							>
								{selected.itemName || "Inventory Item"}
							</div>
						</div>

						<div className="d-flex align-items-center gap-2">
							{stockBadge}

							<Button
								size="sm"
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
								<i className="ri-arrow-left-line" /> Back
							</Button>
						</div>
					</div>
				</div>

				<Card.Body style={{ background: "#f7fbfa", padding: 18 }}>
					<Row className="g-3 mb-3">
						<Col md={6} lg={3}>
							<Metric
								label="Sr No"
								value={selected.srNo ?? "-"}
								icon="ri-hashtag"
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label="Received Qty"
								value={received}
								sub={selected.unit ? `(${selected.unit})` : ""}
								icon="ri-inbox-archive-line"
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label="Reserved Qty"
								value={reserved}
								sub={selected.unit ? `(${selected.unit})` : ""}
								icon="ri-time-line"
								accentBg="rgba(255,193,7,0.18)"
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label="Available Qty"
								value={available}
								sub={selected.unit ? `(${selected.unit})` : ""}
								icon="ri-bar-chart-2-line"
								accentBg="rgba(40,167,69,0.16)"
							/>
						</Col>
					</Row>

					<div
						style={{
							background: "#ffffff",
							border: "1px solid #eef2f6",
							borderRadius: 14,
							padding: 12,
							marginBottom: 14,
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 12,
							flexWrap: "wrap",
						}}
					>
						<div className="d-flex align-items-center gap-2">
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
								<i className="ri-bar-chart-box-line" />
							</div>
							<div style={{ fontSize: 13, color: "#6c757d" }}>
								<b style={{ color: "#212529" }}>Available Stock:</b> Live inventory value from system records.
							</div>
						</div>

						<Badge
							bg="secondary"
							style={{ borderRadius: 999, padding: "6px 10px" }}
						>
							Backend Value
						</Badge>
					</div>

					<Row className="g-3">
						<Col md={6} lg={4}>
							<Field label="Item Name" value={selected.itemName || "-"} />
						</Col>
						<Col md={6} lg={4}>
							<Field label="Category" value={selected.category || "-"} />
						</Col>
						<Col md={6} lg={4}>
							<Field label="Sub Category" value={selected.subCategory || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field label="Unit" value={selected.unit || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field label="Status" value={stockBadge} />
						</Col>

						<Col md={6} lg={4}>
							<Field
								label="Sellable Now"
								value={
									<>
										{available}{" "}
										<span style={{ fontWeight: 600, color: "#6c757d" }}>
											{selected.unit ? `(${selected.unit})` : ""}
										</span>
									</>
								}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label="Received Quantity"
								value={
									<>
										{received}{" "}
										<span style={{ fontWeight: 600, color: "#6c757d" }}>
											{selected.unit ? `(${selected.unit})` : ""}
										</span>
									</>
								}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label="Reserved Quantity"
								value={
									<>
										{reserved}{" "}
										<span style={{ fontWeight: 600, color: "#6c757d" }}>
											{selected.unit ? `(${selected.unit})` : ""}
										</span>
									</>
								}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label="Available Quantity"
								value={
									<>
										{available}{" "}
										<span style={{ fontWeight: 600, color: "#6c757d" }}>
											{selected.unit ? `(${selected.unit})` : ""}
										</span>
									</>
								}
							/>
						</Col>
					</Row>

					<div
						className="d-flex justify-content-end gap-2 mt-4"
						style={{
							paddingTop: 14,
							borderTop: "1px solid #e9ebec",
						}}
					>
						<Button
							variant="light"
							onClick={() => nav(-1)}
							style={{
								border: "1px solid #e9ebec",
								borderRadius: 10,
								fontWeight: 700,
							}}
						>
							<i className="ri-arrow-left-line" /> Back
						</Button>
					</div>
				</Card.Body>
			</Card>
		</div>
	);
}