import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { env } from 'process';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const db = await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
});

app.get('/users', async (req, res) => {
    const [rows] = await db.execute('SELECT id, name FROM users');
    res.json(rows);
});

app.get('/users/:id', async (req, res) => {
    const [rows] = await db.execute('SELECT id, name, password FROM users WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
});

app.post('/users', async (req, res) => {
    const { username, password } = req.body;
    const [result] = await db.execute('INSERT INTO users (name, password) VALUES (?, ?)', [username, password]);
    res.json({ id: result.insertId, username, password });
});

app.delete('/users/:id', async (req, res) => {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE name = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
        res.json({ success: true, token: 'token' });
    } else {
        res.json({ success: false });
    }
});

app.put('/users/:id', async (req, res) => {
    const { name, password } = req.body;
    await db.execute('UPDATE users SET name = ?, password = ? WHERE id = ?', [name, password, req.params.id]);
    res.json({ message: 'User updated' });
});

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
