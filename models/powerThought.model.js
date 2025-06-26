const { default: mongoose } = require("mongoose");

const powerThoughtSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    thought: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split("T")[0]
    },
},{
    timestamps:true
});

module.exports = mongoose.model("PowerThought",powerThoughtSchema);