import * as mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    items: {type: Array},
    userID: {type: String},
    total: {type: Number},
    createdAd: {type: String || Date},
    updatedAt: {type: String || Date}
}, { timestamps: true });

const Cart = model("CART", schema);

export default Cart;