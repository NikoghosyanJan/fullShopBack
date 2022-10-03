import * as path from "path";
import * as express from "express";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";
import * as cors from "cors";
import {ServerApiVersion} from "mongodb";
import productRouterAdmin from "./Routes/admin/products";
import categoriesRouterAdmin from "./Routes/admin/categories";
import productRouter from "./Routes/api/products";
import categoriesReducer from "./Routes/api/categories";
import authRouter from "./Routes/api/auth";
import cartRouter from "./Routes/api/cart";
import cron from "node-cron";
import {checkUnusedCarts} from "./helpers";

// cron.schedule('* * * * *', checkUnusedCarts);

const whitelist = ["https://fullshop.pages.dev", "http://localhost:3000", "", "/"]
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
}

dotenv.config();
const app = express();
app.use("/uploads", express.static('uploads'));
app.use(express.json());
app.use(cors(corsOptions));

app.use('/api/products', productRouter);
app.use('/api/categories', categoriesReducer);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);

app.use('/admin/products', productRouterAdmin);
app.use('/admin/categories', categoriesRouterAdmin);


interface MongoConfig {
    useNewUrlParser: Boolean;
    useUnifiedTopology: Boolean;
    serverApi: any
}

const mongoConfig: MongoConfig = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
};
(async function start(): Promise<void> {
    try {
        await mongoose.connect("mongodb+srv://Zhan:1111@cluster0.aryldzn.mongodb.net/?retryWrites=true&w=majority", mongoConfig)
    } catch (e) {
        console.log("server Error", e.message)
        process.exit(1)
    }
})();

app.listen(process.env.PORT)