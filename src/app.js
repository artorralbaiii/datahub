var Emitter = require('events').EventEmitter;
var util = require('util');
var View = require('./view');
const headerTitleMapping = {
    audittrail: 'Audit Trail',
    main: 'Main Page',
    profile: 'Profile Setup'
};

var App = function () {

    this.on('view-selected', function (viewName) {
        var view = new View(viewName);
        this.emit('rendered', view.toHtml());
        document.title = 'Data Hub Repository - ' + headerTitleMapping[viewName];
    });
}

util.inherits(App, Emitter);
module.exports = new App();