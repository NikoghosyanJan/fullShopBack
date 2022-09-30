import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    items: {type: Array},
    userID: {type: String},
    total: {type: Number},
    updated_at: {type: String}
});

const Cart = model("CART", schema);

export default Cart;