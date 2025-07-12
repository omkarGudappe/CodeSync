const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    message: {type: String , require: true},
    userName: String,
    EmojiToolTip: String,
    timestamp: Date
});

module.exports = mongoose.model("Feedback" , feedbackSchema);