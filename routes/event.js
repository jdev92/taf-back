const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

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
      start,
      end,
      user: userId,
      daysOfWeek,
      Events: eventsData,
      periode: periodeData,
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
      start: event.start.toLocaleDateString(),
      end: event.end.toLocaleDateString(),
      periode: event.periode.map((day) => ({
        date: day.date.toLocaleDateString(),
        dayOfWeek: day.dayOfWeek,
      })),
    }));

    res.json(formattedUserEvents);
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
      start: event.start.toLocaleDateString(),
      end: event.end.toLocaleDateString(),
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
      start: event.start.toLocaleDateString(),
      end: event.end.toLocaleDateString(),
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
