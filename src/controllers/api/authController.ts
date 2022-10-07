import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import User from "../../models/User";
import {ObjectId} from "mongodb";
import Product from "../../models/Product";
import product from "../../models/Product";

interface RegErrors {
    email?: String,
    phone_number?: String
}

class AuthController {

    async register(req, res) {
        try {
            const {name, phone_number, email, password} = req.body;
            const candidateWithSuchEmail = await User.findOne({email});
            const candidateWithSuchNumber = await User.findOne({phone_number})
            if (candidateWithSuchEmail || candidateWithSuchNumber) {
                const error: RegErrors = {}
                if (candidateWithSuchEmail) {
                    error.email = "User with such email already exists!"
                }
                if (candidateWithSuchNumber) {
                    error.phone_number = "User with such phone number already exists!"
                }
                return res.status(400).json({error})
            }
            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({name, phone_number, email, password: hashedPassword, token: ""});
            await user.save()
            res.status(201).json({
                status: true,
                message: "user was success registered"
            })
        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async login(req, res) {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({email});

            if (!user) {
                return res.status(400).json({
                    error: {
                        email: "User with such email user does not exist 😟!"
                    }
                })
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    error: {
                        password: "password was wrong 😟!"
                    }
                })
            }

            const token = jwt.sign(
                {userId: user.id},
                "jwtServer",
                {expiresIn: "1h"}
            )

            await User.updateOne({email}, {
                $set: {token}
            });

            res.cookie("token", token)
            res.json({
                name: user.name,
                phone_number: user.phone_number,
                email: user.email,
                token,
                status: true
            })

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async logout(req, res) {
        try {
            const serchToken = req.body.token
            const user = await User.findOne({token: serchToken})

            if (!user) {
                return res.status(400).json({message: "logout failed!"})
            }

            await User.updateOne({token: serchToken}, {
                $set: {token: ""}
            });

            res.clearCookie("token")
            res.json({status: true, message: "User was successfuly log outed!"})

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async getUser(req, res) {
        try {
            const searchToken = req.body.token
            const user = await User.findOne({token: searchToken})

            if (!user) {
                return res.status(400).json({message: "try again"})

            }

            res.json({
                name: user.name,
                phone_number: user.phone_number,
                email: user.email,
                status: true
            })
        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async addToWishList(req, res) {
        try {
            const _id = req.body._id;
            const user = await User.findOne({token: req.headers.authorization});

            if (!user) {
                return res.status(400).json({message: "try again"})
            }


            const index =  user.wishList.indexOf(_id);

            if(index > -1){
                user.wishList.splice(index, 1)
            }else {
                user.wishList.push(_id)
            }


            await User.updateOne(
                {token: req.headers.authorization},
                {$set: user}
            )
            res.send({success: true})


        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

    async getWishList(req, res) {
        try {
            const user = await User.findOne({token: req.headers.authorization});

            if (!user) {
                return res.status(400).json({message: "try again"})
            }

            const products = await Product.find({_id: user.wishList})
            products.forEach(el => {
                el.image = process.env.API_URL + el.image;
                el.isWished = true;
            })
            res.send(products)

        } catch (e) {
            res.status(500).json({message: "Something went wrong!"})
        }
    }

}

export default new AuthController()