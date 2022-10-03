"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const schema = new Schema({
    items: { type: Array },
    userID: { type: String },
    total: { type: Number },
    createdAd: { type: String || Date },
    updatedAt: { type: String || Date }
}, { timestamps: true });
const Cart = model("CART", schema);
exports.default = Cart;
