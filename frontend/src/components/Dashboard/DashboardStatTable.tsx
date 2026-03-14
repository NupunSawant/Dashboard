import { Card, Badge } from "react-bootstrap";

type RowItem = {
	label: string;
	value: number | string;
	trend?: string;
	status?: "good" | "warning" | "danger" | "neutral";
};

type Props = {
	title: string;
	icon?: string;
	rows: RowItem[];
	onRowClick?: (row: RowItem) => void;
};

function getRowTone(
	status: RowItem["status"],
	value: number | string,
	index: number,
) {
	if (status === "danger") {
		return {
			bg: "linear-gradient(135deg, rgba(220,53,69,0.08) 0%, rgba(220,53,69,0.14) 100%)",
			border: "#dc3545",
			text: "#b42318",
			badgeBg: "#dc3545",
			icon: "ri-close-circle-line",
		};
	}

	if (status === "warning") {
		return {
			bg: "linear-gradient(135deg, rgba(253,126,20,0.08) 0%, rgba(253,126,20,0.14) 100%)",
			border: "#fd7e14",
			text: "#b54708",
			badgeBg: "#fd7e14",
			icon: "ri-error-warning-line",
		};
	}

	if (status === "good") {
		return {
			bg: "linear-gradient(135deg, rgba(25,135,84,0.08) 0%, rgba(25,135,84,0.14) 100%)",
			border: "#198754",
			text: "#067647",
			badgeBg: "#198754",
			icon: "ri-checkbox-circle-line",
		};
	}

	const num = typeof value === "number" ? value : Number(value);
	if (!Number.isNaN(num)) {
		if (num === 0) {
			return {
				bg: "linear-gradient(135deg, rgba(100,116,139,0.06) 0%, rgba(100,116,139,0.12) 100%)",
				border: "#94a3b8",
				text: "#475467",
				badgeBg: "#64748b",
				icon: "ri-subtract-line",
			};
		}

		const palette = [
			{
				bg: "linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(13,110,253,0.14) 100%)",
				border: "#0d6efd",
				text: "#175cd3",
				badgeBg: "#0d6efd",
				icon: "ri-bar-chart-box-line",
			},
			{
				bg: "linear-gradient(135deg, rgba(111,66,193,0.08) 0%, rgba(111,66,193,0.14) 100%)",
				border: "#6f42c1",
				text: "#5925dc",
				badgeBg: "#6f42c1",
				icon: "ri-pie-chart-2-line",
			},
			{
				bg: "linear-gradient(135deg, rgba(26,131,118,0.08) 0%, rgba(26,131,118,0.14) 100%)",
				border: "#1a8376",
				text: "#0f766e",
				badgeBg: "#1a8376",
				icon: "ri-line-chart-line",
			},
		];
		return palette[index % palette.length];
	}

	return {
		bg: "linear-gradient(135deg, rgba(100,116,139,0.06) 0%, rgba(100,116,139,0.12) 100%)",
		border: "#94a3b8",
		text: "#475467",
		badgeBg: "#64748b",
		icon: "ri-information-line",
	};
}

export default function DashboardStatTable({
	title,
	icon = "ri-grid-line",
	rows,
	onRowClick,
}: Props) {
	const clickable = typeof onRowClick === "function";

	return (
		<Card
			className='border-0 shadow-sm h-100 overflow-hidden'
			style={{
				borderRadius: 16,
				background: "linear-gradient(180deg, #ffffff 0%, #fbfcfc 100%)",
				minHeight: "100%",
				transition: "all 0.28s ease",
			}}
		>
			<Card.Header
				className='d-flex align-items-center justify-content-between'
				style={{
					background: "#fff",
					borderBottom: "1px solid #eef0f2",
					padding: "1rem 1rem 0.95rem",
				}}
			>
				<div className='d-flex align-items-center gap-2'>
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: 12,
							background:
								"linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(111,66,193,0.14) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
							flexShrink: 0,
						}}
					>
						<i
							className={icon}
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
							Structured overview
						</div>
					</div>
				</div>

				<div
					style={{
						fontSize: 12,
						fontWeight: 700,
						color: "#1a8376",
						background: "rgba(26,131,118,0.08)",
						padding: "0.35rem 0.6rem",
						borderRadius: 999,
					}}
				>
					{rows.length}
				</div>
			</Card.Header>

			<Card.Body className='p-3'>
				{rows.length ? (
					<div className='d-flex flex-column gap-2'>
						{rows.map((row, index) => {
							const tone = getRowTone(row.status, row.value, index);

							return (
								<button
									key={`${row.label}-${index}`}
									type='button'
									onClick={() => onRowClick?.(row)}
									style={{
										width: "100%",
										border: "none",
										background: tone.bg,
										borderLeft: `4px solid ${tone.border}`,
										borderRadius: 14,
										padding: "0.9rem 1rem",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: "0.9rem",
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
										e.currentTarget.style.transform = "translateY(0) scale(1)";
										e.currentTarget.style.boxShadow =
											"0 1px 2px rgba(15,23,42,0.04)";
									}}
								>
									<div className='d-flex align-items-center gap-3'>
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

										<div>
											<div
												style={{
													fontWeight: 700,
													fontSize: "0.95rem",
													color: "#0f172a",
													lineHeight: 1.15,
													marginBottom: row.trend ? 4 : 0,
												}}
											>
												{row.label}
											</div>

											{row.trend ? (
												<div
													style={{
														fontSize: 12.5,
														color: "#64748b",
													}}
												>
													{row.trend}
												</div>
											) : null}
										</div>
									</div>

									<div className='d-flex align-items-center gap-2'>
										<Badge
											pill
											style={{
												background: tone.badgeBg,
												fontSize: 12,
												padding: "0.45rem 0.7rem",
												minWidth: 44,
											}}
										>
											{row.value}
										</Badge>

										{clickable ? (
											<i
												className='ri-arrow-right-line'
												style={{
													fontSize: 18,
													color: "#475467",
												}}
											/>
										) : null}
									</div>
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
									"linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(111,66,193,0.14) 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: 12,
							}}
						>
							<i
								className='ri-file-list-3-line'
								style={{ fontSize: 24, color: "#1a8376" }}
							/>
						</div>

						<div
							style={{
								fontWeight: 800,
								color: "#0f172a",
								marginBottom: 4,
							}}
						>
							No records available
						</div>
						<div style={{ fontSize: 13.5 }}>
							Data will appear here when available
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}
