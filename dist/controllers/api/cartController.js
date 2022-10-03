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
const User_1 = require("../../models/User");
const Cart_1 = require("../../models/Cart");
const helpers_1 = require("../../helpers");
const Product_1 = require("../../models/Product");
const mongodb_1 = require("mongodb");
class CartController {
    getCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cartID = req.body.cartID;
                const auth = req.headers.authorization;
                if (auth) {
                    const user = yield User_1.default.findOne({
                        token: auth
                    });
                    const cart = yield Cart_1.default.findOne({
                        userID: user._id
                    });
                    if (!cart) {
                        res.send({});
                    }
                    else {
                        (0, helpers_1.calculateCartTotal)(cart);
                        yield Cart_1.default.updateOne({ token: auth });
                        res.send(cart);
                    }
                }
                else if (req.body.cartID) {
                    const cart = yield Cart_1.default.findOne({ _id: cartID });
                    if (!cart) {
                        res.send({});
                    }
                    (0, helpers_1.calculateCartTotal)(cart);
                    res.send(cart);
                }
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong! 😟" });
            }
        });
    }
    addToCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, cartID, qtt } = req.body;
                const product = yield Product_1.default.findOne({ _id });
                const { category_id, description, image, quantity, price, title, sale_price, url, _id: productId } = product;
                const itemModel = {
                    category_id, description, image, quantity, price, title, sale_price, url,
                    _id: productId,
                    qtt
                };
                let cart, user;
                if (req.headers.authorization) {
                    user = yield User_1.default.findOne({
                        token: req.headers.authorization
                    });
                    if (!user) {
                        res.status(403).json({ error: "the user not found" });
                    }
                    cart = yield Cart_1.default.findOne({
                        userID: user._id
                    });
                }
                else if (req.body.cartID) {
                    cart = yield Cart_1.default.findOne({ _id: cartID });
                    if (cart.userID) {
                        res.send({});
                    }
                }
                if (!cart) {
                    const newCart = new Cart_1.default({
                        items: [itemModel],
                        userID: (user === null || user === void 0 ? void 0 : user._id) || null,
                        total: (sale_price || price) * qtt
                    });
                    yield newCart.save();
                    res.send(newCart);
                }
                else {
                    const putProd = cart.items.find(el => el._id.toString() === _id.toString());
                    if (putProd) {
                        if (+putProd.qtt + +qtt <= +putProd.quantity) {
                            putProd.qtt = +putProd.qtt + +qtt;
                        }
                        else {
                            putProd.qtt = putProd.quantity;
                        }
                        cart.items.forEach(el => {
                            if (el._id.toString() === _id.toString()) {
                                el = putProd;
                            }
                        });
                        (0, helpers_1.calculateCartTotal)(cart);
                        yield Cart_1.default.updateOne({ _id: cartID }, {
                            $set: cart
                        });
                        const newUpdatedCart = yield Cart_1.default.findOne({ _id: cartID });
                        res.send(newUpdatedCart);
                    }
                    else {
                        cart.items.push(itemModel);
                        (0, helpers_1.calculateCartTotal)(cart);
                        yield Cart_1.default.updateOne({ _id: new mongodb_1.ObjectId(cartID) }, {
                            $set: cart
                        });
                        const newUpdatedCart = yield Cart_1.default.findOne({ _id: cartID });
                        res.send(newUpdatedCart);
                    }
                }
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong! 😟" });
            }
        });
    }
    editCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cartID, _id, qtt } = req.body;
                const auth = req.headers.authorization;
                if (auth) {
                    const user = yield User_1.default.findOne({
                        token: auth
                    });
                    const cart = yield Cart_1.default.findOne({
                        userID: user._id
                    });
                    if (!cart) {
                        res.send({});
                    }
                    const itemToEdit = cart.items.find(el => el._id.toString() === _id);
                    const index = cart.items.indexOf(itemToEdit);
                    if (qtt <= itemToEdit.quantity) {
                        cart.items[index] = Object.assign(Object.assign({}, itemToEdit), { qtt: qtt });
                    }
                    (0, helpers_1.calculateCartTotal)(cart);
                    yield Cart_1.default.updateOne({ _id: cartID }, { $set: cart });
                    const newUpdatedCart = yield Cart_1.default.findOne({ _id: cartID });
                    res.send(newUpdatedCart);
                }
                else if (cartID) {
                    const cart = yield Cart_1.default.findOne({ _id: cartID });
                    if (!cart) {
                        res.send({});
                    }
                    const itemToEdit = cart.items.find(el => el._id.toString() === _id);
                    const index = cart.items.indexOf(itemToEdit);
                    if (qtt <= itemToEdit.quantity) {
                        cart.items[index] = Object.assign(Object.assign({}, itemToEdit), { qtt: qtt });
                    }
                    (0, helpers_1.calculateCartTotal)(cart);
                    yield Cart_1.default.updateOne({ _id: cartID }, { $set: cart });
                    const newUpdatedCart = yield Cart_1.default.findOne({ _id: cartID });
                    res.send(newUpdatedCart);
                }
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong! 😟" });
            }
        });
    }
    deleteFromCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cartID, _id } = req.body;
                const auth = req.headers.authorization;
                if (auth) {
                    const user = yield User_1.default.findOne({
                        token: auth
                    });
                    const cart = yield Cart_1.default.findOne({
                        userID: user._id
                    });
                    if (!cart) {
                        res.send({});
                    }
                    const itemToDelete = cart.items.find(el => el._id.toString() === _id);
                    const index = cart.items.indexOf(itemToDelete);
                    cart.items.splice(index, 1);
                    (0, helpers_1.calculateCartTotal)(cart);
                    yield Cart_1.default.updateOne({ _id: cartID }, { $set: cart });
                    const newUpdatedCart = yield Cart_1.default.findOne({ _id: cartID });
                    res.send(newUpdatedCart);
                }
                else if (cartID) {
                    const cart = yield Cart_1.default.findOne({ _id: cartID });
                    if (!cart) {
                        res.send({});
                    }
                    const itemToDelete = cart.items.find(el => el._id.toString() === _id);
                    const index = cart.items.indexOf(itemToDelete);
                    cart.items.splice(index, 1);
                    (0, helpers_1.calculateCartTotal)(cart);
                    yield Cart_1.default.updateOne({ _id: cartID }, { $set: cart });
                    const newUpdatedCart = yield Cart_1.default.findOne({ _id: cartID });
                    res.send(newUpdatedCart);
                }
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong! 😟" });
            }
        });
    }
}
exports.default = new CartController();
