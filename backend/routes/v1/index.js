const express = require("express");
const assetRoute = require("./asset.route");
const userRoute = require("./user.route");

const router = express.Router();

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      res.sendStatus(403);
    }
  
  }

router.use('/user',userRoute);

router.use('/',verifyToken,assetRoute);



module.exports = router;

