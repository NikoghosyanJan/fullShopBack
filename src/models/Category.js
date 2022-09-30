import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    title: {type: String, required: true},
    url_key: {type: String, required: true, unique: true},
    children: {type: Array},
    parent: {type: String || null},
    productIDs: {type: Array}
});

const Category = model("CATEGORY", schema);

export default Category;