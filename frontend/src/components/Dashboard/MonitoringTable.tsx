import {  Card, ProgressBar } from "react-bootstrap";

type MonitoringRow = {
	label: string;
	value: number | string;
	status: "danger" | "warning" | "good";
	note?: string;
	onClick?: () => void;
};

type Props = {
	title: string;
	rows: MonitoringRow[];
	subtitle?: string;
};

function toNumber(value: number | string) {
	const num = typeof value === "number" ? value : Number(value);
	return Number.isNaN(num) ? 0 : num;
}

function getTone(status: MonitoringRow["status"]) {
	if (status === "danger") {
		return {
			bg: "linear-gradient(135deg, rgba(220,53,69,0.08) 0%, rgba(220,53,69,0.14) 100%)",
			border: "#dc3545",
			text: "#b42318",
			badgeBg: "#dc3545",
			progressBg: "rgba(220,53,69,0.16)",
			icon: "ri-alarm-warning-line",
			label: "High Risk",
		};
	}

	if (status === "warning") {
		return {
			bg: "linear-gradient(135deg, rgba(253,126,20,0.08) 0%, rgba(253,126,20,0.14) 100%)",
			border: "#fd7e14",
			text: "#b54708",
			badgeBg: "#fd7e14",
			progressBg: "rgba(253,126,20,0.16)",
			icon: "ri-error-warning-line",
			label: "Watch",
		};
	}

	return {
		bg: "linear-gradient(135deg, rgba(25,135,84,0.08) 0%, rgba(25,135,84,0.14) 100%)",
		border: "#198754",
		text: "#067647",
		badgeBg: "#198754",
		progressBg: "rgba(25,135,84,0.16)",
		icon: "ri-checkbox-circle-line",
		label: "Healthy",
	};
}

function getNormalizedPercent(value: number, maxValue: number) {
	if (maxValue <= 0) return 0;
	return Math.max(6, Math.min(100, (value / maxValue) * 100));
}

export default function MonitoringTable({
	title,
	rows,
	subtitle = "Operational risk and attention indicators",
}: Props) {
	const numericValues = rows.map((row) => Math.abs(toNumber(row.value)));
	const maxValue = Math.max(...numericValues, 0);
	const dangerCount = rows.filter((r) => r.status === "danger").length;
	const warningCount = rows.filter((r) => r.status === "warning").length;

	return (
		<Card
			className="border-0 shadow-sm h-100 overflow-hidden"
			style={{
				borderRadius: 16,
				background: "linear-gradient(180deg, #ffffff 0%, #fbfcfc 100%)",
			}}
		>
			<Card.Header
				className="d-flex align-items-center justify-content-between"
				style={{
					background: "#fff",
					borderBottom: "1px solid #eef0f2",
					padding: "1rem 1rem 0.95rem",
				}}
			>
				<div className="d-flex align-items-center gap-2">
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: 12,
							background:
								"linear-gradient(135deg, rgba(220,53,69,0.08) 0%, rgba(253,126,20,0.14) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
							flexShrink: 0,
						}}
					>
						<i
							className="ri-radar-line"
							style={{
								fontSize: 18,
								color: "#dc3545",
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

				<div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
					{dangerCount > 0 ? (
						<span
						className="badge"
							style={{
								background: "rgba(220,53,69,0.10)",
								color: "#b42318",
								border: "1px solid rgba(220,53,69,0.18)",
								fontWeight: 700,
								padding: "0.45rem 0.65rem",
								borderRadius: 999,
							}}
						>
							<i className="ri-alarm-warning-line me-1" />
							{dangerCount} High
						</span>
					) : null}

					{warningCount > 0 ? (
						<span
						className="badge"
							style={{
								background: "rgba(253,126,20,0.10)",
								color: "#b54708",
								border: "1px solid rgba(253,126,20,0.18)",
								fontWeight: 700,
								padding: "0.45rem 0.65rem",
								borderRadius: 999,
							}}
						>
							<i className="ri-error-warning-line me-1" />
							{warningCount} Watch
						</span>
					) : null}
				</div>
			</Card.Header>

			<Card.Body className="p-3">
				{rows.length ? (
					<div className="d-flex flex-column gap-3">
						{rows.map((row, index) => {
							const tone = getTone(row.status);
							const numericValue = Math.abs(toNumber(row.value));
							const percent = getNormalizedPercent(numericValue, maxValue);
							const clickable = typeof row.onClick === "function";

							return (
								<button
									key={`${row.label}-${index}`}
									type="button"
									onClick={row.onClick}
									style={{
										width: "100%",
										border: "none",
										background: tone.bg,
										borderLeft: `4px solid ${tone.border}`,
										borderRadius: 14,
										padding: "0.95rem 1rem",
										textAlign: "left",
										cursor: clickable ? "pointer" : "default",
										transition: "all 0.24s ease",
										boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform =
											"translateY(-2px) scale(1.01)";
										e.currentTarget.style.boxShadow =
											"0 10px 20px rgba(15,23,42,0.08)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform =
											"translateY(0) scale(1)";
										e.currentTarget.style.boxShadow =
											"0 1px 2px rgba(15,23,42,0.04)";
									}}
								>
									<div className="d-flex align-items-start justify-content-between gap-3 mb-2">
										<div className="d-flex align-items-start gap-3 min-w-0">
											<div
												style={{
													width: 40,
													height: 40,
													borderRadius: 12,
													background: "rgba(255,255,255,0.75)",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexShrink: 0,
												}}
											>
												<i
													className={tone.icon}
													style={{
														fontSize: 17,
														color: tone.text,
														lineHeight: 1,
													}}
												/>
											</div>

											<div style={{ minWidth: 0 }}>
												<div
													style={{
														fontWeight: 700,
														fontSize: "0.95rem",
														color: "#0f172a",
														lineHeight: 1.15,
														marginBottom: row.note ? 4 : 0,
													}}
												>
													{row.label}
												</div>

												{row.note ? (
													<div
														style={{
															fontSize: 12.5,
															color: "#64748b",
															lineHeight: 1.4,
														}}
													>
														{row.note}
													</div>
												) : null}
											</div>
										</div>

										<div className="d-flex align-items-center gap-2 flex-shrink-0">
											<span
												className="badge"
												style={{
													background: tone.badgeBg,
													fontSize: 12,
													padding: "0.45rem 0.65rem",
													borderRadius: 999,
												}}
											>
												{tone.label}
											</span>

											<div
												style={{
													fontWeight: "bold",
													fontSize: "1rem",
													color: "#0f172a",
													minWidth: 48,
													textAlign: "right",
												}}
											>
												{row.value}
											</div>

											{clickable ? (
												<i
													className="ri-arrow-right-line"
													style={{
														fontSize: 18,
														color: "#475467",
													}}
												/>
											) : null}
										</div>
									</div>

									<ProgressBar
										now={percent}
										style={{
											height: 10,
											borderRadius: 999,
											backgroundColor: tone.progressBg,
											overflow: "hidden",
										}}
										variant=""
									>
										<ProgressBar
											now={percent}
											style={{
												background:
													row.status === "danger"
														? "linear-gradient(90deg, #dc3545 0%, #ef4444 100%)"
														: row.status === "warning"
															? "linear-gradient(90deg, #fd7e14 0%, #f59e0b 100%)"
															: "linear-gradient(90deg, #198754 0%, #22c55e 100%)",
												borderRadius: 999,
											}}
										/>
									</ProgressBar>
								</button>
							);
						})}
					</div>
				) : (
					<div
						style={{
							minHeight: 220,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
							textAlign: "center",
							color: "#64748b",
						}}
					>
						<div
							style={{
								width: 56,
								height: 56,
								borderRadius: 18,
								background:
									"linear-gradient(135deg, rgba(220,53,69,0.08) 0%, rgba(253,126,20,0.14) 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: 12,
							}}
						>
							<i
								className="ri-radar-line"
								style={{ fontSize: 24, color: "#dc3545" }}
							/>
						</div>

						<div
							style={{
								fontWeight: 800,
								color: "#0f172a",
								marginBottom: 4,
							}}
						>
							No monitoring items
						</div>
						<div style={{ fontSize: 13.5 }}>
							Monitoring indicators will appear here
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}