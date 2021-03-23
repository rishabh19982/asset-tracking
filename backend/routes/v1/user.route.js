const express = require("express");
const router = express.Router();
const Users = require("../../models/user.model");

router.post('/signUp', async (req,res) =>{
    try {
        var data = req.body;
        if (!data.email || !data.password) {
            res.status(404).json({
                status: "Invalid Creds"
            })
        }
        var result = await userModel.create(data);
        var token = jsonwebtoken.sign({ id: result._id }, "Secret Key", { expiresIn: "1d" });
        res.cookie("jwt", token, { "httpOnly": true })
        let url = "https://google.com"

        await new sendEmail(result, url).sendWelcome();
        res.status(201).json({
            status: "Registration Successfull",
            token
        })

    }
    catch (err) {
        res.send(err)
    }

    
})
    