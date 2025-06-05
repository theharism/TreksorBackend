const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        },
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    attemptsLeft: {
        type: Number,
        required: true,
        default: 3
    }, 
    type: {
        type: String,
        enum: ["reset-password", "registration"],
        required: true,
        default: "registration"
    },
},{ timestamps: true });

OtpSchema.pre("save", function (next) {
    if (!this.isModified("otp")) return next();
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this.otp, salt, (err, hash) => {
            if (err) return next(err);
            this.otp = hash;
            next();
        });
    });
});

module.exports = mongoose.model("Otp", OtpSchema);