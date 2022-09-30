import express from "express"
import mongoose from "mongoose";
import {ServerApiVersion} from "mongodb";
import authRouter from "./routes/api/auth.js";
import productRouter from "./routes/api/product.js";
import categoryRouter from "./routes/api/categories.js";
import categoryRouterAdmin from "./routes/admin/categories.js";
import productRouterAdmin from "./routes/admin/products.js";
import CartRouter from "./routes/api/cart.js";
import cron from "node-cron";
import {checkUnusedCarts} from "./helper.js";
import * as dotenv from "dotenv";

dotenv.config();

//   --->   IT WILL WORK EVERY MONTH    <---
// cron.schedule('0 0 0 1 */1 *', checkUnusedCarts);
//  ---> BUT AT THIS TIME I NEED TO USE THIS EVERY HOUR  <---
cron.schedule('0 0 */1 * * *', checkUnusedCarts);

const app = express();
app.use("/uploads", express.static('uploads'));
app.use(express.json());
app.use('/api/auth',authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart', CartRouter);

app.use('/admin/categories', categoryRouterAdmin);
app.use('/admin/products', productRouterAdmin);


(async function start(){
    try {
        await mongoose.connect("mongodb+srv://Zhan:1111@cluster0.aryldzn.mongodb.net/?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: ServerApiVersion.v1
        })
    }catch (e) {
        console.log("server Error", e.message)
        process.exit(1)
    }
})()

app.listen(process.env.PORT || 5000);