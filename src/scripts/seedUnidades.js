require("dotenv").config();
const mongoose = require("mongoose");
const Cliente = require("../models/Cliente");
const Unidade = require("../models/Unidade");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo conectado (seedUnidades)"))
  .catch(err => {
    console.error("Erro Mongo:", err);
    process.exit(1);
  });

async function seed() {
  try {
    const cliente = await Cliente.findOne({ nome: "DASA" });

    if (!cliente) {
      console.error("❌ Cliente DASA não encontrado. Rode o seedClientes primeiro.");
      process.exit(1);
    }

    await Unidade.deleteMany({ cliente: cliente._id });

    const lista = [
      { nome: "PRAIME", marca: "CERPE" },
      { nome: "João de Barros", marca: "CERPE" },
      { nome: "Canela", marca: "NTO - Bahia" },
      { nome: "ALDEOTA", marca: "LabPasteur" },
      { nome: "VILA DO ATLANTICO", marca: "IMAGE" },
      { nome: "CERPE GRAÇAS - HOSPITAL", marca: "CERPE" },
      { nome: "JAIME DA FONTE", marca: "CERPE" },
      { nome: "NTO-NORDESTE", marca: "CERPE" },
      { nome: "BOA VIAGEM I", marca: "CERPE" },
      { nome: "BOA VIAGEM II", marca: "CERPE" },
      { nome: "IBURA", marca: "CERPE" },
      { nome: "ABDIAS", marca: "CERPE" },
      { nome: "Abreu Lima", marca: "CERPE" },
      { nome: "DERBY 2", marca: "CERPE" },
      { nome: "IPSEP", marca: "CERPE" },
      { nome: "PIEDADE II", marca: "CERPE" },
      { nome: "GOIANA", marca: "CERPE" },
      { nome: "CASA CAIADA", marca: "CERPE" },
      { nome: "IPOJUCA", marca: "CERPE" },
      { nome: "PALMARES", marca: "CERPE" },
      { nome: "RIBEIRÃO", marca: "CERPE" },
      { nome: "SURUBIM", marca: "CERPE" },
      { nome: "OLINDA", marca: "CERPE" },
      { nome: "PAULISTA 2", marca: "CERPE" },
      { nome: "IBURA", marca: "GILSON CIDRIN" },
      { nome: "SETUBAL", marca: "CERPE" },
      { nome: "GRAVATA", marca: "CERPE" },
      { nome: "BOA VIAGEM", marca: "BORIS BERNSTEIN" },
      { nome: "PIEDADE", marca: "BORIS BERNSTEIN" },
      { nome: "MESSJANA", marca: "LabPasteur" },
      { nome: "BEZERRA DE MENEZES", marca: "LabPasteur" },
      { nome: "PARANGABA", marca: "LabPasteur" },
      { nome: "FATIMA", marca: "LabPasteur" },
      { nome: "OLIVEIRA PAIVA", marca: "LabPasteur" },
      { nome: "RENASCENÇA", marca: "GASPAR" },
      { nome: "ANJO DA GUARDA", marca: "GASPAR" },
      { nome: "CALHAU", marca: "GASPAR" },
      { nome: "KIDS - HOLANDESES", marca: "GASPAR" },
      { nome: "ITAJARA", marca: "IMAGE MEMORIAL" },
      { nome: "Campo Grande", marca: "IMAGE MEMORIAL" },
      { nome: "LE-SÃO MARCOS", marca: "LEME" },
      { nome: "CANELA", marca: "LEME" },
      { nome: "GARIBALDI", marca: "LEME" },
      { nome: "PATAMARES", marca: "LEME" },
      { nome: "CABULA", marca: "LEME" },
      { nome: "IMBUI", marca: "LEME" },
      { nome: "NTO-ADM", marca: "LEME" },
      { nome: "ITAIGARA", marca: "LEME" },
      { nome: "VILA DO ATLANTICO", marca: "LEME" },
      { nome: "MEMORIAL", marca: "IMAGE" },
      { nome: "DERBY", marca: "CERPE" },
      { nome: "CAXANGA", marca: "CERPE" },
      { nome: "MADALENA - PRIME", marca: "CERPE - PRIME" },
      { nome: "OLINDA", marca: "BORIS BERNSTEIN" },
      { nome: "Paulista", marca: "BORIS BERNSTEIN" },
      { nome: "BEBERIBE", marca: "CERPE" },
      { nome: "Graças", marca: "CERPE" },
      { nome: "GRAVATÁ", marca: "CERPE" },
      { nome: "Igarassu", marca: "CERPE" },
      { nome: "CE NTH RECIFE", marca: "CERPE" },
      { nome: "Jaboatão", marca: "CERPE" },
      { nome: "Janga", marca: "CERPE" },
      { nome: "NTH - ADM", marca: "CERPE" },
      { nome: "PRAZERES", marca: "CERPE" },
      { nome: "Setubal II", marca: "CERPE" },
      { nome: "IMBIRIBEIRA", marca: "NTO - Recife" },
      { nome: "Jardim São Paulo", marca: "CERPE" },
      { nome: "HOLANDESES", marca: "GASPAR" },
      { nome: "JP Gaspar", marca: "GASPAR" },
      { nome: "LEME", marca: "IMAGE" },
      { nome: "ARMAZEM", marca: "LABPASTEUR" },
      { nome: "FATIMA", marca: "LabPasteur" },
      { nome: "Itapoã", marca: "LEME" },
      { nome: "Campo Grande", marca: "LEME" },
      { nome: "SÃO MARCOS", marca: "LEME" },
      { nome: "ONDINA", marca: "NTO - Recife" },
      { nome: "STELLA MARIS", marca: "LEME" },
      { nome: "CABO DE SANTO AGOSTINHO", marca: "BORIS BERNSTEIN" },
      { nome: "DERBY", marca: "BORIS BERNSTEIN" },
      { nome: "IMBIRIBEIRA", marca: "CERPE" },
      { nome: "NTO", marca: "CERPE" },
      { nome: "JAQUEIRA", marca: "CERPE" },
      { nome: "MADALENA - PRIME", marca: "CERPE" },
      { nome: "CAXANGA", marca: "CERPE" },
      { nome: "JARDIM SAO PAULO", marca: "CERPE" },
      { nome: "GRAVATA 2", marca: "CERPE" },
      { nome: "IGARASSU II", marca: "CERPE" },
      { nome: "CARPINA", marca: "CERPE" },
      { nome: "BORIS BERNSTEIN 2", marca: "CERPE" },
      { nome: "MEMORIAL ONDINA", marca: "IMAGE" },
      { nome: "GARIBALDI", marca: "LEME" },
      { nome: "CAMINHO DE AREIA", marca: "LEME" },
      { nome: "SAO MARCOS", marca: "LEME" },
      { nome: "COSTA AZUL", marca: "LEME" },
      { nome: "ALDEOTA", marca: "LABPASTEUR" },
      { nome: "CAMINHO DAS ARVORES", marca: "LEME" },
      { nome: "ONDINA", marca: "LEME" },
      { nome: "JARDINS", marca: "GASPAR" },
      { nome: "BOA VIAGEM - PRIME", marca: "CERPE" }
    ];

    const formatado = lista.map(u => ({
      nome: u.nome,
      marca: u.marca,
      cliente: cliente._id
    }));

    await Unidade.insertMany(formatado);

    console.log("✅ Unidades DASA cadastradas com sucesso!");
    process.exit();

  } catch (err) {
    console.error("Erro no seedUnidades:", err);
    process.exit(1);
  }
}

seed();
