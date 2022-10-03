import * as express from "express";
import cartController from "../../controllers/api/cartController";

let router = express.Router();

router.post('/get-cart', cartController.getCart);
router.post('/add-to-cart', cartController.addToCart);
router.post('/delete-from-cart', cartController.deleteFromCart);
router.post('/edit-cart', cartController.editCart);

export default router



