import { Card, Table } from "react-bootstrap";

type RowItem = {
	label: string;
	value: number | string;
	trend?: string;
};

type Props = {
	title: string;
	icon: string;
	rows: RowItem[];
};

export default function DashboardStatTable({ title, icon, rows }: Props) {
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
				<Table responsive hover className='mb-0 align-middle'>
					<tbody>
						{rows.map((row) => (
							<tr key={row.label}>
								<td style={{ padding: "12px 16px" }}>
									<div style={{ fontWeight: 700, color: "#334155" }}>
										{row.label}
									</div>
									{row.trend ? (
										<div style={{ fontSize: 12, color: "#94a3b8" }}>
											{row.trend}
										</div>
									) : null}
								</td>
								<td
									style={{
										padding: "12px 16px",
										textAlign: "right",
										fontWeight: 800,
										fontSize: 18,
										color: "#0f172a",
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
