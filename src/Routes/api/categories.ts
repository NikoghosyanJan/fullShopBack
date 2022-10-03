import * as  express from "express";
import categoriesController from "../../controllers/api/categoriesController";

let router = express.Router();

router.get('/get-categories', categoriesController.getCategories);

export default router