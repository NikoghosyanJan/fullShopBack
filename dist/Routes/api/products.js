"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const productsController_1 = require("../../controllers/api/productsController");
const router = express.Router();
router.get('/get-products-by-category', productsController_1.default.getProductsByCategory);
router.get('/get-product-details', productsController_1.default.getProductDetails);
exports.default = router;
