import { Badge, Card } from "react-bootstrap";

type Item = {
	key: string;
	label: string;
	count: number;
};

type Props = {
	items: Item[];
	onItemClick?: (item: Item) => void;
};

function getTone(count: number) {
	if (count > 10) {
		return {
			bg: "linear-gradient(135deg, rgba(220,53,69,0.12) 0%, rgba(220,53,69,0.18) 100%)",
			border: "#dc3545",
			badgeBg: "#dc3545",
			text: "#b42318",
			icon: "ri-alarm-warning-line",
		};
	}

	if (count > 0) {
		return {
			bg: "linear-gradient(135deg, rgba(253,126,20,0.12) 0%, rgba(253,126,20,0.18) 100%)",
			border: "#fd7e14",
			badgeBg: "#fd7e14",
			text: "#b54708",
			icon: "ri-time-line",
		};
	}

	return {
		bg: "linear-gradient(135deg, rgba(25,135,84,0.10) 0%, rgba(25,135,84,0.16) 100%)",
		border: "#198754",
		badgeBg: "#198754",
		text: "#067647",
		icon: "ri-checkbox-circle-line",
	};
}

export default function PendingActionsPanel({ items, onItemClick }: Props) {
	return (
		<Card
			className='border-0 shadow-sm h-100 overflow-hidden'
			style={{
				borderRadius: 16,
				background: "linear-gradient(180deg, #ffffff 0%, #fbfcfc 100%)",
				transition: "all 0.28s ease",
				minHeight: "100%",
			}}
		>
			<Card.Header
				className='d-flex align-items-center justify-content-between'
				style={{
					background: "#fff",
					borderBottom: "1px solid #eef0f2",
					padding: "1rem 1rem 0.95rem",
				}}
			>
				<div className='d-flex align-items-center gap-2'>
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: 12,
							background:
								"linear-gradient(135deg, rgba(220,53,69,0.10) 0%, rgba(253,126,20,0.18) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
							flexShrink: 0,
						}}
					>
						<i
							className='ri-alarm-warning-line'
							style={{
								fontSize: 18,
								color: "#dc3545",
								lineHeight: 1,
							}}
						/>
					</div>

					<div>
						<div
							style={{
								fontWeight: 800,
								fontSize: "1rem",
								color: "#0f172a",
								lineHeight: 1.1,
							}}
						>
							Pending Actions
						</div>
						<div
							style={{
								fontSize: 13,
								color: "#64748b",
								marginTop: 2,
							}}
						>
							Items requiring attention
						</div>
					</div>
				</div>

				<div
					style={{
						fontSize: 12,
						fontWeight: 700,
						color: "#dc3545",
						background: "rgba(220,53,69,0.08)",
						padding: "0.35rem 0.6rem",
						borderRadius: 999,
					}}
				>
					{items.reduce((sum, item) => sum + (item.count || 0), 0)}
				</div>
			</Card.Header>

			<Card.Body className='p-3'>
				{items.length ? (
					<div className='d-flex flex-column gap-2'>
						{items.map((item) => {
							const tone = getTone(item.count);
							const clickable = typeof onItemClick === "function";

							return (
								<button
									key={item.key}
									type='button'
									onClick={() => onItemClick?.(item)}
									style={{
										width: "100%",
										border: "none",
										background: tone.bg,
										borderLeft: `4px solid ${tone.border}`,
										borderRadius: 14,
										padding: "0.95rem 1rem",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: "0.9rem",
										textAlign: "left",
										cursor: clickable ? "pointer" : "default",
										transition: "all 0.24s ease",
										boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform =
											"translateY(-2px) scale(1.01)";
										e.currentTarget.style.boxShadow =
											"0 10px 20px rgba(15,23,42,0.08)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = "translateY(0) scale(1)";
										e.currentTarget.style.boxShadow =
											"0 1px 2px rgba(15,23,42,0.04)";
									}}
								>
									<div className='d-flex align-items-center gap-3'>
										<div
											style={{
												width: 42,
												height: 42,
												borderRadius: 12,
												background: "rgba(255,255,255,0.75)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												flexShrink: 0,
											}}
										>
											<i
												className={tone.icon}
												style={{
													fontSize: 18,
													color: tone.text,
													lineHeight: 1,
												}}
											/>
										</div>

										<div>
											<div
												style={{
													fontWeight: 700,
													fontSize: "0.95rem",
													color: "#0f172a",
													lineHeight: 1.15,
													marginBottom: 4,
												}}
											>
												{item.label}
											</div>

											<div
												style={{
													fontSize: 12.5,
													color: "#64748b",
												}}
											>
												{item.count > 0 ? "Requires review" : "No open action"}
											</div>
										</div>
									</div>

									<div className='d-flex align-items-center gap-2'>
										<Badge
											pill
											style={{
												background: tone.badgeBg,
												fontSize: 12,
												padding: "0.45rem 0.65rem",
												minWidth: 34,
											}}
										>
											{item.count}
										</Badge>

										{clickable ? (
											<i
												className='ri-arrow-right-line'
												style={{
													fontSize: 18,
													color: "#475467",
												}}
											/>
										) : null}
									</div>
								</button>
							);
						})}
					</div>
				) : (
					<div
						style={{
							minHeight: 220,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
							textAlign: "center",
							color: "#64748b",
						}}
					>
						<div
							style={{
								width: 56,
								height: 56,
								borderRadius: 18,
								background:
									"linear-gradient(135deg, rgba(25,135,84,0.10) 0%, rgba(25,135,84,0.18) 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: 12,
							}}
						>
							<i
								className='ri-checkbox-circle-line'
								style={{ fontSize: 24, color: "#198754" }}
							/>
						</div>

						<div
							style={{
								fontWeight: 800,
								color: "#0f172a",
								marginBottom: 4,
							}}
						>
							No pending actions
						</div>
						<div style={{ fontSize: 13.5 }}>
							Everything looks clear right now
						</div>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}
