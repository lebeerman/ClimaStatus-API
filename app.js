require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://lebeerman:" + process.env.MONGO_PWD + "@cluster0.mongodb.net/test";

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

let data = {};

app.get("/", (req, res) => {
  console.log(uri)
  MongoClient.connect(uri, (err, client) => {
    console.log(client);
    // const collection = client.collection('test'); // db('test).
    // let example = collection.find({});
    // console.log(example);
    // res.send(example);
    // // perform actions on the collection object
    // client.close();
  });
});

app.get('/', (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) throw err;

    db
      .collection('quilt')
      .find({}, { _id: false, color: true })
      .toArray((err, result) => {
        if (err) throw err;
        res.json(result);
        db.close();
      });
  });
});




app.post("/", (req, res) => {
  data = req.body;
  res.sendStatus(200);

  MongoClient.connect(uri, function(err, client) {
      const collection = client.db("test").collection("devices");
      // perform actions on the collection object
      client.close();
  });
});



app.listen(port, () => console.log(`Listening on port ${port}`));
