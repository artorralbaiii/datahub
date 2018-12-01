'use strict';

var dbconnection = require('./dbconnection.js');

module.exports = function () {
  var controller = {
    getAll: getAll,
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
          console.error(error);
          res.json({ data: [] });
        });
    });
  }

  function updateRecords(req, res, next) {

    let arrIds = req.body.rows.map(obj => obj.ID);
    let ids = arrIds.join(',');
    let sSQL = 'UPDATE CONTACTS SET [' + req.body.field + ']=\'' + req.body.value + '\' WHERE ID IN (' + ids + ');';

    console.log(sSQL);

    dbconnection(function (connection) {
      connection
        .execute(sSQL)
        .then(data => {
          res.json({ data: data, success: true });
        })
        .catch(error => {
          res.json({ success: true, message: error });
        });
    });
  }

}
