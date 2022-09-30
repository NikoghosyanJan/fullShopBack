import express from "express";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";
import User from "../../models/User.js";
import {calculateCartTotal} from "../../helper.js";

let router = express.Router();


router.post('/get-cart', async (req, res) => {
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
                const date = new Date();
                calculateCartTotal(cart)
                await Cart.updateOne(
                    {token: auth},
                    {updated_at: date}
                )
                cart.items.forEach(el => {
                    el.image = process.env.API_URL + el.image
                })
                res.send(cart)
            }
        } else if (req.body.cartID) {
            const cart = await Cart.findOne({_id: cartID})
            if (!cart) {
                res.send({})
            }
            const date = new Date();
            calculateCartTotal(cart)
            await Cart.updateOne(
                {_id: cartID},
                {updated_at: date}
            )
            cart.items.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
            res.send(cart)
        }
    } catch (e) {
        res.status(500).json({message: "Something went wrong! 😟"})
    }
});


router.post('/add-to-cart', async (req, res) => {
    try {
        const {_id, cartID, qtt} = req.body
        const product = await Product.findOne({_id})
        const {category, description, image, quantity, price, title, sale_price, url} = await product;

        const itemModel = {
            category, description, image, quantity, price, title, sale_price, url,
            _id: product._id,
            qtt
        }

        if (req.headers.authorization) {
            //    ---> the case of GET CART WITH BAREER TOKEN <---
            const user = await User.findOne({
                token: req.headers.authorization
            })
            if (!user) {
                res.send({})
            }
            const cart = await Cart.findOne({
                userID: user._id
            })

            if (!cart) {
                //  ---> the case ofCART NOT FOUND,  and  create new cart <---
                const newCart = new Cart({
                    items: [itemModel],
                    userID: user._id,
                    total: (sale_price || price) * qtt,
                    updated_at: new Date()
                })
                await newCart.save()
                newCart.items.forEach(el => {
                    el.image = process.env.API_URL + el.image
                })
                res.send(newCart)
            } else {
                // ---> the case of CART WAS FOUNT <---
                const putProd = cart.items.find(el => el._id.toString() === _id.toString())
                if (putProd) {
                    //  ---> the case of  PUT QUANTITY of an product <---
                    if (+putProd.qtt + +qtt <= +putProd.quantity) {
                        putProd.qtt = +putProd.qtt + +qtt;
                    }else{
                        putProd.qtt = putProd.quantity

                    }
                    cart.items.forEach(el => {
                        if (el._id.toString() === _id.toString()) {
                            el = putProd
                        }
                    })
                    calculateCartTotal(cart);
                    cart.updated_at = new Date();
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
                    cart.updated_at = new Date();
                    await Cart.updateOne(
                        {_id: cartID},
                        {
                            $set: cart
                        }
                    );
                    const newUpdatedCart = await Cart.findOne({_id: cartID})
                    newUpdatedCart.items.forEach(el => {
                        el.image = process.env.API_URL + el.image
                    })
                    res.send(newUpdatedCart)
                }
            }
        } else if (req.body.cartID) {
            const cart = await Cart.findOne({_id: cartID})
            if (cart.userID) {
                res.send({})
            }
            if (!cart) {
                //  ---> the case ofCART NOT FOUND,  and  create new cart <---
                const newCart = new Cart({
                    items: [itemModel],
                    userID: null,
                    total: (sale_price || price) * qtt,
                    updated_at: new Date()
                })
                await newCart.save()
                newCart.items.forEach(el => {
                    el.image = process.env.API_URL + el.image
                })
                res.send(newCart)
            } else {
                // ---> the case of CART WAS FOUNT <---
                const putProd = cart.items.find(el => el._id.toString() === _id.toString())
                if (putProd) {
                    //  ---> the case of  PUT QUANTITY of an product <---
                    if (+putProd.qtt + +qtt <= +putProd.quantity) {
                        putProd.qtt = +putProd.qtt + +qtt;
                    }else{
                        putProd.qtt = putProd.quantity
                    }                    cart.items.forEach(el => {
                        if (el._id.toString() === _id.toString()) {
                            el = putProd
                        }
                    })
                    calculateCartTotal(cart);
                    cart.updated_at = new Date();
                    await Cart.updateOne(
                        {_id: cartID},
                        {
                            $set: {
                                ...cart,
                                updated_at: new Date()
                            }
                        }
                    );
                    const newUpdatedCart = await Cart.findOne({_id: cartID})
                    newUpdatedCart.items.forEach(el => {
                        el.image = process.env.API_URL + el.image
                    })
                    res.send(newUpdatedCart)
                } else {
                    // <--- the case of ADD NEW PRODUCT to cart <---
                    cart.items.push(itemModel);
                    calculateCartTotal(cart);
                    cart.updated_at = new Date();
                    await Cart.updateOne(
                        {_id: cartID},
                        {
                            $set: {
                                ...cart,
                                updated_at: new Date()
                            }
                        }
                    );
                    const newUpdatedCart = await Cart.findOne({_id: cartID})
                    newUpdatedCart.items.forEach(el => {
                        el.image = process.env.API_URL + el.image
                    })
                    res.send(newUpdatedCart)
                }
            }
        } else {
            //  ---> the case of CREATING NEW CART <---
            const newCart = new Cart({
                items: [itemModel],
                userID: null,
                total: (sale_price || price) * qtt,
                updated_at: new Date()
            })
            await newCart.save()
            newCart.items.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
            res.send(newCart)
        }


    } catch (e) {
        res.status(500).json({message: "Something went wrong! 😟"})
    }
});

router.post('/delete-from-cart', async (req, res) => {
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
            cart.updated_at = new Date();
            await Cart.updateOne(
                {_id: cartID},
                {$set: cart}
            )

            const newUpdatedCart = await Cart.findOne({_id: cartID})
            newUpdatedCart.items.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
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
            cart.updated_at = new Date();
            await Cart.updateOne(
                {_id: cartID},
                {$set: cart}
            )

            const newUpdatedCart = await Cart.findOne({_id: cartID})
            newUpdatedCart.items.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
            res.send(newUpdatedCart)
        }
    } catch (e) {
        res.status(500).json({message: "Something went wrong! 😟"})
    }
});

router.post('/edit-cart', async (req, res) => {
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
            cart.updated_at = new Date();
            await Cart.updateOne(
                {_id: cartID},
                {$set: cart}
            )

            const newUpdatedCart = await Cart.findOne({_id: cartID})
            newUpdatedCart.items.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
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
            cart.updated_at = new Date();
            await Cart.updateOne(
                {_id: cartID},
                {$set: cart}
            )

            const newUpdatedCart = await Cart.findOne({_id: cartID})
            newUpdatedCart.items.forEach(el => {
                el.image = process.env.API_URL + el.image
            })
            res.send(newUpdatedCart)
        }
    } catch (e) {
        res.status(500).json({message: "Something went wrong! 😟"})
    }
});

export default router



