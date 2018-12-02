'use strict';

var dbconnection = require('./dbconnection.js');
var os = require('os');

module.exports = function () {
    var controller = {
        getProfile: getProfile,
        newProfile: newProfile
    };

    return controller;

    function getProfile(req, res, next) {
        var sSQL = 'SELECT * FROM USERS WHERE [HOSTNAME]=\'' + os.hostname() + '\'';

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

    function newProfile(req, res, next) {
        let sSQL = 'INSERT INTO USERS ' +
            '([HOSTNAME], [BRID], [EMAIL], [FULLNAME]) VALUES (' +
            '\'' + os.hostname() + '\',' +
            '\'' + req.body.brid + '\',' +
            '\'' + req.body.email + '\',' +
            '\'' + req.body.fullname + '\');';

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
