import { Card, Col, Row } from "react-bootstrap";

type Item = {
	label: string;
	value: number;
	color?: string;
	icon?: string;
};

type Props = {
	title: string;
	items: Item[];
};

export default function FlowOverview({ title, items }: Props) {
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
				<Row className='g-3'>
					{items.map((i) => (
						<Col md={6} xl={4} key={i.label}>
							<div
								style={{
									borderRadius: 12,
									padding: 14,
									background: i.color ? `${i.color}12` : "#f8f9fa",
									border: `1px solid ${i.color ? `${i.color}30` : "#eef0f2"}`,
									height: "100%",
								}}
							>
								<div className='d-flex align-items-center justify-content-between mb-2'>
									<div
										style={{
											fontSize: 13,
											fontWeight: 600,
											color: "#6c757d",
										}}
									>
										{i.label}
									</div>

									{i.icon ? (
										<i
											className={i.icon}
											style={{
												fontSize: 16,
												color: i.color || "#1a8376",
											}}
										/>
									) : null}
								</div>

								<div
									style={{
										fontSize: 22,
										fontWeight: 800,
										color: "#0f172a",
									}}
								>
									{i.value}
								</div>
							</div>
						</Col>
					))}
				</Row>
			</Card.Body>
		</Card>
	);
}
