const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    id : {
        type: Number,
        required : true
    },    
    name: {
        type: String,
    },
    type: {
        type: String,
    },
    status: {
        type: String
    },
    locationArray: {
        type:Array,
        "default":[]
    },
    currLocation : {
        type:Object
    },
    tripName : {
        type: String
    },
    history : {
        type: Object
    }
},{ timestamps: { createdAt: 'created_at' }});

module.exports = mongoose.model("Asset",assetSchema );