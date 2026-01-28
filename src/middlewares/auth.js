const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // ✅ DECLARA A VARIÁVEL
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({ error: "Token mal formatado" });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: "Token mal formatado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token inválido" });
      }

      // 🔥 ESSENCIAL
      req.userId = decoded.id;
      req.userRole = decoded.role;

      return next(); // ✅ SEM ISSO NADA FUNCIONA
    });
  } catch (err) {
    console.error("ERRO AUTH:", err);
    return res.status(500).json({ error: "Erro interno no auth" });
  }
};
