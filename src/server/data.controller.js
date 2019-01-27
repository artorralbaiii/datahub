'use strict';

var dbconnection = require('./dbconnection.js');
var os = require('os');

module.exports = function () {
  var controller = {
    getAll: getAll,
    newRecord: newRecord,
    updateRecord: updateRecord,
    updateRecords: updateRecords
  };

  return controller;

  function getAll(req, res, next) {

    dbconnection(function (connection) {
      connection
        .query('SELECT * FROM INTERFACES_ACT')
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
    let affectedRecordIds = req.body.rows.map(obj => '[ID: ' + obj.ID + ']' + ' - ' + '[Int.ID: ' + obj.InterfaceId + ']' + ' - ' + '[OldValue: ' + obj[req.body.field] + ']');
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
      '([InterfaceId], [TableName], [TableDescription], [Subtype], [FieldName], [FieldDescription], [DataType], [Length], [OutputType], [OutputLength], [Notation], [InterfaceName], [OtherInfo], [Status]) VALUES (' +
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
      '\'' + req.body.notation + '\',' +
      '\'' + req.body.interfaceName + '\',' +
      '\'' + req.body.otherInfo + '\'' + ', \'Active\');';

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


  function updateRecord(req, res, next) {
    let sSQL = 'UPDATE INTERFACES SET ' +
      '[InterfaceId] = \'' + req.body.interfaceId + '\', ' +
      '[TableName] = \'' + req.body.tableName + '\', ' +
      '[TableDescription] = \'' + req.body.tableDescription + '\', ' +
      '[Subtype] = \'' + req.body.subType + '\', ' +
      '[FieldName] = \'' + req.body.fieldName + '\', ' +
      '[FieldDescription] = \'' + req.body.fieldDescription + '\', ' +
      '[DataType] = \'' + req.body.dataType + '\', ' +
      '[Length] = \'' + req.body.fieldLength + '\', ' +
      '[OutputType] = \'' + req.body.outputType + '\', ' +
      '[OutputLength] = \'' + req.body.outputLength + '\', ' +
      '[Notation] = \'' + req.body.notation + '\', ' +
      '[InterfaceName] = \'' + req.body.interfaceName + '\', ' +
      '[OtherInfo] = \'' + req.body.otherInfo + '\' ' +
      'WHERE ID = ' + req.params.id

    dbconnection(function (connection) {
      connection
        .execute(sSQL)
        .then(data => {

          sSQL = 'INSERT INTO AUDIT_TRAILS ' +
            '([HostName], [FieldChanged], [NewValue], [AffectedRecords], [Action], [Comments]) VALUES (' +
            '\'' + os.hostname() + '\',' +
            '\'N/A\',' +
            '\'N/A\',' +
            '\'[ID: ' + req.params.id + ']\',' +
            '\'UPDATE\',' +
            '\'Full record has been updated.\');';

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
