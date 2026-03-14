import { Card } from "react-bootstrap";

type FlowItem = {
	label: string;
	value: number;
	color?: string;
	icon?: string;
	onClick?: () => void;
};

type Props = {
	title: string;
	items: FlowItem[];
};

export default function FlowOverview({ title, items }: Props) {
	return (
		<Card
			className="border-0 shadow-sm h-100"
			style={{
				borderRadius: 16,
				background: "linear-gradient(180deg,#ffffff 0%,#fbfcfc 100%)",
			}}
		>
			<Card.Header
				style={{
					background: "#fff",
					borderBottom: "1px solid #eef0f2",
					fontWeight: 800,
				}}
			>
				<div className="d-flex align-items-center gap-2">
					<i
						className="ri-route-line"
						style={{ fontSize: 18, color: "#1a8376" }}
					/>
					{title}
				</div>
			</Card.Header>

			<Card.Body>
				<div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
					{items.map((item, i) => {
						const color = item.color || "#1a8376";

						return (
							<>
								<div
									key={item.label}
									onClick={item.onClick}
									style={{
										flex: 1,
										minWidth: 140,
										cursor: item.onClick ? "pointer" : "default",
									}}
								>
									<div
										style={{
											background: `linear-gradient(135deg,${color}22 0%,${color}11 100%)`,
											borderLeft: `4px solid ${color}`,
											padding: "1rem",
											borderRadius: 12,
											textAlign: "center",
											transition: "all .25s",
										}}
									>
										<div
											style={{
												fontSize: 13,
												color: "#64748b",
												fontWeight: 600,
											}}
										>
											{item.label}
										</div>

										<div
											style={{
												fontSize: 24,
												fontWeight: 800,
												color,
											}}
										>
											{item.value}
										</div>
									</div>
								</div>

								{i < items.length - 1 && (
									<div
										style={{
											fontSize: 20,
											color: "#94a3b8",
										}}
									>
										<i className="ri-arrow-right-line" />
									</div>
								)}
							</>
						);
					})}
				</div>
			</Card.Body>
		</Card>
	);
}