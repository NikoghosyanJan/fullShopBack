"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../models/Product");
const Category_1 = require("../../models/Category");
class ProductsController {
    getProductsByCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.query;
                const category = yield Category_1.default.findOne({ url_key: slug });
                let IDs = [];
                if (category.productIDs.length) {
                    IDs = category.productIDs;
                }
                else {
                    const children = yield Category_1.default.find({ parent: category._id });
                    children.forEach(el => {
                        IDs.push(...el.productIDs);
                    });
                }
                const productsByCategory = yield Product_1.default.find({ _id: IDs });
                res.send(productsByCategory);
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    getProductDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url } = req.query;
                const product = yield Product_1.default.findOne({ url });
                if (!product) {
                    return res.status(400).json({ message: "No data" });
                }
                ;
                res.send(product);
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
}
exports.default = new ProductsController();
