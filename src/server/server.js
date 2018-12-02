'use strict';

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let port = 3000;
let data = require('./data.controller')();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/data', data.getAll);
app.post('/data', data.updateRecords);
app.post('/data/new', data.newRecord);

app.listen(port, () => {
    console.log('Express server is listening on port ' + port);
    console.log('\n ___dirname = ' + __dirname + '\nprocess.cwd = ' + process.cwd());
});