"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const categoriesController_1 = require("../../controllers/api/categoriesController");
let router = express.Router();
router.get('/get-categories', categoriesController_1.default.getCategories);
exports.default = router;
