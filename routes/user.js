const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Créer un utilisateur
router.post("/createUser", async (req, res) => {
  try {
    const { lastName, firstName, email } = req.body;
    if (lastName && firstName && email) {
      const user = await User.findOne({ email });
      if (user) {
        res.status(409).json({ message: "Email déjà enregistré" });
      } else {
        const newUser = new User({
          lastName: lastName,
          firstName: firstName,
          email: email,
        });

        await newUser.save();
        res.status(201).json({
          _id: newUser._id,
          lastName: newUser.lastName,
          firstName: newUser.firstName,
          email: newUser.email,
        });
      }
    } else {
      res.status(400).json({ message: "Informations requises" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      if (SHA256(password + user.salt).toString(encBase64) === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          authToken: user.authTokens.authToken,
        });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// logout
router.post("/logout", async (req, res) => {
  try {
    const user = req.user;

    await user.save();

    res.json({ message: "Vous êtes déconnecté" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Rechercher un utilisateur
router.get("/user/:lastName", async (req, res) => {
  try {
    const lastName = req.params.lastName;
    const user = await User.findOne({ lastName });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({
      _id: user._id,
      lastName: user.lastName,
      firstName: user.firstName,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Récupérer tous les utilisateurs
router.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer un utilisateur par son ID
router.get("/userDetails/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({
      _id: user._id,
      lastName: user.lastName,
      firstName: user.firstName,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

// Modifier un utilisateur
router.post("/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updateUser = await User.updateOne({ _id: id }, req.body);
    res.json(updateUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un utilisateur
router.delete("/deleteUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteUser = await User.deleteOne({ _id: id });
    res.json(deleteUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
