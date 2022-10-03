import Category from "../../models/Category";
import {convertSubCategories} from "../../helpers";

class AdminCategoriesController {

    async getCategories(req, res) {
        try {
            const categories = await Category.find({});

            res.send(convertSubCategories(categories))

        } catch (e) {
            res.status(500).json({message: "not categories !"})
        }
    }

    async addCategory(req, res) {
        try {
            const {title, url_key, parent} = req.body;
            const category = await Category.findOne({url_key});
            const parentCategory = await Category.findOne({url_key: parent});
            if (category) {
                return res.status(400).json({message: "that catecori already exist", data: category})
            }
            const newCategory = new Category({
                title,
                url_key,
                parent: parentCategory ? parentCategory._id : "",
                children: []
            });
            await newCategory.save();

            const addedCategories = await Category.find({});
            return res.status(201).json(convertSubCategories(addedCategories));
        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async editCategory(req, res) {
        try {
            const {title, url_key, _id} = req.body;
            await Category.updateOne(
                {
                    _id
                },
                {
                    $set: {
                        title, url_key, _id
                    }
                }
            )

            const addedCategories = await Category.find({});
            return res.status(201).json(convertSubCategories(addedCategories));
        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async deleteCategory(req, res) {
        try {
            const {_id} = req.body;
            const categoriesForDelete = [_id];
            const firstChilds = await Category.find({parent: _id});
            firstChilds.length && firstChilds.forEach(el => {
                categoriesForDelete.push(el._id)
            })

            const secondChilds = await Category.find({
                parent: {
                    $in: categoriesForDelete
                }
            });

            secondChilds.length && secondChilds.forEach(el => {
                categoriesForDelete.push(el._id)
            });


            await Category.deleteMany({
                _id: {
                    $in: categoriesForDelete
                }
            })

            const addedCategories = await Category.find({});
            return res.status(201).json(convertSubCategories(addedCategories));
        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

}

export default new AdminCategoriesController()