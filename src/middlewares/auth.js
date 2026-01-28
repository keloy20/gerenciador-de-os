const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token não enviado" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({ error: "Token malformado" });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: "Token malformado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 ESSENCIAL (SEU ROUTES DEPENDE DISSO)
    req.userId = decoded.id;
    req.userRole = decoded.role;

    return next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};
