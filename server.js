const express = require('express')
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express()
const mysql = require('mysql');
const multer = require('multer')
const csvtojson = require('csvtojson')
const xlsx = require('xlsx')
const readXlsxFile = require('read-excel-file/node');
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});
const upload = multer({ storage: storage });
// const upload = multer();


function importExcelData2MySQL(filePath) {

    // File path.
    readXlsxFile(filePath).then((rows) => {

        // `rows` is an array of rows
        // each row being an array of cells.     
        console.log(rows);
        /**
        [ [ 'Id', 'Name', 'Address', 'Age' ],
        [ 1, 'john Smith', 'London', 25 ],
        [ 2, 'Ahman Johnson', 'New York', 26 ]
        */
        // Remove Header ROW
        return rows
        // res.status(200).json({ rows })
        // rows.shift();

        // Open the MySQL connection

        // let query = 'INSERT INTO customer (id, address, name, age) VALUES ?';
        // db.query(query, [rows], (error, response) => {
        //     console.log(error || response);
        /**
            OkPacket {
                fieldCount: 0,
                affectedRows: 5,
                insertId: 0,
                serverStatus: 2,
                warningCount: 0,
                message: '&Records: 5  Duplicates: 0  Warnings: 0',
                protocol41: true,
                changedRows: 0 
            } 
        */
        // });

    })
}

function checkType() {

}

app.post('/uploadfile', upload.single("uploadfile"), async (req, res) => {

    let xlFile = xlsx.readFile("public/" + req.file.filename)

    let sheet = xlFile.Sheets[xlFile.SheetNames[0]]

    let P_JSON = xlsx.utils.sheet_to_json(sheet)
    console.log(P_JSON);
    // await empSchema.insertMany(P_JSON).then(result=>{
    //     if (result.length>0) {
    //         res.status(200).send({msg:"succss",Count:result.length})
    //     } else {
    //         res.send({msg:"no data"})
    //     }
    // })

    // console.log(req.file);
    // const data = await importExcelData2MySQL("public/" + req.file.filename);
    // console.log(data);
    // var arrayToInsert = [];
    // csvtojson().fromFile("public/" + req.file.filename).then(source => {
    //     // Fetching the all data from each row
    //     console.log(source);
    //     for (var i = 0; i < source.length; i++) {
    //         console.log(source[i]["name"])
    //         var singleRow = {
    //             name: source[i]["name"],
    //             email: source[i]["email"],
    //             standard: source[i]["standard"],
    //         };
    //         arrayToInsert.push(singleRow);
    //     }
    //     //inserting into the table student
    //     Student.insertMany(arrayToInsert, (err, result) => {
    //         if (err) console.log(err);
    //         if (result) {
    //             console.log("File imported successfully.");
    //             res.redirect('/')
    //         }
    //     });
    // });


    // readXlsxFile("public/" + req.file.filename).then((rows) => {
    //     const datatype = [];
    //     const column = [];
    //     for (let i = 1; i < data.length; i++) {
    //         const element = data[i];
    //     }
    //     for (let i = 0; i < rows[1].length; i++) {
    //         if (typeof (rows[1][i]) == String) {
    //             datatype.push(rows[0][i].replace(/[ /]/g, "_") + " VARCHAR(255)")
    //             column.push(rows[0][i].replace(/[ /]/g, "_"))
    //         } else if (typeof (rows[1][i]) == Number) {
    //             datatype.push(rows[0][i].replace(/[ /]/g, "_") + " INT")
    //             column.push(rows[0][i].replace(/[ /]/g, "_"))
    //         } else if (typeof (rows[1][i]) instanceof Date) {
    //             datatype.push(rows[0][i].replace(/[ /]/g, "_") + " DATE")
    //             column.push(rows[0][i].replace(/[ /]/g, "_"))
    //         } else {
    //             datatype.push(rows[0][i].replace(/[ /]/g, "_") + " VARCHAR(255)")
    //             column.push(rows[0][i].replace(/[ /]/g, "_"))
    //         }
    //     }
    //     const create = `create table test11(Id int  auto_increment primary key, ${datatype}) ENGINE=InnoDB DEFAULT CHARSET=hebrew`
    //     const insert = `insert into test11 (${column}) values(?)`
    //     db.query(create, (err, result) => {
    //         if (err) console.log(err);
    //         db.query(insert, [rows[1]], (err, rs) => {
    //             if (err) console.log(err);
    //             db.query("select * from test11", (r, s) => {
    //                 res.status(200).send(s)
    //                 console.log(rs);
    //             })
    //         })
    //     })
    // })
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






