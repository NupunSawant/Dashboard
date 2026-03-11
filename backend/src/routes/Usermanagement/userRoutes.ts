import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validation";
import {
	createUserSchema,
	updatePasswordSchema,
	updateUserSchema,
} from "../../validation/Usermanagement/userValidation";
import {
	addUser,
	changePassword,
	editUser,
	getUser,
	getUsers,
	removeUser,
} from "../../controllers/Usermanagement/userController";

const router = Router();

//   Protected user-management
router.use(authenticateToken);

router.get("/", getUsers);
router.post("/", validate(createUserSchema), addUser);

router.get("/:id", getUser);
router.put("/:id", validate(updateUserSchema), editUser);
router.patch("/:id/password", validate(updatePasswordSchema), changePassword);

router.delete("/:id", removeUser);

export default router;
