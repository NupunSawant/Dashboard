import React, { useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
	Button,
	Form,
	InputGroup,
	Pagination,
	Spinner,
	Table,
} from "react-bootstrap";
import "./DashboardSlidePanel.css";

export type DashboardPanelColumn<T = any> = {
	key: string;
	label: string;
	width?: string | number;
	render?: (row: T, index: number) => React.ReactNode;
};

type DashboardSlidePanelProps<T = any> = {
	isOpen: boolean;
	title: string;
	subtitle?: string;
	loading?: boolean;
	error?: string | null;
	columns: DashboardPanelColumn<T>[];
	rows: T[];
	total?: number;
	page?: number;
	pageSize?: number;
	search?: string;
	onSearchChange?: (value: string) => void;
	onPageChange?: (page: number) => void;
	onClose: () => void;
};

function getPageItems(current: number, totalPages: number) {
	const items: Array<number | "ellipsis"> = [];

	if (totalPages <= 7) {
		for (let i = 1; i <= totalPages; i++) items.push(i);
		return items;
	}

	items.push(1);

	if (current > 3) items.push("ellipsis");

	const start = Math.max(2, current - 1);
	const end = Math.min(totalPages - 1, current + 1);

	for (let i = start; i <= end; i++) items.push(i);

	if (current < totalPages - 2) items.push("ellipsis");

	items.push(totalPages);

	return items;
}

export default function DashboardSlidePanel<T = any>({
	isOpen,
	title,
	subtitle,
	loading = false,
	error = null,
	columns,
	rows,
	total = 0,
	page = 1,
	pageSize = 10,
	search = "",
	onSearchChange,
	onPageChange,
	onClose,
}: DashboardSlidePanelProps<T>) {
	useLayoutEffect(() => {
		if (!isOpen) return;

		const originalBodyOverflow = document.body.style.overflow;
		const originalHtmlOverflow = document.documentElement.style.overflow;
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;
		const originalBodyPaddingRight = document.body.style.paddingRight;

		document.body.style.overflow = "hidden";
		document.body.style.paddingRight =
			scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
		document.documentElement.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = originalBodyOverflow;
			document.body.style.paddingRight = originalBodyPaddingRight;
			document.documentElement.style.overflow = originalHtmlOverflow;
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageItems = getPageItems(page, totalPages);

	const content = (
		<>
			<div className='dashboard-slide-panel-backdrop' onClick={onClose} />

			<aside
				className='dashboard-slide-panel'
				role='dialog'
				aria-modal='true'
				aria-label={title}
			>
				<div className='dashboard-slide-panel-header'>
					<div className='dashboard-slide-panel-header-left'>
						<div className='dashboard-slide-panel-icon-wrap'>
							<i className='ri-layout-right-2-line' />
						</div>

						<div>
							<h2 className='dashboard-slide-panel-title mb-1'>{title}</h2>
							<div className='dashboard-slide-panel-subtitle'>
								{subtitle || `${total} record${total === 1 ? "" : "s"}`}
							</div>
						</div>
					</div>

					<Button
						variant='link'
						className='dashboard-slide-panel-close-btn'
						onClick={onClose}
					>
						<i className='ri-close-line' />
					</Button>
				</div>

				<div className='dashboard-slide-panel-toolbar'>
					<div className='dashboard-slide-panel-search-wrap'>
						<InputGroup className='dashboard-slide-panel-search-group'>
							<InputGroup.Text className='dashboard-slide-panel-search-icon'>
								<i className='ri-search-2-line' />
							</InputGroup.Text>

							<Form.Control
								value={search}
								onChange={(e) => onSearchChange?.(e.target.value)}
								placeholder='Search records...'
								className='dashboard-slide-panel-search-input'
							/>
						</InputGroup>
					</div>

					<div className='dashboard-slide-panel-toolbar-meta'>
						<span className='dashboard-slide-panel-meta-pill'>
							<i className='ri-database-2-line' />
							<span>{total} Records</span>
						</span>
					</div>
				</div>

				<div className='dashboard-slide-panel-body'>
					{loading ? (
						<div className='dashboard-slide-panel-state'>
							<div className='dashboard-slide-panel-state-icon loading'>
								<Spinner animation='border' />
							</div>
							<div className='dashboard-slide-panel-state-title'>
								Loading records...
							</div>
							<div className='dashboard-slide-panel-state-text'>
								Please wait while the data is being prepared
							</div>
						</div>
					) : error ? (
						<div className='dashboard-slide-panel-state dashboard-slide-panel-state-error'>
							<div className='dashboard-slide-panel-state-icon error'>
								<i className='ri-error-warning-line' />
							</div>
							<div className='dashboard-slide-panel-state-title'>
								Failed to load data
							</div>
							<div className='dashboard-slide-panel-state-text'>{error}</div>
						</div>
					) : (
						<div className='dashboard-slide-panel-table-wrap'>
							<Table responsive hover className='dashboard-slide-panel-table'>
								<thead>
									<tr>
										{columns.map((col) => (
											<th key={col.key} style={{ width: col.width }}>
												{col.label}
											</th>
										))}
									</tr>
								</thead>

								<tbody>
									{rows.length === 0 ? (
										<tr>
											<td colSpan={columns.length}>
												<div className='dashboard-slide-panel-empty'>
													<div className='dashboard-slide-panel-empty-icon'>
														<i className='ri-inbox-archive-line' />
													</div>
													<div className='dashboard-slide-panel-empty-title'>
														No records found
													</div>
													<div className='dashboard-slide-panel-empty-text'>
														Try changing search or filters to see more results
													</div>
												</div>
											</td>
										</tr>
									) : (
										rows.map((row, index) => (
											<tr key={index}>
												{columns.map((col) => (
													<td key={col.key}>
														{col.render
															? col.render(row, index)
															: String((row as any)?.[col.key] ?? "-")}
													</td>
												))}
											</tr>
										))
									)}
								</tbody>
							</Table>
						</div>
					)}
				</div>

				<div className='dashboard-slide-panel-footer'>
					<div className='dashboard-slide-panel-footer-meta'>
						Showing <strong>{rows.length}</strong> of <strong>{total}</strong>
					</div>

					{totalPages > 1 ? (
						<Pagination className='dashboard-slide-panel-pagination mb-0'>
							<Pagination.Prev
								disabled={page <= 1}
								onClick={() => onPageChange?.(page - 1)}
							/>
							{pageItems.map((item, idx) =>
								item === "ellipsis" ? (
									<Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
								) : (
									<Pagination.Item
										key={item}
										active={item === page}
										onClick={() => onPageChange?.(item)}
									>
										{item}
									</Pagination.Item>
								),
							)}
							<Pagination.Next
								disabled={page >= totalPages}
								onClick={() => onPageChange?.(page + 1)}
							/>
						</Pagination>
					) : null}
				</div>
			</aside>
		</>
	);

	return createPortal(content, document.body);
}
