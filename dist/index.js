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
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const mongodb_1 = require("mongodb");
const products_1 = require("./Routes/admin/products");
const categories_1 = require("./Routes/admin/categories");
const products_2 = require("./Routes/api/products");
const categories_2 = require("./Routes/api/categories");
const auth_1 = require("./Routes/api/auth");
const cart_1 = require("./Routes/api/cart");
const whitelist = ["https://fullshop.pages.dev", "http://localhost:3000"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
dotenv.config();
const app = express();
app.use("/uploads", express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cors(corsOptions));
app.use('/api/products', products_2.default);
app.use('/api/categories', categories_2.default);
app.use('/api/auth', auth_1.default);
app.use('/api/cart', cart_1.default);
app.use('/admin/products', products_1.default);
app.use('/admin/categories', categories_1.default);
const mongoConfig = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: mongodb_1.ServerApiVersion.v1
};
(function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose.connect("mongodb+srv://Zhan:1111@cluster0.aryldzn.mongodb.net/?retryWrites=true&w=majority", mongoConfig);
        }
        catch (e) {
            console.log("server Error", e.message);
            process.exit(1);
        }
    });
})();
app.listen(process.env.PORT);
