import React from "react";
import { Alert, Button, Card, Form, Spinner, Table } from "react-bootstrap";
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table";

type DashboardInventorySummaryTableProps<T extends object> = {
	title?: string;
	subtitle?: string;
	iconClassName?: string;
	data: T[];
	columns: ColumnDef<T, any>[];
	loading?: boolean;
	error?: string | null;
	totalRecords?: number;
	pageIndex?: number;
	pageSize?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	sorting?: SortingState;
	onSortingChange?: (sorting: SortingState) => void;
	search?: string;
	onSearchChange?: (value: string) => void;
	onRefresh?: () => void;
	emptyTitle?: string;
	emptySubtitle?: string;
	maxBodyHeight?: number;
};

function getPageItems(current: number, totalPages: number) {
	const items: Array<number | "ellipsis"> = [];

	if (totalPages <= 7) {
		for (let i = 1; i <= totalPages; i++) items.push(i);
		return items;
	}

	items.push(1);

	if (current > 3) items.push("ellipsis");

	const start = Math.max(2, current - 1);
	const end = Math.min(totalPages - 1, current + 1);

	for (let i = start; i <= end; i++) items.push(i);

	if (current < totalPages - 2) items.push("ellipsis");

	items.push(totalPages);

	return items;
}

export default function DashboardInventorySummaryTable<T extends object>({
	title = "Inventory Summary",
	subtitle = "Stock overview across warehouse inventory",
	iconClassName = "ri-database-2-line",
	data,
	columns,
	loading = false,
	error = null,
	totalRecords = 0,
	pageIndex = 0,
	pageSize = 10,
	onPageChange,
	onPageSizeChange,
	sorting = [],
	onSortingChange,
	search = "",
	onSearchChange,
	onRefresh,
	emptyTitle = "No inventory records",
	emptySubtitle = "Inventory summary will appear here once data is available",
	maxBodyHeight = 460,
}: DashboardInventorySummaryTableProps<T>) {
	const safePage = pageIndex + 1;
	const totalPages = Math.max(1, Math.ceil((totalRecords || 0) / pageSize));
	const pageItems = getPageItems(safePage, totalPages);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: (updater) => {
			if (!onSortingChange) return;
			const next =
				typeof updater === "function" ? updater(sorting ?? []) : updater;
			onSortingChange(next);
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualSorting: !!onSortingChange,
	});

	return (
		<Card
			className="border-0 shadow-sm overflow-hidden h-100"
			style={{
				borderRadius: 20,
				background: "linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%)",
				boxShadow: "0 10px 24px rgba(15, 23, 42, 0.07)",
			}}
		>
			<div
				style={{
					height: 4,
					background:
						"linear-gradient(90deg, #1a8376 0%, #0d6efd 50%, #6f42c1 100%)",
				}}
			/>

			<Card.Header
				style={{
					background: "linear-gradient(180deg, #ffffff 0%, #fcfefe 100%)",
					borderBottom: "1px solid #edf2f7",
					padding: "1rem 1rem 0.95rem",
				}}
			>
				<div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
					<div className="d-flex align-items-center gap-3">
						<div
							style={{
								width: 44,
								height: 44,
								borderRadius: 14,
								background:
									"linear-gradient(135deg, rgba(26,131,118,0.10) 0%, rgba(13,110,253,0.14) 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
								flexShrink: 0,
							}}
						>
							<i
								className={iconClassName}
								style={{
									fontSize: 18,
									color: "#1a8376",
									lineHeight: 1,
								}}
							/>
						</div>

						<div>
							<div
								style={{
									fontWeight: 800,
									fontSize: "1rem",
									color: "#0f172a",
									lineHeight: 1.1,
								}}
							>
								{title}
							</div>
							<div
								style={{
									fontSize: 13,
									color: "#64748b",
									marginTop: 2,
								}}
							>
								{subtitle}
							</div>
						</div>
					</div>

					<div className="d-flex flex-wrap align-items-center gap-2">
						<div
							style={{
								minWidth: 44,
								height: 34,
								padding: "0 0.85rem",
								borderRadius: 999,
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 12.5,
								fontWeight: 800,
								color: "#1a8376",
								background: "rgba(26,131,118,0.08)",
								border: "1px solid rgba(26,131,118,0.12)",
							}}
						>
							{totalRecords || data.length}
						</div>

						{onRefresh ? (
							<Button
								variant="light"
								onClick={onRefresh}
								style={{
									height: 38,
									borderRadius: 12,
									border: "1px solid #dbe4ea",
									background:
										"linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
									fontWeight: 700,
									color: "#334155",
									boxShadow: "0 4px 10px rgba(15,23,42,0.04)",
								}}
							>
								<i className="ri-refresh-line me-2" />
								Refresh
							</Button>
						) : null}
					</div>
				</div>

				<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
					<div style={{ width: "100%", maxWidth: 340 }}>
						<div
							className="d-flex align-items-center"
							style={{
								borderRadius: 14,
								overflow: "hidden",
								border: "1px solid #dbe4ea",
								background:
									"linear-gradient(180deg, #ffffff 0%, #fcfdfd 100%)",
								boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
							}}
						>
							<div
								style={{
									padding: "0.78rem 0.95rem",
									color: "#1a8376",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<i className="ri-search-2-line" />
							</div>

							<Form.Control
								value={search}
								onChange={(e) => onSearchChange?.(e.target.value)}
								placeholder="Search inventory..."
								style={{
									border: "none",
									boxShadow: "none",
									fontWeight: 600,
									padding: "0.78rem 0.95rem 0.78rem 0",
									color: "#0f172a",
								}}
							/>
						</div>
					</div>

					<div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "0.45rem",
							padding: "0.55rem 0.85rem",
							borderRadius: 999,
							background: "rgba(13,110,253,0.06)",
							color: "#0d6efd",
							fontSize: 12,
							fontWeight: 700,
							border: "1px solid rgba(13,110,253,0.10)",
						}}
					>
						<i className="ri-bar-chart-box-line" />
						<span>Live inventory snapshot</span>
					</div>
				</div>
			</Card.Header>

			<Card.Body className="p-0">
				{loading ? (
					<div
						style={{
							minHeight: 320,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
							gap: 12,
							color: "#64748b",
						}}
					>
						<div
							style={{
								width: 62,
								height: 62,
								borderRadius: 20,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								background:
									"linear-gradient(135deg, rgba(26,131,118,0.10) 0%, rgba(13,110,253,0.10) 100%)",
							}}
						>
							<Spinner animation="border" style={{ color: "#1a8376" }} />
						</div>
						<div style={{ fontWeight: 800, color: "#0f172a" }}>
							Loading inventory summary...
						</div>
					</div>
				) : error ? (
					<div style={{ padding: "1rem" }}>
						<Alert
							variant="danger"
							className="mb-0"
							style={{ borderRadius: 14, fontWeight: 600 }}
						>
							<strong>Error:</strong> {error}
						</Alert>
					</div>
				) : data.length === 0 ? (
					<div
						style={{
							minHeight: 320,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
							textAlign: "center",
							color: "#64748b",
							padding: "1.5rem",
							background:
								"radial-gradient(circle at top, rgba(26,131,118,0.04), transparent 35%)",
						}}
					>
						<div
							style={{
								width: 60,
								height: 60,
								borderRadius: 20,
								background:
									"linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(26,131,118,0.14) 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: 14,
								boxShadow: "0 10px 20px rgba(15, 23, 42, 0.06)",
							}}
						>
							<i
								className="ri-database-2-line"
								style={{ fontSize: 25, color: "#1a8376" }}
							/>
						</div>

						<div
							style={{
								fontWeight: 800,
								color: "#0f172a",
								marginBottom: 4,
								fontSize: "1rem",
							}}
						>
							{emptyTitle}
						</div>
						<div style={{ fontSize: 13.5, maxWidth: 280, lineHeight: 1.55 }}>
							{emptySubtitle}
						</div>
					</div>
				) : (
					<div
						style={{
							overflowX: "auto",
							maxHeight: maxBodyHeight,
						}}
					>
						<Table responsive hover className="mb-0 align-middle">
							<thead
								style={{
									position: "sticky",
									top: 0,
									zIndex: 2,
								}}
							>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											const isSorted = header.column.getIsSorted();
											const canSort = header.column.getCanSort();

											return (
												<th
													key={header.id}
													colSpan={header.colSpan}
													onClick={
														canSort
															? header.column.getToggleSortingHandler()
															: undefined
													}
													style={{
														padding: "0.95rem 1rem",
														fontSize: "0.76rem",
														textTransform: "uppercase",
														letterSpacing: "0.06em",
														color: "#64748b",
														background:
															"linear-gradient(180deg, #f8fbfc 0%, #f2f7f8 100%)",
														borderBottom: "1px solid #e8eef3",
														whiteSpace: "nowrap",
														fontWeight: 800,
														cursor: canSort ? "pointer" : "default",
														userSelect: "none",
													}}
												>
													{header.isPlaceholder ? null : (
														<div className="d-flex align-items-center gap-2">
															<span>
																{flexRender(
																	header.column.columnDef.header,
																	header.getContext(),
																)}
															</span>

															{canSort ? (
																<span
																	style={{
																		fontSize: 13,
																		color:
																			isSorted === "asc" || isSorted === "desc"
																				? "#1a8376"
																				: "#94a3b8",
																	}}
																>
																	{isSorted === "asc" ? "▲" : isSorted === "desc" ? "▼" : "↕"}
																</span>
															) : null}
														</div>
													)}
												</th>
											);
										})}
									</tr>
								))}
							</thead>

							<tbody>
								{table.getRowModel().rows.map((row, rowIndex) => (
									<tr
										key={row.id}
										style={{
											transition: "all 0.22s ease",
											background:
												rowIndex % 2 === 0
													? "rgba(255,255,255,0.96)"
													: "rgba(248,250,252,0.75)",
										}}
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												style={{
													padding: "0.95rem 1rem",
													borderColor: "#eef2f6",
													color: "#334155",
													fontWeight: 600,
													whiteSpace: "nowrap",
												}}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</Table>
					</div>
				)}
			</Card.Body>

			<div
				style={{
					padding: "1rem",
					borderTop: "1px solid #edf2f7",
					background: "linear-gradient(180deg, #ffffff 0%, #fafcfd 100%)",
				}}
			>
				<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
					<div
						style={{
							fontSize: 13,
							color: "#64748b",
							fontWeight: 600,
						}}
					>
						Showing <strong style={{ color: "#0f172a" }}>{data.length}</strong> of{" "}
						<strong style={{ color: "#0f172a" }}>{totalRecords}</strong>
					</div>

					<div className="d-flex flex-wrap align-items-center gap-2">
						<Form.Select
							value={pageSize}
							onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
							style={{
								width: 88,
								borderRadius: 12,
								border: "1px solid #dbe4ea",
								fontWeight: 700,
								color: "#334155",
								boxShadow: "0 4px 10px rgba(15,23,42,0.04)",
							}}
						>
							{[5, 10, 20, 50].map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</Form.Select>

						<div className="d-flex align-items-center gap-2 flex-wrap">
							<Button
								variant="light"
								disabled={safePage <= 1}
								onClick={() => onPageChange?.(safePage - 2)}
								style={{
									borderRadius: 12,
									border: "1px solid #dbe4ea",
									fontWeight: 700,
									minWidth: 40,
								}}
							>
								‹
							</Button>

							{pageItems.map((item, idx) =>
								item === "ellipsis" ? (
									<span
										key={`ellipsis-${idx}`}
										style={{
											padding: "0 0.35rem",
											color: "#94a3b8",
											fontWeight: 700,
										}}
									>
										...
									</span>
								) : (
									<Button
										key={item}
										onClick={() => onPageChange?.(item - 1)}
										style={{
											borderRadius: 12,
											minWidth: 40,
											fontWeight: 800,
											border:
												item === safePage
													? "1px solid #1a8376"
													: "1px solid #dbe4ea",
											background:
												item === safePage
													? "linear-gradient(135deg, #1a8376 0%, #13695f 100%)"
													: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
											color: item === safePage ? "#fff" : "#334155",
											boxShadow:
												item === safePage
													? "0 10px 18px rgba(26, 131, 118, 0.18)"
													: "0 4px 10px rgba(15,23,42,0.04)",
										}}
									>
										{item}
									</Button>
								),
							)}

							<Button
								variant="light"
								disabled={safePage >= totalPages}
								onClick={() => onPageChange?.(safePage)}
								style={{
									borderRadius: 12,
									border: "1px solid #dbe4ea",
									fontWeight: 700,
									minWidth: 40,
								}}
							>
								›
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}