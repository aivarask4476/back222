const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Answer", AnswerSchema);
