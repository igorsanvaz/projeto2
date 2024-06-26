const express = require('express');
const bodyParser = require('body-parser');
const calculateRouter = require('./api/calculate');
const resultsRouter = require('./api/results');
const usersRouter = require('./api/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use('/api/calculate', calculateRouter);
app.use('/api/results', resultsRouter);
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
