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
      date: { type: Date, default: null }, // Définir le type Date pour la propriété date
      dayOfWeek: String,
    },
  ],
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
