const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    // Esperado: "Bearer TOKEN"
    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({ error: "Token mal formatado" });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token inválido" });
      }

      // 🔥 ESSENCIAL
      req.userId = decoded.id;
      req.userRole = decoded.role;

      next();
    });
  } catch (err) {
    console.error("ERRO AUTH:", err);
    return res.status(500).json({ error: "Erro interno no auth" });
  }
};
