import { useEffect } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../slices/store";
import { getInventoryThunk } from "../../../slices/Inventory/thunks";

const theme = "#1a8376";
const themeSoft = "rgba(26,131,118,0.08)";
const themeMid = "rgba(26,131,118,0.15)";

const styles: Record<string, React.CSSProperties> = {
	page: {
		minHeight: "100vh",
		background: "#f4f6f8",
		fontFamily: "'DM Sans', sans-serif",
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: "24px",
		flexWrap: "wrap" as const,
		gap: "12px",
	},
	headerLeft: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
	},
	iconBox: {
		width: "42px",
		height: "42px",
		borderRadius: "10px",
		background: themeMid,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: theme,
		fontSize: "20px",
		flexShrink: 0,
	},
	pageTitle: {
		margin: 0,
		fontSize: "20px",
		fontWeight: 700,
		color: "#1a202c",
		letterSpacing: "-0.3px",
	},
	pageSubtitle: {
		margin: 0,
		fontSize: "13px",
		color: "#718096",
		fontWeight: 400,
	},
	warehouseBadge: {
		display: "inline-flex",
		alignItems: "center",
		gap: "6px",
		padding: "6px 14px",
		borderRadius: "20px",
		background: themeSoft,
		border: `1.5px solid ${theme}`,
		color: theme,
		fontWeight: 600,
		fontSize: "13px",
		letterSpacing: "0.02em",
	},
	backBtn: {
		display: "inline-flex",
		alignItems: "center",
		gap: "6px",
		padding: "7px 16px",
		borderRadius: "8px",
		border: "1.5px solid #e2e8f0",
		background: "#fff",
		color: "#4a5568",
		fontSize: "13px",
		fontWeight: 500,
		cursor: "pointer",
		transition: "all 0.2s",
		textDecoration: "none",
		boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
	},
	card: {
		background: "#fff",
		borderRadius: "14px",
		border: "1px solid #e8edf2",
		boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
		overflow: "hidden",
		marginBottom: "20px",
	},
	cardHeader: {
		padding: "16px 24px",
		borderBottom: "1px solid #f0f4f8",
		display: "flex",
		alignItems: "center",
		gap: "10px",
		background: "#fafbfc",
	},
	cardHeaderIcon: {
		width: "30px",
		height: "30px",
		borderRadius: "8px",
		background: themeMid,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: theme,
		fontSize: "15px",
		flexShrink: 0,
	},
	cardHeaderTitle: {
		margin: 0,
		fontSize: "14px",
		fontWeight: 600,
		color: "#2d3748",
		letterSpacing: "0.01em",
	},
	cardBody: {
		padding: "24px",
	},
	fieldGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
		gap: "20px",
	},
	fieldItem: {
		display: "flex",
		flexDirection: "column" as const,
		gap: "4px",
	},
	fieldLabel: {
		fontSize: "11px",
		fontWeight: 600,
		color: "#a0aec0",
		textTransform: "uppercase" as const,
		letterSpacing: "0.06em",
	},
	fieldValue: {
		fontSize: "14px",
		fontWeight: 600,
		color: "#2d3748",
	},
	divider: {
		height: "1px",
		background: "#f0f4f8",
		margin: "0 24px",
	},
	statGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: "0",
	},
	statCell: {
		padding: "28px 24px",
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		borderRight: "1px solid #f0f4f8",
		textAlign: "center" as const,
		position: "relative" as const,
	},
	statCellLast: {
		borderRight: "none",
	},
	statIcon: {
		width: "40px",
		height: "40px",
		borderRadius: "10px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: "18px",
		marginBottom: "4px",
	},
	statValue: {
		fontSize: "28px",
		fontWeight: 700,
		lineHeight: 1,
		letterSpacing: "-0.5px",
	},
	statLabel: {
		fontSize: "12px",
		fontWeight: 500,
		color: "#a0aec0",
		textTransform: "uppercase" as const,
		letterSpacing: "0.05em",
	},
};

export default function InStockViewPage() {
	const dispatch = useDispatch<AppDispatch>();
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const warehouseName = searchParams.get("warehouseName") || "";

	const inventoryState = useSelector((s: RootState) => (s as any).inventory);
	const loading = inventoryState?.loadingOne || inventoryState?.loadingGet;
	const error = inventoryState?.error;
	const inventory =
		inventoryState?.selected ||
		inventoryState?.selectedInventory ||
		inventoryState?.inventory ||
		null;

	useEffect(() => {
		if (id) dispatch(getInventoryThunk(id));
	}, [id, dispatch]);

	if (loading) {
		return (
			<div className='d-flex justify-content-center align-items-center py-5'>
				<div style={{ textAlign: "center" }}>
					<Spinner
						animation='border'
						style={{ color: theme, width: "36px", height: "36px" }}
					/>
					<div style={{ marginTop: "12px", color: "#718096", fontSize: "14px" }}>
						Loading inventory details...
					</div>
				</div>
			</div>
		);
	}

	if (error) return <Alert variant='danger'>{error}</Alert>;
	if (!inventory) return <Alert variant='info'>Inventory item not found.</Alert>;

	const available = inventory.availableQuantity ?? 0;
	const received = inventory.receivedQuantity ?? 0;
	const reserved = inventory.reservedQuantity ?? 0;
	const utilizationPct =
		received > 0 ? Math.round(((received - available) / received) * 100) : 0;

	return (
		<div style={styles.page}>
			{/* ── Header ─────────────────────────────────────────────────────── */}
			<div style={styles.header}>
				<div style={styles.headerLeft}>
					<div style={styles.iconBox}>
						<i className='ri-archive-stack-line' />
					</div>
					<div>
						<h4 style={styles.pageTitle}>In Stock — Item View</h4>
						<p style={styles.pageSubtitle}>
							Inventory details and stock breakdown
						</p>
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					{warehouseName && (
						<span style={styles.warehouseBadge}>
							<i className='ri-store-2-line' style={{ fontSize: "13px" }} />
							{warehouseName}
						</span>
					)}
					<button
						style={styles.backBtn}
						onClick={() => window.history.back()}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLButtonElement).style.borderColor = theme;
							(e.currentTarget as HTMLButtonElement).style.color = theme;
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
							(e.currentTarget as HTMLButtonElement).style.color = "#4a5568";
						}}
					>
						<i className='ri-arrow-left-line' />
						Back
					</button>
				</div>
			</div>

			{/* ── Item Info Card ──────────────────────────────────────────────── */}
			<div style={styles.card}>
				<div style={styles.cardHeader}>
					<div style={styles.cardHeaderIcon}>
						<i className='ri-box-3-line' />
					</div>
					<h6 style={styles.cardHeaderTitle}>Item Information</h6>
				</div>

				<div style={styles.cardBody}>
					<div style={styles.fieldGrid}>
						<div style={styles.fieldItem}>
							<span style={styles.fieldLabel}>Item Name</span>
							<span style={styles.fieldValue}>
								{inventory.itemName || "—"}
							</span>
						</div>
						<div style={styles.fieldItem}>
							<span style={styles.fieldLabel}>Warehouse</span>
							<span style={styles.fieldValue}>
								{warehouseName || inventory.warehouseName || "—"}
							</span>
						</div>
						<div style={styles.fieldItem}>
							<span style={styles.fieldLabel}>Category</span>
							<span style={styles.fieldValue}>
								{inventory.category || "—"}
							</span>
						</div>
						<div style={styles.fieldItem}>
							<span style={styles.fieldLabel}>Sub Category</span>
							<span style={styles.fieldValue}>
								{inventory.subCategory || "—"}
							</span>
						</div>
						<div style={styles.fieldItem}>
							<span style={styles.fieldLabel}>Unit</span>
							<span style={styles.fieldValue}>
								{inventory.unit || "—"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Stock Details Card ──────────────────────────────────────────── */}
			<div style={styles.card}>
				<div style={styles.cardHeader}>
					<div style={styles.cardHeaderIcon}>
						<i className='ri-bar-chart-box-line' />
					</div>
					<h6 style={styles.cardHeaderTitle}>Stock Details</h6>
				</div>

				<div style={styles.statGrid}>
					{/* Available */}
					<div style={styles.statCell}>
						<div
							style={{
								...styles.statIcon,
								background: themeSoft,
								color: theme,
							}}
						>
							<i className='ri-checkbox-circle-line' />
						</div>
						<div style={{ ...styles.statValue, color: theme }}>
							{available}
						</div>
						<div style={styles.statLabel}>Available</div>
					</div>

					{/* Received */}
					<div style={styles.statCell}>
						<div
							style={{
								...styles.statIcon,
								background: "rgba(59,130,246,0.08)",
								color: "#3b82f6",
							}}
						>
							<i className='ri-download-line' />
						</div>
						<div style={{ ...styles.statValue, color: "#3b82f6" }}>
							{received}
						</div>
						<div style={styles.statLabel}>Total Received</div>
					</div>

					{/* Reserved */}
					<div style={{ ...styles.statCell, ...styles.statCellLast }}>
						<div
							style={{
								...styles.statIcon,
								background: "rgba(231,76,60,0.08)",
								color: "#e74c3c",
							}}
						>
							<i className='ri-lock-line' />
						</div>
						<div style={{ ...styles.statValue, color: "#e74c3c" }}>
							{reserved}
						</div>
						<div style={styles.statLabel}>Reserved</div>
					</div>
				</div>

				{/* Utilization bar */}
				<div style={styles.divider} />
				<div style={{ padding: "20px 24px" }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "8px",
						}}
					>
						<span
							style={{ fontSize: "12px", fontWeight: 600, color: "#718096" }}
						>
							STOCK UTILIZATION
						</span>
						<span
							style={{ fontSize: "13px", fontWeight: 700, color: "#2d3748" }}
						>
							{utilizationPct}%
						</span>
					</div>
					<div
						style={{
							height: "8px",
							borderRadius: "99px",
							background: "#edf2f7",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								height: "100%",
								width: `${utilizationPct}%`,
								borderRadius: "99px",
								background: `linear-gradient(90deg, ${theme}, #22c5b5)`,
								transition: "width 0.6s ease",
							}}
						/>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: "6px",
						}}
					>
						<span style={{ fontSize: "11px", color: "#a0aec0" }}>
							{received - available} dispatched / reserved
						</span>
						<span style={{ fontSize: "11px", color: "#a0aec0" }}>
							{available} remaining
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}