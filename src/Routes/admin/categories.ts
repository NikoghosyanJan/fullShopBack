import * as express from "express";
import adminCategoriesController from "../../controllers/admin/admin_categoriesController";

let router = express.Router();

router.get('/get-categories', adminCategoriesController.getCategories);
router.post('/add-category', adminCategoriesController.addCategory);
router.post('/edit-category', adminCategoriesController.editCategory);
router.post('/delete-category', adminCategoriesController.deleteCategory);

export default router;