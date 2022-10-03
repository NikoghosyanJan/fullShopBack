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
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User_1 = require("../../models/User");
class AuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, phone_number, email, password } = req.body;
                const candidateWithSuchEmail = yield User_1.default.findOne({ email });
                const candidateWithSuchNumber = yield User_1.default.findOne({ phone_number });
                if (candidateWithSuchEmail || candidateWithSuchNumber) {
                    const error = {};
                    if (candidateWithSuchEmail) {
                        error.email = "User with such email already exists!";
                    }
                    if (candidateWithSuchNumber) {
                        error.phone_number = "User with such phone number already exists!";
                    }
                    return res.status(400).json({ error });
                }
                const hashedPassword = yield bcrypt.hash(password, 12);
                const user = new User_1.default({ name, phone_number, email, password: hashedPassword, token: "" });
                yield user.save();
                res.status(201).json({
                    status: true,
                    message: "user was success registered"
                });
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield User_1.default.findOne({ email });
                if (!user) {
                    return res.status(400).json({
                        error: {
                            email: "User with such email user does not exist 😟!"
                        }
                    });
                }
                const isMatch = yield bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({
                        error: {
                            password: "password was wrong 😟!"
                        }
                    });
                }
                const token = jwt.sign({ userId: user.id }, "jwtServer", { expiresIn: "1h" });
                yield User_1.default.updateOne({ email }, {
                    $set: { token }
                });
                res.cookie("token", token);
                res.json({
                    name: user.name,
                    phone_number: user.phone_number,
                    email: user.email,
                    status: true
                });
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serchToken = req.body.token;
                const user = yield User_1.default.findOne({ token: serchToken });
                if (!user) {
                    return res.status(400).json({ message: "logout failed!" });
                }
                yield User_1.default.updateOne({ token: serchToken }, {
                    $set: { token: "" }
                });
                res.clearCookie("token");
                res.json({ status: true, message: "User was successfuly log outed!" });
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchToken = req.body.token;
                const user = yield User_1.default.findOne({ token: searchToken });
                if (!user) {
                    return res.status(400).json({ message: "try again" });
                }
                res.json({
                    name: user.name,
                    phone_number: user.phone_number,
                    email: user.email,
                    status: true
                });
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
}
exports.default = new AuthController();
