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
        Users.create(data,(err,result) => {
            if(err){
                console.log(err);
                res.status(400).send(err);
            } else {
                var token = jsonwebtokens.sign({ id: result._id }, "secretKey", { expiresIn: "1d" });
                // res.cookie("jwt", token, { "httpOnly": true })
                console.log(result);
                res.status(201).json({
                    status: "Registration Successful",
                    token
                })
            }
        });


    }
    catch (err) {
        res.status(500).send(err)
    }


})

router.post('/login',async (req,res) => {
    console.log('Received')
    try {
        var data = req.body;
        if (!data.email || !data.password) {
            res.status(404).json({
                status: "Invalid Creds"
            })
        }
        Users.find(data,(err,result) => {
            if(err){
                res.status(400).send(err);
            } else {
                console.log(result);
                var token = jsonwebtokens.sign({ id: result._id }, "secretKey", { expiresIn: "1d" });
                // res.cookie("jwt", token, { "httpOnly": true })
                res.status(201).json({
                    status:"Login Successful",
                    token
                })
            }
        });


    }
    catch (err) {
        res.status(500).send(err)
    }
})

router.get('/logout', async (req,res) => {
    res.cookie('jwt', "logout", {
        expires: new Date(Date.now() * 20)
    })
    res.status(201).send("User Logged Out");
})
    
module.exports = router;