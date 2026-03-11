import { Card, Col, ProgressBar, Row } from "react-bootstrap";

type Stage = {
	label: string;
	value: number;
	color: string;
	icon: string;
};

type Props = {
	title: string;
	stages: Stage[];
};

export default function PipelineBoard({ title, stages }: Props) {
	const total = stages.reduce((sum, s) => sum + s.value, 0) || 1;

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
				<Row className="g-3 mb-3">
					{stages.map((stage) => (
						<Col md={6} xl={4} key={stage.label}>
							<div
								style={{
									border: "1px solid #eef0f2",
									borderRadius: 12,
									padding: 14,
									background: "#fff",
									height: "100%",
								}}
							>
								<div className="d-flex align-items-center justify-content-between mb-2">
									<div
										style={{
											width: 38,
											height: 38,
											borderRadius: 10,
											background: `${stage.color}18`,
											color: stage.color,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 18,
										}}
									>
										<i className={stage.icon} />
									</div>

									<div
										style={{
											fontWeight: 800,
											fontSize: 22,
											color: "#0f172a",
										}}
									>
										{stage.value}
									</div>
								</div>

								<div
									style={{
										fontWeight: 700,
										color: "#334155",
										marginBottom: 8,
									}}
								>
									{stage.label}
								</div>

								<ProgressBar
									now={(stage.value / total) * 100}
									style={{ height: 8, borderRadius: 999 }}
									variant="success"
								/>
							</div>
						</Col>
					))}
				</Row>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
						gap: 12,
					}}
				>
					{stages.map((stage) => (
						<div
							key={`${stage.label}-mini`}
							style={{
								padding: "10px 12px",
								background: "#f8fafc",
								borderRadius: 10,
								border: "1px solid #eef0f2",
							}}
						>
							<div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
								{stage.label}
							</div>
							<div style={{ fontSize: 18, fontWeight: 800, color: stage.color }}>
								{stage.value}
							</div>
						</div>
					))}
				</div>
			</Card.Body>
		</Card>
	);
}