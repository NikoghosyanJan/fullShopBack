import * as express from "express"
import productsController from "../../controllers/api/productsController";

const router = express.Router();

router.get('/get-products-by-category', productsController.getProductsByCategory);
router.get('/get-product-details', productsController.getProductDetails);

export default router;