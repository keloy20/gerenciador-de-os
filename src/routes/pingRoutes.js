const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({
    ok: true,
    message: "API viva",
    time: new Date().toISOString(),
  });
});

module.exports = router;
