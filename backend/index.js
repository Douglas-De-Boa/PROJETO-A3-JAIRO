const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Configuração do banco MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "fichas_db",
  port: 3306,
});

// Função para garantir que JSON do MySQL vira array/objeto
function safeJSON(value) {
  try {
    return value ? JSON.parse(value) : [];
  } catch (e) {
    return [];
  }
}

// ------------------------------------------------------
// Criar ficha
// ------------------------------------------------------
app.post("/fichas", async (req, res) => {
  try {
    const f = req.body;

    const [result] = await pool.query(
      `
      INSERT INTO fichas
      (nomePersonagem, classe, raca, alinhamento, aparencia, dadoDano, armadura,
       pontosVida, maxpontosVida, nivel, xp, moedas, carga, maxCarga,
       movimentos, vinculos, inventario, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        f.nomePersonagem,
        f.classe,
        f.raca,
        f.alinhamento,
        f.aparencia,
        f.dadoDano,
        f.armadura,
        f.pontosVida,
        f.maxpontosVida,
        f.nivel,
        f.xp,
        f.moedas,
        f.carga,
        f.maxCarga,
        JSON.stringify(f.movimentos || []),
        JSON.stringify(f.vinculos || []),
        JSON.stringify(f.inventario || []),
        f.notas,
      ]
    );

    res.json({ message: "Ficha criada!", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar ficha" });
  }
});

// ------------------------------------------------------
// Editar ficha
// ------------------------------------------------------
app.put("/fichas/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const f = req.body;

    const [result] = await pool.query(
      `
      UPDATE fichas SET
      nomePersonagem=?, classe=?, raca=?, alinhamento=?, aparencia=?, dadoDano=?,
      armadura=?, pontosVida=?, maxpontosVida=?, nivel=?, xp=?, moedas=?,
      carga=?, maxCarga=?, movimentos=?, vinculos=?, inventario=?, notas=?
      WHERE id=?
      `,
      [
        f.nomePersonagem,
        f.classe,
        f.raca,
        f.alinhamento,
        f.aparencia,
        f.dadoDano,
        f.armadura,
        f.pontosVida,
        f.maxpontosVida,
        f.nivel,
        f.xp,
        f.moedas,
        f.carga,
        f.maxCarga,
        JSON.stringify(f.movimentos || []),
        JSON.stringify(f.vinculos || []),
        JSON.stringify(f.inventario || []),
        f.notas,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Ficha não encontrada" });

    res.json({ message: "Ficha atualizada!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar ficha" });
  }
});

// ------------------------------------------------------
// Buscar TODAS as fichas (corrigido)
// ------------------------------------------------------
app.get("/fichas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM fichas");

    const fichasCorrigidas = rows.map((f) => ({
      ...f,
      movimentos: safeJSON(f.movimentos),
      vinculos: safeJSON(f.vinculos),
      inventario: safeJSON(f.inventario),
    }));

    res.json(fichasCorrigidas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar fichas" });
  }
});

// ------------------------------------------------------
// Buscar ficha por ID (corrigido)
// ------------------------------------------------------
app.get("/fichas/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query("SELECT * FROM fichas WHERE id = ?", [id]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Ficha não encontrada" });

    const ficha = rows[0];

    ficha.movimentos = safeJSON(ficha.movimentos);
    ficha.vinculos = safeJSON(ficha.vinculos);
    ficha.inventario = safeJSON(ficha.inventario);

    res.json(ficha);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar ficha" });
  }
});

// ------------------------------------------------------
// Deletar ficha
// ------------------------------------------------------
app.delete("/fichas/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await pool.query("DELETE FROM fichas WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Ficha não encontrada" });

    res.json({ message: "Ficha deletada!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar ficha" });
  }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
