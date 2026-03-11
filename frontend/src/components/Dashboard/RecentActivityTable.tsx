import { Badge, Card, Table } from "react-bootstrap";

type Activity = {
	id: string;
	module: string;
	refNo: string;
	status: string;
	partyName: string;
	warehouseName: string;
};

type Props = {
	data: Activity[];
};

const getBadgeVariant = (status: string) => {
	const s = String(status || "").toUpperCase();

	if (["DELIVERED", "COMPLETED", "WON", "CLOSED"].includes(s)) return "success";
	if (["PENDING", "ISSUED", "SEND", "REQUESTED_FOR_DISPATCH"].includes(s))
		return "warning";
	if (["CANCELLED", "LOST", "REVERTED"].includes(s)) return "danger";

	return "secondary";
};

export default function RecentActivityTable({ data }: Props) {
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
				Recent Activity
			</Card.Header>

			<Card.Body style={{ padding: 0 }}>
				<Table responsive hover className='mb-0'>
					<thead>
						<tr>
							<th style={{ padding: "12px 16px" }}>Module</th>
							<th style={{ padding: "12px 16px" }}>Ref No</th>
							<th style={{ padding: "12px 16px" }}>Status</th>
							<th style={{ padding: "12px 16px" }}>Party</th>
							<th style={{ padding: "12px 16px" }}>Warehouse</th>
						</tr>
					</thead>

					<tbody>
						{data.length ? (
							data.map((a) => (
								<tr key={a.id}>
									<td style={{ padding: "12px 16px", fontWeight: 700 }}>
										{a.module}
									</td>
									<td style={{ padding: "12px 16px" }}>{a.refNo}</td>
									<td style={{ padding: "12px 16px" }}>
										<Badge bg={getBadgeVariant(a.status)}>{a.status}</Badge>
									</td>
									<td style={{ padding: "12px 16px" }}>{a.partyName}</td>
									<td style={{ padding: "12px 16px" }}>{a.warehouseName}</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={5}
									style={{
										padding: "18px 16px",
										textAlign: "center",
										color: "#6c757d",
									}}
								>
									No recent activity
								</td>
							</tr>
						)}
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
}
