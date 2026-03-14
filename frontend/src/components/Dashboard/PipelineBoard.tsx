import { Card } from "react-bootstrap";

type StageItem = {
	label: string;
	value: number | string;
	color?: string;
	icon?: string;
	onClick?: () => void;
};

type Props = {
	title: string;
	stages: StageItem[];
	subtitle?: string;
};

function hexToRgba(hex: string, alpha: number) {
	const cleaned = String(hex || "#1a8376").replace("#", "");
	const bigint = parseInt(cleaned, 16);

	if (cleaned.length !== 6 || Number.isNaN(bigint)) {
		return `rgba(26,131,118,${alpha})`;
	}

	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getSafeIcon(icon?: string) {
	return icon || "ri-node-tree";
}

export default function PipelineBoard({
	title,
	stages,
	subtitle = "Track stage-wise movement and flow",
}: Props) {
	return (
		<Card
			className='border-0 shadow-sm h-100 overflow-hidden'
			style={{
				borderRadius: 16,
				background: "linear-gradient(180deg, #ffffff 0%, #fbfcfc 100%)",
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
								"linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(26,131,118,0.14) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
							flexShrink: 0,
						}}
					>
						<i
							className='ri-git-merge-line'
							style={{
								fontSize: 18,
								color: "#1a8376",
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
							{title}
						</div>
						<div
							style={{
								fontSize: 13,
								color: "#64748b",
								marginTop: 2,
							}}
						>
							{subtitle}
						</div>
					</div>
				</div>

				<div
					style={{
						fontSize: 12,
						fontWeight: 700,
						color: "#1a8376",
						background: "rgba(26,131,118,0.08)",
						padding: "0.35rem 0.6rem",
						borderRadius: 999,
					}}
				>
					{stages.length} Stages
				</div>
			</Card.Header>

			<Card.Body className='p-3 p-md-4'>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
						gap: "0.9rem",
					}}
					className='pipeline-board-grid'
				>
					{stages.map((stage, index) => {
						const color = stage.color || "#1a8376";
						const clickable = typeof stage.onClick === "function";

						return (
							<div
								key={`${stage.label}-${index}`}
								className='position-relative'
								style={{ minWidth: 0 }}
							>
								<button
									type='button'
									onClick={stage.onClick}
									style={{
										width: "100%",
										border: "none",
										background: `linear-gradient(135deg, ${hexToRgba(
											color,
											0.1,
										)} 0%, ${hexToRgba(color, 0.18)} 100%)`,
										borderLeft: `4px solid ${color}`,
										borderRadius: 16,
										padding: "1rem",
										textAlign: "left",
										minHeight: 150,
										display: "flex",
										flexDirection: "column",
										justifyContent: "space-between",
										position: "relative",
										overflow: "hidden",
										cursor: clickable ? "pointer" : "default",
										transition:
											"transform 0.25s ease, box-shadow 0.25s ease, border-left-width 0.25s ease",
										boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform =
											"translateY(-4px) scale(1.01)";
										e.currentTarget.style.boxShadow =
											"0 14px 24px rgba(15,23,42,0.10)";
										e.currentTarget.style.borderLeftWidth = "5px";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = "translateY(0) scale(1)";
										e.currentTarget.style.boxShadow =
											"0 1px 2px rgba(15,23,42,0.04)";
										e.currentTarget.style.borderLeftWidth = "4px";
									}}
								>
									<div
										style={{
											position: "absolute",
											top: "-35%",
											right: "-20%",
											width: 150,
											height: 150,
											borderRadius: "50%",
											background: `radial-gradient(circle, ${hexToRgba(
												color,
												0.18,
											)} 0%, transparent 70%)`,
											pointerEvents: "none",
										}}
									/>

									<div
										className='d-flex align-items-start justify-content-between gap-2'
										style={{ position: "relative", zIndex: 1 }}
									>
										<div
											style={{
												width: 46,
												height: 46,
												borderRadius: 14,
												background: `linear-gradient(135deg, ${hexToRgba(
													color,
													0.14,
												)} 0%, ${hexToRgba(color, 0.24)} 100%)`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												boxShadow: `0 8px 16px ${hexToRgba(color, 0.18)}`,
												flexShrink: 0,
											}}
										>
											<i
												className={getSafeIcon(stage.icon)}
												style={{
													fontSize: 20,
													color,
													lineHeight: 1,
												}}
											/>
										</div>

										{clickable ? (
											<div
												style={{
													fontSize: 12,
													fontWeight: 700,
													color,
													background: hexToRgba(color, 0.1),
													padding: "0.3rem 0.5rem",
													borderRadius: 999,
													whiteSpace: "nowrap",
												}}
											>
												View
											</div>
										) : null}
									</div>

									<div style={{ position: "relative", zIndex: 1 }}>
										<div
											style={{
												fontSize: "0.78rem",
												fontWeight: 800,
												letterSpacing: "0.08em",
												textTransform: "uppercase",
												color,
												marginBottom: 8,
											}}
										>
											{stage.label}
										</div>

										<div
											style={{
												fontSize: "1.9rem",
												fontWeight: 800,
												lineHeight: 1.05,
												letterSpacing: "-0.03em",
												color: "#0f172a",
											}}
										>
											{stage.value}
										</div>
									</div>
								</button>

								{index < stages.length - 1 ? (
									<div
										className='pipeline-board-arrow'
										style={{
											position: "absolute",
											top: "50%",
											right: "-0.58rem",
											transform: "translateY(-50%)",
											zIndex: 3,
											width: 28,
											height: 28,
											borderRadius: "50%",
											background: "#fff",
											border: "1px solid #e2e8f0",
											boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<i
											className='ri-arrow-right-line'
											style={{
												fontSize: 16,
												color: "#64748b",
												lineHeight: 1,
											}}
										/>
									</div>
								) : null}
							</div>
						);
					})}
				</div>

				<style>
					{`
            @media (max-width: 1199px) {
              .pipeline-board-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              }
            }

            @media (max-width: 767px) {
              .pipeline-board-grid {
                grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
              }

              .pipeline-board-arrow {
                display: none !important;
              }
            }
          `}
				</style>
			</Card.Body>
		</Card>
	);
}
