const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'scoter',
    password: '12345',
    port: 5432,
});

// Bağlantıyı başlat
(async () => {
    try {
        await client.connect();
        console.log('Veritabanına başarıyla bağlandım!');
    } catch (err) {
        console.error('Bağlantı hatası:', err.stack);
    }
})();

const JWT_SECRET = 'ScooterAppV1';

// JWT doğrulama middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Giriş yapma
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await client.query('SELECT id, username, role FROM "user" WHERE username = $1 AND password = $2', [username, password]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id,  role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ user, token });
        } else {
            res.status(401).send('Geçersiz kullanıcı adı veya şifre');
        }
    } catch (err) {
        console.error('Giriş hatası:', err.stack);
        res.status(500).send('Bir hata oluştu.');
    }
});

// Kayıt olma
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Kullanıcı adı kontrolü
        const existingUser = await client.query('SELECT * FROM "user" WHERE username = $1', [username]);
        
        if (existingUser.rows.length > 0) {
            return res.status(400).send('Bu kullanıcı adı zaten mevcut.');
        }

        // Yeni kullanıcıyı ekle
        const insertResult = await client.query('INSERT INTO "user" (username, password, role) VALUES ($1, $2, $3) RETURNING *', [username, password, role]);
        const newUser = insertResult.rows[0];

        res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
    } catch (err) {
        console.error('Kayıt hatası:', err.stack);
        res.status(500).send('Bir hata oluştu.');
    }
});

// Scooterları listeleme
app.get('/scooters', authenticateToken, async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM "scooter";');
        res.json(result.rows);
    } catch (err) {
        console.error('Sorgu hatası:', err.stack);
        res.status(500).send('Bir hata oluştu.');
    }
});

// Scooter ekleme
app.post('/scooters', authenticateToken, async (req, res) => {
    const { unique_name, battery_status, latitude, longitude } = req.body;
    try {
        const insertResult = await client.query('INSERT INTO "scooter" (unique_name, battery_status, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *', [unique_name, battery_status, latitude, longitude]);
        res.status(201).json(insertResult.rows[0]);
    } catch (err) {
        console.error('Ekleme hatası:', err.stack);
        res.status(500).send('Bir hata oluştu.');
    }
});

// Scooter silme
app.delete('/scooters/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await client.query('DELETE FROM "scooter" WHERE id = $1', [id]);
        res.status(200).send('Scooter başarıyla silindi.');
    } catch (err) {
        console.error('Silme hatası:', err.stack);
        res.status(500).send('Bir hata oluştu.');
    }
});

// Scooter güncelleme
app.put('/scooters/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { unique_name, battery_status, latitude, longitude } = req.body;
    try {
        await client.query('UPDATE "scooter" SET unique_name = $1, battery_status = $2, latitude = $3, longitude = $4 WHERE id = $5', [unique_name, battery_status, latitude, longitude, id]);
        res.status(200).send('Scooter başarıyla güncellendi.');
    } catch (err) {
        console.error('Güncelleme hatası:', err.stack);
        res.status(500).send('Bir hata oluştu.');
    }
});

// Sürüş bitirme
app.post('/end-ride', async (req, res) => {
    const { scooterId, remainingBattery } = req.body;

    try {
        await client.query('UPDATE "scooter" SET battery_status = $1 WHERE id = $2', [remainingBattery, scooterId]);
        res.status(200).send('Sürüş başarıyla bitirildi ve batarya durumu güncellendi.');
    } catch (err) {
        console.error('Güncelleme hatası:', err.stack);
        res.status(500).send('Bir hata oluştu.');
    }
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
