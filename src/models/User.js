import mongoose from 'mongoose';

const {Schema, model} = mongoose

const schema = new Schema({
    name: {type: String, required: true},
    phone_number: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    token: {type: String}
});

const User = model("User", schema)

export default User