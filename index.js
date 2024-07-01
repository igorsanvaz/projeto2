const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./config');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const conString = config.urlConnection;
const client = new Client(conString);

client.connect((err) => {
  if (err) {
    return console.error('Não foi possível conectar ao banco.', err);
  }
  client.query('SELECT NOW()', (err, result) => {
    if (err) {
      return console.error('Erro ao executar a query.', err);
    }
    console.log(result.rows[0]);
  });
});

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  console.log('Response ok.');
  res.send('Ok - Servidor disponível.');
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [username, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/calculate', authenticateToken, async (req, res) => {
  try {
    const { shape, dimensions } = req.body;
    let area = 0;

    switch (shape) {
      case 'circle':
        area = Math.PI * Math.pow(dimensions.radius, 2);
        break;
      case 'rectangle':
        area = dimensions.length * dimensions.width;
        break;
      case 'triangle':
        area = 0.5 * dimensions.length * dimensions.height;
        break;
      case 'square':
        area = Math.pow(dimensions.side, 2);
        break;
      default:
        return res.status(400).json({ error: 'Invalid shape' });
    }

    const result = await client.query(
      'INSERT INTO results (user_id, shape, dimensions, area, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [req.user.id, shape, dimensions, area]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error calculating area:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/results/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await client.query('SELECT * FROM results WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
