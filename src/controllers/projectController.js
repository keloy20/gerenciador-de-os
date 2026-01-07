const Project = require("../models/Project");

exports.getMyProjects = async (req, res) => {
  try {
    const atual = await Project.findOne({
      tecnico: req.userId,
      status: "em_andamento"
    });

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);

    const hoje = await Project.find({
      tecnico: req.userId,
      dataServico: { $gte: inicioHoje, $lte: fimHoje }
    }).sort({ createdAt: -1 });

    res.json({ atual, hoje });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar projetos" });
  }
};
