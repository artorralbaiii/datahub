'use strict';

var dbconnection = require('./dbconnection.js');
var os = require('os');

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
    let affectedRecordIds = req.body.rows.map(obj => '[ID: ' + obj.ID + ']' + ' - ' + '[Interface ID: ' + obj.InterfaceId + ']');
    let ids = arrIds.join(',');
    let affectedRecords = affectedRecordIds.join('<br>');
    let sSQL = 'UPDATE INTERFACES SET [' + req.body.field + ']=\'' + req.body.value + '\' WHERE ID IN (' + ids + ');';

    dbconnection(function (connection) {
      connection
        .execute(sSQL)
        .then(data => {

          sSQL = 'INSERT INTO AUDIT_TRAILS ' +
            '([HostName], [FieldChanged], [NewValue], [AffectedRecords], [Action], [Comments]) VALUES (' +
            '\'' + os.hostname() + '\',' +
            '\'' + req.body.field + '\',' +
            '\'' + req.body.value + '\',' +
            '\'' + affectedRecords + '\',' +
            '\'UPDATE\',' +
            '\'' + req.body.comments + '\');';

          dbconnection(function (connection) {
            connection
              .execute(sSQL)
              .then(logs => {
                res.json({ data: data, logs: logs, success: true });
              })
              .catch(error => {
                res.status(500);
                res.json({ success: false, message: error });
              });
          });

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

    dbconnection(function (connection) {
      connection
        .execute(sSQL)
        .then(data => {

          sSQL = 'INSERT INTO AUDIT_TRAILS ' +
            '([HostName], [FieldChanged], [NewValue], [AffectedRecords], [Action], [Comments]) VALUES (' +
            '\'' + os.hostname() + '\',' +
            '\'N/A\',' +
            '\'N/A\',' +
            '\'N/A\',' +
            '\'CREATE\',' +
            '\'New Record.\');';

          dbconnection(function (connection) {
            connection
              .execute(sSQL)
              .then(logs => {
                res.json({ data: data, logs: logs, success: true });
              })
              .catch(error => {
                res.status(500);
                res.json({ success: false, message: error });
              });
          });

        })
        .catch(error => {
          res.status(500);
          res.json({ success: false, message: error });
        });
    });

  }

}
