import { Card, ProgressBar } from "react-bootstrap";

type BarItem = {
	label: string;
	value: number | string;
	color?: string;
	onClick?: () => void;
};

type Props = {
	title: string;
	items: BarItem[];
	subtitle?: string;
};

function hexToRgba(hex: string, alpha: number) {
	const cleaned = String(hex || "#1a8376").replace("#", "");
	const bigint = parseInt(cleaned, 16);

	if (cleaned.length !== 6 || Number.isNaN(bigint)) {
		return `rgba(26,131,118,${alpha})`;
	}

	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toNumber(value: number | string) {
	const num = typeof value === "number" ? value : Number(value);
	return Number.isNaN(num) ? 0 : num;
}

function formatValue(value: number | string) {
	const num = toNumber(value);
	return num.toLocaleString("en-IN");
}

export default function VisualBarPanel({
	title,
	items,
	subtitle = "Compare quantity movement across tracked actions",
}: Props) {
	const numericValues = items.map((item) => toNumber(item.value));
	const maxValue = Math.max(...numericValues, 0);
	const totalValue = numericValues.reduce((sum, val) => sum + val, 0);

	return (
		<Card
			className='border-0 shadow-sm h-100 overflow-hidden'
			style={{
				borderRadius: 16,
				background: "linear-gradient(180deg, #ffffff 0%, #fbfcfc 100%)",
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
								"linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(26,131,118,0.14) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
							flexShrink: 0,
						}}
					>
						<i
							className='ri-bar-chart-grouped-line'
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
					Total {formatValue(totalValue)}
				</div>
			</Card.Header>

			<Card.Body className='p-3'>
				{items.length ? (
					<div className='d-flex flex-column gap-3'>
						{items.map((item, index) => {
							const color = item.color || "#1a8376";
							const numericValue = toNumber(item.value);
							const percentage =
								maxValue > 0 ? Math.max((numericValue / maxValue) * 100, 2) : 0;
							const clickable = typeof item.onClick === "function";

							return (
								<button
									key={`${item.label}-${index}`}
									type='button'
									onClick={item.onClick}
									style={{
										width: "100%",
										border: "none",
										background: `linear-gradient(135deg, ${hexToRgba(
											color,
											0.07,
										)} 0%, ${hexToRgba(color, 0.12)} 100%)`,
										borderLeft: `4px solid ${color}`,
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
										e.currentTarget.style.transform = "translateY(0) scale(1)";
										e.currentTarget.style.boxShadow =
											"0 1px 2px rgba(15,23,42,0.04)";
									}}
								>
									<div className='d-flex align-items-center justify-content-between gap-3 mb-2'>
										<div className='d-flex align-items-center gap-3 min-w-0'>
											<div
												style={{
													width: 40,
													height: 40,
													borderRadius: 12,
													background: `linear-gradient(135deg, ${hexToRgba(
														color,
														0.14,
													)} 0%, ${hexToRgba(color, 0.22)} 100%)`,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexShrink: 0,
												}}
											>
												<i
													className='ri-stack-line'
													style={{
														fontSize: 17,
														color,
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
													}}
												>
													{item.label}
												</div>
												<div
													style={{
														fontSize: 12.5,
														color: "#64748b",
														marginTop: 3,
													}}
												>
													{maxValue > 0
														? `${Math.round(
																(numericValue / (totalValue || 1)) * 100,
															)}% of total movement`
														: "No movement"}
												</div>
											</div>
										</div>

										<div className='d-flex align-items-center gap-2 flex-shrink-0'>
											<div
												style={{
													fontWeight: 800,
													fontSize: "1rem",
													color: "#0f172a",
													whiteSpace: "nowrap",
												}}
											>
												{formatValue(item.value)}
											</div>

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
									</div>

									<ProgressBar
										now={percentage}
										style={{
											height: 10,
											borderRadius: 999,
											backgroundColor: hexToRgba(color, 0.14),
											overflow: "hidden",
										}}
										variant=''
									>
										<ProgressBar
											now={percentage}
											style={{
												background: `linear-gradient(90deg, ${color} 0%, ${hexToRgba(
													color,
													0.82,
												)} 100%)`,
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
									"linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(26,131,118,0.14) 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: 12,
							}}
						>
							<i
								className='ri-bar-chart-grouped-line'
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
							No analytics available
						</div>
						<div style={{ fontSize: 13.5 }}>
							Movement data will appear here when available
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}
