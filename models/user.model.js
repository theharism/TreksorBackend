const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { jwt_secret_token } = require("../config/keys");

const UserSchema = new mongoose.Schema({
    avatar: {
        type: String,
        required: false,
        default: null,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        maxlength: 128,
    },
    role: {
        type: String,
        required: true,
        trim: true,
        enum: ["user", "admin"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    resetPasswordToken: {
        type: String,
        required: false,
        default: null,
    },
    resetPasswordExpires:{
        type: Date,
        required: false,
        default: null,
    }, 
    pushToken: {
        type: String,
        default: null,
    },
},{ timestamps: true });

UserSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.generateAccessJWT = function () {
    let payload = {
      id: this._id,
    };
    return jwt.sign(payload, jwt_secret_token, {
      expiresIn: '30d',
    });
};

module.exports = mongoose.model("User", UserSchema);