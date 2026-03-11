// UsersList.tsx

import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../slices/store";
import { fetchUsersThunk } from "../../slices/users/thunks";
import type { User } from "../../types/user";
import BasicTable from "../../components/Table/BasicTable";
import { canCreate, canUpdate } from "../../utils/permission";

const theme = "#1a8376";

export default function UsersList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "userManagement", "user");
	const allowUpdate = canUpdate(authUser, "userManagement", "user");

	const { users, loadingList, error } = useSelector((s: RootState) => s.users);

	useEffect(() => {
		dispatch(fetchUsersThunk());
	}, [dispatch]);

	const col = createColumnHelper<User>();

	const columns = useMemo(
		() => [
			col.accessor("firstName", {
				header: "First Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("lastName", {
				header: "Last Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("phone", {
				header: "Phone",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("email", {
				header: "Email",
				cell: (i) => i.getValue() || "-",
			}),

			col.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const u = row.original as any;
					const id = u.id || u._id;

					return allowUpdate ? (
						<Button
							size='sm'
							disabled={!id}
							onClick={() => nav(`/users/${id}/edit`)}
							style={{
								background: "#eaf4f2",
								border: "none",
								color: theme,
								borderRadius: "6px",
								padding: "4px 10px",
							}}
						>
							<i className='ri-pencil-line' />
						</Button>
					) : null;
				},
			}),
		],
		[col, nav, allowUpdate],
	);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			{loadingList ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : (
				<BasicTable
					data={users || []}
					columns={columns}
					title='Users'
					rightActions={
						<div className='d-flex gap-2'>
							<Button
								variant='light'
								style={{
									border: "1px solid #e9ebec",
									fontSize: "13px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								<i className='ri-upload-2-line' /> Export
							</Button>

							{allowCreate && (
								<Button
									onClick={() => nav("/users/new")}
									style={{
										background: theme,
										border: "none",
										borderRadius: "6px",
										fontSize: "13px",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<i className='ri-add-circle-line' /> Add User
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
