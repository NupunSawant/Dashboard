import { Card, Table } from "react-bootstrap";

type RowItem = {
	label: string;
	value: number | string;
};

type Props = {
	title: string;
	icon: string;
	rows: RowItem[];
};

export default function ModuleSummaryCard({ title, icon, rows }: Props) {
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
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				<i className={icon} style={{ color: "#1a8376" }} />
				<span>{title}</span>
			</Card.Header>

			<Card.Body style={{ padding: 0 }}>
				<Table responsive hover className="mb-0">
					<tbody>
						{rows.map((row) => (
							<tr key={row.label}>
								<td style={{ padding: "12px 16px", fontWeight: 600 }}>
									{row.label}
								</td>
								<td
									style={{
										padding: "12px 16px",
										textAlign: "right",
										fontWeight: 800,
									}}
								>
									{row.value}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
}