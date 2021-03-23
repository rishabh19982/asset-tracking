const express = require("express");
const jsonwebtokens = require('jsonwebtoken');
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
        Users.create(data,(_,err) => {
            if(err){
                res.status(400).send(err);
            } else {
                var token = jsonwebtokens.sign({ id: result._id }, "Secret Key", { expiresIn: "1d" });
                res.cookie("jwt", token, { "httpOnly": true })
                res.status(201).json({
                    status: "Registration Successfull",
                    token
                })
            }
        });


    }
    catch (err) {
        res.send(err)
    }


})

router.get('/logout', async (req,res) => {
    res.cookie('jwt', "logout", {
        expires: new Date(Date.now() * 20)
    })
    res.status(201).send("User Logged Out");
})
    