const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

let access_token;

if(process.env.NODE_ENV !== 'production'){
  access_token = require("./mapbox")
}

module.exports = {
  port: process.env.PORT,
  mapbox_token: process.env.NODE_ENV === 'production'? process.env.mapbox_token : access_token,
  mongoose: {
    url:  process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.MONGODB_URL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
  },
};
