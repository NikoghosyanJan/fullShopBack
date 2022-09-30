import express from "express";
import Product from "../../models/Product.js";
import Category from "../../models/Category.js";

let router = express.Router();

router.get('/get-products', async (req, res) => {
    try {
        const products = await Product.find({});
        if (!products) {
            return res.status(400).json({message: "No data"})
        }
        res.send(products)

    } catch (e) {
        res.status(500).json({message: "Something went wrong!"})
    }
});

router.get('/get-products-by-category', async (req, res) => {
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
});

router.get('/get-product-details', async (req, res) => {
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
});

export default router