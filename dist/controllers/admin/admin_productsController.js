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
const mongodb_1 = require("mongodb");
const Cart_1 = require("../../models/Cart");
class AdminProductsController {
    getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield Product_1.default.find({});
                if (!products) {
                    return res.status(400).json({ message: "No data" });
                }
                products.forEach(el => {
                    el.image = process.env.API_URL + el.image;
                });
                res.send(products);
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    addProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = new Product_1.default(Object.assign(Object.assign({}, req.body), { image: `/uploads/products/${req.file.filename}` }));
                yield product.save();
                const category_id = req.body.category_id;
                const category = yield Category_1.default.findOne({ _id: new mongodb_1.ObjectId(category_id) });
                category.productIDs.push(product._id);
                yield Category_1.default.updateOne({ _id: new mongodb_1.ObjectId(category_id) }, {
                    $set: category
                });
                const products = yield Product_1.default.find({});
                res.send(products);
            }
            catch (e) {
                res.status(500).json({
                    error: e,
                    message: "Something went wrong!"
                });
            }
        });
    }
    editProduct(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description, category_id, quantity, price, sale_price, url, _id } = req.body;
                const params = { title, description, category_id, quantity, price, sale_price, url, _id };
                if (req.file) {
                    params.image = `/uploads/products/${req.file.filename}`;
                }
                const product = yield Product_1.default.findOne({ _id });
                if (category_id && product.category_id !== category_id) {
                    const categoryOfProduct = yield Category_1.default.findOne({ _id: new mongodb_1.ObjectId(product.category_id) });
                    console.log(categoryOfProduct, "THE Category of product");
                    if ((_a = categoryOfProduct === null || categoryOfProduct === void 0 ? void 0 : categoryOfProduct.productIDs) === null || _a === void 0 ? void 0 : _a.length) {
                        const productID = categoryOfProduct.productIDs.find(el => el == product._id.toString());
                        const index = categoryOfProduct.productIDs.indexOf(productID);
                        categoryOfProduct.productIDs.splice(index, 1);
                        yield Category_1.default.updateOne({ _id: new mongodb_1.ObjectId(product.category_id) }, { $set: categoryOfProduct });
                    }
                    const newCategory = yield Category_1.default.findOne({ _id: new mongodb_1.ObjectId(category_id) });
                    if (newCategory.productIDs) {
                        newCategory.productIDs.push(_id);
                    }
                    else {
                        newCategory.productIDs = [_id];
                    }
                    yield Category_1.default.updateOne({ _id: new mongodb_1.ObjectId(category_id) }, {
                        $set: newCategory
                    });
                }
                yield Product_1.default.updateOne({
                    _id
                }, {
                    $set: params
                });
                const EditedProducts = yield Product_1.default.find({});
                const carts = yield Cart_1.default.find({
                    items: {
                        $elemMatch: {
                            _id: new mongodb_1.ObjectId(_id)
                        }
                    }
                });
                carts.length && carts.forEach(cart => {
                    let editedItem = cart.items.find(el => el._id.toString() == _id.toString());
                    const qtt = editedItem.qtt;
                    editedItem.title = title;
                    editedItem.description = description;
                    editedItem.category_id = category_id;
                    editedItem.quantity = quantity;
                    editedItem.price = price;
                    editedItem.sale_price = sale_price;
                    editedItem.url = url;
                    editedItem.qtt = qtt <= quantity ? qtt : quantity;
                });
                yield Cart_1.default.deleteMany({
                    items: {
                        $elemMatch: {
                            _id: new mongodb_1.ObjectId(_id)
                        }
                    }
                });
                yield Cart_1.default.insertMany(carts);
                return res.send(EditedProducts);
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id } = req.body;
                const product = yield Product_1.default.findOne({ _id });
                const category = yield Category_1.default.findOne({ _id: new mongodb_1.ObjectId(product.category_id) });
                const productID = category.productIDs.find(el => el == product._id.toString());
                const index = category.productIDs.indexOf(productID);
                category.productIDs.splice(index, 1);
                yield Category_1.default.updateOne({ _id: new mongodb_1.ObjectId(product.category_id) }, { $set: category });
                yield Product_1.default.deleteOne({ _id });
                const products = yield Product_1.default.find({});
                const carts = yield Cart_1.default.find({
                    items: {
                        $elemMatch: {
                            _id: new mongodb_1.ObjectId(_id)
                        }
                    }
                });
                carts.length && carts.forEach(cart => {
                    const deletedItem = cart.items.find(el => el._id.toString() == _id.toString());
                    const index = cart.items.indexOf(deletedItem);
                    cart.items.splice(index, 1);
                });
                yield Cart_1.default.deleteMany({
                    items: {
                        $elemMatch: {
                            _id: new mongodb_1.ObjectId(_id)
                        }
                    }
                });
                yield Cart_1.default.insertMany(carts);
                res.send(products);
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
}
exports.default = new AdminProductsController();
