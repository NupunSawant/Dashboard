import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/reducer";
import itemsReducer from "./Masters/items/reducer";
import orderReducer from "./orders/reducer";
import userReducer from "./users/reducer";
import categoryReducer from "./Masters/categories/reducer";
import subCategoryReducer from "./Masters/subCategories/reducer";
import unitsReducer from "./Masters/units/reducer";
import gstReducer from "./Masters/gst/reducer";
import supplierReducer from "./Masters/suppliers/reducer";
import warehouseReducer from "./Masters/warehouses/reducer";
import labourReducer from "./Masters/labours/reducer";
import customerReducer from "./Masters/customers/reducer";
import hsnCodesReducer from "./Masters/hsnCodes/reducer";
import inventoryReducer from "./Inventory/reducer";
import warehouseInwardReducer from "./Warehouse/reducer";
import enquiryReducer from "./orders/Enquiry/reducer";
import QuotationReducer from "./orders/Quotation/reducer";
import dispatchReducer from "./Warehouse/Dispatch/reducer";
import reorderLevelReducer from "./Inventory/ReorderLevel/reducer";
import warehouseOverviewReducer from "./Warehouse/WarehouseOverview/reducer";
import stockTransferReducer from "./Warehouse/Stocktransfer/reducer";
import issueToLabourReducer from "./Warehouse/IssueToLabour/reducer";
import dashboardReducer from "./Dashboard/reducer";

export default combineReducers({
	auth: authReducer,
	items: itemsReducer,
	orders: orderReducer,
	users: userReducer,
	categories: categoryReducer,
	subCategories: subCategoryReducer,
	units: unitsReducer,
	gsts: gstReducer,
	suppliers: supplierReducer,
	warehouses: warehouseReducer,
	labours: labourReducer,
	customers: customerReducer,
	hsnCodes: hsnCodesReducer,
	inventory: inventoryReducer,
	warehouseInward: warehouseInwardReducer,
	enquiries: enquiryReducer,
	quotation: QuotationReducer,
	warehouseDispatch: dispatchReducer,
	reorderLevel: reorderLevelReducer,
	warehouseOverview: warehouseOverviewReducer,
	stockTransfer: stockTransferReducer,
	issueToLabour: issueToLabourReducer,
	dashboard: dashboardReducer,
});