import express from "express";
import multer from 'multer';
import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import {convertSubCategories} from "../../helper.js";
import Cart from "../../models/Cart.js";
import {ObjectId} from "mongodb";

let router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './src/uploads/products');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const upload = multer({storage: storage})

router.post('/add-product', upload.single('image'), async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            image: `/uploads/products/${req.file.filename}`
        })
        await product.save()

        console.log(req.body, "___body")

        const category_id = req.body.category_id
        const category = await Category.findOne({_id: ObjectId(category_id)});
        category.productIDs.push(product._id)

        await Category.updateOne(
            {_id: ObjectId(category_id)},
            {
                $set:
                category
            }
        )

        const products = await Product.find({})
        res.send(products)

    } catch (e) {
        res.status(500).json({
            error: e,
            message: "Something went wrong!"
        })
    }
});

router.post('/edit-product', upload.single('image'), async (req, res) => {
    try {
        const {title, description, category, quantity, price, sale_price, url, _id} = req.body;
        const params = {title, description, category, quantity, price, sale_price, url, _id}

        if (req.file) {
            params.image = `/uploads/products/${req.file.filename}`
        }

        const product = await Product.findOne({_id})
        if (product.category !== category) {
            const categoryOfProduct = await Category.findOne({url_key: product.category})

            if (categoryOfProduct.productIDs) {
                const productID = categoryOfProduct.productIDs.find(el => el == product._id.toString())
                const index = categoryOfProduct.productIDs.indexOf(productID)
                categoryOfProduct.productIDs.splice(index, 1)
                await Category.updateOne(
                    {url_key: product.category},
                    {$set: categoryOfProduct}
                )
            }

            const newCategory = await Category.findOne({url_key: category});
            if (newCategory.productIDs) {
                newCategory.productIDs.push(_id)
            } else {
                newCategory.productIDs = [_id]
            }

            await Category.updateOne(
                {url_key: category},
                {
                    $set:
                    newCategory
                }
            )
        }

        await Product.updateOne(
            {
                _id
            },
            {
                $set: params
            }
        );
        const EditedProducts = await Product.find({});

        const carts = await Cart.find({
            items: {
                $elemMatch: {
                    _id: ObjectId(_id)
                }
            }
        });

        carts.length && carts.forEach(cart => {
            let editedItem = cart.items.find(el => el._id.toString() == _id.toString());
            const qtt = editedItem.qtt
            editedItem.title = title
            editedItem.description = description
            editedItem.category = category
            editedItem.quantity = quantity
            editedItem.price = price
            editedItem.sale_price = sale_price
            editedItem.url = url
            editedItem.qtt = qtt <= quantity ? qtt : quantity
        });

        await Cart.deleteMany({
            items: {
                $elemMatch: {
                    _id: ObjectId(_id)
                }
            }
        });

        await Cart.insertMany(
            carts
        );

        return res.send(EditedProducts);
    } catch (e) {
        res.status(500).json({message: "Something went wrong!"})
    }
});

router.post('/delete-product', async (req, res) => {
    try {
        const {_id} = req.body;
        const product = await Product.findOne({_id});
        const category = await Category.findOne({_id: ObjectId(product.category_id)});
        const productID = category.productIDs.find(el => el == product._id.toString())
        const index = category.productIDs.indexOf(productID)
        category.productIDs.splice(index, 1)
        await Category.updateOne(
            {_id: ObjectId(product.category_id)},
            {$set: category}
        )
        await Product.deleteOne({_id});
        const products = await Product.find({});

        const carts = await Cart.find({
            items: {
                $elemMatch: {
                    _id: ObjectId(_id)
                }
            }
        });

        carts.length && carts.forEach(cart => {
            const deletedItem = cart.items.find(el => el._id.toString() == _id.toString())
            const index = cart.items.indexOf(deletedItem)
            cart.items.splice(index, 1)
        });

        await Cart.deleteMany({
            items: {
                $elemMatch: {
                    _id: ObjectId(_id)
                }
            }
        });

        await Cart.insertMany(
            carts
        );

        res.send(products);
    } catch (e) {
        res.status(500).json({message: "Something went wrong!"})
    }
});

router.get('/get-all-products', async (req, res) => {
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

export default router