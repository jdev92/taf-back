const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: String,
  start: Date,
  end: Date,
  daysOfWeek: [{ type: String }],
  Events: [{ Event: { type: String } }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  periode: [
    {
      date: { type: Date, default: null },
      dayOfWeek: String,
    },
  ],
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
