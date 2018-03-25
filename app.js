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
const uri = (port === 3000) ? `mongodb://localhost:27017/localTest` : `mongodb+srv://lebeerman:${process.env.MONGO_PWD}@cluster0-ojwct.mongodb.net/test`;
const path = require('path');

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(devMode ? 'dev' : 'combined'));
app.use(cors({ origin: true }));
// app.use(notFound);
// app.use(errorHandler);

let data = {};

// ROUTES
app.get('/', (req, res, next) => {
  MongoClient
    .connect(uri, (err, client) => {
      if (err) return console.dir(err);
      else console.log('Connected');
      const collection = client.db('localTest').collection('collection');
      collection.find().sort({dateutc: -1}).toArray((err, payloads) => {
        if (err) console.log('FIND', err);
        const mostRecentDate = orderByDate(payloads, 'dateutc');
        res.status(200).send(mostRecentDate);
      });
      client.close();
    })
});

app.post('/', (req, res, next) => {
  data = req.body;
  MongoClient
    .connect(uri, (err, client) => {
      if (err) console.log('POST Error: ', err);
      const collection = client.db('localTest').collection('collection');
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
    const totalPayloads = client.db('localTest').collection('collection').count((err, count) => {
      if (err) throw err;
      console.log('Total Rows: ' + count);
      return count;
    });
    res.send(totalPayloads);
    client.close();
  });
});


//HELPER FUNCTIONS

const orderByDate = (arr, dateProp) => {
  return arr.slice().sort(function(a, b) {
    return a[dateProp] < b[dateProp] ? -1 : 1;
  })[0];
}

// const insertPayloads = (db, callback) => {
//   // Get the documents collection
//   const collection = db.db('localTest').collection('collection');
//   // Insert some documents
//   collection.insertMany([PAYLOAD AS ARRAY], (err, result) => {
//     assert.equal(err, null); // dev testing
//     console.log('Inserted 3 documents into the collection');
//     callback(result);
//   });
// };

// const findPayloads = (db, callback) => {
//   // Get the documents collection
//   const collection = db.db('localTest').collection('collection');
//   // Find some documents
//   collection.find({}).toArray((err, docs) => {
//     assert.equal(err, null);
//     console.log('Found the following records');
//     console.log(docs);
//     callback(docs);
//   });
// };

server
  .listen(port)
  .on('error', console.error.bind(console))
  .on('listening', console.log.bind(console, 'Listening on ' + port));

function notFound(req, res, next) {
  const url = req.originalUrl;
  if (!/favicon\.ico$/.test(url) && !/robots\.txt$/.test(url)) {
    // Don't log less important auto requests
    console.error('[404: Requested file not found] ', url);
  }
  res.status(404).send({ error: 'Url not found', status: 404, url });
}

function errorHandler(err, req, res, next) {
  console.error('ERROR', err);
  const stack = devMode ? err.stack : undefined;
  res.status(500).send({ error: err.message, stack, url: req.originalUrl });
}