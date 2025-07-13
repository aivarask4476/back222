const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "labai_slaptas_raktas";

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Neautorizuota: nėra token" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Neautorizuota: nėra token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Neautorizuota: neteisingas token" });
  }
}

module.exports = auth;
