const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcrypt')


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        validate: function abc(val) {
            var str = val.split(" ").join("");
            if (!validator.isAlpha(str)) {
                throw new Error("Name contains numerics");
            }

        }
    },
    roles: {
        type: String,
        enum: ["admin", "user"],
        default: "admin"
    },
    password: {
        type: String,
        required: true,
        validate: function abc(val) {
            if (!validator.isLength(val, { min: 8, max: undefined })) {
                throw new Error("Password length is too short. Should be minimum of 8 in length")
            }
        }
    },
    confirmPassword: {
        type: String,
        validate: function abc(val) {
            // console.log("2")
            if (val !== this.password) {

                throw new Error("Password does not match")
            }
        }
    },

    username: {
        type: String,
        validate: function abc(val) {
            var str = val.split(" ").join("");
            if (!validator.isAlphanumeric(str)) {
                throw new Error("username is not alphanumeric");
            }

        }
    },
    email: {
        type: String, 
        required: true, 
        unique: true,
        validate: validator.isEmail
    },
    address: {
        street: { type: String, default: "ABCDEF" },
        suite: { type: String, default: "ABCDEFG" },
        city: {
            type: String,
            validate: function abc(val) {
                var str = val.split(" ").join("");
                if (!validator.isAlpha(str)) {
                    throw new error("city contains numerics")
                }

            },
            default: "Delhi"
        },
        zipcode: { type: Number },

    },
    phone: { 
        type: Number, 
    },
    resetToken: String,
    ExpiresIn: Date

})
// UserSchema.pre('save', async function (next) {
//     this.password = await bcrypt.hash(this.password, 8);
//     this.confirmPassword = await bcrypt.hash(this.confirmPassword, 8);
//     console.log('Insode pre');
//     next();
// })
// UserSchema.methods.abc = function () {
//     // const crypto  =require('crypto')
//     const cryptoToken = crypto.randomBytes(32).toString('hex');

//     this.resetToken = crypto.createHash('sha256').update(cryptoToken).digest('hex');
//     console.log(this.resetToken)
//     this.ExpiresIn = Date.now() + 1000*60*7;
//     return cryptoToken;
// }
const UserModels = mongoose.model('User', UserSchema);


module.exports = UserModels;