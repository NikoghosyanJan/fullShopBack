import Category from "../../models/Category";
import {convertSubCategories} from "../../helpers";

class CategoriesController {
    async getCategories(req, res) {
        try {
            const categories = await Category.find({});

            res.send(convertSubCategories(categories))

        } catch (e) {
            res.status(500).json({message: "not categories !"})
        }
    }
}

export default new CategoriesController()