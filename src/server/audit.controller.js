'use strict';

var dbconnection = require('./dbconnection.js');

module.exports = function () {
    var controller = {
        getAudits: getAudits
    };

    return controller;

    function getAudits(req, res, next) {
        var sSQL = 'SELECT AUDIT_TRAILS.TimeStamp, AUDIT_TRAILS.Action, USERS.FULLNAME, AUDIT_TRAILS.FieldChanged, AUDIT_TRAILS.NewValue, AUDIT_TRAILS.AffectedRecords, AUDIT_TRAILS.Comments ' + 
        'FROM USERS INNER JOIN AUDIT_TRAILS ON USERS.HOSTNAME = AUDIT_TRAILS.HostName;';

        dbconnection(function (connection) {
            connection
                .query(sSQL)
                .then(data => {
                    res.json({ success: true, data: data });
                })
                .catch(error => {
                    res.json({ success: false, message: error });
                });
        });
    }

}
