const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    date: { type: String, required: true }, 
    time: { type: String, required: true }, 
    code: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
