import { Card } from "react-bootstrap";

type TrendItem = {
	_id: string;
	count: number;
};

type Props = {
	title: string;
	data: TrendItem[];
	color?: string;
};

export default function TrendChartCard({
	title,
	data,
	color = "#1a8376",
}: Props) {
	const max = Math.max(...data.map((d) => d.count), 1);

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
				{data.length ? (
					<div className='d-flex align-items-end gap-2' style={{ height: 220 }}>
						{data.map((item) => {
							const height = Math.max((item.count / max) * 160, 12);

							return (
								<div
									key={item._id}
									style={{
										flex: 1,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "flex-end",
										height: "100%",
									}}
								>
									<div
										style={{
											fontSize: 12,
											fontWeight: 700,
											marginBottom: 6,
										}}
									>
										{item.count}
									</div>

									<div
										style={{
											width: "100%",
											maxWidth: 40,
											height,
											background: color,
											borderRadius: "10px 10px 0 0",
											opacity: 0.9,
										}}
									/>

									<div
										style={{
											fontSize: 11,
											color: "#6c757d",
											marginTop: 8,
											textAlign: "center",
											wordBreak: "break-word",
										}}
									>
										{item._id}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div style={{ color: "#6c757d" }}>No trend data</div>
				)}
			</Card.Body>
		</Card>
	);
}
