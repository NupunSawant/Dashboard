import { Button, Card, Container } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

const theme = "#1a8376";

export default function AccessDenied() {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "#f8fafb",
				padding: "32px 20px",
			}}
		>
			<Container fluid>
				<Card
					style={{
						border: "1px solid #e9ebec",
						borderRadius: "14px",
						boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
						overflow: "hidden",
						maxWidth: 760,
						margin: "40px auto",
					}}
				>
					<div
						style={{
							height: 5,
							background: theme,
						}}
					/>

					<Card.Body style={{ padding: "32px" }}>
						<div
							style={{
								width: 64,
								height: 64,
								borderRadius: "12px",
								background: "#fff1f2",
								color: "#dc3545",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 30,
								marginBottom: 20,
							}}
						>
							<i className='ri-lock-2-line' />
						</div>

						<h2
							style={{
								margin: 0,
								fontSize: "28px",
								fontWeight: 700,
								color: "#212529",
							}}
						>
							Access Denied
						</h2>

						<p
							style={{
								marginTop: 10,
								marginBottom: 6,
								fontSize: "15px",
								color: "#6c757d",
								lineHeight: 1.7,
							}}
						>
							You do not have permission to access this page.
						</p>

						{location.state?.from && (
							<p
								style={{
									marginTop: 0,
									marginBottom: 24,
									fontSize: "14px",
									color: "#495057",
								}}
							>
								Requested route: <strong>{location.state.from}</strong>
							</p>
						)}

						<div className='d-flex flex-wrap gap-2'>
							<Button
								variant='light'
								onClick={() => navigate(-1)}
								style={{
									border: "1px solid #e9ebec",
									fontSize: "13px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									padding: "8px 14px",
								}}
							>
								<i className='ri-arrow-left-line' /> Go Back
							</Button>
						</div>
					</Card.Body>
				</Card>
			</Container>
		</div>
	);
}
