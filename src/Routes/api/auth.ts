import * as express from "express";
import User from "../../models/User";
import authController from "../../controllers/api/authController";

let router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/get-user', authController.getUser);

export default router