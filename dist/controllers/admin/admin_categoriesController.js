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
const Category_1 = require("../../models/Category");
const helpers_1 = require("../../helpers");
class AdminCategoriesController {
    getCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield Category_1.default.find({});
                res.send((0, helpers_1.convertSubCategories)(categories));
            }
            catch (e) {
                res.status(500).json({ message: "not categories !" });
            }
        });
    }
    addCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, url_key, parent } = req.body;
                const category = yield Category_1.default.findOne({ url_key });
                const parentCategory = yield Category_1.default.findOne({ url_key: parent });
                if (category) {
                    return res.status(400).json({ message: "that catecori already exist", data: category });
                }
                const newCategory = new Category_1.default({
                    title,
                    url_key,
                    parent: parentCategory ? parentCategory._id : "",
                    children: []
                });
                yield newCategory.save();
                const addedCategories = yield Category_1.default.find({});
                return res.status(201).json((0, helpers_1.convertSubCategories)(addedCategories));
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    editCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, url_key, _id } = req.body;
                yield Category_1.default.updateOne({
                    _id
                }, {
                    $set: {
                        title, url_key, _id
                    }
                });
                const addedCategories = yield Category_1.default.find({});
                return res.status(201).json((0, helpers_1.convertSubCategories)(addedCategories));
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id } = req.body;
                const categoriesForDelete = [_id];
                const firstChilds = yield Category_1.default.find({ parent: _id });
                firstChilds.length && firstChilds.forEach(el => {
                    categoriesForDelete.push(el._id);
                });
                const secondChilds = yield Category_1.default.find({
                    parent: {
                        $in: categoriesForDelete
                    }
                });
                secondChilds.length && secondChilds.forEach(el => {
                    categoriesForDelete.push(el._id);
                });
                yield Category_1.default.deleteMany({
                    _id: {
                        $in: categoriesForDelete
                    }
                });
                const addedCategories = yield Category_1.default.find({});
                return res.status(201).json((0, helpers_1.convertSubCategories)(addedCategories));
            }
            catch (e) {
                res.status(500).json({ message: "Something went wrong!" });
            }
        });
    }
}
exports.default = new AdminCategoriesController();
