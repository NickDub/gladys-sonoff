const Promise = require('bluebird');

module.exports = {
	changeState: (deviceType, value) => {
		return new Promise((resolve, reject) => {
			const newState = { devicetype: deviceType.id, value: value };

			return gladys.deviceState.create(newState)
				.then((state) => {
					// sails.log.debug(`Sonoff - state ${deviceType.identifier} created`);
					return resolve(state.value);
				})
				.catch((err) => {
					sails.log.error(`Sonoff - Error, state ${deviceType.identifier} not created!`);
					return reject(err);
				});
		});
	}
};
