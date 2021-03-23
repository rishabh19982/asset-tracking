const express = require("express");
const router = express.Router();
const Assets = require("../../models/asset.model");

async function checkDuplicate(req){
    
    const assets = await Assets.find({$and : [ {"name": req.body.name },{ "type": req.body.type } ]}).limit(1) ;
    // console.log(memes);
    if(assets.length > 0){
        return false;
    }
    return true;
}

function changeToActive(req,res,asset){
    const history = asset.length > 0 && asset[0].history ? asset[0].history : {} ;
    const tripName = req.body.tripName;
    console.log(tripName);

    if(tripName && !(tripName in history)){
        Assets.updateOne({"id":req.body.id},{$set:{
            "status":req.body.status,
            "tripName":tripName
        }},(error,response) => {
            if(error){
                res.status(400).send('Error in changing status')
            } else {
                res.send('Status Changed Successfully');
            }
        });
        
    } else {
        res.status(400).send('Enter different Trip Name');
    }
}

function changeToNonActive(req,res,asset){
    let locationArray = asset.length > 0 && asset[0].locationArray ? asset[0].locationArray : [] ;
    let prevLocation = asset.length > 0 && asset[0].currLocation ? asset[0].currLocation : {} ;
    const tripName = asset.length > 0 && asset[0].tripName ? asset[0].tripName : "" ;
    let history = asset.length > 0 && asset[0].history ? asset[0].history : {} ;
    if(Object.keys(prevLocation).length){
        locationArray.push(prevLocation);
    }
    if (tripName && !(tripName in history)){
        history[tripName] = locationArray;
    }
    Assets.updateOne({"id":req.body.id},{$set:{
        "status":req.body.status,
        "currLocation":{},
        "locationArray":[],
        "history":history,
        "tripName":""
    }},(error,response) => {
        if(error){
            res.status(400).send('Status rest failing');
        } else {
            res.send('Status Changed Successfully');
        }
    });
}

function handleStatus(req,res,asset){
    const status = asset.length > 0 && asset[0].status ? asset[0].status : "" ;
    if(req.body.status === 'active' && status === 'non-active'){
        changeToActive(req,res,asset);
    } else if( req.body.status === 'non-active' && status === 'active'){
        changeToNonActive(req,res,asset);
    } else {
        res.status(400).send('Invalid Status');
    }
}

router.get('/assets',async (req,res) => { 
    Assets.find({}, (err, allAssets) => {
        if (err) {
          console.log(err);
          res.status(500).send();
        } else {
            const result = allAssets.map((asset) => {
                return {
                    "id" : asset.id,
                    "name" :asset.name,
                    "type" : asset.type,
                    "locationArray" : asset.locationArray,
                    "currLocation" : asset.currLocation,
                    "status" : asset.status,
                    "history" : asset.history
                }
            });
            res.send(result.slice(0,100));
        }
    });  
})


router.put('/changeStatus',async (req,res) => {
    Assets.find({"id":req.body.id},(err ,asset) => {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            handleStatus(req,res,asset);
        }
    });
    
})

router.put('/postLocation',async (req,res) => {
    // if (!req.is("application/json")) {
    //     res.status(415);
    //     res.send({ error: "Received non-JSON data" });
    // }
    Assets.find({"id":req.body.id},(err ,asset) => {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            // console.log(asset);
            if(asset.length > 0 && asset[0].status === 'non-active'){
                res.status(400).send("status is not active");
            } else{
                let locationArray = asset.length > 0 && asset[0].locationArray ? asset[0].locationArray : [] ;
                let prevLocation = asset.length  > 0 && asset[0].currLocation ? asset[0].currLocation : {};
                const location = {
                    'lt': req.body.lt,
                    'lg': req.body.lg,
                    'timeStamp':req.body.timeStamp
                }
                // console.log(location);
                if(Object.keys(prevLocation).length){
                    locationArray.push(prevLocation);
                }
                // console.log(locationArray)
                Assets.updateOne({"id":req.body.id},{$set:{"locationArray":locationArray,"currLocation":location}},(error,response) => {
                    if(error){
                        res.status(400).send("Location rest failed");
                    } else {
                        res.send('Success');
                    }
                });
            }
        }
    });
});


router.post('/createAsset',async (req,res) => {
    // if (!req.is("application/json")) {
    //     res.status(415);
    //     res.send({ error: "Received non-JSON data" });
    // }
    const lastAsset = await Assets.find({}).sort({"created_at":-1}).limit(1);
    const newAsset = {
        'id': lastAsset.length > 0 ? lastAsset[0].id + 1 : 1,
        'name': req.body.name,
        'type':req.body.type,
        'status':req.body.status
    }
    // console.log(newAsset);
    let flag = await checkDuplicate(req);
    if (flag){
        Assets.create(newAsset, (err, newlyCreated) => {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            // console.log("New Asset item: ", newlyCreated);
            res.status(201).send({"id": newlyCreated.id});
        }
        });
    } else {
        res.status(409).send({msg: "Duplicate "});
    }
});




router.all('*',(req,res) => {
    res.status(404).send('Page Not found');
})

module.exports = router;