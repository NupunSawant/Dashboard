import { Badge, Card, Table } from "react-bootstrap";

type MonitoringRow = {
	label: string;
	value: number;
	status: "good" | "warning" | "danger";
	note: string;
};

type Props = {
	title: string;
	rows: MonitoringRow[];
};

const badgeMap = {
	good: "success",
	warning: "warning",
	danger: "danger",
} as const;

export default function MonitoringTable({ title, rows }: Props) {
	return (
		<Card
			style={{
				border: "1px solid #eef0f2",
				borderRadius: 14,
				boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
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

			<Card.Body style={{ padding: 0 }}>
				<Table responsive hover className="mb-0 align-middle">
					<thead>
						<tr>
							<th style={{ padding: "12px 16px" }}>Metric</th>
							<th style={{ padding: "12px 16px" }}>Value</th>
							<th style={{ padding: "12px 16px" }}>Status</th>
							<th style={{ padding: "12px 16px" }}>Remark</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row.label}>
								<td style={{ padding: "12px 16px", fontWeight: 700 }}>
									{row.label}
								</td>
								<td style={{ padding: "12px 16px", fontWeight: 800 }}>
									{row.value}
								</td>
								<td style={{ padding: "12px 16px" }}>
									<Badge bg={badgeMap[row.status]}>
										{row.status.toUpperCase()}
									</Badge>
								</td>
								<td style={{ padding: "12px 16px", color: "#64748b" }}>
									{row.note}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
}