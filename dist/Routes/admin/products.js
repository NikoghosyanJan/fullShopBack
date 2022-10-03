"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const multer = require("multer");
const admin_productsController_1 = require("../../controllers/admin/admin_productsController");
let router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './src/uploads/products');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({ storage });
router.get('/get-all-products', admin_productsController_1.default.getAllProducts);
router.post('/add-product', upload.single('image'), admin_productsController_1.default.addProduct);
router.post('/edit-product', upload.single('image'), admin_productsController_1.default.editProduct);
router.post('/delete-product', admin_productsController_1.default.deleteProduct);
exports.default = router;
