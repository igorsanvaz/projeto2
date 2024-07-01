const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to query the database
const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Route to register a new user
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query('INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING *', [username, hashedPassword]);
    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to login a user
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
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

// Route to calculate area and store the result
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

    const result = await query('INSERT INTO results (user_id, shape, dimensions, area, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *', [req.user.id, shape, dimensions, area]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error calculating area:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get results by user ID
app.get('/api/results/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await query('SELECT * FROM results WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback route for undefined routes
app.get('*', (req, res) => {
  res.status(404).send('Route not found');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
