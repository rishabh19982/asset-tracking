const express = require("express");
const router = express.Router();
const Assets = require("../../models/asset.model");
const fetch = require("node-fetch");
const config = require("../../config/config");
async function checkDuplicate(req){
    
    const assets = await Assets.find({$and : [ {"name": req.body.name },{ "type": req.body.type } ]}).limit(1) ;
    // console.log(memes);
    if(assets.length > 0){
        return false;
    }
    return true;
}

function checkGeofence(myPts,X,Y){
    let  sides = myPts.length - 1;
    let j = sides - 1;
    let pointStatus = false;
    for (let i = 0; i < sides; i++)
    {
        if (myPts[i].Y < Y && myPts[j].Y >= Y || 
    myPts[j].Y < Y && myPts[i].Y >= Y)
        {
            if (myPts[i].X + (Y - myPts[i].Y) / 
    (myPts[j].Y - myPts[i].Y) * (myPts[j].X - myPts[i].X) < X)
            {
                pointStatus = !pointStatus ;                        
            }
        }
        j = i;
    }
    return pointStatus;
}

async function getExpected(tripDetails){
    let expected = [];
    console.log('Expected')
    console.log(config.mapbox_token);
    if(tripDetails.source && tripDetails.destination){
        let slt = tripDetails.source.lt;
        let slg = tripDetails.source.lg;
        let dlt = tripDetails.destination.lt;
        let dlg = tripDetails.destination.lg;
        let url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + slg + '%2C' + slt + '%3B' + dlg + '%2C' + dlt + '?alternatives=true&geometries=geojson&steps=true&access_token=' + config.mapbox_token;
        console.log(url);
        let res = await (await fetch(url)).json() ;
        let duration = 0;
        console.log(res);
        res['routes'].forEach(route => {
            duration += route['duration']
            // console.log(route['duration']);
            route['legs'].forEach( leg =>{
                leg['steps'].forEach( step => {
                    step['geometry']['coordinates'].forEach(cor => {
                        //console.log(cor[0],cor[1])
                        expected.push({'lt':cor[1],'lg':cor[0]})
                    });
                });
            });
        });
    }
    return expected;
}

function detectAnomaly(expected,locationArray,location,tripDetails){
    let i = locationArray.length - 1;
    if( i >= 0 && i < expected.length){
        if(expected[i].lt !== location.lt && expected[i].lg !== location.lg ){
            tripDetails.anomalyFlag = true;
            tripDetails.anomalyDetails.push(location);
        }
    }
    return tripDetails;
}

async function changeToActive(req,res,asset){
    const history = asset.length > 0 && asset[0].history ? asset[0].history : {} ;
    const tripName = req.body.tripName;
    console.log(tripName);
    console.log(req.body);
    if(tripName && !(tripName in history)){
        const tripDetails = {
            "tripName":tripName
        };
        if(req.body.sLocation){
            tripDetails.source = {
                "lt": req.body.sLocation.lat,
                "lg": req.body.sLocation.lng
            };
        }
        if(req.body.dLocation){
            tripDetails.destination = {
                "lt": req.body.dLocation.lat,
                "lg": req.body.dLocation.lng
            };
        }

        tripDetails.anomalyFlag = false,
        tripDetails.anomalyDetails = [],
        tripDetails.expected = await getExpected(tripDetails);
        console.log(tripDetails)
        Assets.updateOne({"id":req.body.id},{$set:{
            "status":req.body.status,
            "tripDetails":tripDetails,
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
    const tripName = asset.length > 0 && asset[0].tripDetails ? asset[0].tripDetails.tripName : "" ;
    let history = asset.length > 0 && asset[0].history ? asset[0].history : {} ;
    if(Object.keys(prevLocation).length){
        locationArray.push(prevLocation);
    }
    if (tripName && !(tripName in history)){
        const details = asset.length > 0 && asset[0].tripDetails ? asset[0].tripDetails : {}
        details.locationArray = locationArray;
        history[tripName] = details;
    }
    Assets.updateOne({"id":req.body.id},{$set:{
        "status":req.body.status,
        "currLocation":{},
        "locationArray":[],
        "history":history,
        "tripDetails": {}
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
    let id = req.query.id;
    let type = req.query.type;
    let query = {}
    // console.log(id,type);
    if(id){
        const check = id.match(/^\d+$/) != null && parseInt(id) === parseFloat(id);
        // console.log('hii');
        if(!check){
            res.status(404).json({ msg : "Invalid Id"});
            return;
        } 
        query.id = id;
    }
    if(type){
        const check = type.match(/^[A-Za-z]+$/) !== null 
        // console.log('hii');

        if(!check){
            res.status(404).json({ msg : "Invalid Id"});
            return;
        }
        query.type = type 
    }
    Assets.find(query, (err, allAssets) => {
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
                    "tripDetails": asset.tripDetails,
                    "history" : asset.history
                }
            });
            // console.log(result);
            res.send(result.slice(0,100));
        }
    });  
})


router.put('/changeStatus',async (req,res) => {
    console.log(req.body);
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
                let expected = asset.length  > 0 && asset[0].tripDetails && asset[0].tripDetails.expected  ? asset[0].tripDetails.expected : [];
                let tripDetails = asset.length  > 0 && asset[0].tripDetails ? asset[0].tripDetails : {};
                const location = {
                    'lt': req.body.lt,
                    'lg': req.body.lg,
                    'timeStamp':req.body.timeStamp
                }
                tripDetails = detectAnomaly(expected,locationArray,location,tripDetails);
                // console.log(location);
                if(Object.keys(prevLocation).length){
                    locationArray.push(prevLocation);
                }
                // console.log(locationArray)
                Assets.updateOne({"id":req.body.id},{$set:{"locationArray":locationArray,"currLocation":location,"tripDetails":tripDetails}},(error,response) => {
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
        'status':req.body.status,
        'locationArray': [],
        'currLocation' : {},
        'history':{}
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