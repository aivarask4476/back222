const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Question", QuestionSchema);
