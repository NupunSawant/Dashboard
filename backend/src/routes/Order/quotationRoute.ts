import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validation";

import {
	createQuotationSchema,
	updateQuotationSchema,
	updateQuotationStatusSchema,
} from "../../validation/Order/quotationValidation";

import {
	addQuotation,
	editQuotation,
	getQuotation,
	getQuotations,
	removeQuotation,
	getQuotationRequests, //   ADD
	revertRequestToEnquiry, //   ADD
	updateQuotationStatus, //   ADD
	requestQuotationToDispatch, // ✅ NEW
	revertQuotationDispatch, // ✅ NEW
} from "../../controllers/Order/quotationController";

const router = Router();

/* =========================================================
     QUOTATION REQUESTS (RFQ)
========================================================= */
// GET RFQ list
router.get("/requests", authenticateToken, getQuotationRequests);

// PATCH revert RFQ -> PENDING
router.patch(
	"/requests/:enquiryId/revert",
	authenticateToken,
	revertRequestToEnquiry,
);

/* =========================================================
     QUOTATION -> REQUEST TO DISPATCH (READY QUEUE)
========================================================= */
router.post(
	"/:id/request-to-dispatch",
	authenticateToken,
	requestQuotationToDispatch,
);

//   REVERT dispatch request
router.post(
	"/:id/revert-dispatch-request",
	authenticateToken,
	revertQuotationDispatch,
);

/* =========================================================
     QUOTATIONS CRUD
========================================================= */
router.post(
	"/",
	authenticateToken,
	validate(createQuotationSchema),
	addQuotation,
);
router.get("/", authenticateToken, getQuotations);

//   Status update endpoint
router.patch(
	"/:id/status",
	authenticateToken,
	validate(updateQuotationStatusSchema),
	updateQuotationStatus,
);

router.get("/:id", authenticateToken, getQuotation);

router.put(
	"/:id",
	authenticateToken,
	validate(updateQuotationSchema),
	editQuotation,
);

router.delete("/:id", authenticateToken, removeQuotation);

export default router;
