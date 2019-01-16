require('dotenv').config();
const fs = require('fs');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const httpServer = http.createServer(app);
const port = parseInt(process.env.PORT || 3000);
const devMode = process.env.NODE_ENV !== 'production';
const https = require('https');
const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

// your express configuration here

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const uri = (port === 3000) ? `mongodb://localhost:27017/test` : `mongodb+srv://lebeerman:${process.env.MONGO_PWD}@cluster0-ojwct.mongodb.net/test`;
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
    else console.log('Connected');
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


httpServer
  .listen(port)
  .on('error', console.error.bind(console))
  .on('listening', console.log.bind(console, 'Listening on ' + port));
httpsServer
  .listen(8443)
  .on('error', console.error.bind(console))
  .on('listening', console.log.bind(console, 'Listening on ' + port));
  