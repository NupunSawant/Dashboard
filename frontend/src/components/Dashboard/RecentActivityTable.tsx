import { Card, Table } from "react-bootstrap";

type ActivityRow = {
	id: string;
	module: string;
	refNo: string;
	date: string | null;
	status: string;
	partyName: string;
	warehouseName: string;
	createdAt: string | null;
};

type Props = {
	data: ActivityRow[];
	onRowClick?: (row: ActivityRow) => void;
};

function formatDate(value: string | null) {
	if (!value) return "-";
	try {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return value;
		return d.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return value;
	}
}

function getStatusTone(status?: string) {
	const s = String(status || "").toLowerCase();

	if (
		s.includes("pending") ||
		s.includes("processing") ||
		s.includes("requested")
	) {
		return {
			bg: "#fff7e6",
			color: "#b76e00",
			border: "#ffe2a8",
			dot: "#f59e0b",
		};
	}

	if (
		s.includes("done") ||
		s.includes("completed") ||
		s.includes("delivered") ||
		s.includes("success") ||
		s.includes("closed")
	) {
		return {
			bg: "#eafbf1",
			color: "#157347",
			border: "#b7ebc6",
			dot: "#22c55e",
		};
	}

	if (
		s.includes("cancel") ||
		s.includes("reject") ||
		s.includes("failed") ||
		s.includes("danger")
	) {
		return {
			bg: "#fff0f0",
			color: "#c92a2a",
			border: "#fecaca",
			dot: "#ef4444",
		};
	}

	return {
		bg: "#eef6ff",
		color: "#0b67c2",
		border: "#bfdbfe",
		dot: "#3b82f6",
	};
}

function getModuleTone(module?: string) {
	const m = String(module || "").toLowerCase();

	if (m.includes("order")) {
		return {
			bg: "linear-gradient(135deg, rgba(26,131,118,0.10) 0%, rgba(26,131,118,0.18) 100%)",
			color: "#1a8376",
			border: "rgba(26,131,118,0.16)",
		};
	}

	if (m.includes("dispatch")) {
		return {
			bg: "linear-gradient(135deg, rgba(13,110,253,0.10) 0%, rgba(13,110,253,0.18) 100%)",
			color: "#0d6efd",
			border: "rgba(13,110,253,0.16)",
		};
	}

	if (m.includes("inward")) {
		return {
			bg: "linear-gradient(135deg, rgba(32,201,151,0.10) 0%, rgba(32,201,151,0.18) 100%)",
			color: "#20c997",
			border: "rgba(32,201,151,0.16)",
		};
	}

	if (m.includes("quotation")) {
		return {
			bg: "linear-gradient(135deg, rgba(111,66,193,0.10) 0%, rgba(111,66,193,0.18) 100%)",
			color: "#6f42c1",
			border: "rgba(111,66,193,0.16)",
		};
	}

	if (m.includes("enquiry")) {
		return {
			bg: "linear-gradient(135deg, rgba(253,126,20,0.10) 0%, rgba(253,126,20,0.18) 100%)",
			color: "#fd7e14",
			border: "rgba(253,126,20,0.16)",
		};
	}

	if (m.includes("transfer")) {
		return {
			bg: "linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0.18) 100%)",
			color: "#4f46e5",
			border: "rgba(99,102,241,0.16)",
		};
	}

	return {
		bg: "linear-gradient(135deg, rgba(100,116,139,0.10) 0%, rgba(100,116,139,0.16) 100%)",
		color: "#475569",
		border: "rgba(100,116,139,0.16)",
	};
}

function getModuleIcon(module?: string) {
	const m = String(module || "").toLowerCase();

	if (m.includes("order")) return "ri-file-list-3-line";
	if (m.includes("dispatch")) return "ri-truck-line";
	if (m.includes("inward")) return "ri-inbox-line";
	if (m.includes("quotation")) return "ri-file-text-line";
	if (m.includes("enquiry")) return "ri-question-answer-line";
	if (m.includes("transfer")) return "ri-arrow-left-right-line";

	return "ri-information-line";
}

export default function RecentActivityTable({ data, onRowClick }: Props) {
	const clickable = typeof onRowClick === "function";

	return (
		<Card
			className='border-0 shadow-sm overflow-hidden h-100'
			style={{
				borderRadius: 18,
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
				className='d-flex align-items-center justify-content-between'
				style={{
					background: "linear-gradient(180deg, #ffffff 0%, #fcfefe 100%)",
					borderBottom: "1px solid #edf2f7",
					padding: "1rem 1rem 0.95rem",
				}}
			>
				<div className='d-flex align-items-center gap-3'>
					<div
						style={{
							width: 42,
							height: 42,
							borderRadius: 14,
							background:
								"linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(26,131,118,0.14) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
							flexShrink: 0,
						}}
					>
						<i
							className='ri-time-line'
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
							Recent Activity
						</div>
						<div
							style={{
								fontSize: 13,
								color: "#64748b",
								marginTop: 2,
							}}
						>
							Latest records from dashboard summary
						</div>
					</div>
				</div>

				<div
					style={{
						minWidth: 42,
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
						boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
					}}
				>
					{data.length}
				</div>
			</Card.Header>

			<Card.Body className='p-0'>
				{data.length ? (
					<div style={{ overflowX: "auto" }}>
						<Table responsive hover className='mb-0 align-middle'>
							<thead>
								<tr>
									{[
										"Module",
										"Reference",
										"Party",
										"Warehouse",
										"Status",
										"Date",
									].map((label) => (
										<th
											key={label}
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
											}}
										>
											{label}
										</th>
									))}
								</tr>
							</thead>

							<tbody>
								{data.map((row) => {
									const moduleTone = getModuleTone(row.module);
									const statusTone = getStatusTone(row.status);

									return (
										<tr
											key={row.id}
											onClick={() => onRowClick?.(row)}
											style={{
												cursor: clickable ? "pointer" : "default",
												transition: "all 0.22s ease",
											}}
											onMouseEnter={(e) => {
												if (!clickable) return;
												e.currentTarget.style.background =
													"linear-gradient(90deg, rgba(26,131,118,0.03) 0%, rgba(13,110,253,0.025) 100%)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = "transparent";
											}}
										>
											<td
												style={{
													padding: "1rem",
													borderColor: "#eef2f6",
													minWidth: 240,
												}}
											>
												<div className='d-flex align-items-center gap-3'>
													<div
														style={{
															width: 42,
															height: 42,
															borderRadius: 14,
															background: moduleTone.bg,
															border: `1px solid ${moduleTone.border}`,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															flexShrink: 0,
															boxShadow: "0 8px 18px rgba(15,23,42,0.05)",
														}}
													>
														<i
															className={getModuleIcon(row.module)}
															style={{
																fontSize: 18,
																color: moduleTone.color,
																lineHeight: 1,
															}}
														/>
													</div>

													<div style={{ minWidth: 0 }}>
														<div
															style={{
																fontWeight: "bold",
																fontSize: "0.94rem",
																color: "#0f172a",
																lineHeight: 1.15,
															}}
														>
															{row.module || "-"}
														</div>
														<div
															style={{
																fontSize: 12.5,
																color: "#64748b",
																marginTop: 3,
															}}
														>
															Created {formatDate(row.createdAt)}
														</div>
													</div>
												</div>
											</td>

											<td
												style={{
													padding: "1rem",
													borderColor: "#eef2f6",
													whiteSpace: "nowrap",
													minWidth: 150,
												}}
											>
												<div
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: "0.45rem",
														padding: "0.48rem 0.75rem",
														borderRadius: 12,
														background:
															"linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
														border: "1px solid #e6edf2",
														fontWeight: "bold",
														fontSize: "0.86rem",
														color: "#1f2937",
														boxShadow: "0 4px 10px rgba(15,23,42,0.04)",
													}}
												>
													<i
														className='ri-hashtag'
														style={{
															fontSize: 14,
															color: "#64748b",
															lineHeight: 1,
														}}
													/>
													<span>{row.refNo || "-"}</span>
												</div>
											</td>

											<td
												style={{
													padding: "1rem",
													borderColor: "#eef2f6",
													minWidth: 180,
												}}
											>
												<div
													style={{
														fontWeight: 700,
														color: "#334155",
														fontSize: "0.92rem",
													}}
												>
													{row.partyName || "-"}
												</div>
											</td>

											<td
												style={{
													padding: "1rem",
													borderColor: "#eef2f6",
													minWidth: 180,
												}}
											>
												<div
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: "0.45rem",
														padding: "0.44rem 0.7rem",
														borderRadius: 12,
														background:
															"linear-gradient(180deg, rgba(26,131,118,0.05) 0%, rgba(13,110,253,0.04) 100%)",
														border: "1px solid rgba(26,131,118,0.08)",
														color: "#334155",
														fontWeight: "bold",
														fontSize: "0.86rem",
													}}
												>
													<i
														className='ri-building-line'
														style={{
															fontSize: 14,
															color: "#1a8376",
															lineHeight: 1,
														}}
													/>
													<span>{row.warehouseName || "-"}</span>
												</div>
											</td>

											<td
												style={{
													padding: "1rem",
													borderColor: "#eef2f6",
													minWidth: 140,
												}}
											>
												<span
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: "0.45rem",
														background: statusTone.bg,
														color: statusTone.color,
														border: `1px solid ${statusTone.border}`,
														fontWeight: "bold",
														padding: "0.48rem 0.78rem",
														borderRadius: 999,
														fontSize: "0.82rem",
														boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
													}}
												>
													<span
														style={{
															width: 8,
															height: 8,
															borderRadius: 999,
															background: statusTone.dot,
															display: "inline-block",
														}}
													/>
													{row.status || "-"}
												</span>
											</td>

											<td
												style={{
													padding: "1rem",
													borderColor: "#eef2f6",
													whiteSpace: "nowrap",
													minWidth: 130,
												}}
											>
												<div
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: "0.45rem",
														padding: "0.45rem 0.72rem",
														borderRadius: 12,
														background:
															"linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
														border: "1px solid #e6edf2",
														fontWeight: "bold",
														fontSize: "0.84rem",
														color: "#475569",
													}}
												>
													<i
														className='ri-calendar-line'
														style={{
															fontSize: 14,
															color: "#64748b",
															lineHeight: 1,
														}}
													/>
													<span>{formatDate(row.date)}</span>
													{clickable ? (
														<i
															className='ri-arrow-right-up-line'
															style={{
																fontSize: 14,
																color: "#94a3b8",
																lineHeight: 1,
																marginLeft: 2,
															}}
														/>
													) : null}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
					</div>
				) : (
					<div
						style={{
							minHeight: 260,
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
								className='ri-time-line'
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
							No recent activity
						</div>
						<div style={{ fontSize: 13.5, maxWidth: 280, lineHeight: 1.55 }}>
							New module activity will appear here once records are created
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}
