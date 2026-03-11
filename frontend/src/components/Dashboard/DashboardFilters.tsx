import { Button, Card, Col, Form, Row } from "react-bootstrap";

export type DashboardFilterValues = {
	from: string;
	to: string;
	warehouseName: string;
};

type Props = {
	values: DashboardFilterValues;
	warehouseOptions: string[];
	onChange: (name: keyof DashboardFilterValues, value: string) => void;
	onApply: () => void;
	onReset: () => void;
	loading?: boolean;
};

export default function DashboardFilters({
	values,
	warehouseOptions,
	onChange,
	onApply,
	onReset,
	loading,
}: Props) {
	return (
		<Card
			style={{
				border: "1px solid #eef0f2",
				borderRadius: 14,
				boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
			}}
			className='mb-4'
		>
			<Card.Body>
				<Row className='g-3 align-items-end'>
					<Col md={3}>
						<Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
						<Form.Control
							type='date'
							value={values.from}
							onChange={(e) => onChange("from", e.target.value)}
						/>
					</Col>

					<Col md={3}>
						<Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
						<Form.Control
							type='date'
							value={values.to}
							onChange={(e) => onChange("to", e.target.value)}
						/>
					</Col>

					<Col md={4}>
						<Form.Label style={{ fontWeight: 600 }}>Warehouse</Form.Label>
						<Form.Select
							value={values.warehouseName}
							onChange={(e) => onChange("warehouseName", e.target.value)}
						>
							<option value=''>All Warehouses</option>
							{warehouseOptions.map((w) => (
								<option key={w} value={w}>
									{w}
								</option>
							))}
						</Form.Select>
					</Col>

					<Col md={2}>
						<div className='d-flex gap-2'>
							<Button
								variant='success'
								onClick={onApply}
								disabled={loading}
								style={{ flex: 1 }}
							>
								Apply
							</Button>
							<Button
								variant='outline-secondary'
								onClick={onReset}
								disabled={loading}
								style={{ flex: 1 }}
							>
								Reset
							</Button>
						</div>
					</Col>
				</Row>
			</Card.Body>
		</Card>
	);
}
