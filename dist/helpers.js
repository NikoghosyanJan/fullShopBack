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
exports.checkUnusedCarts = exports.calculateCartTotal = exports.convertSubCategories = void 0;
const Cart_1 = require("./models/Cart");
function convertSubCategories(data) {
    const result = [];
    data.forEach((el, i) => {
        if (!el.parent) {
            result.push(el);
        }
    });
    data.forEach((el, i) => {
        result.forEach(e => {
            if (e._id.toString() == el.parent.toString()) {
                e.children.push(el);
            }
        });
    });
    data.forEach(element => {
        result.forEach(el => {
            el.children.forEach(e => {
                if (element.parent == e._id) {
                    e.children.push(element);
                }
            });
        });
    });
    return result;
}
exports.convertSubCategories = convertSubCategories;
function calculateCartTotal(cart) {
    cart.total = 0;
    cart.items.forEach(el => {
        cart.total += (+el.qtt) * (+el.sale_price || +el.price);
    });
}
exports.calculateCartTotal = calculateCartTotal;
function checkUnusedCarts() {
    return __awaiter(this, void 0, void 0, function* () {
        const carts = yield Cart_1.default.find({ userID: null });
        const cartsForDelete = [];
        console.log(carts, "carts ");
        carts.forEach(cart => {
            const cartDate = new Date(cart.updatedAt);
            const currentDate = new Date();
            const time = cartDate.getTime();
            const currentTime = currentDate.getTime();
            const difTime = (currentTime - time) / (1000 * 60 * 60 * 24);
            if (difTime > 0.04) {
                cartsForDelete.push(cart._id);
            }
        });
        yield Cart_1.default.deleteMany({
            _id: {
                $in: cartsForDelete
            }
        });
    });
}
exports.checkUnusedCarts = checkUnusedCarts;
