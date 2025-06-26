const { default: mongoose } = require("mongoose");

const powerThoughtSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    thought: {
        type: String,
        required: true,
    },
},{
    timestamps:true
});

module.exports = mongoose.model("PowerThought",powerThoughtSchema);