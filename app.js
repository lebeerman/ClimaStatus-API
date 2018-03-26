require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || 3000);
const devMode = process.env.NODE_ENV !== 'production';


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const uri = `mongodb+srv://lebeerman:XABxVhOtrYDnsERG@cluster0-ojwct.mongodb.net/test`;
const path = require('path');

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(devMode ? 'dev' : 'combined'));
app.use(cors({ origin: true }));

let data = {};

// ROUTES
app.get('/', (req, res, next) => {
  MongoClient
    .connect(uri, (err, client) => {
      if (err) return console.dir(err);
      else console.log('Connected to DB');
      const collection = client.db('test').collection('test');
      collection.find({}).sort({ dateutc: -1 }).limit(1).toArray((err, payload) => {
          if (err) console.log('FIND', err);
          res.status(200).send(payload);
        });
      client.close();
    })
});

app.post('/', (req, res, next) => {
  data = req.body;
  MongoClient
    .connect(uri, (err, client) => {
      if (err) console.log('POST Error: ', err);
      const collection = client.db('test').collection('test');
      try {
        collection.insertOne(data);
        console.log('ADDING', data);
        client.close();
      } catch (err) {
        console.log(err);
      }
    })
  res.send('Sensor Data Saved');
});

app.get('/payload', (req, res, next) => {
  MongoClient.connect(uri, (err, client) => {
    if (err) return console.dir(err);
    else console.log('Connected');
    const totalPayloads = client.db('test').collection('test').count((err, count) => {
      if (err) throw err;
      console.log('Total Rows: ' + count);
      return count;
    });
    res.send(totalPayloads);
    client.close();
  });
});


server
  .listen(port)
  .on('error', console.error.bind(console))
  .on('listening', console.log.bind(console, 'Listening on ' + port));
