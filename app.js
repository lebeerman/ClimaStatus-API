require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || 3000);


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://lebeerman:${process.env.MONGO_PWD}@cluster0-ojwct.mongodb.net/test`;
const path = require('path');

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(devMode ? 'dev' : 'combined'));
app.use(cors({ origin: true }));

let data = {};

app.get('/', (req, res) => {
  MongoClient.connect(uri, (err, client) => {
    // Doing stuff
    if (err) console.error(err);
    const collection = client.db('test').collection('test');
    // pull the most recent item hopefully
    const mostRecent = collection.find().sort({"dateutc": -1}).limit(1);
    res.send(mostRecent);
    console.log('SENTIT', items);
    res.sendStatus(200);
    client.close();
  })
  .catch(err => console.error(err));
  res.status(303).send({message: 'something went wrong'});
});

app.post('/', (req, res) => {
  data = req.body;
  MongoClient.connect(uri, (err, client) => {
    console.log('ADDING', data);
    if (err) console.log('POST Error: ', err);
    const collection = client.db('test').collection('test');
    collection.insertOne(data);
  });
  res.sendStatus(200);
});

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
