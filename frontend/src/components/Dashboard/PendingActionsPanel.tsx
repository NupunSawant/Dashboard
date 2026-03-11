import { Badge, Card, ListGroup } from "react-bootstrap";

type Item = {
	key: string;
	label: string;
	count: number;
};

type Props = {
	items: Item[];
};

export default function PendingActionsPanel({ items }: Props) {
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
				Pending Actions
			</Card.Header>

			<ListGroup variant='flush'>
				{items.length ? (
					items.map((i) => (
						<ListGroup.Item
							key={i.key}
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								padding: "14px 16px",
							}}
						>
							<div style={{ fontWeight: 600 }}>{i.label}</div>
							<Badge bg={i.count > 0 ? "danger" : "secondary"} pill>
								{i.count}
							</Badge>
						</ListGroup.Item>
					))
				) : (
					<ListGroup.Item style={{ padding: "16px", color: "#6c757d" }}>
						No pending actions
					</ListGroup.Item>
				)}
			</ListGroup>
		</Card>
	);
}
