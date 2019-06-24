const Promise = require('bluebird');
const util = require('util');
const utils = require('./utils');

// HTTP protocol
const regexCheckIp = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
const powerReq = 'http://%s/cm?cmnd=Power%s';

// MQTT protocol (%prefix%/%topic%/%command%)
const powerMqttCmd = 'cmnd/%s/power%s';
const powerMqttStat = 'stat/%s/POWER%s';

module.exports = function init() {
	gladys.device.getByService({ service: 'sonoff' })
		.then((devices) => devices.map((device) => {
			sails.log.debug(`DEBUG - device: ${JSON.stringify(device)}`);

			const identifier = device.identifier.split('_');
			const id = identifier.length > 1 ? identifier[1] : '';
			switch (device.protocol) {
				case 'http':
					const ip = identifier[0];
					if (ip.match(regexCheckIp)) {
						gladys.deviceType.getByDevice({ id: device.id })
							.map((deviceType) => {
								if (deviceType.type === 'binary') {
									getHttpState(ip, id)
										.then((state) => utils.changeState(deviceType, state))
										.catch((error) => { });
								}
							});
					} else {
						sails.log.error(`Sonoff - Device identifier invalid or unknown: ${ip}`);
					}
					break;

				case 'mqtt':
					const topic = identifier[0];
					getMqttState(topic, id)
						.then((state) => utils.changeState(deviceType, state))
						.catch((error) => { });
					break;

				default:
					break;
			}
		}));
};

function getHttpState(ip, id) {
	const req = util.format(powerReq, ip, id);
	sails.log.info(`Sonoff - Sending ${req}`);

	return gladys.utils.request(req)
		.then((response) => {
			const state = response[`POWER${id}`];
			sails.log.info(`Sonoff - State: ${state}`);

			if (state == 'OFF') {
				return Promise.resolve(0);
			} else if (state == 'ON') {
				return Promise.resolve(1);
			} else {
				sails.log.error(`Sonoff - HTTP response: ${response}`);
				return Promise.reject();
			}
		})
		.catch((error) => {
			sails.log.error(`Sonoff - Error: ${error}`);
			return Promise.reject(error);
		});
}

function getMqttState(topic, id) {
	return gladys.param.getValues(['MQTT_URL', 'MQTT_USERNAME', 'MQTT_PASSWORD'])
		.spread(function (url, username, password) {
			const client = mqtt.connect(url, {
				username: username,
				password: password
			});

			client.on('connect', () => {
				sails.log.info(`Sonoff - Successfully connected to MQTT : ${url}`);

				const req = util.format(powerMqttCmd, topic, id);
				sails.log.info(`Sonoff - Sending ${req}`);
				client.publish(req);
			});

			client.on('message', (topic, message) => {
				const req = util.format(powerMqttStat, topic, id);
				if (topic.indewOf(req) > 1) {
					const state = message === 'ON' ? 1 : 0;
					sails.log.info(`Sonoff - State: ${state}`);
					client.end();
					return Promise.resolve(state);
				}
			});

			client.on('error', (error) => {
				sails.log.error(`Sonoff - Error: ${error}`);
				client.end();
				return Promise.reject(error);
			});
		});
}
