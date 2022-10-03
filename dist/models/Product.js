"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category_id: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: String, required: true },
    sale_price: { type: String },
    image: { type: String },
    url: { type: String, unique: true }
});
const Product = model("PRODUCT", schema);
exports.default = Product;
