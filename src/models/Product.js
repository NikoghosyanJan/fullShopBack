import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    category_id: {type: String, required:true},
    quantity: {type: String, required: true},
    price: {type: String, required: true},
    sale_price: {type: String},
    image: { type: Object },
    url: {type: String, unique: true}
});

const Product = model("PRODUCT", schema);

export default Product;