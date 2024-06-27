const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const calculateRouter = require('./api/calculate');
const resultsRouter = require('./api/results');
const usersRouter = require('./api/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.use('/api/calculate', calculateRouter);
app.use('/api/results', resultsRouter);
app.use('/api/users', usersRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
