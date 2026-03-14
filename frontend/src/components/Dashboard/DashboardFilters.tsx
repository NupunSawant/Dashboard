import { useMemo } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import "./DashboardFilters.css";

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
	loading = false,
}: Props) {
	const uniqueWarehouses = useMemo(
		() => Array.from(new Set((warehouseOptions || []).filter(Boolean))),
		[warehouseOptions],
	);

	return (
		<div className='dashboard-filter-sticky-wrap'>
			<Card className='dashboard-filter-card border-0 shadow-sm mb-4'>
				<Card.Body className='dashboard-filter-card-body'>
					<div className='dashboard-filter-topbar'>
						<div className='dashboard-filter-topbar-left'>
							<div className='dashboard-filter-icon-wrap'>
								<i className='ri-filter-3-line dashboard-filter-topbar-icon' />
							</div>
							<div>
								<div className='dashboard-filter-title'>Filters</div>
								<div className='dashboard-filter-subtitle'>
									Refine dashboard data by date and warehouse
								</div>
							</div>
						</div>

						<div className='dashboard-filter-topbar-right'>
							<div className='dashboard-filter-status-pill'>
								<i className='ri-equalizer-line' />
								<span>Live Filters</span>
							</div>
						</div>
					</div>

					<Row className='g-3 align-items-end'>
						<Col md={6} xl={3}>
							<Form.Group>
								<Form.Label className='dashboard-filter-label'>
									<i className='ri-calendar-line' />
									<span>From Date</span>
								</Form.Label>
								<Form.Control
									type='date'
									value={values.from}
									onChange={(e) => onChange("from", e.target.value)}
									className='dashboard-filter-control'
									max={values.to || undefined}
								/>
							</Form.Group>
						</Col>

						<Col md={6} xl={3}>
							<Form.Group>
								<Form.Label className='dashboard-filter-label'>
									<i className='ri-calendar-check-line' />
									<span>To Date</span>
								</Form.Label>
								<Form.Control
									type='date'
									value={values.to}
									onChange={(e) => onChange("to", e.target.value)}
									className='dashboard-filter-control'
									min={values.from || undefined}
								/>
							</Form.Group>
						</Col>

						<Col md={12} xl={4}>
							<Form.Group>
								<Form.Label className='dashboard-filter-label'>
									<i className='ri-building-line' />
									<span>Warehouse</span>
								</Form.Label>
								<Form.Select
									value={values.warehouseName}
									onChange={(e) => onChange("warehouseName", e.target.value)}
									className='dashboard-filter-control'
								>
									<option value=''>All Warehouses</option>
									{uniqueWarehouses.map((warehouse) => (
										<option key={warehouse} value={warehouse}>
											{warehouse}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>

						<Col md={12} xl={2}>
							<div className='dashboard-filter-actions'>
								<Button
									type='button'
									onClick={onApply}
									disabled={loading}
									className='dashboard-filter-btn dashboard-filter-btn-apply'
								>
									{loading ? (
										<>
											<Spinner animation='border' size='sm' />
											<span>Applying</span>
										</>
									) : (
										<>
											<i className='ri-search-eye-line' />
											<span>Apply</span>
										</>
									)}
								</Button>

								<Button
									type='button'
									variant='light'
									onClick={onReset}
									disabled={loading}
									className='dashboard-filter-btn dashboard-filter-btn-reset'
								>
									<i className='ri-refresh-line' />
									<span>Reset</span>
								</Button>
							</div>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</div>
	);
}
