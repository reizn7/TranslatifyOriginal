const mongoose = require("mongoose");

const MeetingSummarySchema = new mongoose.Schema({
  title: String,
  date: String,
  duration: String,
  participants: [String],
  minutes: [String],
  tasks: [{
    text: String,
    assignee: String,
    deadline: String
  }]
});

module.exports = mongoose.model("MeetingSummary", MeetingSummarySchema);
