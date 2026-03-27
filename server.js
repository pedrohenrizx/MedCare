const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = 3000;
const SECRET = 'medcare_secret_key_123';

app.use(cors());
app.use(express.json());

// Servir o front-end (index.html na raiz do projeto)
app.use(express.static(path.join(__dirname, '../')));

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const info = stmt.run(name, email, hashedPassword);
    
    const token = jwt.sign({ id: info.lastInsertRowid }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: info.lastInsertRowid, name, email } });
  } catch (err) {
    res.status(400).json({ error: 'E-mail já cadastrado' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// --- ROTAS DE MEDICAMENTOS ---

app.get('/api/medications', authMiddleware, (req, res) => {
  const meds = db.prepare('SELECT * FROM medications WHERE user_id = ?').all(req.userId);
  res.json(meds);
});

app.post('/api/medications', authMiddleware, (req, res) => {
  const { name, dosage, time, frequency, color, prescriptionExpires } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO medications (user_id, name, dosage, time, frequency, color, prescriptionExpires)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(req.userId, name, dosage, time, frequency, color || 'bg-blue-500', prescriptionExpires);
  const newMed = db.prepare('SELECT * FROM medications WHERE id = ?').get(info.lastInsertRowid);
  
  res.status(201).json(newMed);
});

app.delete('/api/medications/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM medications WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  
  if (result.changes === 0) return res.status(404).json({ error: 'Medicamento não encontrado' });
  res.status(204).send();
});

// --- ROTA DE HISTÓRICO / TOMAR DOSE ---

app.post('/api/medications/:id/take', authMiddleware, (req, res) => {
  const med = db.prepare('SELECT * FROM medications WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  
  if (!med) return res.status(404).json({ error: 'Medicamento não encontrado' });

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const stmt = db.prepare('INSERT INTO history (user_id, med_name, date, time, status) VALUES (?, ?, ?, ?, ?)');
  stmt.run(req.userId, med.name, dateStr, timeStr, 'Tomado');

  res.json({ message: 'Dose registrada', date: dateStr, time: timeStr });
});

app.get('/api/history', authMiddleware, (req, res) => {
  const history = db.prepare('SELECT * FROM history WHERE user_id = ? ORDER BY id DESC LIMIT 50').all(req.userId);
  res.json(history);
});

// Rota para o Front-end SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
