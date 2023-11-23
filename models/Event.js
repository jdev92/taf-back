const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: String,
  start: Date,
  end: Date,
  daysOfWeek: [{ type: String }],
  periode: [{ type: Date }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
