const Promise = require('bluebird');
const util = require('util');
const mqtt = require('mqtt');

// HTTP protocol
const regexCheckIp = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
const powerReq = 'http://%s/cm?cmnd=Power%s%20%s';

// MQTT protocol (%prefix%/%topic%/%command%)
const powerMqttCmd = 'cmnd/%s/power%s';
const powerMqttStat = 'stat/%s/POWER%s';
// const powerMqtt = 'tasmota/%s/cmnd/Power%s';

module.exports = function exec(params) {
  if (params.deviceType.type === 'binary') {
    switch (params.deviceType.protocol) {
      case 'http':
        const identifier = params.deviceType.identifier.split('_');
        const ip = identifier[0];
        const id = identifier.length > 1 ? identifier[1] : '';

        if (ip.match(regexCheckIp)) {
          return sendRequest(ip, id, params.state.value);
        } else {
          console.log(`Sonoff - Device identifier invalid or unknown: ${ip}`);
          return Promise.reject();
        }

      case 'mqtt':
        const identifier = params.deviceType.identifier.split('_');
        const topic = identifier[0];
        const id = identifier.length > 1 ? identifier[1] : '';

        return sendMqttMsg(topic, id, params.state.value);

      default:
        return Promise.reject();
    }
  }

  console.log(`Sonoff - DeviceType type invalid or unknown: ${params.deviceType.type}`);
  return Promise.reject();
};

function sendRequest(ip, id, value) {
  const req = util.format(powerReq, ip, id, value === 1 ? 'on' : 'off');
  console.log(`Sonoff - Sending ${req}`);

  return gladys.utils.request(req)
    .then((response) => {
      const lines = response.split('\n');
      const newState = lines[1];
      console.log(`Sonoff - New state: ${newState}`);

      if (newState == 'POWER = OFF') {
        return Promise.resolve(0);
      } else if (newState == 'POWER = ON') {
        return Promise.resolve(1);
      } else {
        console.log(`Sonoff - HTTP response: ${response}`);
        return Promise.reject();
      }
    })
    .catch((error) => {
      console.log(`Sonoff - Error: ${error}`);
      return Promise.reject(error);
    });
}

function sendMqttMsg(topic, id, value) {
  return gladys.param.getValues(['MQTT_URL', 'MQTT_USERNAME', 'MQTT_PASSWORD'])
    .spread(function (url, username, password) {
      const client = mqtt.connect(url, {
        username: username,
        password: password
      });

      client.on('connect', function () {
        console.log(`Sonoff - Successfully connected to MQTT : ${url}`);

        const req = util.format(powerMqttCmd, topic, id);
        const state = value === 1 ? 'on' : 'off';
        console.log(`Sonoff - Sending ${req} ${state}`);
        client.publish(req, state);
      });

      client.on('message', function (topic, message) {
        const req = util.format(powerMqttStat, topic, id);
        if (topic.indewOf(req) > 1) {
          const state = message === 'ON' ? 1 : 0;
          console.log(`Sonoff - New state: ${state}`);
          client.end();
          return Promise.resolve(state);
        }
      });

      client.on('error', function (error) {
        console.log(`Sonoff - Error: ${error}`);
        client.end();
        return Promise.reject(error);
      });
    });
}
