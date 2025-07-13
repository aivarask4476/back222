const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/forum";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Prisijungta prie MongoDB"))
  .catch((err) => console.error("❌ Klaida jungiantis prie MongoDB:", err));

// Maršrutai
app.use("/auth", require("./routes/auth"));
app.use("/questions", require("./routes/questions"));
app.use("/answers", require("./routes/answers"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Serveris veikia http://localhost:${PORT}`)
);
