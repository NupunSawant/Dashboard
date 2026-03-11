// AppSidebar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { logoutThunk } from "../../slices/auth/thunks";
import { canView } from "../../utils/permission";

type Props = {
	collapsed: boolean;
	onToggle: () => void;
};

type MenuItem = {
	to: string;
	icon: string;
	label: string;
	section:
		| "dashboard"
		| "inventory"
		| "masters"
		| "orders"
		| "userManagement"
		| "warehouse";
	module: string;
};

const theme = "#1a8376";

export default function AppSidebar({ collapsed }: Props) {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const location = useLocation();
	const token = useSelector((s: RootState) => s.auth.token);
	const authUser = useSelector((s: RootState) => s.auth.user);

	const [hovered, setHovered] = useState<string | null>(null);

	const [openMaster, setOpenMaster] = useState(true);
	const [openWarehouse, setOpenWarehouse] = useState(true);
	const [openInventory, setOpenInventory] = useState(true);
	const [openOrders, setOpenOrders] = useState(true);

	const [flyoutKey, setFlyoutKey] = useState<
		null | "masters" | "warehouses" | "inventory" | "orders"
	>(null);
	const flyoutCloseTimer = useRef<number | null>(null);

	const canViewDashboard = canView(authUser, "dashboard", "dashboard");
	const canViewUsers = canView(authUser, "userManagement", "user");

	useEffect(() => {
		if (location.pathname.startsWith("/masters")) setOpenMaster(true);
		if (location.pathname.startsWith("/warehouses")) setOpenWarehouse(true);
		if (location.pathname.startsWith("/inventory")) setOpenInventory(true);

		if (
			location.pathname.startsWith("/orders") ||
			location.pathname.startsWith("/orders-list")
		) {
			setOpenOrders(true);
		}
	}, [location.pathname]);

	if (!token) return null;

	const isActive = (path: string) =>
		location.pathname === path || location.pathname.startsWith(`${path}/`);

	const safeOpenFlyout = (
		key: "masters" | "warehouses" | "inventory" | "orders",
	) => {
		if (flyoutCloseTimer.current) window.clearTimeout(flyoutCloseTimer.current);
		setFlyoutKey(key);
	};

	const safeCloseFlyout = () => {
		if (flyoutCloseTimer.current) window.clearTimeout(flyoutCloseTimer.current);
		flyoutCloseTimer.current = window.setTimeout(() => setFlyoutKey(null), 150);
	};

	const sidebarStyle: React.CSSProperties = {
		position: "fixed",
		top: 0,
		left: 0,
		height: "100vh",
		width: collapsed ? "72px" : "250px",
		background: "#ffffff",
		borderRight: "1px solid #e9ebec",
		transition:
			"width 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease, background-color 220ms ease",
		zIndex: 1001,
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
		boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
		willChange: "width",
	};

	const brandBoxStyle: React.CSSProperties = {
		height: "60px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: collapsed ? "0" : "0 20px",
		borderBottom: "1px solid #e9ebec",
		flexShrink: 0,
		background: "#fff",
		transition: "padding 280ms cubic-bezier(0.22, 1, 0.36, 1)",
	};

	const sectionLabelStyle: React.CSSProperties = {
		fontSize: "12px",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.08em",
		color: "#878a99",
		padding: collapsed ? "14px 0 4px" : "14px 20px 4px",
		whiteSpace: "nowrap",
		overflow: "hidden",
		textAlign: collapsed ? "center" : "left",
		transition: "padding 240ms ease, color 180ms ease, opacity 180ms ease",
	};

	const menuLinkStyle = (
		active: boolean,
		isHovered: boolean,
	): React.CSSProperties => ({
		display: "flex",
		alignItems: "center",
		gap: collapsed ? 0 : "10px",
		justifyContent: collapsed ? "center" : "flex-start",
		padding: collapsed ? "10px 0" : "8px 16px",
		color: active || isHovered ? theme : "#545a6d",
		background: active ? "#eaf4f2" : isHovered ? "#d4f5e9" : "transparent",
		borderRadius: "8px",
		textDecoration: "none",
		fontWeight: active ? 600 : 500,
		fontSize: "15px",
		cursor: "pointer",
		transition:
			"all 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 160ms ease",
		margin: "2px 8px",
		whiteSpace: "nowrap",
		border: "none",
		width: "calc(100% - 16px)",
		transform: isHovered ? "translateX(2px)" : "translateX(0px)",
		willChange: "transform, background-color, color",
	});

	const subMenuLinkStyle = (
		active: boolean,
		isHovered: boolean,
	): React.CSSProperties => ({
		display: "flex",
		alignItems: "center",
		gap: "8px",
		padding: collapsed ? "8px 0" : "7px 16px 7px 36px",
		justifyContent: collapsed ? "center" : "flex-start",
		color: active || isHovered ? theme : "#545a6d",
		background: active ? "#eaf4f2" : isHovered ? "#d4f5e9" : "transparent",
		borderRadius: "8px",
		textDecoration: "none",
		fontWeight: active ? 600 : 400,
		fontSize: "14px",
		cursor: "pointer",
		transition:
			"all 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 160ms ease",
		margin: "1px 8px",
		whiteSpace: "nowrap",
		transform: isHovered ? "translateX(3px)" : "translateX(0px)",
		willChange: "transform, background-color, color",
	});

	const submenuWrapStyle = (open: boolean): React.CSSProperties => ({
		maxHeight: open ? "700px" : "0px",
		opacity: open ? 1 : 0,
		overflow: "hidden",
		transition:
			"max-height 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease",
	});

	const arrowStyle = (open: boolean): React.CSSProperties => ({
		transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
		transform: `rotate(${open ? "0deg" : "180deg"})`,
	});

	const flyoutStyle: React.CSSProperties = {
		position: "fixed",
		top: 70,
		left: collapsed ? 72 : 250,
		width: 240,
		maxHeight: "calc(100vh - 120px)",
		background: "#fff",
		border: "1px solid #e9ebec",
		boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
		borderRadius: 12,
		zIndex: 2000,
		overflow: "hidden",
		animation: "sidebarFlyoutIn 180ms cubic-bezier(0.22, 1, 0.36, 1)",
		transformOrigin: "left center",
	};

	const flyoutHeaderStyle: React.CSSProperties = {
		padding: "12px 14px",
		borderBottom: "1px solid #eef0f2",
		fontWeight: 700,
		color: "#0f172a",
		display: "flex",
		alignItems: "center",
		gap: 10,
	};

	const flyoutItemStyle = (active: boolean): React.CSSProperties => ({
		display: "flex",
		alignItems: "center",
		gap: 10,
		padding: "10px 14px",
		textDecoration: "none",
		color: active ? theme : "#334155",
		background: active ? "#eaf4f2" : "transparent",
		fontWeight: active ? 700 : 600,
		borderRadius: 8,
		margin: "6px 10px",
		transition:
			"all 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 160ms ease",
	});

	const masterItems: MenuItem[] = useMemo(
		() =>
			[
				{
					to: "/masters/categories",
					icon: "ri-price-tag-3-line",
					label: "Category",
					section: "masters" as const,
					module: "category",
				},
				{
					to: "/masters/sub-categories",
					icon: "ri-price-tag-line",
					label: "Sub Category",
					section: "masters" as const,
					module: "subCategory",
				},
				{
					to: "/masters/units",
					icon: "ri-ruler-line",
					label: "Unit",
					section: "masters" as const,
					module: "unit",
				},
				{
					to: "/masters/gsts",
					icon: "ri-percent-line",
					label: "GST",
					section: "masters" as const,
					module: "gst",
				},
				{
					to: "/masters/hsn-codes",
					icon: "ri-code-line",
					label: "HSN Code",
					section: "masters" as const,
					module: "hsnCode",
				},
				{
					to: "/masters/items",
					icon: "ri-store-2-line",
					label: "Item",
					section: "masters" as const,
					module: "item",
				},
				{
					to: "/masters/suppliers",
					icon: "ri-truck-line",
					label: "Suppliers",
					section: "masters" as const,
					module: "suppliers",
				},
				{
					to: "/masters/warehouses",
					icon: "ri-building-4-line",
					label: "Warehouse",
					section: "masters" as const,
					module: "warehouse",
				},
				{
					to: "/masters/labours",
					icon: "ri-group-line",
					label: "Labour",
					section: "masters" as const,
					module: "labour",
				},
				{
					to: "/masters/customers",
					icon: "ri-contacts-line",
					label: "Customers",
					section: "masters" as const,
					module: "customer",
				},
			].filter((item) => canView(authUser, item.section, item.module)),
		[authUser],
	);

	const warehouseItems: MenuItem[] = useMemo(
		() =>
			[
				{
					to: "/warehouses/warehouse-overview",
					icon: "ri-dashboard-line",
					label: "Overview",
					section: "warehouse" as const,
					module: "warehouseOverview",
				},
				{
					to: "/warehouses/inward",
					icon: "ri-file-text-line",
					label: "Items Inward",
					section: "warehouse" as const,
					module: "itemInward",
				},
				{
					to: "/warehouses/dispatch",
					icon: "ri-file-shield-line",
					label: "Dispatch",
					section: "warehouse" as const,
					module: "dispatch",
				},
			].filter((item) => canView(authUser, item.section, item.module)),
		[authUser],
	);

	const inventoryItems: MenuItem[] = useMemo(() => {
		const items: MenuItem[] = [
			{
				to: "/inventory/stock",
				icon: "ri-inbox-line",
				label: "In Stock",
				section: "inventory",
				module: "inStock",
			},
			{
				to: "/inventory/dispatches",
				icon: "ri-file-shield-line",
				label: "Dispatch",
				section: "inventory",
				module: "dispatch",
			},
			{
				to: "/inventory/orders",
				icon: "ri-file-list-3-line",
				label: "Order",
				section: "inventory",
				module: "order",
			},
			{
				to: "/inventory/reorder-levels",
				icon: "ri-alert-line",
				label: "Reorder Level",
				section: "inventory",
				module: "reorderLevel",
			},
		];

		return items.filter((item) => canView(authUser, item.section, item.module));
	}, [authUser]);

	const orderItems: MenuItem[] = useMemo(
		() =>
			[
				{
					to: "/orders/enquiries",
					icon: "ri-question-answer-line",
					label: "Enquiry",
					section: "orders" as const,
					module: "enquiry",
				},
				{
					to: "/orders/quotations",
					icon: "ri-file-text-line",
					label: "Quotation",
					section: "orders" as const,
					module: "quotation",
				},
				{
					to: "/orders-list",
					icon: "ri-file-list-3-line",
					label: "Orders",
					section: "orders" as const,
					module: "order",
				},
			].filter((item) => canView(authUser, item.section, item.module)),
		[authUser],
	);

	const showMasters = masterItems.length > 0;
	const showWarehouse = warehouseItems.length > 0;
	const showInventory = inventoryItems.length > 0;
	const showOrders = orderItems.length > 0;

	const ordersGroupActive = orderItems.some((item) => isActive(item.to));

	const flyoutMap: Record<
		NonNullable<typeof flyoutKey>,
		{ title: string; icon: string; items: MenuItem[] }
	> = {
		masters: {
			title: "Masters",
			icon: "ri-layout-grid-line",
			items: masterItems,
		},
		warehouses: {
			title: "Warehouses",
			icon: "ri-building-4-line",
			items: warehouseItems,
		},
		inventory: {
			title: "Inventory",
			icon: "ri-inbox-line",
			items: inventoryItems,
		},
		orders: { title: "Orders", icon: "ri-file-list-3-line", items: orderItems },
	};

	const renderFlyout = () => {
		if (!collapsed || !flyoutKey) return null;

		const meta = flyoutMap[flyoutKey];
		if (!meta?.items?.length) return null;

		return (
			<div
				style={flyoutStyle}
				onMouseEnter={() => safeOpenFlyout(flyoutKey)}
				onMouseLeave={safeCloseFlyout}
			>
				<div style={flyoutHeaderStyle}>
					<i className={meta.icon} style={{ fontSize: 18, color: theme }} />
					<span>{meta.title}</span>
				</div>

				<SimpleBar
					autoHide={false}
					style={{ height: "calc(100vh - 60px - 56px)" }}
				>
					<div style={{ padding: "6px 0" }}>
						{meta.items.map((it) => (
							<Link
								key={it.to}
								to={it.to}
								style={flyoutItemStyle(isActive(it.to))}
								onClick={() => setFlyoutKey(null)}
							>
								<i className={it.icon} style={{ fontSize: 16 }} />
								<span>{it.label}</span>
							</Link>
						))}
					</div>
				</SimpleBar>
			</div>
		);
	};

	return (
		<>
			<style>
				{`
          .simplebar-scrollbar:before { opacity: 1 !important; }
          .simplebar-track.simplebar-vertical { width: 10px; }
          .simplebar-track.simplebar-vertical .simplebar-scrollbar:before {
            background: rgba(26, 131, 118, 0.45);
          }
          .simplebar-content-wrapper { overflow: auto; }

          @keyframes sidebarFlyoutIn {
            from {
              opacity: 0;
              transform: translateX(-8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
        `}
			</style>

			<div
				style={sidebarStyle}
				onMouseLeave={collapsed ? safeCloseFlyout : undefined}
			>
				<div style={brandBoxStyle}>
					<Link
						to='/dashboard'
						style={{
							textDecoration: "none",
							transition: "transform 180ms ease, opacity 180ms ease",
						}}
					>
						<span
							style={{
								color: theme,
								fontWeight: 700,
								fontSize: "20px",
								transition: "all 220ms ease",
							}}
						>
							{collapsed ? "D" : "Dashboard"}
						</span>
					</Link>
				</div>

				<SimpleBar
					autoHide={false}
					style={{ height: "calc(100vh - 60px - 56px)" }}
				>
					<div style={{ padding: "8px 0" }}>
						{canViewDashboard && (
							<Link
								to='/dashboard'
								title='Dashboard'
								style={menuLinkStyle(
									isActive("/dashboard"),
									hovered === "/dashboard",
								)}
								onMouseEnter={() => setHovered("/dashboard")}
								onMouseLeave={() => setHovered(null)}
							>
								<i className='ri-dashboard-line' style={{ fontSize: "16px" }} />
								{!collapsed && <span>Dashboard</span>}
							</Link>
						)}

						{canViewUsers && !collapsed && (
							<div style={sectionLabelStyle}>User Management</div>
						)}

						{canViewUsers && (
							<Link
								to='/users'
								title='User Management'
								style={menuLinkStyle(isActive("/users"), hovered === "/users")}
								onMouseEnter={() => setHovered("/users")}
								onMouseLeave={() => setHovered(null)}
							>
								<i className='ri-user-line' style={{ fontSize: "16px" }} />
								{!collapsed && <span>User Management</span>}
							</Link>
						)}

						{collapsed ? (
							<>
								<div style={{ marginTop: 8 }} />

								{showMasters && (
									<div
										title='Masters'
										style={menuLinkStyle(
											isActive("/masters"),
											hovered === "/masters",
										)}
										onMouseEnter={() => {
											setHovered("/masters");
											safeOpenFlyout("masters");
										}}
										onMouseLeave={() => setHovered(null)}
									>
										<i
											className='ri-layout-grid-line'
											style={{ fontSize: "16px" }}
										/>
									</div>
								)}

								{showWarehouse && (
									<div
										title='Warehouses'
										style={menuLinkStyle(
											isActive("/warehouses"),
											hovered === "/warehouses",
										)}
										onMouseEnter={() => {
											setHovered("/warehouses");
											safeOpenFlyout("warehouses");
										}}
										onMouseLeave={() => setHovered(null)}
									>
										<i
											className='ri-building-4-line'
											style={{ fontSize: "16px" }}
										/>
									</div>
								)}

								{showInventory && (
									<div
										title='Inventory'
										style={menuLinkStyle(
											isActive("/inventory"),
											hovered === "/inventory",
										)}
										onMouseEnter={() => {
											setHovered("/inventory");
											safeOpenFlyout("inventory");
										}}
										onMouseLeave={() => setHovered(null)}
									>
										<i className='ri-inbox-line' style={{ fontSize: "16px" }} />
									</div>
								)}

								{showOrders && (
									<div
										title='Orders'
										style={menuLinkStyle(
											ordersGroupActive,
											hovered === "/orders",
										)}
										onMouseEnter={() => {
											setHovered("/orders");
											safeOpenFlyout("orders");
										}}
										onMouseLeave={() => setHovered(null)}
									>
										<i
											className='ri-file-list-3-line'
											style={{ fontSize: "16px" }}
										/>
									</div>
								)}
							</>
						) : (
							<>
								{showMasters && (
									<>
										<div style={sectionLabelStyle}>Masters</div>
										<div
											onClick={() => setOpenMaster((v) => !v)}
											style={menuLinkStyle(false, hovered === "/masters")}
											onMouseEnter={() => setHovered("/masters")}
											onMouseLeave={() => setHovered(null)}
										>
											<i
												className='ri-layout-grid-line'
												style={{ fontSize: "16px" }}
											/>
											<>
												<span style={{ flex: 1 }}>Masters</span>
												<i
													className={`ri-arrow-${openMaster ? "up" : "down"}-s-line`}
													style={arrowStyle(openMaster)}
												/>
											</>
										</div>

										<div style={submenuWrapStyle(openMaster)}>
											{masterItems.map((item) => (
												<Link
													key={item.to}
													to={item.to}
													style={subMenuLinkStyle(
														isActive(item.to),
														hovered === item.to,
													)}
													onMouseEnter={() => setHovered(item.to)}
													onMouseLeave={() => setHovered(null)}
												>
													<i
														className={item.icon}
														style={{ fontSize: "14px" }}
													/>
													<span>{item.label}</span>
												</Link>
											))}
										</div>
									</>
								)}

								{showWarehouse && (
									<>
										<div style={sectionLabelStyle}>Warehouse</div>
										<div
											onClick={() => setOpenWarehouse((v) => !v)}
											style={menuLinkStyle(false, hovered === "/warehouses")}
											onMouseEnter={() => setHovered("/warehouses")}
											onMouseLeave={() => setHovered(null)}
										>
											<i
												className='ri-building-4-line'
												style={{ fontSize: "16px" }}
											/>
											<>
												<span style={{ flex: 1 }}>Warehouses</span>
												<i
													className={`ri-arrow-${openWarehouse ? "up" : "down"}-s-line`}
													style={arrowStyle(openWarehouse)}
												/>
											</>
										</div>

										<div style={submenuWrapStyle(openWarehouse)}>
											{warehouseItems.map((item) => (
												<Link
													key={item.to}
													to={item.to}
													style={subMenuLinkStyle(
														isActive(item.to),
														hovered === item.to,
													)}
													onMouseEnter={() => setHovered(item.to)}
													onMouseLeave={() => setHovered(null)}
												>
													<i
														className={item.icon}
														style={{ fontSize: "14px" }}
													/>
													<span>{item.label}</span>
												</Link>
											))}
										</div>
									</>
								)}

								{showInventory && (
									<>
										<div style={sectionLabelStyle}>Inventory</div>
										<div
											onClick={() => setOpenInventory((v) => !v)}
											style={menuLinkStyle(false, hovered === "/inventory")}
											onMouseEnter={() => setHovered("/inventory")}
											onMouseLeave={() => setHovered(null)}
										>
											<i
												className='ri-inbox-line'
												style={{ fontSize: "16px" }}
											/>
											<>
												<span style={{ flex: 1 }}>Inventory</span>
												<i
													className={`ri-arrow-${openInventory ? "up" : "down"}-s-line`}
													style={arrowStyle(openInventory)}
												/>
											</>
										</div>

										<div style={submenuWrapStyle(openInventory)}>
											{inventoryItems.map((item) => (
												<Link
													key={item.to}
													to={item.to}
													style={subMenuLinkStyle(
														isActive(item.to),
														hovered === item.to,
													)}
													onMouseEnter={() => setHovered(item.to)}
													onMouseLeave={() => setHovered(null)}
												>
													<i
														className={item.icon}
														style={{ fontSize: "14px" }}
													/>
													<span>{item.label}</span>
												</Link>
											))}
										</div>
									</>
								)}

								{showOrders && (
									<>
										<div style={sectionLabelStyle}>Orders</div>
										<div
											onClick={() => setOpenOrders((v) => !v)}
											style={menuLinkStyle(false, hovered === "/orders")}
											onMouseEnter={() => setHovered("/orders")}
											onMouseLeave={() => setHovered(null)}
										>
											<i
												className='ri-file-list-3-line'
												style={{ fontSize: "16px" }}
											/>
											<>
												<span style={{ flex: 1 }}>Orders</span>
												<i
													className={`ri-arrow-${openOrders ? "up" : "down"}-s-line`}
													style={arrowStyle(openOrders)}
												/>
											</>
										</div>

										<div style={submenuWrapStyle(openOrders)}>
											{orderItems.map((item) => (
												<Link
													key={item.to}
													to={item.to}
													style={subMenuLinkStyle(
														isActive(item.to),
														hovered === item.to,
													)}
													onMouseEnter={() => setHovered(item.to)}
													onMouseLeave={() => setHovered(null)}
												>
													<i
														className={item.icon}
														style={{ fontSize: "14px" }}
													/>
													<span>{item.label}</span>
												</Link>
											))}
										</div>
									</>
								)}
							</>
						)}
					</div>
				</SimpleBar>

				<div
					style={{
						padding: "10px 0",
						borderTop: "1px solid #e9ebec",
						flexShrink: 0,
						background: "#fff",
						transition: "all 220ms ease",
					}}
				>
					<div
						title='Logout'
						onClick={async () => {
							await dispatch(logoutThunk());
							navigate("/login");
						}}
						style={{
							...menuLinkStyle(false, hovered === "/logout"),
							color: hovered === "/logout" ? "#842029" : "#f06548",
							background: hovered === "/logout" ? "#f8d7da" : "transparent",
						}}
						onMouseEnter={() => setHovered("/logout")}
						onMouseLeave={() => setHovered(null)}
					>
						<i className='ri-logout-box-line' style={{ fontSize: "16px" }} />
						{!collapsed && <span>Logout</span>}
					</div>
				</div>
			</div>

			{renderFlyout()}
		</>
	);
}
