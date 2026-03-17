import { Card } from "react-bootstrap";

type SummaryCardProps = {
	title: string;
	value: number | string;
	icon: string;
	color?: string;
	subtitle?: string;
	onClick?: () => void;
};

function hexToRgba(hex: string, alpha: number) {
	const cleaned = hex.replace("#", "");
	const bigint = parseInt(cleaned, 16);

	if (cleaned.length !== 6 || Number.isNaN(bigint)) {
		return `rgba(26,131,118,${alpha})`;
	}

	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function SummaryCard({
	title,
	value,
	icon,
	color = "#1a8376",
	subtitle,
	onClick,
}: SummaryCardProps) {
	const clickable = typeof onClick === "function";

	const softBg = `linear-gradient(135deg, ${hexToRgba(color, 0.1)} 0%, ${hexToRgba(
		color,
		0.18,
	)} 100%)`;

	const iconBg = `linear-gradient(135deg, ${hexToRgba(color, 0.14)} 0%, ${hexToRgba(
		color,
		0.24,
	)} 100%)`;

	return (
		<Card
			onClick={onClick}
			className='border-0 shadow-sm h-100 overflow-hidden'
			style={{
				borderRadius: "1rem",
				cursor: clickable ? "pointer" : "default",
				transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
				background: softBg,
				borderLeft: `4px solid ${color}`,
				minHeight: 148,
				position: "relative",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = "translateY(-6px) scale(1.015)";
				e.currentTarget.style.boxShadow = "0 18px 30px rgba(15, 23, 42, 0.14)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = "translateY(0) scale(1)";
				e.currentTarget.style.boxShadow = "";
			}}
		>
			<div
				style={{
					position: "absolute",
					top: "-35%",
					right: "-18%",
					width: 180,
					height: 180,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${hexToRgba(
						color,
						0.16,
					)} 0%, transparent 70%)`,
					pointerEvents: "none",
				}}
			/>

			<Card.Body
				className='p-3 p-md-4 d-flex flex-column justify-content-between'
				style={{ position: "relative", zIndex: 1 }}
			>
				<div className='d-flex align-items-start justify-content-between gap-3'>
					<div
						style={{
							width: 52,
							height: 52,
							borderRadius: "0.9rem",
							background: iconBg,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: `0 8px 16px ${hexToRgba(color, 0.18)}`,
							flexShrink: 0,
							transition: "transform 0.28s ease",
						}}
					>
						<i
							className={icon}
							style={{
								fontSize: 22,
								color,
								lineHeight: 1,
							}}
						/>
					</div>

					{clickable ? (
						<div
							style={{
								fontSize: 12,
								fontWeight: 700,
								color,
								background: hexToRgba(color, 0.1),
								padding: "0.3rem 0.55rem",
								borderRadius: 999,
								whiteSpace: "nowrap",
							}}
						>
							View
						</div>
					) : null}
				</div>

				<div className='mt-3'>
					<div
						style={{
							fontSize: "0.82rem",
							fontWeight: 700,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							color,
							opacity: 0.95,
							marginBottom: 8,
						}}
					>
						{title}
					</div>

					<div
						style={{
							fontSize: "2rem",
							fontWeight: 800,
							lineHeight: 1.1,
							letterSpacing: "-0.03em",
							color: "#0f172a",
							marginBottom: 8,
						}}
					>
						{value}
					</div>

					{subtitle ? (
						<div
							style={{
								fontSize: "0.9rem",
								color: "#64748b",
								fontWeight: 500,
							}}
						>
							{subtitle}
						</div>
					) : null}
				</div>
			</Card.Body>
		</Card>
	);
}
