import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import Logout from "../pages/Authentication/Logout";
import Layout from "../Layout";
import NonAuthLayout from "../Layout/NonAuthLayout";
import { guard } from "./guarded";
import AccessDenied from "../pages/error/AccessDenied";
import NotFound from "../pages/error/NotFound";

import DashboardPage from "../pages/Dashboard/DashboardPage";

// Masters
import ItemsList from "../pages/Master/Items/ItemsList";
import ItemUpsertPage from "../pages/Master/Items/ItemUpsertPage";
import CategoriesList from "../pages/Master/Categories/CategoriesList";
import CategoryUpsertPage from "../pages/Master/Categories/CategoriesUpsertPage";
import SubCategoriesList from "../pages/Master/SubCategories/SubCategoriesList";
import SubCategoryUpsertPage from "../pages/Master/SubCategories/SubCategoriesUpsertPage";
import UnitsList from "../pages/Master/Units/UnitsList";
import UnitUpsertPage from "../pages/Master/Units/UnitsUpsertPage";
import GstsList from "../pages/Master/Gst/GstsList";
import GstUpsertPage from "../pages/Master/Gst/GstsUpsertPage";
import SupplierList from "../pages/Master/Suppliers/SupplierList";
import SupplierUpsertPage from "../pages/Master/Suppliers/SupplierUpsertPage";
import WarehouseList from "../pages/Master/Warehouses/WarehouseList";
import WarehouseUpsertPage from "../pages/Master/Warehouses/WarehousesUpsertPage";
import LaboursList from "../pages/Master/Labours/LaboursList";
import LaboursUpsertPage from "../pages/Master/Labours/LaboursUpsertPage";
import CustomersList from "../pages/Master/Customers/CustomersList";
import CustomersUpsertPage from "../pages/Master/Customers/CustomersUpsertPage";
import HsnsList from "../pages/Master/HSNCodes/HsnsList";
import HsnUpsertPage from "../pages/Master/HSNCodes/HsnsUpsertPage";

// Users
import UsersList from "../pages/User/UsersList";
import UserUpsertPage from "../pages/User/UserUpsertPage";

// Profile
import Profile from "../pages/Profile/Profile";

// Inventory
import InventoryList from "../pages/Inventory/Inventory/InventoryList";
import InventoryView from "../pages/Inventory/Inventory/InventoryViewPage";
import InventoryOrdersList from "../pages/Inventory/Inventory/InventoryOrderList";
import ReorderLevelPage from "../pages/Inventory/ReorderLevel/ReorderLevelPage";
import InventoryDispatchList from "../pages/Inventory/InventoryDispatch/InventoryDispatchList";
import InventoryDispatchView from "../pages/Inventory/InventoryDispatch/InventoryDispatchView";
import WarehouseStockViewPage from "../pages/Inventory/Inventory/WarehouseStockViewPage";

// Warehouse
import WarehouseInwardList from "../pages/Warehouse/WarehouseInward/WarehouseInwardList";
import WarehouseInwardUpsertPage from "../pages/Warehouse/WarehouseInward/WarehouseInwardUpsertPage";
import WarehouseInwardViewPage from "../pages/Warehouse/WarehouseInward/WarehouseInwardViewPage";
import WarehouseOverviewPage from "../pages/Warehouse/WarehouseOverview/WarehouseOverviewPage";
import InStockViewPage from "../pages/Warehouse/WarehouseOverview/InStockViewPage";
import PendingStockTransferInwardPage from "../pages/Warehouse/WarehouseInward/Pendingstocktransferinwardpage";
import PendingSalesReturnInwardPage from "../pages/Warehouse/WarehouseInward/PendingSalesReturnInwardPage";
import StockTransferList from "../pages/Warehouse/StockTransfer/Stocktransferlist";
import StockTransferUpsertPage from "../pages/Warehouse/StockTransfer/Stocktransferupsertpage";
import IssueToLabourUpsertPage from "../pages/Warehouse/IssueToLabour/IssueToLabourUpsertPage";
import LabourInwardPage from "../pages/Warehouse/WarehouseInward/LabourInwardPage";

// Orders
import OrdersList from "../pages/Order/OrdersList";
import OrderUpsertPage from "../pages/Order/OrderUpsertPage";
import OrderViewPage from "../pages/Order/OrderViewPage";

import EnquiryListPage from "../pages/Order/Enquiry/EnquiryList";
import EnquiryUpsertPage from "../pages/Order/Enquiry/EnquiryUpsertPage";
import EnquiryView from "../pages/Order/Enquiry/EnquiryView";

import QuotationList from "../pages/Order/Quotation/QuotationList";
import QuotationUpsertPage from "../pages/Order/Quotation/QuotationUpsertPage";
import QuotationView from "../pages/Order/Quotation/QuotationView";
import QuotationRequestList from "../pages/Order/Quotation/QuotationRequestList";
import QuotationRequestViewPage from "../pages/Order/Quotation/QuotationRequestViewPage";

// Warehouse Dispatch
import DispatchUpsertPage from "../pages/Warehouse/Dispatch/DispatchUpsertPage";
import DispatchList from "../pages/Warehouse/Dispatch/DispatchList";
import DispatchViewPage from "../pages/Warehouse/Dispatch/DispatchView";
import SalesOrderReturnProcessPage from "../pages/Warehouse/Dispatch/SalesOrderReturnProcessPage";

export default function RoutesIndex() {
	return (
		<Routes>
			<Route element={<NonAuthLayout />}>
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
			</Route>

			<Route element={guard(<Layout />)}>
				<Route path='/logout' element={<Logout />} />
				<Route path='/profile' element={guard(<Profile />)} />

				{/* Masters */}
				<Route
					path='/masters/items'
					element={guard(<ItemsList />, "masters", "item", "view")}
				/>
				<Route
					path='/masters/items/new'
					element={guard(<ItemUpsertPage />, "masters", "item", "create")}
				/>
				<Route
					path='/masters/items/:id/edit'
					element={guard(<ItemUpsertPage />, "masters", "item", "update")}
				/>

				<Route
					path='/masters/categories'
					element={guard(<CategoriesList />, "masters", "category", "view")}
				/>
				<Route
					path='/masters/categories/new'
					element={guard(
						<CategoryUpsertPage />,
						"masters",
						"category",
						"create",
					)}
				/>
				<Route
					path='/masters/categories/:id/edit'
					element={guard(
						<CategoryUpsertPage />,
						"masters",
						"category",
						"update",
					)}
				/>

				<Route
					path='/masters/sub-categories'
					element={guard(
						<SubCategoriesList />,
						"masters",
						"subCategory",
						"view",
					)}
				/>
				<Route
					path='/masters/sub-categories/new'
					element={guard(
						<SubCategoryUpsertPage />,
						"masters",
						"subCategory",
						"create",
					)}
				/>
				<Route
					path='/masters/sub-categories/:id/edit'
					element={guard(
						<SubCategoryUpsertPage />,
						"masters",
						"subCategory",
						"update",
					)}
				/>

				<Route
					path='/masters/units'
					element={guard(<UnitsList />, "masters", "unit", "view")}
				/>
				<Route
					path='/masters/units/new'
					element={guard(<UnitUpsertPage />, "masters", "unit", "create")}
				/>
				<Route
					path='/masters/units/:id/edit'
					element={guard(<UnitUpsertPage />, "masters", "unit", "update")}
				/>

				<Route
					path='/masters/gsts'
					element={guard(<GstsList />, "masters", "gst", "view")}
				/>
				<Route
					path='/masters/gsts/new'
					element={guard(<GstUpsertPage />, "masters", "gst", "create")}
				/>
				<Route
					path='/masters/gsts/:id/edit'
					element={guard(<GstUpsertPage />, "masters", "gst", "update")}
				/>

				<Route
					path='/masters/suppliers'
					element={guard(<SupplierList />, "masters", "suppliers", "view")}
				/>
				<Route
					path='/masters/suppliers/new'
					element={guard(
						<SupplierUpsertPage />,
						"masters",
						"suppliers",
						"create",
					)}
				/>
				<Route
					path='/masters/suppliers/:id/edit'
					element={guard(
						<SupplierUpsertPage />,
						"masters",
						"suppliers",
						"update",
					)}
				/>

				<Route
					path='/masters/warehouses'
					element={guard(<WarehouseList />, "masters", "warehouse", "view")}
				/>
				<Route
					path='/masters/warehouses/new'
					element={guard(
						<WarehouseUpsertPage />,
						"masters",
						"warehouse",
						"create",
					)}
				/>
				<Route
					path='/masters/warehouses/:id/edit'
					element={guard(
						<WarehouseUpsertPage />,
						"masters",
						"warehouse",
						"update",
					)}
				/>
				<Route
					path='/warehouses/warehouse-overview'
					element={guard(<WarehouseOverviewPage />)}
				/>
				<Route
					path='/warehouses/:id/view'
					element={guard(
						<InStockViewPage />,
						"warehouse",
						"warehouseOverview",
						"view",
					)}
				/>

				<Route
					path='/masters/customers'
					element={guard(<CustomersList />, "masters", "customer", "view")}
				/>
				<Route
					path='/masters/customers/new'
					element={guard(
						<CustomersUpsertPage />,
						"masters",
						"customer",
						"create",
					)}
				/>
				<Route
					path='/masters/customers/:id/edit'
					element={guard(
						<CustomersUpsertPage />,
						"masters",
						"customer",
						"update",
					)}
				/>

				<Route
					path='/masters/labours'
					element={guard(<LaboursList />, "masters", "labour", "view")}
				/>
				<Route
					path='/masters/labours/new'
					element={guard(<LaboursUpsertPage />, "masters", "labour", "create")}
				/>
				<Route
					path='/masters/labours/:id/edit'
					element={guard(<LaboursUpsertPage />, "masters", "labour", "update")}
				/>

				<Route
					path='/masters/hsn-codes'
					element={guard(<HsnsList />, "masters", "hsnCode", "view")}
				/>
				<Route
					path='/masters/hsn-codes/new'
					element={guard(<HsnUpsertPage />, "masters", "hsnCode", "create")}
				/>
				<Route
					path='/masters/hsn-codes/:id/edit'
					element={guard(<HsnUpsertPage />, "masters", "hsnCode", "update")}
				/>

				{/* Users */}
				<Route
					path='/users'
					element={guard(<UsersList />, "userManagement", "user", "view")}
				/>
				<Route
					path='/users/new'
					element={guard(
						<UserUpsertPage />,
						"userManagement",
						"user",
						"create",
					)}
				/>
				<Route
					path='/users/:id/edit'
					element={guard(
						<UserUpsertPage />,
						"userManagement",
						"user",
						"update",
					)}
				/>

				<Route path='/dashboard' element={guard(<DashboardPage />)} />

				{/* Inventory */}
				<Route
					path='/inventory/stock'
					element={guard(<InventoryList />, "inventory", "inStock", "view")}
				/>
				<Route
					path='/inventory/warehouse-stock/:itemId'
					element={guard(
						<WarehouseStockViewPage />,
						"inventory",
						"inStock",
						"view",
					)}
				/>
				<Route
					path='/masters/inventory/:id'
					element={guard(<InventoryView />, "inventory", "inStock", "view")}
				/>
				<Route
					path='/inventory/orders'
					element={guard(<InventoryOrdersList />, "inventory", "order", "view")}
				/>
				<Route
					path='/inventory/reorder-levels'
					element={guard(
						<ReorderLevelPage />,
						"inventory",
						"reorderLevel",
						"view",
					)}
				/>
				<Route
					path='/inventory/dispatches'
					element={guard(
						<InventoryDispatchList />,
						"inventory",
						"dispatch",
						"view",
					)}
				/>
				<Route
					path='/inventory/dispatch/:id/view'
					element={guard(
						<InventoryDispatchView />,
						"inventory",
						"dispatch",
						"view",
					)}
				/>

				{/* Warehouse */}
				<Route
					path='/warehouses/inward'
					element={guard(
						<WarehouseInwardList />,
						"warehouse",
						"itemInward",
						"view",
					)}
				/>
				<Route
					path='/warehouses/inward/new'
					element={guard(
						<WarehouseInwardUpsertPage />,
						"warehouse",
						"itemInward",
						"create",
					)}
				/>
				<Route
					path='/warehouses/inward/:id/edit'
					element={guard(
						<WarehouseInwardUpsertPage />,
						"warehouse",
						"itemInward",
						"update",
					)}
				/>
				<Route
					path='/warehouses/inward/:id/view'
					element={guard(
						<WarehouseInwardViewPage />,
						"warehouse",
						"itemInward",
						"view",
					)}
				/>
				<Route
					path='/warehouses/inward/stock-transfer/:id/inward'
					element={guard(
						<PendingStockTransferInwardPage />,
						"warehouse",
						"itemInward",
						"create",
					)}
				/>
				<Route
					path='/warehouses/inward/labour/:id'
					element={guard(
						<LabourInwardPage />,
						"warehouse",
						"itemInward",
						"create",
					)}
				/>
				<Route
					path='/warehouses/inward/sales-return/:id'
					element={guard(
						<PendingSalesReturnInwardPage />,
						"warehouse",
						"itemInward",
						"create",
					)}
				/>

				<Route
					path='/warehouses/stock-transfer'
					element={guard(
						<StockTransferList />,
						"warehouse",
						"dispatch",
						"view",
					)}
				/>
				<Route
					path='/warehouses/stock-transfer/new'
					element={guard(
						<StockTransferUpsertPage />,
						"warehouse",
						"dispatch",
						"create",
					)}
				/>
				<Route
					path='/warehouses/stock-transfer/:id/edit'
					element={guard(
						<StockTransferUpsertPage />,
						"warehouse",
						"dispatch",
						"update",
					)}
				/>
				<Route
					path='/warehouses/stock-transfer/:id/view'
					element={guard(
						<StockTransferList />,
						"warehouse",
						"dispatch",
						"view",
					)}
				/>
				<Route
					path='/warehouses/issue-to-labour/new'
					element={guard(
						<IssueToLabourUpsertPage />,
						"warehouse",
						"dispatch",
						"create",
					)}
				/>
				<Route
					path='/warehouses/issue-to-labour/:id/edit'
					element={guard(
						<IssueToLabourUpsertPage />,
						"warehouse",
						"dispatch",
						"update",
					)}
				/>

				{/* Orders */}
				<Route
					path='/orders-list'
					element={guard(<OrdersList />, "orders", "order", "view")}
				/>
				<Route
					path='/orders/new'
					element={guard(<OrderUpsertPage />, "orders", "order", "create")}
				/>
				<Route
					path='/orders/:id'
					element={guard(<OrderViewPage />, "orders", "order", "view")}
				/>
				<Route
					path='/orders/:id/edit'
					element={guard(<OrderUpsertPage />, "orders", "order", "update")}
				/>

				<Route
					path='/orders/enquiries'
					element={guard(<EnquiryListPage />, "orders", "enquiry", "view")}
				/>
				<Route
					path='/orders/enquiries/new'
					element={guard(<EnquiryUpsertPage />, "orders", "enquiry", "create")}
				/>
				<Route
					path='/orders/enquiries/:id/edit'
					element={guard(<EnquiryUpsertPage />, "orders", "enquiry", "update")}
				/>
				<Route
					path='/orders/enquiries/:id/view'
					element={guard(<EnquiryView />, "orders", "enquiry", "view")}
				/>

				<Route
					path='/orders/quotation-requests'
					element={guard(
						<QuotationRequestList />,
						"orders",
						"quotation",
						"view",
					)}
				/>
				<Route
					path='/orders/quotation-requests/:id/view'
					element={guard(
						<QuotationRequestViewPage />,
						"orders",
						"quotation",
						"view",
					)}
				/>
				<Route
					path='/orders/quotations'
					element={guard(<QuotationList />, "orders", "quotation", "view")}
				/>
				<Route
					path='/orders/quotations/new'
					element={guard(
						<QuotationUpsertPage />,
						"orders",
						"quotation",
						"create",
					)}
				/>
				<Route
					path='/orders/quotations/edit/:id'
					element={guard(
						<QuotationUpsertPage />,
						"orders",
						"quotation",
						"update",
					)}
				/>
				<Route
					path='/orders/quotations/view/:id'
					element={guard(<QuotationView />, "orders", "quotation", "view")}
				/>

				{/* Warehouse Dispatch */}
				<Route
					path='/warehouses/dispatch'
					element={guard(<DispatchList />, "warehouse", "dispatch", "view")}
				/>
				<Route
					path='/warehouses/dispatch/:orderId/create'
					element={guard(
						<DispatchUpsertPage />,
						"warehouse",
						"dispatch",
						"create",
					)}
				/>
				<Route
					path='/warehouses/dispatch/:dispatchId/view'
					element={guard(<DispatchViewPage />, "warehouse", "dispatch", "view")}
				/>
				<Route
					path='/warehouses/dispatch/:id/sales-return'
					element={guard(
						<SalesOrderReturnProcessPage />,
						"warehouse",
						"dispatch",
						"update",
					)}
				/>
				<Route
					path='/warehouses/dispatch/new'
					element={guard(
						<DispatchUpsertPage />,
						"warehouse",
						"dispatch",
						"create",
					)}
				/>
			</Route>

			<Route
				path='/'
				element={
					localStorage.getItem("token") ? (
						<Navigate to='/inventory/stock' replace />
					) : (
						<Navigate to='/login' replace />
					)
				}
			/>
			<Route path='/access-denied' element={<AccessDenied />} />
			<Route path='/not-found' element={<NotFound />} />
			<Route path='*' element={<Navigate to='/not-found' replace />} />
		</Routes>
	);
}
