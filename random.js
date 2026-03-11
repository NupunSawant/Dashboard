<Dropdown as={ButtonGroup} align='end'>
	<Dropdown.Toggle
		size='sm'
		disabled={disabled}
		style={{
			background: "#eaf4f2",
			border: "none",
			color: theme,
			borderRadius: "6px",
			padding: "6px 10px",
			lineHeight: 1,
		}}
		title='Actions'
	>
		<i className='ri-more-2-fill' />
	</Dropdown.Toggle>

	<Dropdown.Menu
		renderOnMount
		popperConfig={{
			strategy: "absolute", //   IMPORTANT (keeps it beside the button)
			modifiers: [
				{
					name: "offset",
					options: { offset: [0, 8] }, //   little gap below the button
				},
				{
					name: "preventOverflow",
					options: { boundary: "viewport", padding: 8 },
				},
			],
		}}
		style={{ zIndex: 9999 }}
	>
		<Dropdown.Item
			disabled={disabled}
			onClick={async () => {
				if (!enquiryId) return;

				try {
					setBusyId(enquiryId);
					await dispatch(revertQuotationRequestThunk(enquiryId)).unwrap();
					toast.success("Reverted back to enquiry");
					dispatch(fetchQuotationRequestsThunk());
				} catch /*(e: any)*/ {
					toast.error(String(e || "Failed to revert"));
				} finally {
					setBusyId(null);
				}
			}}
		>
			{isBusy ? (
				<span className='d-inline-flex align-items-center gap-2'>
					<Spinner size='sm' animation='border' /> Reverting...
				</span>
			) : (
				<span className='d-inline-flex align-items-center gap-2'>
					<i className='ri-arrow-go-back-line' /> Revert
				</span>
			)}
		</Dropdown.Item>

		<Dropdown.Item
			disabled={disabled}
			onClick={() => {
				if (!enquiryId) return;
				nav(`/orders/quotations/new?enquiryId=${enquiryId}`);
			}}
		>
			<span className='d-inline-flex align-items-center gap-2'>
				<i className='ri-add-circle-line' /> Create Quotation
			</span>
		</Dropdown.Item>
	</Dropdown.Menu>
</Dropdown>;
