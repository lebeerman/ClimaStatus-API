const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

let data = {};

app.get('/', (req, res) => {
    res.send(data);
});

app.post('/', (req, res) => {
    data = req.body;
    res.sendSuccess(200);
});

app.listen(port, () => console.log(`Listening on port ${port}`));