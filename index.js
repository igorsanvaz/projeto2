const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");
const calculateRouter = require('./api/calculate');
const resultsRouter = require('./api/results');
const usersRouter = require('./api/users');
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;

const PORT = process.env.PORT || 5000;

app.use('/api/calculate', calculateRouter);
app.use('/api/results', resultsRouter);
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});