const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Usando o mysql2 com suporte a Promises
require("dotenv").config(); // Para trabalhar com variáveis de ambiente

const app = express();
const PORT = 3000;

// Configuração do CORS (permite frontend em localhost)
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); // Para lidar com JSON nas requisições

// Configuração do banco de dados MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // XAMPP usa senha vazia por padrão
  database: "fichas_db",
  port: 3306
});


// Rota para criar uma nova ficha
app.post("/fichas", async (req, res) => {
  try {
    const ficha = req.body;
    const [result] = await pool.query(
      `
            INSERT INTO fichas (nomePersonagem, classe, raca, alinhamento, aparencia, dadoDano, armadura, pontosVida, maxpontosVida, nivel, xp, moedas, carga, maxCarga, movimentos, vinculos, inventario, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ficha.nomePersonagem,
        ficha.classe,
        ficha.raca,
        ficha.alinhamento,
        ficha.aparencia,
        ficha.dadoDano,
        ficha.armadura,
        ficha.pontosVida,
        ficha.maxpontosVida,
        ficha.nivel,
        ficha.xp,
        ficha.moedas,
        ficha.carga,
        ficha.maxCarga,
        JSON.stringify(ficha.movimentos || []),
        JSON.stringify(ficha.vinculos || []),
        JSON.stringify(ficha.inventario || []),
        ficha.notas,
      ]
    );
    res
      .status(201)
      .json({ message: "Ficha criada com sucesso!", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar ficha" });
  }
});

// Rota para editar uma ficha
app.put("/fichas/:id", async (req, res) => {
  try {
    const fichaId = parseInt(req.params.id);
    const fichaData = req.body;

    const [result] = await pool.query(
      `
            UPDATE fichas
            SET nomePersonagem = ?, classe = ?, raca = ?, alinhamento = ?, aparencia = ?, dadoDano = ?, armadura = ?, pontosVida = ?, maxpontosVida = ?, nivel = ?, xp = ?, moedas = ?, carga = ?, maxCarga = ?, movimentos = ?, vinculos = ?, inventario = ?, notas = ?
            WHERE id = ?`,
      [
        fichaData.nomePersonagem,
        fichaData.classe,
        fichaData.raca,
        fichaData.alinhamento,
        fichaData.aparencia,
        fichaData.dadoDano,
        fichaData.armadura,
        fichaData.pontosVida,
        fichaData.maxpontosVida,
        fichaData.nivel,
        fichaData.xp,
        fichaData.moedas,
        fichaData.carga,
        fichaData.maxCarga,
        JSON.stringify(fichaData.movimentos || []),
        JSON.stringify(fichaData.vinculos || []),
        JSON.stringify(fichaData.inventario || []),
        fichaData.notas,
        fichaId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ficha não encontrada" });
    }

    res.json({ message: "Ficha atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar ficha" });
  }
});

// Rota para buscar todas as fichas
app.get("/fichas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM fichas");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar fichas" });
  }
});

// Rota para buscar uma ficha pelo ID
app.get("/fichas/:id", async (req, res) => {
  try {
    const fichaId = parseInt(req.params.id);
    const [rows] = await pool.query("SELECT * FROM fichas WHERE id = ?", [
      fichaId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ficha não encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar ficha" });
  }
});

// Rota para deletar uma ficha pelo ID
app.delete("/fichas/:id", async (req, res) => {
  try {
    const fichaId = parseInt(req.params.id);
    const [result] = await pool.query("DELETE FROM fichas WHERE id = ?", [
      fichaId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ficha não encontrada" });
    }

    res.json({ message: "Ficha deletada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar ficha" });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
