const express = require("express");
const Question = require("../models/Question");
const auth = require("../middleware/auth");

const router = express.Router();

// Gauti visus arba filtruotus klausimus su atsakymų skaičiumi
// ?answered=true  → tik klausimai, kurie turi bent vieną atsakymą
// ?answered=false → tik klausimai be atsakymų
router.get("/", async (req, res) => {
  try {
    const { answered } = req.query;

    // Aggregacijos pipeline
    const pipeline = [
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "question_id",
          as: "answers",
        },
      },
      {
        $addFields: {
          answersCount: { $size: "$answers" },
        },
      },
      // Jeigu filtruojame pagal atsakytus/neatsakytus
      ...(answered === undefined
        ? []
        : [
            {
              $match:
                answered === "true"
                  ? { answersCount: { $gt: 0 } }
                  : { answersCount: { $eq: 0 } },
            },
          ]),
      { $sort: { date: -1 } },
      {
        $project: {
          answers: 0, // nebesiuntame masyvo
        },
      },
    ];

    const questions = await Question.aggregate(pipeline);
    res.json(questions);
  } catch (err) {
    console.error("Klaida gaunant klausimus su atsakymų skaičiumi:", err);
    res.status(500).json({ message: "Klaida gaunant klausimus" });
  }
});

// Gauti vieną klausimą pagal id
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Klausimas nerastas" });
    res.json(question);
  } catch (err) {
    console.error("Klaida gaunant klausimą:", err);
    res.status(500).json({ message: "Klaida gaunant klausimą" });
  }
});

// Pridėti naują klausimą (tik prisijungus)
router.post("/", auth, async (req, res) => {
  const { question_text } = req.body;
  if (!question_text)
    return res.status(400).json({ message: "Klausimo tekstas privalomas" });

  try {
    const question = await Question.create({
      question_text,
      user_id: req.userId,
      date: new Date(),
    });
    res.json(question);
  } catch (err) {
    console.error("Klaida pridedant klausimą:", err);
    res.status(500).json({ message: "Klaida pridedant klausimą" });
  }
});

// Ištrinti klausimą (tik savininkas)
router.delete("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Klausimas nerastas" });

    if (question.user_id.toString() !== req.userId)
      return res
        .status(403)
        .json({ message: "Neturi teisės ištrinti šio klausimo" });

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Klausimas ištrintas" });
  } catch (err) {
    console.error("Klaida trinant klausimą:", err);
    res.status(500).json({ message: "Klaida trinant klausimą" });
  }
});

module.exports = router;
