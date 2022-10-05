import Product from "../../models/Product";
import Category from "../../models/Category";

class ProductsController {

    async getProductsByCategory(req, res) {
        try {
            const {slug} = req.query
            const category = await Category.findOne({url_key: slug})
            let IDs = []
            if (category.productIDs.length) {
                IDs = category.productIDs
            } else {
                const children = await Category.find({parent: category._id})
                children.forEach(el => {
                    IDs.push(...el.productIDs)
                })
            }
            const productsByCategory = await Product.find({_id: IDs})
            productsByCategory.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
            res.send(productsByCategory)

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async getProductDetails(req, res) {
        try {
            const {url} = req.query;
            const product = await Product.findOne({url});
            if (!product) {
                return res.status(400).json({message: "No data"})
            }

            product.image = process.env.API_URL + product.image
            res.send(product)

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

}

export default new ProductsController()