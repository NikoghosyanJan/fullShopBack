import Product from "../../models/Product";
import Category from "../../models/Category";
import {ObjectId} from "mongodb";
import Cart from "../../models/Cart";

interface Params {
    title: String
    description: String
    category_id: String
    quantity: String
    price: String | Number
    sale_price: String | Number
    url: String
    _id: ObjectId | String
    image?: String
}

class AdminProductsController {

    async getAllProducts(req, res) {
        try {
            const products = await Product.find({});
            if (!products) {
                return res.status(400).json({message: "No data"})
            }
            products.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
            res.send(products)

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async addProduct(req, res) {
        try {
            const product = new Product({
                ...req.body,
                image: `/uploads/products/${req.file.filename}`
            })
            await product.save()

            const category_id = req.body.category_id
            const category = await Category.findOne({_id: new ObjectId(category_id)});
            category.productIDs.push(product._id)

            await Category.updateOne(
                {_id: new ObjectId(category_id)},
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
    }

    async editProduct(req, res) {
        try {
            const {title, description, category_id, quantity, price, sale_price, url, _id} = req.body;
            const params: Params = {title, description, category_id, quantity, price, sale_price, url, _id}

            if (req.file) {
                params.image = `/uploads/products/${req.file.filename}`
            }

            const product = await Product.findOne({_id})

            if (category_id && product.category_id !== category_id) {
                const categoryOfProduct = await Category.findOne({_id: new ObjectId(product.category_id)})

                console.log(categoryOfProduct , "THE Category of product")
                if (categoryOfProduct?.productIDs?.length) {
                    const productID = categoryOfProduct.productIDs.find(el => el == product._id.toString())
                    const index = categoryOfProduct.productIDs.indexOf(productID)
                    categoryOfProduct.productIDs.splice(index, 1)
                    await Category.updateOne(
                        {_id: new ObjectId(product.category_id)},
                        {$set: categoryOfProduct}
                    )
                }

                const newCategory = await Category.findOne({_id: new ObjectId(category_id)});
                if (newCategory.productIDs) {
                    newCategory.productIDs.push(_id)
                } else {
                    newCategory.productIDs = [_id]
                }

                await Category.updateOne(
                    {_id: new ObjectId(category_id)},
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
                        _id: new ObjectId(_id)
                    }
                }
            });

            carts.length && carts.forEach(cart => {
                let editedItem = cart.items.find(el => el._id.toString() == _id.toString());
                const qtt = editedItem.qtt
                editedItem.title = title
                editedItem.description = description
                editedItem.category_id = category_id
                editedItem.quantity = quantity
                editedItem.price = price
                editedItem.sale_price = sale_price
                editedItem.url = url
                editedItem.qtt = qtt <= quantity ? qtt : quantity
            });

            await Cart.deleteMany({
                items: {
                    $elemMatch: {
                        _id: new ObjectId(_id)
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
    }

    async deleteProduct(req, res) {
        try {
            const {_id} = req.body;
            const product = await Product.findOne({_id});
            const category = await Category.findOne({_id: new ObjectId(product.category_id)});
            const productID = category.productIDs.find(el => el == product._id.toString())
            const index = category.productIDs.indexOf(productID)
            category.productIDs.splice(index, 1)
            await Category.updateOne(
                {_id: new ObjectId(product.category_id)},
                {$set: category}
            )
            await Product.deleteOne({_id});
            const products = await Product.find({});

            const carts = await Cart.find({
                items: {
                    $elemMatch: {
                        _id: new ObjectId(_id)
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
                        _id: new ObjectId(_id)
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
    }
}

export default new AdminProductsController()