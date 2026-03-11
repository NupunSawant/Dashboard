import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { logoutThunk } from "../../slices/auth/thunks";

export default function AppNavbar() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const token = useSelector((s: RootState) => s.auth.token);

	return (
		<Navbar
			bg='white'
			className='border-bottom px-3 shadow-sm'
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				zIndex: 1100,
				height: "56px",
			}}
		>
			<Navbar.Brand as={Link} to='/masters/items' className='fw-bold'>
				Dashboard {/*   Fixed double D */}
			</Navbar.Brand>
			<Nav className='ms-auto gap-2'>
				{token && (
					<Button
						variant='outline-danger'
						size='sm'
						onClick={async () => {
							await dispatch(logoutThunk());
							navigate("/login");
						}}
					>
						<i className='ri-logout-box-line me-1'></i> Logout
					</Button>
				)}
			</Nav>
		</Navbar>
	);
}
