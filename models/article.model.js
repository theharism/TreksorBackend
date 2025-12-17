const { default: mongoose } = require("mongoose");

const articleSchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
        enum:["Body","Mental","Spiritual"]
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    body:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    date: {
        type: String,
        required: true,
    },
    notificationSent: {
        type: Boolean,
        default: false,
    },
},{
    timestamps:true
});

module.exports = mongoose.model("Article",articleSchema);