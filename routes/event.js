const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/User");
const moment = require("moment");

// Créer un Event avec les jours de la semaine sélectionnés
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
    const formattedUserEvents = userEvents.map((event) => ({
      _id: event._id,
      title: event.title,
      start: moment(event.start).format("DD/MM/YYYY"),
      end: moment(event.end).format("DD/MM/YYYY"),
      periode: event.periode.map((day) => ({
        date: moment(day.date).format("DD/MM/YYYY"),
        dayOfWeek: day.dayOfWeek,
      })),
    }));

    res.json(formattedUserEvents);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// // Récupérer les utilisateurs présents pour un jour spécifique
router.get("/presentUsers/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const selectedDate = moment(date, "DD/MM/YYYY").toDate();

    // Calculer la date de fin en ajoutant 24 heures à la date de début
    const selectedEndDate = new Date(
      selectedDate.getTime() + 24 * 60 * 60 * 1000
    );

    // Récupérer les événements pour le jour spécifique
    const events = await Event.find({
      $and: [
        { "periode.date": { $gte: selectedDate } },
        { "periode.date": { $lte: selectedEndDate } },
      ],
    });

    if (events.length === 0) {
      return res.json({
        message: "Aucun événement trouvé pour cette date.",
      });
    }

    const formattedEvents = events.map((event) => ({
      ...event.toObject(),
      periode: event.periode.map((day) => ({
        date: moment(day.date).format("DD/MM/YYYY"),
        dayOfWeek: day.dayOfWeek,
      })),
    }));

    // Récupérer les utilisateurs associés aux événements
    const userIds = formattedEvents.map((event) => event.user);
    const presentUsers = await User.find({ _id: { $in: userIds } });

    res.json({
      events: formattedEvents,
      presentUsers: presentUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Récupérer tous les évènements
router.get("/allEvents", async (req, res) => {
  try {
    const allEvents = await Event.find().populate("user");
    const formattedUserEvents = allEvents.map((event) => ({
      _id: event._id,
      title: event.title,
      start: moment(event.start).format("DD/MM/YYYY"),
      end: moment(event.end).format("DD/MM/YYYY"),
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
