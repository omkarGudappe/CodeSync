const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    name : String ,
    code : String ,
    language : String ,
})

const roomSchema = new mongoose.Schema({
    roomId:{ type: String , required:true , unique:true },
    // code : { type : String , default: "// Start coding..." },
    files: [FileSchema],
})

module.exports = mongoose.model("Room", roomSchema);