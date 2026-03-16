const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

					const open = Boolean(anchorEl);
					const menuItemStyle = {
						fontSize: "12px",
						borderRadius: "6px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "5px 10px",
						minHeight: "18px",
						"& i": {
							width: "15px",
							textAlign: "center",
						},
						"&:hover": {
							background: "#f5f7f9",
						},
					};
					

					return (
						<>
							<IconButton
								size='small'
								onClick={(e) => setAnchorEl(e.currentTarget)}
								sx={{
									color: theme,
									background: "#edf6f5",
									borderRadius: "8px",
									width: 32,
									height: 32,
									transition: "all .15s ease",
									"&:hover": {
										background: "#dff1ef",
									},
								}}
							>
								<i className='ri-more-2-fill' style={{ fontSize: 18 }} />
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								open={open}
								disableScrollLock
								onClose={() => setAnchorEl(null)}
								anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
								transformOrigin={{ vertical: "top", horizontal: "right" }}
								PaperProps={{
									sx: {
										borderRadius: "10px",
										boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
										minWidth: 200,
										padding: "4px",
										border: "1px solid #f1f1f1",
									},
								}}
							>
								<MenuItem
									sx={{ ...menuItemStyle, color: theme	 }}
									disabled={!isOrderRow}
									onClick={() => {
										nav(`/orders/${orderId}`);
										setAnchorEl(null);
									}}
								>
									<i className='ri-eye-line' style={{ fontSize: 18 }} />
									View Order
								</MenuItem>
								<Divider variant='middle' component='li' flexItem={true} />

								{allowUpdate && (
									<MenuItem
										sx={{ ...menuItemStyle, color: "#cf1322" }}
										disabled={!rowId || revertBusy || revertingReady}
										onClick={async () => {
											try {
												const ok = window.confirm(
													"Revert this ready-to-dispatch entry?",
												);
												if (!ok) return;

												setRevertingId(rowId);

												if (isQuotationRow) {
													await dispatch(
														revertReadyDispatchThunk(rowId),
													).unwrap();
													toast.success("Quotation dispatch request reverted");
												} else {
													await dispatch(
														changeOrderStatusThunk({
															id: orderId,
															status: "PENDING",
														}),
													).unwrap();
													toast.success("Order reverted to Pending");
												}

												dispatch(fetchReadyToDispatchThunk());
												dispatch(fetchDispatchesThunk());
											} catch (e: any) {
												toast.error(e || "Failed to revert");
											} finally {
												setRevertingId("");
												setAnchorEl(null);
											}
										}}
									>
										<i
											className='ri-arrow-go-back-line'
											style={{ fontSize: 18 }}
										/>
										Revert
									</MenuItem>
								)}
								<Divider variant='middle' component='li' flexItem={true} />

								{allowCreate && (
									<MenuItem
										sx={{ ...menuItemStyle, color: "#096dd9" }}
										disabled={
											!canCreateDispatch || (!isOrderRow && !isQuotationRow)
										}
										onClick={() => {
											if (isOrderRow) {
												nav(`/warehouses/dispatch/${orderId}/create`);
											} else {
												nav(
													`/warehouses/dispatch/new?sourceType=QUOTATION&sourceId=${quotationId}`,
												);
											}
											setAnchorEl(null);
										}}
									>
										<i className='ri-truck-line' style={{ fontSize: 18 }} />
										Create Dispatch
									</MenuItem>
								)}
							</Menu>
						</>
					);

					<i className='ri-delete-bin-line' />
										<div style={{ fontSize: "16px", padding: "4px" }}>
											Delete
										</div>