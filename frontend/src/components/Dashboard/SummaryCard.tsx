import { Card } from "react-bootstrap";

type Props = {
	title: string;
	value: number | string;
	icon: string;
	color: string;
	subtitle?: string;
};

export default function SummaryCard({
	title,
	value,
	icon,
	color,
	subtitle,
}: Props) {
	return (
		<Card
			style={{
				border: "1px solid #eef0f2",
				borderRadius: 14,
				boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
				overflow: "hidden",
				height: "100%",
			}}
		>
			<div style={{ height: 4, background: color }} />
			<Card.Body
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 12,
				}}
			>
				<div>
					<div
						style={{
							fontSize: 13,
							fontWeight: 600,
							color: "#6c757d",
							marginBottom: 4,
						}}
					>
						{title}
					</div>

					<div
						style={{
							fontSize: 26,
							fontWeight: 800,
							color: "#0f172a",
							lineHeight: 1.1,
						}}
					>
						{value}
					</div>

					{subtitle ? (
						<div
							style={{
								fontSize: 12,
								color: "#878a99",
								marginTop: 6,
							}}
						>
							{subtitle}
						</div>
					) : null}
				</div>

				<div
					style={{
						width: 52,
						height: 52,
						borderRadius: 14,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: `${color}14`,
						color,
						fontSize: 22,
						flexShrink: 0,
					}}
				>
					<i className={icon} />
				</div>
			</Card.Body>
		</Card>
	);
}
