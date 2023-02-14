const express = require('express')
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express()
const mysql = require('mysql');
const { default: axios } = require('axios');
require('dotenv').config()

console.log(process.env.HOST);
app.use(cors())
app.use(bodyParser.json())


const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE
});

db.getConnection(function (err) {
    if (err) throw err;
    console.log("Connected!");
});



app.get("/a", (req, res) => {

    db.query("SELECT country, COUNT(country) AS howMany FROM city GROUP BY country", (err, result) => {
        if (err) console.log(err);
        res.status(200).send(result)
        console.log(result);
    })
})

// db.end()

app.listen(8000, () => console.log("listen on port 8000")) //Server






