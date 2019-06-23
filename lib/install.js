module.exports = function () {
	const type = {
		name: 'Sonoff',
		service: 'sonoff'
	};

	return gladys.notification.install(type);
};
