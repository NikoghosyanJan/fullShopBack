import express from "express";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

let router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const {name, phone_number, email, password} = req.body;
        const candidateWithSuchEmail = await User.findOne({email});
        const candidateWithSuchNumber = await User.findOne({phone_number})
        if (candidateWithSuchEmail || candidateWithSuchNumber) {
            const error = {}
            if(candidateWithSuchEmail){
                error.email = "User with such email already exists!"
            }
            if(candidateWithSuchNumber){
                error.phone_number = "User with such phone number already exists!"
            }
            return res.status(400).json({ error })
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
});


router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email})

        if (!user) {
            return res.status(400).json({
                error : {
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
            token,
            name: user.name,
            phone_number: user.phone_number,
            email: user.email,
            status: true
        })

    } catch (e) {
        res.status(500).json({message: "Something went wrong!"})
    }
});

router.post('/logout', async (req, res) => {
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
});

router.post('/get-user', async (req, res) => {
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
});


export default router