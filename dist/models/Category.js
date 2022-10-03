"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const schema = new Schema({
    title: { type: String, required: true },
    url_key: { type: String, required: true, unique: true },
    children: { type: Array },
    parent: { type: String || null },
    productIDs: { type: Array }
});
const Category = model("CATEGORY", schema);
exports.default = Category;
