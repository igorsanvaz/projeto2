const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const config = require('./config');

const app = express();
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

app.get('/', (req, res) => {
  console.log('Response ok.');
  res.send('Ok - Servidor disponível.');
});


// Rotas
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const result = await client.query(
      'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM posts');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(400).json({ error: error.message });
  }
});
app.get("/users", (req, res) => {
  try {
    client.query("SELECT * FROM users", function
      (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.send(result.rows);
      console.log("Rota: get usuarios");
    });
  } catch (error) {
    console.log(error);
  }
});
// Iniciar o servidor
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(client);
});

module.exports = app;
