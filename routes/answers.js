// server/routes/answers.js

const express = require("express");
const Answer = require("../models/Answer");
const auth = require("../middleware/auth");

const router = express.Router();

// Gauti atsakymus pagal klausimą
// GET /answers/:questionId/answers
router.get("/:questionId/answers", async (req, res) => {
  try {
    const answers = await Answer.find({
      question_id: req.params.questionId,
    })
      .sort({ date: -1 })
      .lean();
    res.json(answers);
  } catch (err) {
    console.error("Klaida gaunant atsakymus:", err);
    res.status(500).json({ message: "Klaida gaunant atsakymus" });
  }
});

// Pridėti atsakymą (tik prisijungus)
// POST /answers/:questionId/answer
router.post("/:questionId/answer", auth, async (req, res) => {
  const { text } = req.body;
  if (!text)
    return res.status(400).json({ message: "Atsakymo tekstas privalomas" });
  try {
    const answer = await Answer.create({
      text,
      question_id: req.params.questionId,
      user_id: req.userId,
      date: new Date(),
    });
    res.json(answer);
  } catch (err) {
    console.error("Klaida pridedant atsakymą:", err);
    res.status(500).json({ message: "Klaida pridedant atsakymą" });
  }
});

// Padidinti like (tik prisijungus)
// PATCH /answers/:id/like
router.patch("/:id/like", auth, async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!answer) return res.status(404).json({ message: "Atsakymas nerastas" });
    res.json(answer);
  } catch (err) {
    console.error("Klaida žymint patinka:", err);
    res.status(500).json({ message: "Klaida žymint patinka" });
  }
});

// Padidinti dislike (tik prisijungus)
// PATCH /answers/:id/dislike
router.patch("/:id/dislike", auth, async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: 1 } },
      { new: true }
    );
    if (!answer) return res.status(404).json({ message: "Atsakymas nerastas" });
    res.json(answer);
  } catch (err) {
    console.error("Klaida žymint nepatinka:", err);
    res.status(500).json({ message: "Klaida žymint nepatinka" });
  }
});

// Ištrinti atsakymą (tik savininkas)
// DELETE /answers/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: "Atsakymas nerastas" });
    if (answer.user_id.toString() !== req.userId)
      return res
        .status(403)
        .json({ message: "Neturi teisės ištrinti šio atsakymo" });
    await Answer.findByIdAndDelete(req.params.id);
    res.json({ message: "Atsakymas ištrintas" });
  } catch (err) {
    console.error("Klaida trinant atsakymą:", err);
    res.status(500).json({ message: "Klaida trinant atsakymą" });
  }
});

module.exports = router;
