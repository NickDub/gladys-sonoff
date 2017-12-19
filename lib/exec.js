var util = require('util');
var mqtt = require('mqtt');

// HTTP protocol
var regexCheckIp = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
var powerReq = 'http://%s/cm?cmnd=Power%s%20%s';
// MQTT protocol (%prefix%/%topic%/%command%)
var powerMqttCmd = 'cmnd/%s/power%s';
var powerMqttStat = 'stat/%s/POWER%s';
// var powerMqtt = 'tasmota/%s/cmnd/Power%s';

module.exports = function exec(params) {

        if (params.deviceType.type == 'binary') {
            switch (params.deviceType.protocol) {
                case 'http':
                    var identifier = params.deviceType.identifier.split('_');
                    var ip = identifier[0];
                    var id = identifier.length > 1 ? identifier[1] : '';
            
                    if (ip.match(regexCheckIp)) {
                        return sendRequest(ip, id, params.state.value);
                    } else {
                        console.log(`Sonoff - Device identifier invalid or unknown: ${ip}`);
                    }
                    break;
                case 'mqtt':
                    var identifier = params.deviceType.identifier.split('_');
                    var topic = identifier[0];
                    var id = identifier.length > 1 ? identifier[1] : '';

                    return sendMqttMsg(topic, id, params.state.value);
                    break;

                default:
                    break;
            }
        } else {
            console.log(`Sonoff - DeviceType type invalid or unknown: ${params.deviceType.type}`);
        }

    return false;
};

function sendRequest(ip, id, state) {

    var req = util.format(powerReq, ip, id, state === 1 ? 'on' : 'off');
    console.log(`Sonoff - Sending ${req}`);

    return gladys.utils.request(req)
        .then((response) => {
            var lines = response.split('\n');
            var state = lines[1];
            console.log(`Sonoff - New state: ${state}`);

            if (state == 'POWER = OFF') {
                return 0;
            } else if (state == 'POWER = ON') {
                return 1;
            } else {
                console.log(`Sonoff - HTTP response: ${response}`);
                return false;
            }
        })
        .catch((error) => {
            console.log(`Sonoff - Error: ${error}`);
            return false;
        });
}

function sendMqttMsg(topic, id, value) {

    return gladys.param.getValues(['MQTT_URL', 'MQTT_USERNAME', 'MQTT_PASSWORD'])
        .spread(function (url, username, password) {
            var client = mqtt.connect(url, {
                username: username,
                password: password
            });

            client.on('connect', function () {
                console.log(`Sonoff - Successfully connected to MQTT : ${url}`);

                var req = util.format(powerMqttCmd, topic, id);
                var state = value === 1 ? 'on' : 'off';
                console.log(`Sonoff - Sending ${req} ${state}`);
                client.publish(req, state);
            });

            client.on('message', function (topic, message) {
                var req = util.format(powerMqttStat, topic, id);
                if (topic.indewOf(req) > 1) {
                    var state = message === 'ON' ? 1 : 0;
                    console.log(`Sonoff - New state: ${state}`);
                    client.end();

                    return state;
                }
            });

            client.on('error', function (error) {
                console.log(`Sonoff - Error: ${error}`);
                client.end();

                return false;
            });
        });
}
