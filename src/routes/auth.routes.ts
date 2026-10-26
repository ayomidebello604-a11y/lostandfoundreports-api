import { Router } from "express";
import { validateLoginBody, validateRegisterBody } from "../middleware/auth.validation.ts";
import { verifyUserToken } from "../middleware/auth.validation.ts";
import { getAllUsers, loginUser, lougoutUser, refreshToken, registerUser } from "../controllers/auth.controllers.ts";


const router = Router()


router.get("/",verifyUserToken,getAllUsers)
router.post("/register", validateRegisterBody, registerUser);
router.post("/login", validateLoginBody, loginUser)
router.post("/refresh", refreshToken)
router.post("/logout",lougoutUser)


export default router;