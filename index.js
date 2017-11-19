module.exports = function (sails) {

    //var setup = require('./lib/setup.js');
    var exec = require('./lib/exec.js');

    return {
        //setup,
        exec,
    };
};
