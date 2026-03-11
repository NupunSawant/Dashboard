import { Card } from "react-bootstrap";

type Item = {
	label: string;
	value: number;
	color: string;
};

type Props = {
	title: string;
	items: Item[];
};

export default function VisualBarPanel({ title, items }: Props) {
	const max = Math.max(...items.map((i) => i.value), 1);

	return (
		<Card
			style={{
				border: "1px solid #eef0f2",
				borderRadius: 14,
				boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
				height: "100%",
			}}
		>
			<Card.Header
				style={{
					background: "#fff",
					borderBottom: "1px solid #eef0f2",
					fontWeight: 700,
				}}
			>
				{title}
			</Card.Header>

			<Card.Body>
				{items.map((item) => (
					<div key={item.label} style={{ marginBottom: 16 }}>
						<div className="d-flex align-items-center justify-content-between mb-1">
							<div style={{ fontWeight: 700, color: "#334155" }}>{item.label}</div>
							<div style={{ fontWeight: 800, color: "#0f172a" }}>{item.value}</div>
						</div>

						<div
							style={{
								height: 10,
								width: "100%",
								background: "#eef2f7",
								borderRadius: 999,
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: `${(item.value / max) * 100}%`,
									height: "100%",
									background: item.color,
									borderRadius: 999,
									transition: "width 240ms ease",
								}}
							/>
						</div>
					</div>
				))}
			</Card.Body>
		</Card>
	);
}