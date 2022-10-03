import User from "../../models/User";
import Cart from "../../models/Cart";
import {calculateCartTotal} from "../../helpers";
import Product from "../../models/Product";
import {ObjectId} from "mongodb";

interface ProductToAdd {
    _id: String | ObjectId;
    cartID: any;
    qtt: any;
}

interface ProductFromDB {
    title: String;
    description: String;
    image: String;
    price: any;
    url: String;
    sale_price: any;
    quantity: any;
    category_id: String | ObjectId;
    _id: any
}

class CartController {
    async getCart(req, res) {
        try {
            const cartID = req.body.cartID
            const auth = req.headers.authorization
            if (auth) {
                const user = await User.findOne({
                    token: auth
                })
                const cart = await Cart.findOne({
                    userID: user._id
                })
                if (!cart) {
                    res.send({})
                } else {
                    calculateCartTotal(cart)
                    await Cart.updateOne(
                        {token: auth}
                    )
                    res.send(cart)
                }
            } else if (req.body.cartID) {
                const cart = await Cart.findOne({_id: cartID})
                if (!cart) {
                    res.send({})
                }
                calculateCartTotal(cart)
                res.send(cart)
            }
        } catch (e) {
            res.status(500).json({message: "Something went wrong! 😟"})
        }
    }

    async addToCart(req, res) {
        try {
            const {_id, cartID, qtt}: ProductToAdd = req.body
            const product: ProductFromDB = await Product.findOne({_id})
            const {category_id, description, image, quantity, price, title, sale_price, url, _id: productId} : ProductFromDB = product;
            const itemModel = {
                category_id, description, image, quantity, price, title, sale_price, url,
                _id: productId,
                qtt
            }
            let cart, user;
            if (req.headers.authorization) {
                //    ---> the case of GET CART WITH BAREER TOKEN <---
                 user = await User.findOne({
                    token: req.headers.authorization
                })
                if (!user) {
                    res.status(403).json({error: "the user not found"})
                }
                cart = await Cart.findOne({
                    userID: user._id
                })
            } else if (req.body.cartID) {
                cart = await Cart.findOne({_id: cartID})
                if (cart.userID) {
                    res.send({})
                }
            }
            if (!cart) {
                //  ---> the case ofCART NOT FOUND,  and  create new cart <---
                const newCart = new Cart({
                    items: [itemModel],
                    userID: user?._id || null,
                    total: (sale_price || price) * qtt
                })
                await newCart.save()
                res.send(newCart)
            } else {
                // ---> the case of CART WAS FOUNT <---
                const putProd = cart.items.find(el => el._id.toString() === _id.toString());
                if (putProd) {
                    //  ---> the case of  PUT QUANTITY of an product <---
                    if (+putProd.qtt + +qtt <= +putProd.quantity) {
                        putProd.qtt = +putProd.qtt + +qtt;
                    } else {
                        putProd.qtt = putProd.quantity
                    }
                    cart.items.forEach(el => {
                        if (el._id.toString() === _id.toString()) {
                            el = putProd
                        }
                    })
                    calculateCartTotal(cart);
                    await Cart.updateOne(
                        {_id: cartID},
                        {
                            $set: cart
                        }
                    );
                    const newUpdatedCart = await Cart.findOne({_id: cartID})
                    res.send(newUpdatedCart)
                } else {
                    // ---> the case of ADD NEW PRODUCT to cart <---
                    cart.items.push(itemModel);
                    calculateCartTotal(cart);
                    await Cart.updateOne(
                        {_id: new ObjectId(cartID)},
                        {
                            $set: cart
                        }
                    );
                    const newUpdatedCart = await Cart.findOne({_id: cartID})
                    res.send(newUpdatedCart)
                }
            }
        } catch (e) {
            res.status(500).json({message: "Something went wrong! 😟"})
        }
    }

    async editCart(req, res) {
        try {
            const {cartID, _id, qtt} = req.body
            const auth = req.headers.authorization
            if (auth) {
                const user = await User.findOne({
                    token: auth
                })
                const cart = await Cart.findOne({
                    userID: user._id
                })
                if (!cart) {
                    res.send({})
                }
                const itemToEdit = cart.items.find(el => el._id.toString() === _id);
                const index = cart.items.indexOf(itemToEdit);

                if (qtt <= itemToEdit.quantity) {
                    cart.items[index] = {
                        ...itemToEdit,
                        qtt: qtt
                    }
                }

                calculateCartTotal(cart);
                await Cart.updateOne(
                    {_id: cartID},
                    {$set: cart}
                )

                const newUpdatedCart = await Cart.findOne({_id: cartID})
                res.send(newUpdatedCart)
            } else if (cartID) {
                const cart = await Cart.findOne({_id: cartID})
                if (!cart) {
                    res.send({})
                }
                const itemToEdit = cart.items.find(el => el._id.toString() === _id);
                const index = cart.items.indexOf(itemToEdit);

                if (qtt <= itemToEdit.quantity) {
                    cart.items[index] = {
                        ...itemToEdit,
                        qtt: qtt
                    }
                }

                calculateCartTotal(cart);
                await Cart.updateOne(
                    {_id: cartID},
                    {$set: cart}
                )

                const newUpdatedCart = await Cart.findOne({_id: cartID})
                res.send(newUpdatedCart)
            }
        } catch (e) {
            res.status(500).json({message: "Something went wrong! 😟"})
        }
    }

    async deleteFromCart(req, res) {
        try {
            const {cartID, _id} = req.body
            const auth = req.headers.authorization
            if (auth) {
                const user = await User.findOne({
                    token: auth
                })
                const cart = await Cart.findOne({
                    userID: user._id
                })
                if (!cart) {
                    res.send({})
                }
                const itemToDelete = cart.items.find(el => el._id.toString() === _id);
                const index = cart.items.indexOf(itemToDelete);
                cart.items.splice(index, 1);
                calculateCartTotal(cart);
                await Cart.updateOne(
                    {_id: cartID},
                    {$set: cart}
                )

                const newUpdatedCart = await Cart.findOne({_id: cartID})
                res.send(newUpdatedCart)
            } else if (cartID) {
                const cart = await Cart.findOne({_id: cartID})
                if (!cart) {
                    res.send({})
                }

                const itemToDelete = cart.items.find(el => el._id.toString() === _id);
                const index = cart.items.indexOf(itemToDelete);
                cart.items.splice(index, 1);
                calculateCartTotal(cart);
                await Cart.updateOne(
                    {_id: cartID},
                    {$set: cart}
                )

                const newUpdatedCart = await Cart.findOne({_id: cartID})
                res.send(newUpdatedCart)
            }
        } catch (e) {
            res.status(500).json({message: "Something went wrong! 😟"})
        }
    }

}

export default new CartController()