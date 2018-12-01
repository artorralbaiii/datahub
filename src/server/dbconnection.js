const ADODB = require('node-adodb');
let connection;
let db = require('./db.config');

module.exports = function (callback) {
    if (connection) {
        callback(connection);
        return;
    }
    connection = ADODB.open('Provider=' + db.provider + ';Data Source=' + db.path + db.name +
        ';');
    // ';Jet OLEDB:Database Password=' + db.password + ';');

    callback(connection);
};