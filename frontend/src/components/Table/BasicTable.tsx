import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Table, Button, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import React from "react";

export default function BasicTable<T>({
	data,
	columns,
	title,
	rightActions,
}: {
	data: T[];
	columns: ColumnDef<T, any>[];
	title?: string;
	rightActions?: React.ReactNode;
}) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data,
		columns,
		state: { globalFilter, pagination },
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: false,
	});

	useEffect(() => {
		const maxPage = Math.max(0, table.getPageCount() - 1);
		if (pagination.pageIndex > maxPage) {
			setPagination((p) => ({ ...p, pageIndex: maxPage }));
		}
	}, [data.length, pagination.pageSize]);

	const totalFiltered = table.getFilteredRowModel().rows.length;
	const start =
		totalFiltered === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
	const end = Math.min(
		(pagination.pageIndex + 1) * pagination.pageSize,
		totalFiltered,
	);

	const pageCount = table.getPageCount();
	const currentPage = pagination.pageIndex;

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		if (pageCount <= 5) {
			for (let i = 0; i < pageCount; i++) pages.push(i);
		} else {
			pages.push(0);
			if (currentPage > 2) pages.push("...");
			const s = Math.max(1, currentPage - 1);
			const e = Math.min(pageCount - 2, currentPage + 1);
			for (let i = s; i <= e; i++) pages.push(i);
			if (currentPage < pageCount - 3) pages.push("...");
			pages.push(pageCount - 1);
		}
		return pages;
	};

	return (
		//   single root div with both card styles AND basic-table-card
		<div
			className='basic-table-card'
			style={{
				background: "#fff",
				borderRadius: "8px",
				boxShadow: "0 1px 10px rgba(0,0,0,0.08)",
				border: "1px solid #e9ebec",
				overflow: "visible", //   IMPORTANT: allow dropdowns to escape card
			}}
		>
			<style>{`
                .basic-table-card thead th {
                    background-color: #f3f6f9 !important;
                    color: #495057;
                    font-weight: Bold;
                    font-size: 16px;
                    border-bottom: 2px solid #e9ebec;
                    padding: 12px 16px;
                    white-space: nowrap;
                }
                .basic-table-card tbody td {
                    font-size: 15px;
                    color: #495057;
                    padding: 12px 16px;
                    vertical-align: middle;
                    border-bottom: 1px solid #f3f6f9;
                }
                .basic-table-card tbody tr:last-child td {
                    border-bottom: none;
                }
                .basic-table-card tbody tr:hover td {
                    background-color: #f8fffe !important;
                }
                .basic-table-card .sticky-column {
                    position: sticky;
                    right: 0;
                    z-index: 10;
                    background-color: #fff !important;
                    border-left: 1px solid #e9ebec;
                    box-shadow: -4px 0 6px rgba(0,0,0,0.04);
                }
                .basic-table-card thead .sticky-column {
                    background-color: #f3f6f9 !important;
                }
                .basic-table-card .page-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 5px !important;
                    font-size: 15px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 !important;
                    border: 1px solid #dee2e6 !important;
                    background: #fff !important;
                    color: #495057 !important;
                    box-shadow: none !important;
                }
                .basic-table-card .page-btn.active-page {
                    background-color: #1a8376 !important;
                    border-color: #1a8376 !important;
                    color: #fff !important;
                }
                .basic-table-card .page-btn:disabled {
                    opacity: 0.45;
                }
                .basic-table-card .search-input {
                    border-radius: 6px !important;
                    border: 1px solid #e9ebec !important;
                    font-size: 15px;
                    padding: 6px 12px 6px 34px !important;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23878a99' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: 10px center;
                    background-size: 14px;
                    box-shadow: none !important;
                }
                .basic-table-card .search-input:focus {
                    border-color: #1a8376 !important;
                    outline: none;
                }

				/*   allow horizontal scroll for table, but dropdowns can overflow vertically */
                .basic-table-card .table-responsive {
	                overflow-x: auto !important;
					overflow-y: visible !important;
                }

				/*   ensure dropdown stays above sticky column + table */
				.basic-table-card .dropdown-menu {
					z-index: 9999 !important;
				}
            `}</style>

			{/* ── TOP BAR ── */}
			<div
				className='d-flex align-items-center justify-content-between flex-wrap gap-2'
				style={{
					padding: "16px 20px",
					borderBottom: "1px solid #e9ebec",
				}}
			>
				{/* Title */}
				{title && (
					<h5
						className='mb-0 fw-bold'
						style={{ fontSize: "19px", color: "#333" }}
					>
						{title}
					</h5>
				)}

				{/* Right: Search + Actions */}
				<div className='d-flex align-items-center gap-2 ms-auto flex-wrap'>
					<input
						className='form-control search-input'
						placeholder='Search'
						style={{ width: 220 }}
						value={globalFilter}
						onChange={(e) => {
							setGlobalFilter(e.target.value);
							setPagination((p) => ({ ...p, pageIndex: 0 }));
						}}
					/>
					{rightActions && <>{rightActions}</>}
				</div>
			</div>

			{/* ── TABLE ── */}
			<div
				className='table-responsive'
				style={{ overflowX: "auto", overflowY: "visible" }}
			>
				<Table
					className='align-middle mb-0'
					hover
					style={{ borderCollapse: "separate", borderSpacing: 0 }}
				>
					<thead>
						{table.getHeaderGroups().map((hg) => (
							<tr key={hg.id}>
								{hg.headers.map((h, index) => {
									const isLast = index === hg.headers.length - 1;
									const headerStr =
										typeof h.column.columnDef.header === "string"
											? h.column.columnDef.header.toLowerCase()
											: "";
									const isAction =
										headerStr === "action" || headerStr === "actions";
									const sticky = isLast && isAction;
									const isSorted = h.column.getIsSorted();
									const canSort = h.column.getCanSort();

									return (
										<th
											key={h.id}
											className={sticky ? "sticky-column" : ""}
											style={{ cursor: canSort ? "pointer" : "default" }}
											onClick={
												canSort ? h.column.getToggleSortingHandler() : undefined
											}
										>
											{!h.isPlaceholder && (
												<div className='d-flex align-items-center gap-1'>
													{flexRender(
														h.column.columnDef.header,
														h.getContext(),
													)}
													{canSort &&
														(isSorted === "asc" ? (
															<ArrowUpwardIcon style={{ fontSize: 14 }} />
														) : isSorted === "desc" ? (
															<ArrowDownwardIcon style={{ fontSize: 14 }} />
														) : (
															<UnfoldMoreIcon
																style={{ fontSize: 14, opacity: 0.4 }}
															/>
														))}
												</div>
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>

					<tbody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell, index) => {
										const isLast = index === row.getVisibleCells().length - 1;
										const headerStr =
											typeof cell.column.columnDef.header === "string"
												? cell.column.columnDef.header.toLowerCase()
												: "";
										const isAction =
											headerStr === "action" || headerStr === "actions";
										const sticky = isLast && isAction;

										return (
											<td
												key={cell.id}
												className={sticky ? "sticky-column" : ""}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										);
									})}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className='text-center py-5 text-muted'
								>
									No data found
								</td>
							</tr>
						)}
					</tbody>
				</Table>
			</div>

			{/* ── FOOTER ── */}
			<div
				className='d-flex align-items-center justify-content-between flex-wrap gap-2'
				style={{
					padding: "12px 20px",
					borderTop: "1px solid #e9ebec",
					background: "#fff",
				}}
			>
				{/* Showing results */}
				<div className='text-muted' style={{ fontSize: 13 }}>
					Showing <strong style={{ color: "#1a8376" }}>{start}</strong>
					{" – "}
					<strong style={{ color: "#1a8376" }}>{end}</strong>
					{" of "}
					<strong>{totalFiltered}</strong> Results
				</div>

				{/* Pagination */}
				<div className='d-flex align-items-center gap-1'>
					<Button
						variant='outline-secondary'
						className='page-btn'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						‹
					</Button>

					{getPageNumbers().map((page, i) =>
						page === "..." ? (
							<span
								key={`dots-${i}`}
								className='px-1 text-muted'
								style={{ fontSize: 13 }}
							>
								...
							</span>
						) : (
							<Button
								key={page}
								variant='outline-secondary'
								className={`page-btn ${currentPage === page ? "active-page" : ""}`}
								onClick={() =>
									setPagination((p) => ({ ...p, pageIndex: page as number }))
								}
							>
								{(page as number) + 1}
							</Button>
						),
					)}

					<Button
						variant='outline-secondary'
						className='page-btn'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						›
					</Button>

					<Form.Select
						size='sm'
						value={pagination.pageSize}
						onChange={(e) =>
							setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
						}
						style={{
							width: "auto",
							fontSize: 13,
							borderRadius: 6,
							border: "1px solid #dee2e6",
						}}
					>
						{[5, 10, 20, 50].map((n) => (
							<option key={n} value={n}>
								Show {n}
							</option>
						))}
					</Form.Select>
				</div>
			</div>
		</div>
	);
}
