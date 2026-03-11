import { Outlet } from "react-router-dom";
import AppSidebar from "../components/Navbar/AppSidebar";
import Header from "./Header";
import { useState } from "react";

export default function Layout() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div style={{ background: "#f4f6f8", minHeight: "100vh" }}>
			{/* Fixed Header / Topbar */}
			<Header
				onToggleSidebar={() => setCollapsed((v) => !v)}
				collapsed={collapsed} //   pass collapsed state
			/>

			{/* Fixed Sidebar */}
			<AppSidebar
				collapsed={collapsed}
				onToggle={() => setCollapsed((v) => !v)}
			/>

			{/* Main Content */}
			<div
				style={{
					marginLeft: collapsed ? "72px" : "250px",
					marginTop: "60px",
					padding: "20px",
					minHeight: "calc(100vh - 60px)",
					transition: "margin-left 0.2s ease",
				}}
			>
				<Outlet />
			</div>
		</div>
	);
}
