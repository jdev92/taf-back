const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const moment = require("moment");

// Créer un Event avec jours de la semaine sélectionnés
router.post("/create-event", async (req, res) => {
  try {
    const { title, start, end, userId, daysOfWeek, periode } = req.body;

    const eventsData = Array.isArray(daysOfWeek)
      ? daysOfWeek.map((day) => ({ Event: day }))
      : [];

    const periodeData = Array.isArray(periode) ? periode : [periode];

    const event = new Event({
      title,
      start: new Date(start),
      end: new Date(end),
      user: userId,
      daysOfWeek,
      Events: eventsData,
      periode: periodeData.map((p) => ({
        date: new Date(p.date),
        dayOfWeek: p.dayOfWeek,
      })),
    });

    const savedEvent = await event.save();

    res.status(201).json({
      eventId: savedEvent._id,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les évènements de l'utilisateur
router.get("/userEvents/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userEvents = await Event.find({ user: userId });

    // Formater les dates pour afficher uniquement la date sans l'heure
    const formattedUserEvents = userEvents.map((event) => ({
      _id: event._id,
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DD"), // Format YYYY-MM-DD
      end: moment(event.end).format("YYYY-MM-DD"), // Format YYYY-MM-DD
      periode: event.periode.map((day) => ({
        date: moment(day.date).format("YYYY-MM-DD"), // Format YYYY-MM-DD
        dayOfWeek: day.dayOfWeek,
      })),
    }));

    res.json(formattedUserEvents);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les évènements
router.get("/allEvents", async (req, res) => {
  try {
    const allEvents = await Event.find().populate("user");
    const formattedUserEvents = allEvents.map((event) => ({
      _id: event._id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      user: {
        _id: event.user._id,
        firstName: event.user.firstName,
        lastName: event.user.lastName,
        email: event.user.email,
      },
    }));
    res.json(formattedUserEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un Event
router.delete("/deleteEvent/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const deletedEvent = await Event.deleteOne({ _id: eventId });
    if (!deletedEvent) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    res.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
