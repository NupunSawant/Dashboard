import { Card } from "react-bootstrap";

type Metric = {
	label: string;
	value: number | string;
};

type Props = {
	title: string;
	icon?: string;
	color?: string;
	metrics: Metric[];
	onClick?: () => void;
};

export default function ModuleSummaryCard({
	title,
	icon = "ri-apps-line",
	color = "#1a8376",
	metrics,
	onClick,
}: Props) {
	return (
		<Card
			onClick={onClick}
			className='border-0 shadow-sm h-100'
			style={{
				borderRadius: 16,
				cursor: onClick ? "pointer" : "default",
				background: "linear-gradient(180deg,#ffffff 0%,#fbfcfc 100%)",
				transition: "all .25s",
			}}
		>
			<Card.Body>
				<div className='d-flex align-items-center justify-content-between mb-3'>
					<div className='d-flex align-items-center gap-2'>
						<div
							style={{
								width: 38,
								height: 38,
								borderRadius: 10,
								background: `${color}22`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<i className={icon} style={{ color, fontSize: 18 }} />
						</div>

						<div
							style={{
								fontWeight: 800,
								fontSize: 15,
								color: "#0f172a",
							}}
						>
							{title}
						</div>
					</div>

					<i className='ri-arrow-right-line text-muted' />
				</div>

				<div className='d-flex flex-column gap-2'>
					{metrics.map((m) => (
						<div
							key={m.label}
							className='d-flex justify-content-between align-items-center'
						>
							<div
								style={{
									fontSize: 13,
									color: "#64748b",
									fontWeight: 600,
								}}
							>
								{m.label}
							</div>

							<div
								style={{
									fontSize: 16,
									fontWeight: 800,
									color,
								}}
							>
								{m.value}
							</div>
						</div>
					))}
				</div>
			</Card.Body>
		</Card>
	);
}
