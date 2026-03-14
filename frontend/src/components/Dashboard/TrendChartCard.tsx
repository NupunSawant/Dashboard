import { Card } from "react-bootstrap";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type TrendPoint = {
	_id: string;
	count: number;
};

type Props = {
	title: string;
	data: TrendPoint[];
	color?: string;
	subtitle?: string;
	onClick?: () => void;
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

function sanitizeId(value: string) {
	return String(value).replace(/[^a-zA-Z0-9_-]/g, "");
}

export default function TrendChartCard({
	title,
	data,
	color = "#1a8376",
	subtitle = "Recent movement trend",
	onClick,
}: Props) {
	const clickable = typeof onClick === "function";
	const gradientId = `trendFill-${sanitizeId(title)}`;
	const strokeId = `trendStroke-${sanitizeId(title)}`;
	const peak = Math.max(...data.map((d) => d.count), 0);

	return (
		<Card
			onClick={onClick}
			className='border-0 shadow-sm h-100 overflow-hidden'
			style={{
				borderRadius: 18,
				cursor: clickable ? "pointer" : "default",
				background: "linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%)",
				transition: "transform 0.22s ease, box-shadow 0.22s ease",
				boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
				minWidth: 0,
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = "translateY(-4px)";
				e.currentTarget.style.boxShadow = "0 16px 30px rgba(15,23,42,0.10)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = "translateY(0)";
				e.currentTarget.style.boxShadow = "0 8px 20px rgba(15,23,42,0.06)";
			}}
		>
			<Card.Header
				className='d-flex align-items-center justify-content-between'
				style={{
					background: "linear-gradient(180deg, #ffffff 0%, #fcfdfd 100%)",
					borderBottom: "1px solid #edf2f7",
					padding: "1rem 1rem 0.95rem",
				}}
			>
				<div
					className='d-flex align-items-center gap-2'
					style={{ minWidth: 0 }}
				>
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: 12,
							background: `linear-gradient(135deg, ${hexToRgba(
								color,
								0.1,
							)} 0%, ${hexToRgba(color, 0.18)} 100%)`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
							flexShrink: 0,
						}}
					>
						<i
							className='ri-line-chart-line'
							style={{
								fontSize: 18,
								color,
								lineHeight: 1,
							}}
						/>
					</div>

					<div style={{ minWidth: 0 }}>
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

				{clickable ? (
					<div
						style={{
							fontSize: 12,
							fontWeight: 700,
							color,
							background: hexToRgba(color, 0.08),
							padding: "0.35rem 0.6rem",
							borderRadius: 999,
							border: `1px solid ${hexToRgba(color, 0.12)}`,
							flexShrink: 0,
						}}
					>
						View
					</div>
				) : null}
			</Card.Header>

			<Card.Body className='p-3' style={{ minWidth: 0 }}>
				{data?.length ? (
					<>
						<div
							style={{
								width: "100%",
								minWidth: 0,
								height: 240,
								borderRadius: 14,
								background: "linear-gradient(180deg, #fcfdfd 0%, #f8fafc 100%)",
								padding: "0.35rem 0.2rem 0 0.1rem",
								overflow: "hidden",
							}}
						>
							<ResponsiveContainer width='100%' height={240}>
								<AreaChart
									data={data}
									margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
								>
									<defs>
										<linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
											<stop offset='0%' stopColor={hexToRgba(color, 0.38)} />
											<stop offset='45%' stopColor={hexToRgba(color, 0.18)} />
											<stop offset='100%' stopColor={hexToRgba(color, 0.03)} />
										</linearGradient>

										<linearGradient id={strokeId} x1='0' y1='0' x2='1' y2='0'>
											<stop offset='0%' stopColor={hexToRgba(color, 0.85)} />
											<stop offset='100%' stopColor={color} />
										</linearGradient>
									</defs>

									<CartesianGrid
										strokeDasharray='3 3'
										stroke='#e9eef5'
										vertical={true}
										horizontal={true}
									/>

									<XAxis
										dataKey='_id'
										tick={{ fontSize: 12, fill: "#64748b" }}
										axisLine={false}
										tickLine={false}
									/>

									<YAxis
										tick={{ fontSize: 12, fill: "#64748b" }}
										axisLine={false}
										tickLine={false}
										allowDecimals={false}
									/>

									<Tooltip
										cursor={{
											stroke: hexToRgba(color, 0.22),
											strokeWidth: 1.5,
											strokeDasharray: "4 4",
										}}
										contentStyle={{
											borderRadius: 14,
											border: "1px solid #e8edf3",
											background: "#ffffff",
											boxShadow: "0 14px 28px rgba(15,23,42,0.10)",
											padding: "10px 12px",
										}}
										labelStyle={{
											color: "#0f172a",
											fontWeight: 700,
											marginBottom: 6,
										}}
										itemStyle={{
											color,
											fontWeight: 700,
										}}
									/>

									<Area
										type='monotone'
										dataKey='count'
										stroke={`url(#${strokeId})`}
										strokeWidth={3}
										fill={`url(#${gradientId})`}
										activeDot={{
											r: 5,
											fill: color,
											stroke: "#ffffff",
											strokeWidth: 2,
										}}
										dot={{ r: 0 }}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>

						<div className='d-flex justify-content-between align-items-center mt-3'>
							<div
								style={{
									fontSize: 12.5,
									color: "#64748b",
									fontWeight: 700,
								}}
							>
								Total Points: {data.length}
							</div>

							<div
								style={{
									fontSize: 12.5,
									color,
									fontWeight: 800,
								}}
							>
								Peak: {peak}
							</div>
						</div>
					</>
				) : (
					<div
						style={{
							minHeight: 240,
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
								background: `linear-gradient(135deg, ${hexToRgba(
									color,
									0.08,
								)} 0%, ${hexToRgba(color, 0.16)} 100%)`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: 12,
							}}
						>
							<i
								className='ri-line-chart-line'
								style={{ fontSize: 24, color }}
							/>
						</div>

						<div
							style={{
								fontWeight: 800,
								color: "#0f172a",
								marginBottom: 4,
							}}
						>
							No trend data
						</div>
						<div style={{ fontSize: 13.5 }}>
							Trend points will appear here when available
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}
