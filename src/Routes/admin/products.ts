import * as express from "express";
import * as multer from 'multer';
import adminProductsController from "../../controllers/admin/admin_productsController"
import productsController from "../../controllers/api/productsController";

let router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/products');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const upload = multer({storage});
router.get('/get-all-products', adminProductsController.getAllProducts);
router.post('/add-product', upload.single('image'), adminProductsController.addProduct);
router.post('/edit-product', upload.single('image'), adminProductsController.editProduct);
router.post('/delete-product', adminProductsController.deleteProduct);

export default router