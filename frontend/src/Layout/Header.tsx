import { useDispatch, useSelector } from "react-redux";
import { Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../slices/store";
import { logoutThunk } from "../slices/auth/thunks";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";

type Props = {
	onToggleSidebar?: () => void;
	collapsed?: boolean;
};

export default function Header({ onToggleSidebar, collapsed }: Props) {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { user } = useSelector((s: RootState) => s.auth);

	const handleLogout = async () => {
		await dispatch(logoutThunk());
		navigate("/login");
	};

	const toggleFullscreen = async () => {
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		} catch {
			// ignore
		}
	};

	const name = user?.name || "User";
	const initials = name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join("");

	return (
		<>
			<style>{`
          #page-topbar {
            position: fixed;
            top: 0;
            right: 0;
            z-index: 1002;
            background-color: #ffffff;
            border-bottom: 1px solid #e9ebec;
            box-shadow: 0 1px 6px rgba(0,0,0,0.06);
            transition: left 0.2s ease;
          }
          #page-topbar .navbar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 60px;
            padding: 0 16px;
          }
          /* Hamburger */
          #page-topbar .hamburger-btn {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 6px 10px;
            color: #495057;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #page-topbar .hamburger-btn:hover {
            color: #1a8376;
          }
          #page-topbar .hamburger-icon {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          #page-topbar .hamburger-icon span {
            display: block;
            width: 22px;
            height: 2px;
            background-color: #495057;
            border-radius: 2px;
            transition: all 0.3s ease;
          }
          #page-topbar .hamburger-btn:hover .hamburger-icon span {
            background-color: #1a8376;
          }
          /* Right side icons */
          #page-topbar .header-icon-btn {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #495057 !important;
            font-size: 18px;
            padding: 6px 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s;
          }
          #page-topbar .header-icon-btn:hover {
            background: #f3f6f9 !important;
            color: #1a8376 !important;
          }
          /* Profile dropdown toggle */
          #page-topbar .profile-toggle {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            border-radius: 8px;
            transition: background 0.2s;
          }
          #page-topbar .profile-toggle:hover {
            background: #f3f6f9 !important;
          }
          #page-topbar .profile-toggle::after {
            color: #878a99;
            margin-left: 2px;
          }
          /* Avatar circle */
          #page-topbar .avatar-circle {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background-color: #1a8376;
            color: #fff;
            font-weight: 600;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          /* Profile name */
          #page-topbar .profile-name {
            font-size: 13.5px;
            font-weight: 500;
            color: #495057;
          }
          /* Dropdown menu */
          #page-topbar + * .profile-dropdown,
          .profile-dropdown {
            min-width: 170px;
            border: 1px solid #e9ebec;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            padding: 6px;
          }
          .profile-dropdown .dropdown-item {
            border-radius: 6px;
            font-size: 13.5px;
            padding: 8px 12px;
            color: #495057;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .profile-dropdown .dropdown-item:hover {
            background: #f3f6f9;
            color: #1a8376;
          }
          .profile-dropdown .dropdown-item.text-danger:hover {
            background: #fff5f5;
            color: #f06548 !important;
          }
          .profile-dropdown .dropdown-divider {
            margin: 4px 0;
            border-color: #e9ebec;
          }
        `}</style>

			<header
				id='page-topbar'
				style={{
					left: collapsed ? "72px" : "250px",
				}}
			>
				<div className='navbar-header'>
					{/* ── LEFT: Hamburger ── */}
					<div className='d-flex align-items-center'>
						<Button
							className='hamburger-btn'
							onClick={onToggleSidebar}
							title='Toggle Sidebar'
						>
							{collapsed ? (
								<FormatAlignRightIcon fontSize='small' />
							) : (
								<FormatAlignLeftIcon fontSize='small' />
							)}
						</Button>
					</div>

					{/* ── RIGHT: Actions + Profile ── */}
					<div className='d-flex align-items-center gap-1'>
						{/* Fullscreen */}
						<Button
							className='header-icon-btn'
							onClick={toggleFullscreen}
							title='Toggle Fullscreen'
						>
							<i className='ri-fullscreen-line' />
						</Button>

						{/* Divider */}
						<div
							style={{
								width: 1,
								height: 24,
								background: "#e9ebec",
								margin: "0 6px",
							}}
						/>

						{/* Profile Dropdown */}
						<Dropdown align='end'>
							<Dropdown.Toggle className='profile-toggle'>
								<span className='avatar-circle'>{initials || "U"}</span>
								<span className='profile-name'>{name}</span>
							</Dropdown.Toggle>

							<Dropdown.Menu className='profile-dropdown'>
								<Dropdown.Item onClick={() => navigate("/profile")}>
									<i className='ri-user-line' />
									Profile
								</Dropdown.Item>
								<Dropdown.Divider />
								<Dropdown.Item onClick={handleLogout} className='text-danger'>
									<i className='ri-logout-box-line' />
									Logout
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</div>
			</header>
		</>
	);
}
