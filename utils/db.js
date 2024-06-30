const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());
var conString = config.urlConnection;
const client = new Client(conString)

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

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok - Servidor disponível.");
});