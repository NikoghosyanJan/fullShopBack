import express from "express";
import Category from "../../models/Category.js";
import {convertSubCategories} from "../../helper.js";

let router = express.Router();

router.get('/get-categories',async (req,res) =>{
    try {
        const categories = await Category.find({});

        res.send(convertSubCategories(categories))

    }catch (e) {
        res.status(500).json({message: "not categories !"})
    }
});

export default router