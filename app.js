require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
var MongoClient = require('mongodb').MongoClient;
var uri = `mongodb+srv://lebeerman:${process.env.MONGO_PWD}@cluster0-ojwct.mongodb.net/test`;

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

let data = {};

app.get("/", (req, res) => {
  console.log('DATA', data);
  MongoClient.connect(uri, (err, client) => {
    console.log('CLIENT', client);
    if (err) console.log(err);
    // Doing stuff
    const collection = client.db('test').collection('test');
  	// Show that duplicate records got dropped
    collection.find({}).toArray((err, items) => {
	if (err) console.log('FIND', err);
        res.send(items[items.length - 1]);
	console.log('SENTIT',items);
	client.close();
    });
    client.close();
  });
});

app.post("/", (req, res) => {
  data = req.body;

  MongoClient.connect(uri, (err, client) => {
    console.log('ADDING', data);
    if (err) console.log('POST Error: ', err);
    const collection = client.db('test').collection('test');
    collection.insertOne(data);
  });

  res.sendStatus(200);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
