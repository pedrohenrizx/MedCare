import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const SECRET_KEY = 'medvibe_super_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Inicializar Banco
initDb();

// --- Middlewares de Auth ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Acesso negado' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
};

// --- Rotas de Autenticação ---

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
        const info = stmt.run(name, email, hashedPassword);
        res.status(201).json({ id: info.lastInsertRowid, message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(400).json({ message: 'Email já cadastrado ou dados inválidos' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// --- Rotas de Medicamentos ---

app.get('/api/medications', authenticateToken, (req, res) => {
    const meds = db.prepare('SELECT * FROM medications WHERE user_id = ?').all(req.user.id);
    res.json(meds);
});

app.post('/api/medications', authenticateToken, (req, res) => {
    const { name, dosage, frequency, color, notes } = req.body;
    const stmt = db.prepare('INSERT INTO medications (user_id, name, dosage, frequency, color, notes) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(req.user.id, name, dosage, frequency, color, notes);
    res.json({ id: info.lastInsertRowid, name, dosage, frequency, color, notes });
});

app.delete('/api/medications/:id', authenticateToken, (req, res) => {
    const stmt = db.prepare('DELETE FROM medications WHERE id = ? AND user_id = ?');
    stmt.run(req.params.id, req.user.id);
    res.json({ ok: true });
});

// --- Relatórios ---

app.get('/api/reports/export', authenticateToken, (req, res) => {
    const meds = db.prepare('SELECT name, dosage, frequency, notes FROM medications WHERE user_id = ?').all(req.user.id);
    res.json(meds);
});

// Inicialização
app.listen(PORT, () => {
    console.log(`🚀 MedVibe rodando em http://localhost:${PORT}`);
});
