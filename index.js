module.exports = function (sails) {
	const install = require('./lib/install');
	const exec = require('./lib/exec');

	return {
		install: install,
		exec: exec
	};
};
