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
        .query('SELECT * FROM INTERFACES')
        .then(data => {
          res.json({ success: true, data: data });
        })
        .catch(error => {
          res.status(500);
          res.json({ success: false, message: error });
        });
    });
  }

  function updateRecords(req, res, next) {

    let arrIds = req.body.rows.map(obj => obj.ID);
    let ids = arrIds.join(',');
    let sSQL = 'UPDATE INTERFACES SET [' + req.body.field + ']=\'' + req.body.value + '\' WHERE ID IN (' + ids + ');';

    dbconnection(function (connection) {
      connection
        .execute(sSQL)
        .then(data => {
          res.json({ data: data, success: true });
        })
        .catch(error => {
          res.status(500);
          res.json({ success: false, message: error });
        });
    });
  }

  function newRecord(req, res, next) {
    let sSQL = 'INSERT INTO INTERFACES ' +
      '([InterfaceId], [TableName], [TableDescription], [Subtype], [FieldName], [FieldDescription], [DataType], [Length], [OutputType], [OutputLength], [Notation]) VALUES (' +
      '\'' + req.body.interfaceId + '\',' +
      '\'' + req.body.tableName + '\',' +
      '\'' + req.body.tableDescription + '\',' +
      '\'' + req.body.subType + '\',' +
      '\'' + req.body.fieldName + '\',' +
      '\'' + req.body.fieldDescription + '\',' +
      '\'' + req.body.dataType + '\',' +
      req.body.fieldLength + ',' +
      '\'' + req.body.outputType + '\',' +
      req.body.outputLength + ',' +
      '\'' + req.body.notation + '\'' + ');';

    console.log(sSQL);
    dbconnection(function (connection) {
      connection
        .execute(sSQL)
        .then(data => {
          res.json({ data: data, success: true })
        })
        .catch(error => {
          console.log(error);
          res.status(500);
          res.json({ success: false, message: error });
        });
    });

  }

}
