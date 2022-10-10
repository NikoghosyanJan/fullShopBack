import Product from "../../models/Product";
import Category from "../../models/Category";
import User from "../../models/User";

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
            const auth = req.headers.authorization;
            const user = auth && await User.findOne({token: auth});

            if (!product) {
                return res.status(400).json({message: "No data"})
            }

            product.image = process.env.API_URL + product.image;
            if(user && user.wishList.includes(product._id.toString())){
                product.isWished = true
            }
            res.send(product)

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async searchProducts(req, res) {
        try {
            const {search:value} = req.query;
            const including = [];


            const products = await Product.find();
            products.forEach(el => {
                console.log(el.title.includes(value), "bool")
                if (el.title.includes(value) || el.description.includes(value)){
                    el.image = process.env.API_URL + el.image;
                    including.push(el)
                }
            });


            res.send(including)

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

}

export default new ProductsController()