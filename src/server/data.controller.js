'use strict';

var dbconnection = require('./dbconnection.js');

module.exports = function () {
  var controller = {
    getAll: getAll,
    newRecord: newRecord,
    updateRecords: updateRecords
  };

  return controller;

  function getAll(req, res, next) {

    dbconnection(function (connection) {
      connection
        .query('SELECT * FROM CONTACTS')
        .then(data => {
          res.json({ data: data });
        })
        .catch(error => {
          res.json({ data: [] });
        });
    });
  }

  function updateRecords(req, res, next) {

    let arrIds = req.body.rows.map(obj => obj.ID);
    let ids = arrIds.join(',');
    let sSQL = 'UPDATE CONTACTS SET [' + req.body.field + ']=\'' + req.body.value + '\' WHERE ID IN (' + ids + ');';

    dbconnection(function (connection) {
      connection
        .execute(sSQL)
        .then(data => {
          res.json({ data: data, success: true });
        })
        .catch(error => {
          res.json({ success: false, message: error });
        });
    });
  }

  function newRecord(req, res, next) {
    let sSQL = 'INSERT INTO CONTACTS ' +
      '([NAME], [POSITION], [OFFICE], [EXTN], [START_DATE], [SALARY]) VALUES (' +
      '\'' + req.body.name + '\',' +
    '\'' + req.body.position + '\',' +
    '\'' + req.body.office + '\',' +
    '\'' + req.body.extn + '\',' +
    '\'' + req.body.startDate + '\',' +
      + req.body.salary + ');';

    dbconnection(function(connection){
      connection
        .execute(sSQL)
        .then(data=> {
          res.json({data: data, success: true})
        })
        .catch(error => {
          res.json({success: false, message: error});
        });
    });

  }

}
