// routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Įsitikinkite, kad bylą pervardinote į User.js
// const auth = require("../middleware/auth"); // nebenaudojame čia

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "labai_slaptas_raktas";

// Registracija
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El. paštas jau užimtas" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Registracijos klaida:", err);
    res.status(500).json({ message: "Klaida registruojantis" });
  }
});

// Prisijungimas
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Neteisingas el. paštas arba slaptažodis" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Neteisingas el. paštas arba slaptažodis" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Prisijungimo klaida:", err);
    res.status(500).json({ message: "Klaida prisijungiant" });
  }
});

module.exports = router;
