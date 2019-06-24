module.exports = function (sails) {
	const install = require('./lib/install');
	const init = require('./lib/init');
	const exec = require('./lib/exec');

	gladys.on('ready', function() {
		init();
	});

	return {
		install: install,
		init: init,
		exec: exec
	};
};
