import express from "express";
import userController from "../../controllers/v1/user-controller";

const router = express.Router()

router.post("/register", userController.register);

export default router;