const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/User");
const moment = require("moment");

// Créer un Event
router.post("/create-event", async (req, res) => {
  try {
    const { start, end, userId, daysOfWeek, title } = req.body;

    const user = await User.findById(userId);

    const joursNonSelectionnes = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
    ].filter((day) => !daysOfWeek.includes(day));

    const joursSelectionnes =
      daysOfWeek.length > 0
        ? daysOfWeek
        : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

    const dateStart = new Date(start);
    const dateEnd = new Date(end);

    // Trouver le dernier jour
    while (!joursSelectionnes.includes(getDayOfWeek(dateEnd))) {
      dateEnd.setDate(dateEnd.getDate() + 1);
    }

    dateEnd.setDate(dateEnd.getDate() - 1);

    // S'assurer que le dernier jour est inclus
    if (!joursSelectionnes.includes(getDayOfWeek(dateEnd))) {
      dateEnd.setDate(dateEnd.getDate() + 1);
    }

    let currentDate = new Date(dateStart);
    const periodeSelectionnee = [];
    const periodeNonSelectionnee = [];

    while (currentDate <= dateEnd) {
      if (joursSelectionnes.includes(getDayOfWeek(currentDate))) {
        periodeSelectionnee.push({
          date: new Date(currentDate.getTime()),
          dayOfWeek: getDayOfWeek(currentDate),
        });
      }

      if (joursNonSelectionnes.includes(getDayOfWeek(currentDate))) {
        periodeNonSelectionnee.push({
          date: new Date(currentDate.getTime()),
          dayOfWeek: getDayOfWeek(currentDate),
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const invertedStatus = title === "Cours" ? "Entreprise" : "Cours";

    const invertedEvent = new Event({
      title: invertedStatus,
      start: new Date(start),
      end: new Date(end),
      user: userId,
      daysOfWeek: joursNonSelectionnes,
      periode: periodeNonSelectionnee,
      status: invertedStatus,
    });

    await invertedEvent.save();

    const periodeData = periodeSelectionnee.map((p) => ({
      date: p.date,
      dayOfWeek: p.dayOfWeek,
    }));

    const event = new Event({
      title: title,
      start: new Date(start),
      end: new Date(end),
      user: userId,
      daysOfWeek: joursSelectionnes,
      periode: periodeData,
      status: title,
    });

    const savedEvent = await event.save();

    res.status(201).json({
      user: userId,
      eventId: savedEvent._id,
      title: title,
      start: new Date(start),
      end: new Date(end),
      daysOfWeek: joursSelectionnes,
      periode: periodeData,
      status: title,
    });
    console.log(dateStart);
    console.log(dateEnd);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Obtenir le jour de la semaine sous forme de chaîne
function getDayOfWeek(date) {
  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  return daysOfWeek[date.getDay() - 1];
}

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

// Récupérer les utilisateurs présents pour un jour spécifique
router.get("/presentUsers/:date", async (req, res) => {
  try {
    const currentDate = new Date();
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    // Calculer la date de fin en ajoutant 24 heures à la date de début
    const selectedEndDate = new Date(
      selectedDate.getTime() + 24 * 60 * 60 * 1000
    );

    // Récupérer les événements pour le jour spécifique
    const events = await Event.find({
      "periode.date": { $gte: selectedDate, $lt: selectedEndDate },
    }).populate("user");

    if (events.length === 0) {
      return res.json({
        message: "Aucun utilisateur trouvé pour cette date.",
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
    const presentUsers = formattedEvents.map((event) => ({
      _id: event.user._id,
      firstName: event.user.firstName,
      lastName: event.user.lastName,
      email: event.user.email,
      // Ajoutez d'autres propriétés d'utilisateur si nécessaire
    }));

    res.json({
      presentUsers: presentUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Récupérer les utilisateurs en entreprise à la date du jour (home)
router.get("/presentEnterpriseUsers", async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(1, 0, 0, 0);
    // console.log("currentDate =>", currentDate);
    // Récupérer les événements en entreprise pour le jour spécifique
    const enterpriseEvents = await Event.find({
      "periode.date": currentDate,
      status: "Entreprise",
    }).populate("user");

    if (enterpriseEvents.length === 0) {
      return res.json({
        message: "Aucun utilisateur en entreprise trouvé pour cette date.",
      });
    }

    const formattedEvents = enterpriseEvents.map((event) => ({
      ...event.toObject(),
      periode: event.periode.map((day) => ({
        date: moment(day.date).format("DD/MM/YYYY"),
        dayOfWeek: day.dayOfWeek,
      })),
    }));

    // Récupérer les utilisateurs associés aux événements en entreprise
    const enterpriseUsers = formattedEvents.map((event) => ({
      _id: event.user._id,
      firstName: event.user.firstName,
      lastName: event.user.lastName,
      email: event.user.email,
    }));
    // console.log("enterpriseUsers =>", enterpriseUsers);
    res.json({
      enterpriseUsers: enterpriseUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Récupérer les utilisateurs présent à la date du jour (home)
router.get("/presentCoursUsers", async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(1, 0, 0, 0);
    const coursEvents = await Event.find({
      "periode.date": currentDate,
      status: "Cours",
    }).populate("user");

    if (coursEvents.length === 0) {
      return res.json({
        message: "Aucun utilisateur en cours trouvé pour cette date.",
      });
    }

    const formattedEvents = coursEvents.map((event) => ({
      ...event.toObject(),
      periode: event.periode.map((day) => ({
        date: moment(day.date).format("DD/MM/YYYY"),
        dayOfWeek: day.dayOfWeek,
      })),
    }));

    // Récupérer les utilisateurs associés aux événements en entreprise
    const coursUsers = formattedEvents.map((event) => ({
      _id: event.user._id,
      firstName: event.user.firstName,
      lastName: event.user.lastName,
      email: event.user.email,
    }));
    // console.log("coursUsers =>", coursUsers);
    res.json({
      coursUsers: coursUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Récupérer les Events pour fullCalendar
router.get("/calendarEvents", async (req, res) => {
  try {
    const events = await Event.find({}).populate("user");
    // Formater les données pour fullCalendar
    const userEvents = events.reduce((userEventMap, event) => {
      const { user, periode } = event;
      const userName = user.lastName;

      if (!userEventMap.has(userName)) {
        userEventMap.set(userName, []);
      }

      // Ajouter les dates spécifiques de la période pour cet événement
      const userDates = userEventMap.get(userName);
      periode.forEach((eventDate) => {
        userDates.push({
          title: event.title,
          date: eventDate.date,
        });
      });

      return userEventMap;
    }, new Map());

    // Convertir la carte en tableau
    const formattedUserEvents = Array.from(
      userEvents,
      ([userName, userDates]) => ({
        name: userName,
        dates: userDates,
      })
    );

    res.json(formattedUserEvents);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Récupérer tous les évènements
router.get("/allEvents", async (req, res) => {
  try {
    const allEvents = await Event.find().populate("user");
    const formattedUserEvents = allEvents.map((event) => ({
      user: {
        _id: event.user._id,
        firstName: event.user.firstName,
        lastName: event.user.lastName,
        email: event.user.email,
      },
      event_id: event._id,
      title: event.title,
      start: moment(event.start).format("DD/MM/YYYY"),
      end: moment(event.end).format("DD/MM/YYYY"),
      presentDays: event.daysOfWeek,
      periode: event.periode.map((day) => ({
        date: moment(day.date).format("DD/MM/YYYY"),
      })),
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

// Supprimer tous les Events de l'utilisateur
router.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Supprimer tous les événements associés à l'utilisateur
    await Event.deleteOne({ _id: userId });

    // Supprimer l'utilisateur
    await user.deleteOne();

    res.json("Utilisateur et ses événements supprimés avec succès.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});

module.exports = router;
